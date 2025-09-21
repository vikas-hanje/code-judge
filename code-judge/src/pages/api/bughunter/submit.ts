import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { getUserFromRequest } from '../../../lib/auth';
import { runOnJudge0 } from '../../../lib/judge0';
import { enforceRateLimit } from '../../../lib/rateLimiter';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { user } = await getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { source_code, language_id, problemSlug } = req.body || {};
  if (!source_code || !language_id || !problemSlug) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await enforceRateLimit(supabaseAdmin, user.id);
  } catch (e: any) {
    return res.status(e.status || 429).json({ error: e.message });
  }

  // Get Bug Hunter problem and all testcases
  const { data: problem, error: pErr } = await supabaseAdmin
    .from('bughunter_problems')
    .select('id, language_id, time_limit_ms, memory_limit_kb')
    .eq('slug', problemSlug)
    .maybeSingle();

  if (pErr) return res.status(500).json({ error: pErr.message });
  if (!problem) return res.status(404).json({ error: 'Bug Hunter problem not found' });

  // Verify language matches problem requirement
  if (language_id !== problem.language_id) {
    return res.status(400).json({ 
      error: `This Bug Hunter problem requires language ID ${problem.language_id}` 
    });
  }

  // Get all testcases (including hidden ones)
  const { data: testcases, error: tcErr } = await supabaseAdmin
    .from('bughunter_testcases')
    .select('id, input, expected_output')
    .eq('problem_id', problem.id)
    .order('id', { ascending: true });

  if (tcErr) return res.status(500).json({ error: tcErr.message });
  if (!testcases || testcases.length === 0) {
    return res.status(500).json({ error: 'No testcases found for this problem' });
  }

  // Create submission record
  const { data: submission, error: subErr } = await supabaseAdmin
    .from('bughunter_submissions')
    .insert({
      user_id: user.id,
      problem_id: problem.id,
      language_id,
      source_code,
      is_submission: true,
      status: 'running',
      total_testcases: testcases.length,
    })
    .select('id')
    .single();

  if (subErr) return res.status(500).json({ error: subErr.message });

  try {
    const memKb = problem.memory_limit_kb ? Math.max(2048, problem.memory_limit_kb) : undefined;
    let passed = 0;
    let failed = 0;
    const results: any[] = [];

    console.log(`[api/bughunter/submit] Running ${testcases.length} testcases`);

    // Run against all testcases
    for (const tc of testcases) {
      try {
        const result = await runOnJudge0({
          source_code,
          language_id,
          stdin: tc.input,
          expected_output: tc.expected_output,
          cpu_time_limit: problem.time_limit_ms ? Math.ceil(problem.time_limit_ms / 1000) : undefined,
          memory_limit: memKb,
        });

        const status = result.status?.description || 'Unknown';
        const isAccepted = status === 'Accepted';
        
        if (isAccepted) {
          passed++;
        } else {
          failed++;
        }

        results.push({
          testcase_id: tc.id,
          status,
          stdout: result.stdout,
          stderr: result.stderr || result.compile_output,
          time_ms: result.time ? Math.round(parseFloat(result.time) * 1000) : null,
          memory_kb: result.memory,
          passed: isAccepted,
        });

        console.log(`[api/bughunter/submit] Testcase ${tc.id}: ${status}`);
      } catch (tcErr: any) {
        console.error(`[api/bughunter/submit] Testcase ${tc.id} error:`, tcErr);
        failed++;
        results.push({
          testcase_id: tc.id,
          status: 'Error',
          stdout: '',
          stderr: tcErr.message,
          time_ms: null,
          memory_kb: null,
          passed: false,
        });
      }
    }

    // Determine overall status
    const overallStatus = passed === testcases.length ? 'Accepted' : 'Wrong Answer';
    const avgTime = results.filter(r => r.time_ms).reduce((sum, r) => sum + r.time_ms, 0) / results.filter(r => r.time_ms).length || null;
    const maxMemory = Math.max(...results.filter(r => r.memory_kb).map(r => r.memory_kb)) || null;

    // Update submission with results
    const { error: updErr } = await supabaseAdmin
      .from('bughunter_submissions')
      .update({
        status: overallStatus,
        passed_testcases: passed,
        time_ms: avgTime ? Math.round(avgTime) : null,
        memory_kb: maxMemory,
      })
      .eq('id', submission.id);

    if (updErr) console.error('Update bughunter submission error', updErr.message);

    // Return summary (don't expose individual testcase details for security)
    res.json({
      submission_id: submission.id,
      status: overallStatus,
      summary: {
        passed,
        failed,
        total: testcases.length,
      },
      time_ms: avgTime ? Math.round(avgTime) : null,
      memory_kb: maxMemory,
    });
  } catch (err: any) {
    console.error('[api/bughunter/submit] Error during submission:', err?.message || err);
    await supabaseAdmin
      .from('bughunter_submissions')
      .update({ status: 'error' })
      .eq('id', submission.id);
    res.status(500).json({ error: err.message });
  }
}
