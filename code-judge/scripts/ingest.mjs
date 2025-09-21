import { readFile } from 'fs/promises';
import { createClient } from '@supabase/supabase-js';
import { resolve } from 'path';

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { file: null };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--file' || a === '-f') {
      out.file = args[i + 1];
      i++;
    } else if (!out.file) {
      out.file = a;
    }
  }
  return out;
}

async function main() {
  const { file } = parseArgs();
  if (!file) {
    console.error('Usage: node scripts/ingest.mjs --file <path-to-problems.json>');
    process.exit(1);
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Set SUPABASE_URL and SUPABASE_SERVICE_KEY in your environment');
    process.exit(1);
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const path = resolve(file);
  const text = await readFile(path, 'utf-8');
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    console.error('Failed to parse JSON from file:', path);
    throw e;
  }

  const problems = Array.isArray(data) ? data : data.problems || [];
  if (!Array.isArray(problems) || problems.length === 0) {
    console.error('No problems found in file');
    process.exit(1);
  }

  for (const p of problems) {
    if (!p.slug || !p.title || !p.statement) {
      console.warn('Skipping invalid problem (missing slug/title/statement):', p);
      continue;
    }
    console.log(`Upserting problem ${p.slug} ...`);
    const { data: inserted, error } = await supabase
      .from('problems')
      .upsert(
        {
          slug: p.slug,
          title: p.title,
          statement: p.statement,
          time_limit_ms: p.time_limit_ms ?? 2000,
          memory_limit_kb: p.memory_limit_kb ?? 65536,
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

    // Replace testcases for this problem to avoid duplicates
    const { error: delErr } = await supabase.from('testcases').delete().eq('problem_id', problemId);
    if (delErr) console.error('Testcases delete error:', delErr.message);

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
  console.log('Ingestion complete');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
