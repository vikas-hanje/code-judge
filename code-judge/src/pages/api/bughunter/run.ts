import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { getUserFromRequest } from '../../../lib/auth';
import { runOnJudge0 } from '../../../lib/judge0';
import { enforceRateLimit } from '../../../lib/rateLimiter';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { user } = await getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { source_code, language_id, stdin, problemSlug } = req.body || {};
  if (!source_code || !language_id || !problemSlug) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await enforceRateLimit(supabaseAdmin, user.id);
  } catch (e: any) {
    return res.status(e.status || 429).json({ error: e.message });
  }

  // Get Bug Hunter problem details
  let problem: any = null;
  let samples: any[] = [];
  
  const { data: problemData } = await supabaseAdmin
    .from('bughunter_problems')
    .select('id, language_id, time_limit_ms, memory_limit_kb')
    .eq('slug', problemSlug)
    .maybeSingle();
  
  if (!problemData) {
    return res.status(404).json({ error: 'Bug Hunter problem not found' });
  }
  
  problem = problemData;

  // Verify language matches problem requirement
  if (language_id !== problem.language_id) {
    return res.status(400).json({ 
      error: `This Bug Hunter problem requires language ID ${problem.language_id}` 
    });
  }

  // Get sample test cases for this problem
  const { data: sampleData } = await supabaseAdmin
    .from('bughunter_testcases')
    .select('id, input, expected_output')
    .eq('problem_id', problem.id)
    .eq('is_sample', true)
    .order('id', { ascending: true });
  samples = sampleData || [];

  // Create submission record (for tracking, not actual submission)
  const { data: prelim, error: insErr } = await supabaseAdmin
    .from('bughunter_submissions')
    .insert({
      user_id: user.id,
      problem_id: problem.id,
      language_id,
      source_code,
      is_submission: false, // This is just a run, not a submission
      status: 'running',
    })
    .select('id')
    .single();

  if (insErr) return res.status(500).json({ error: insErr.message });

  try {
    const memKb = problem.memory_limit_kb ? Math.max(2048, problem.memory_limit_kb) : undefined;
    
    console.log('[api/bughunter/run] Using limits', {
      cpu_s: problem.time_limit_ms ? Math.ceil(problem.time_limit_ms / 1000) : undefined,
      mem_kb: memKb,
      hasApiKey: Boolean(process.env.JUDGE0_API_KEY),
      host: process.env.JUDGE0_API_HOST,
    });

    // Run with custom stdin first
    const result = await runOnJudge0({
      source_code,
      language_id,
      stdin,
      cpu_time_limit: problem.time_limit_ms ? Math.ceil(problem.time_limit_ms / 1000) : undefined,
      memory_limit: memKb,
    });

    const time_ms = result.time ? Math.round(parseFloat(result.time) * 1000) : null;
    const memory_kb = result.memory ?? null;
    const status = result.status?.description || 'Unknown';

    // Also run against sample test cases if available
    const sampleResults: { [key: number]: { stdout: string; status: string } } = {};
    if (samples.length > 0) {
      console.log(`[api/bughunter/run] Running ${samples.length} sample test cases`);
      for (const sample of samples) {
        try {
          const sampleResult = await runOnJudge0({
            source_code,
            language_id,
            stdin: sample.input,
            cpu_time_limit: problem.time_limit_ms ? Math.ceil(problem.time_limit_ms / 1000) : undefined,
            memory_limit: memKb,
          });
          const sampleStatus = sampleResult.status?.description || 'Unknown';
          sampleResults[sample.id] = {
            stdout: sampleResult.stdout || '',
            status: sampleStatus
          };
          console.log(`[api/bughunter/run] Sample ${sample.id} result:`, sampleResults[sample.id]);
          
          // Handle NZEC (Non-Zero Exit Code) and other runtime errors
          if (sampleStatus.includes('Runtime Error') || sampleStatus.includes('NZEC')) {
            sampleResults[sample.id].stdout = sampleResult.stderr || 'Runtime Error (NZEC)';
          }
        } catch (sampleErr) {
          console.error(`[api/bughunter/run] Sample ${sample.id} error:`, sampleErr);
          sampleResults[sample.id] = {
            stdout: '',
            status: 'Error'
          };
        }
      }
    }

    // Update submission record
    const { error: updErr } = await supabaseAdmin
      .from('bughunter_submissions')
      .update({
        status,
        time_ms,
        memory_kb,
      })
      .eq('id', prelim.id);
    if (updErr) console.error('Update bughunter submission error', updErr.message);

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
    console.error('[api/bughunter/run] Error during execution:', err?.message || err);
    await supabaseAdmin
      .from('bughunter_submissions')
      .update({ status: 'error' })
      .eq('id', prelim.id);
    res.status(500).json({ error: err.message });
  }
}
