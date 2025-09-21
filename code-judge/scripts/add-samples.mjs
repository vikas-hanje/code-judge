import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_KEY in your environment');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function addSampleTestCases() {
  // Get sum-of-digits problem
  const { data: problem } = await supabase
    .from('problems')
    .select('id')
    .eq('slug', 'sum-of-digits')
    .single();

  if (problem) {
    console.log('Adding sample test case for sum-of-digits...');
    const { error } = await supabase
      .from('testcases')
      .insert({
        problem_id: problem.id,
        input: '456\n',
        expected_output: '15\n',
        is_sample: true
      });
    
    if (error) {
      console.error('Error adding test case:', error);
    } else {
      console.log('Added sample test case for sum-of-digits');
    }
  }

  // Get factorial-recursion problem
  const { data: factorialProblem } = await supabase
    .from('problems')
    .select('id')
    .eq('slug', 'factorial-recursion')
    .single();

  if (factorialProblem) {
    console.log('Adding sample test case for factorial-recursion...');
    const { error } = await supabase
      .from('testcases')
      .insert({
        problem_id: factorialProblem.id,
        input: '3\n',
        expected_output: '6\n',
        is_sample: true
      });
    
    if (error) {
      console.error('Error adding test case:', error);
    } else {
      console.log('Added sample test case for factorial-recursion');
    }
  }

  console.log('Done adding sample test cases');
}

addSampleTestCases().catch(console.error);
