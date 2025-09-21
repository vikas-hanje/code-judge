import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';
import { getUserFromRequest } from '../../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { user } = await getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const slug = req.query.slug as string;
  if (!slug) return res.status(400).json({ error: 'Missing slug parameter' });

  try {
    // Get Bug Hunter problem details
    const { data: problem, error: pErr } = await supabaseAdmin
      .from('bughunter_problems')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (pErr) return res.status(500).json({ error: pErr.message });
    if (!problem) return res.status(404).json({ error: 'Bug Hunter problem not found' });

    // Get sample testcases (only visible ones)
    const { data: samples, error: sErr } = await supabaseAdmin
      .from('bughunter_testcases')
      .select('id, input, expected_output')
      .eq('problem_id', problem.id)
      .eq('is_sample', true)
      .order('id', { ascending: true });

    if (sErr) return res.status(500).json({ error: sErr.message });

    // Debug logging
    console.log(`[api/bughunter/problems/${slug}] Found ${samples?.length || 0} sample test cases for problem ${problem.id}`);
    if (samples) {
      samples.forEach((s, i) => {
        console.log(`[api/bughunter/problems/${slug}] Sample ${i + 1}: ID=${s.id}, input="${s.input.replace(/\n/g, '\\n')}", output="${s.expected_output.replace(/\n/g, '\\n')}"`);
      });
    }

    res.json({
      problem,
      samples: samples || [],
    });
  } catch (err: any) {
    console.error('[api/bughunter/problems/[slug]] Error:', err?.message || err);
    res.status(500).json({ error: err.message });
  }
}
