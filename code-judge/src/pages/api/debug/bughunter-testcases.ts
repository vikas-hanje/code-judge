import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { slug } = req.query;
  
  try {
    if (slug) {
      // Get specific Bug Hunter problem's test cases
      const { data: problem } = await supabaseAdmin
        .from('bughunter_problems')
        .select('id, slug, title')
        .eq('slug', slug)
        .maybeSingle();
      
      if (!problem) return res.status(404).json({ error: 'Bug Hunter problem not found' });
      
      const { data: testcases } = await supabaseAdmin
        .from('bughunter_testcases')
        .select('id, input, expected_output, is_sample')
        .eq('problem_id', problem.id)
        .order('id', { ascending: true });
      
      res.json({ 
        problem,
        testcases: testcases || [],
        sampleCount: testcases?.filter(t => t.is_sample).length || 0,
        totalCount: testcases?.length || 0
      });
    } else {
      // Get all Bug Hunter problems with test case counts
      const { data: problems } = await supabaseAdmin
        .from('bughunter_problems')
        .select(`
          id, slug, title,
          bughunter_testcases(id, is_sample)
        `);
      
      const summary = problems?.map(p => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        totalTestcases: p.bughunter_testcases?.length || 0,
        sampleTestcases: p.bughunter_testcases?.filter((t: any) => t.is_sample).length || 0
      })) || [];
      
      res.json({ problems: summary });
    }
  } catch (err: any) {
    console.error('[api/debug/bughunter-testcases] Error:', err?.message || err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
