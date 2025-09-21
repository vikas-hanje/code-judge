import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_KEY in your environment');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function ingestBugHunterProblems(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const fileContent = fs.readFileSync(filePath, 'utf8');
  let data;
  
  try {
    data = JSON.parse(fileContent);
  } catch (error) {
    console.error('Invalid JSON file:', error.message);
    process.exit(1);
  }

  if (!data.bughunter_problems || !Array.isArray(data.bughunter_problems)) {
    console.error('File must contain a "bughunter_problems" array');
    process.exit(1);
  }

  console.log(`Found ${data.bughunter_problems.length} Bug Hunter problems to ingest`);

  for (const problemData of data.bughunter_problems) {
    console.log(`\nProcessing: ${problemData.title}`);
    
    // Validate required fields
    const requiredFields = ['slug', 'title', 'statement', 'language_id', 'buggy_code', 'testcases'];
    for (const field of requiredFields) {
      if (!problemData[field]) {
        console.error(`Missing required field: ${field}`);
        continue;
      }
    }

    try {
      // Insert or update problem
      const { data: problem, error: problemError } = await supabase
        .from('bughunter_problems')
        .upsert({
          slug: problemData.slug,
          title: problemData.title,
          statement: problemData.statement,
          language_id: problemData.language_id,
          buggy_code: problemData.buggy_code,
          difficulty: problemData.difficulty || 'medium',
          time_limit_ms: problemData.time_limit_ms || 2000,
          memory_limit_kb: problemData.memory_limit_kb || 65536,
        }, { onConflict: 'slug' })
        .select('id')
        .single();

      if (problemError) {
        console.error(`Error upserting problem ${problemData.title}:`, problemError.message);
        continue;
      }

      console.log(`✓ Upserted problem: ${problemData.title} (ID: ${problem.id})`);

      // Delete existing testcases for this problem
      const { error: deleteError } = await supabase
        .from('bughunter_testcases')
        .delete()
        .eq('problem_id', problem.id);

      if (deleteError) {
        console.error(`Error deleting old testcases:`, deleteError.message);
      }

      // Insert new testcases
      const testcases = problemData.testcases.map(tc => ({
        problem_id: problem.id,
        input: tc.input,
        expected_output: tc.expected_output,
        is_sample: tc.is_sample || false,
      }));

      const { error: testcaseError } = await supabase
        .from('bughunter_testcases')
        .insert(testcases);

      if (testcaseError) {
        console.error(`Error inserting testcases:`, testcaseError.message);
      } else {
        const sampleCount = testcases.filter(tc => tc.is_sample).length;
        const hiddenCount = testcases.length - sampleCount;
        console.log(`✓ Inserted ${testcases.length} testcases (${sampleCount} sample, ${hiddenCount} hidden)`);
      }

    } catch (error) {
      console.error(`Error processing ${problemData.title}:`, error.message);
    }
  }

  console.log('\n✅ Bug Hunter problems ingestion completed!');
}

// Get file path from command line arguments
const filePath = process.argv.find(arg => arg.startsWith('--file='))?.split('=')[1];

if (!filePath) {
  console.error('Usage: node ingest-bughunter.mjs --file=path/to/bughunter-problems.json');
  process.exit(1);
}

ingestBugHunterProblems(filePath).catch(console.error);
