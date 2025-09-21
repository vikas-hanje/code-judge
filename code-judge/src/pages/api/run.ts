import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import { getUserFromRequest } from '../../lib/auth';
import { enforceRateLimit } from '../../lib/rateLimiter';
import { runOnJudge0 } from '../../lib/judge0';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { user } = await getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { source_code, language_id, stdin, problemSlug } = req.body || {};
  if (!source_code || !language_id) return res.status(400).json({ error: 'Missing fields' });

  try {
    await enforceRateLimit(supabaseAdmin, user.id);
  } catch (e: any) {
    return res.status(e.status || 429).json({ error: e.message });
  }

  let problem: any = null;
  let samples: any[] = [];
  if (problemSlug) {
    const { data } = await supabaseAdmin
      .from('problems')
      .select('id, time_limit_ms, memory_limit_kb')
      .eq('slug', problemSlug)
      .maybeSingle();
    problem = data;
    
    // Get sample test cases for this problem
    if (problem) {
      const { data: sampleData } = await supabaseAdmin
        .from('testcases')
        .select('id, input, expected_output')
        .eq('problem_id', problem.id)
        .eq('is_sample', true)
        .order('id', { ascending: true });
      samples = sampleData || [];
    }
  }

  const { data: prelim, error: insErr } = await supabaseAdmin
    .from('submissions')
    .insert({
      user_id: user.id,
      problem_id: problem?.id ?? null,
      language_id,
      source_code,
      stdin: stdin || null,
      status: 'queued',
      is_submission: false,
    })
    .select('id')
    .single();
  if (insErr) return res.status(500).json({ error: insErr.message });

  try {
    const memKb = problem?.memory_limit_kb
      ? Math.max(2048, problem.memory_limit_kb)
      : undefined;
    // Debug (safe): show limits and whether API key is set (do not log the key)
    console.log('[api/run] Using limits', {
      cpu_s: problem?.time_limit_ms ? Math.ceil(problem.time_limit_ms / 1000) : undefined,
      mem_kb: memKb,
      hasApiKey: Boolean(process.env.JUDGE0_API_KEY),
      host: process.env.JUDGE0_API_HOST,
    });

    // Run with custom stdin first
    const result = await runOnJudge0({
      source_code,
      language_id,
      stdin,
      cpu_time_limit: problem?.time_limit_ms ? Math.ceil(problem.time_limit_ms / 1000) : undefined,
      memory_limit: memKb,
    });

    const time_ms = result.time ? Math.round(parseFloat(result.time) * 1000) : null;
    const memory_kb = result.memory ?? null;
    const status = result.status?.description || 'Unknown';

    // Also run against sample test cases if available (regardless of main execution status)
    const sampleResults: { [key: number]: { stdout: string; status: string } } = {};
    if (samples.length > 0) {
      console.log(`[api/run] Running ${samples.length} sample test cases`);
      for (const sample of samples) {
        try {
          const sampleResult = await runOnJudge0({
            source_code,
            language_id,
            stdin: sample.input,
            cpu_time_limit: problem?.time_limit_ms ? Math.ceil(problem.time_limit_ms / 1000) : undefined,
            memory_limit: memKb,
          });
          const sampleStatus = sampleResult.status?.description || 'Unknown';
          sampleResults[sample.id] = {
            stdout: sampleResult.stdout || '',
            status: sampleStatus
          };
          console.log(`[api/run] Sample ${sample.id} result:`, sampleResults[sample.id]);
          
          // Handle NZEC (Non-Zero Exit Code) and other runtime errors
          if (sampleStatus.includes('Runtime Error') || sampleStatus.includes('NZEC')) {
            sampleResults[sample.id].stdout = sampleResult.stderr || 'Runtime Error (NZEC)';
          }
        } catch (sampleErr) {
          console.error(`[api/run] Sample ${sample.id} error:`, sampleErr);
          sampleResults[sample.id] = {
            stdout: '',
            status: 'Error'
          };
        }
      }
    }

    const { error: updErr } = await supabaseAdmin
      .from('submissions')
      .update({
        stdout: result.stdout ?? null,
        stderr: (result.compile_output || result.stderr) ?? null,
        status,
        time_ms,
        memory_kb,
      })
      .eq('id', prelim.id);
    if (updErr) console.error('Update submission error', updErr.message);

    res.json({
      submission_id: prelim.id,
      status,
      stdout: result.stdout,
      stderr: result.compile_output || result.stderr,
      time_ms,
      memory_kb,
      sampleResults,
    });
  } catch (err: any) {
    console.error('[api/run] Error during execution:', err?.message || err);
    await supabaseAdmin
      .from('submissions')
      .update({ status: 'error', stderr: err.message })
      .eq('id', prelim.id);
    res.status(500).json({ error: err.message });
  }
}
