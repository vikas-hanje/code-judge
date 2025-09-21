import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { getUserFromRequest } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { user } = await getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const slug = req.query.slug as string;
  const { data: problem, error } = await supabaseAdmin
    .from('problems')
    .select('id, slug, title, statement, time_limit_ms, memory_limit_kb')
    .eq('slug', slug)
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!problem) return res.status(404).json({ error: 'Not found' });

  const { data: samples, error: tErr } = await supabaseAdmin
    .from('testcases')
    .select('id, input, expected_output, is_sample')
    .eq('problem_id', problem.id)
    .eq('is_sample', true)
    .order('id', { ascending: true });
  if (tErr) return res.status(500).json({ error: tErr.message });

  // Debug logging
  console.log(`[api/problems/${slug}] Found ${samples?.length || 0} sample test cases for problem ${problem.id}`);
  if (samples) {
    samples.forEach((s, i) => {
      console.log(`[api/problems/${slug}] Sample ${i + 1}: ID=${s.id}, input="${s.input.replace(/\n/g, '\\n')}", output="${s.expected_output.replace(/\n/g, '\\n')}"`);
    });
  }

  res.json({ problem, samples });
}
