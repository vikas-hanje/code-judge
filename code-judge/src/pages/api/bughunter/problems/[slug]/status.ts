import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../../../lib/supabaseAdmin';
import { getUserFromRequest } from '../../../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { user } = await getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { slug } = req.query;
  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ error: 'Problem slug is required' });
  }

  try {
    // Get the Bug Hunter problem ID
    const { data: problem, error: pErr } = await supabaseAdmin
      .from('bughunter_problems')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (pErr) return res.status(500).json({ error: pErr.message });
    if (!problem) return res.status(404).json({ error: 'Bug Hunter problem not found' });

    // Check if user has submitted this problem
    const { data: submission, error: sErr } = await supabaseAdmin
      .from('bughunter_submissions')
      .select('id, status, created_at')
      .eq('user_id', user.id)
      .eq('problem_id', problem.id)
      .eq('is_submission', true)
      .order('created_at', { ascending: false })
      .maybeSingle();

    if (sErr) return res.status(500).json({ error: sErr.message });

    res.json({
      hasSubmitted: !!submission,
      submission: submission || null,
    });
  } catch (err: any) {
    console.error('[api/bughunter/status] Error:', err?.message || err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
