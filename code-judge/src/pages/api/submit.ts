import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import { getUserFromRequest } from '../../lib/auth';
import { enforceRateLimit } from '../../lib/rateLimiter';
import { runOnJudge0 } from '../../lib/judge0';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { user } = await getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { source_code, language_id, problemSlug } = req.body || {};
  if (!source_code || !language_id || !problemSlug) return res.status(400).json({ error: 'Missing fields' });

  try {
    await enforceRateLimit(supabaseAdmin, user.id, 10);
  } catch (e: any) {
    return res.status(e.status || 429).json({ error: e.message });
  }

  const { data: problem, error: pErr } = await supabaseAdmin
    .from('problems')
    .select('id, time_limit_ms, memory_limit_kb')
    .eq('slug', problemSlug)
    .maybeSingle();
  if (pErr) return res.status(500).json({ error: pErr.message });
  if (!problem) return res.status(404).json({ error: 'Problem not found' });

  const { data: testcases, error: tErr } = await supabaseAdmin
    .from('testcases')
    .select('id, input, expected_output')
    .eq('problem_id', problem.id)
    .eq('is_sample', false)
    .order('id', { ascending: true });
  if (tErr) return res.status(500).json({ error: tErr.message });

  const { data: prelim, error: insErr } = await supabaseAdmin
    .from('submissions')
    .insert({
      user_id: user.id,
      problem_id: problem.id,
      language_id,
      source_code,
      status: 'queued',
      is_submission: true,
    })
    .select('id')
    .single();
  if (insErr) return res.status(500).json({ error: insErr.message });

  let passed = 0;
  let total = testcases?.length || 0;
  let aggTimeMs = 0;
  let peakMemKb: number | null = null;
  const details: any[] = [];

  try {
    const memKb = problem.memory_limit_kb
      ? Math.max(2048, problem.memory_limit_kb)
      : undefined;
    for (const tc of testcases || []) {
      const result = await runOnJudge0({
        source_code,
        language_id,
        stdin: tc.input,
        expected_output: tc.expected_output,
        cpu_time_limit: problem.time_limit_ms ? Math.ceil(problem.time_limit_ms / 1000) : undefined,
        memory_limit: memKb,
      });
      const status = result.status?.description || 'Unknown';
      const time_ms = result.time ? Math.round(parseFloat(result.time) * 1000) : 0;
      const mem_kb = result.memory ?? null;
      aggTimeMs += time_ms;
      if (mem_kb != null) peakMemKb = Math.max(peakMemKb ?? 0, mem_kb);
      const accepted = status.toLowerCase().includes('accepted');
      if (accepted) passed += 1;
      details.push({
        testcase_id: tc.id,
        status,
        time_ms,
        memory_kb: mem_kb,
        stdout: result.stdout,
        stderr: result.compile_output || result.stderr,
      });
    }

    const finalStatus = passed === total ? 'Accepted' : `Failed (${passed}/${total})`;

    const { error: updErr } = await supabaseAdmin
      .from('submissions')
      .update({
        status: finalStatus,
        time_ms: aggTimeMs,
        memory_kb: peakMemKb,
        stdout: JSON.stringify({ passed, total }),
        stderr: null,
      })
      .eq('id', prelim.id);
    if (updErr) console.error('Update submission error', updErr.message);

    res.json({
      submission_id: prelim.id,
      status: finalStatus,
      summary: { passed, total, time_ms: aggTimeMs, memory_kb: peakMemKb },
      details,
    });
  } catch (err: any) {
    await supabaseAdmin
      .from('submissions')
      .update({ status: 'error', stderr: err.message })
      .eq('id', prelim.id);
    res.status(500).json({ error: err.message });
  }
}
