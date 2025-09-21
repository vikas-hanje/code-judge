import { readFile } from 'fs/promises';
import { createClient } from '@supabase/supabase-js';
import { resolve } from 'path';

async function main() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Set SUPABASE_URL and SUPABASE_SERVICE_KEY in your environment');
    process.exit(1);
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const path = resolve('problems.js');
  const text = await readFile(path, 'utf-8');
  const data = JSON.parse(text);
  const problems = data.problems || [];

  console.log(`Force re-ingesting ${problems.length} problems...`);

  for (const p of problems) {
    console.log(`\n=== Processing ${p.slug} ===`);
    
    // First, get or create the problem
    const { data: existing } = await supabase
      .from('problems')
      .select('id')
      .eq('slug', p.slug)
      .maybeSingle();

    let problemId;
    if (existing) {
      problemId = existing.id;
      console.log(`Found existing problem with ID ${problemId}`);
    } else {
      const { data: inserted, error } = await supabase
        .from('problems')
        .insert({
          slug: p.slug,
          title: p.title,
          statement: p.statement,
          time_limit_ms: p.time_limit_ms ?? 2000,
          memory_limit_kb: p.memory_limit_kb ?? 65536,
        })
        .select('id')
        .single();
      
      if (error) {
        console.error('Problem insert error:', error.message);
        continue;
      }
      problemId = inserted.id;
      console.log(`Created new problem with ID ${problemId}`);
    }

    // Delete ALL existing testcases for this problem
    const { error: delErr } = await supabase
      .from('testcases')
      .delete()
      .eq('problem_id', problemId);
    
    if (delErr) {
      console.error('Testcases delete error:', delErr.message);
    } else {
      console.log('Deleted existing testcases');
    }

    // Insert new testcases
    const tcs = p.testcases || [];
    if (tcs.length) {
      const payload = tcs.map((tc) => ({
        problem_id: problemId,
        input: tc.input,
        expected_output: tc.expected_output,
        is_sample: !!tc.is_sample,
      }));
      
      const { error: tcErr } = await supabase.from('testcases').insert(payload);
      if (tcErr) {
        console.error('Testcases insert error:', tcErr.message);
      } else {
        const sampleCount = payload.filter(tc => tc.is_sample).length;
        console.log(`✅ Inserted ${payload.length} testcases (${sampleCount} samples) for ${p.slug}`);
      }
    }
  }
  
  console.log('\n🎉 Force re-ingestion complete!');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
