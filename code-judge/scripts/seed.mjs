import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

  const jsonPath = resolve(__dirname, '../supabase/problems.example.json');
  const text = await readFile(jsonPath, 'utf-8');
  const data = JSON.parse(text);
  const problems = data.problems || [];
  for (const p of problems) {
    console.log(`Upserting problem ${p.slug} ...`);
    const { data: inserted, error } = await supabase
      .from('problems')
      .upsert(
        {
          slug: p.slug,
          title: p.title,
          statement: p.statement,
          time_limit_ms: p.time_limit_ms,
          memory_limit_kb: p.memory_limit_kb,
        },
        { onConflict: 'slug' }
      )
      .select('id')
      .single();
    if (error) {
      console.error('Problem upsert error:', error.message);
      continue;
    }
    const problemId = inserted.id;

    // Delete existing testcases for id to avoid duplicates (optional)
    await supabase.from('testcases').delete().eq('problem_id', problemId);

    const tcs = p.testcases || [];
    if (tcs.length) {
      const payload = tcs.map((tc) => ({
        problem_id: problemId,
        input: tc.input,
        expected_output: tc.expected_output,
        is_sample: !!tc.is_sample,
      }));
      const { error: tcErr } = await supabase.from('testcases').insert(payload);
      if (tcErr) console.error('Testcases insert error:', tcErr.message);
      else console.log(`Inserted ${payload.length} testcases for ${p.slug}`);
    }
  }
  console.log('Seeding complete');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
