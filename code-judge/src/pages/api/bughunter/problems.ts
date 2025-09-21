import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { getUserFromRequest } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { user } = await getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    // Get all Bug Hunter problems
    const { data: problems, error: pErr } = await supabaseAdmin
      .from('bughunter_problems')
      .select('id, slug, title, difficulty, language_id, created_at')
      .order('created_at', { ascending: false });

    if (pErr) return res.status(500).json({ error: pErr.message });

    res.json({ problems: problems || [] });
  } catch (err: any) {
    console.error('[api/bughunter/problems] Error:', err?.message || err);
    res.status(500).json({ error: err.message });
  }
}
