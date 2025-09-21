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

const bugHunterProblems = [
  {
    slug: 'sum-bug',
    title: 'Sum Bug Fix',
    statement: `## Sum Bug Fix

You are given a buggy function that should calculate the sum of two numbers, but it has a logical error.

**Your task:** Fix the bug in the provided code so that it correctly adds two numbers.

**Input:** Two integers on separate lines
**Output:** The sum of the two integers

**Example:**
- Input: 5, 3
- Output: 8`,
    language_id: 71, // Python
    buggy_code: `# Read two numbers
a = int(input())
b = int(input())

# BUG: This should add, not subtract!
result = a - b
print(result)`,
    difficulty: 'easy',
    testcases: [
      { input: '5\n3\n', expected_output: '8\n', is_sample: true },
      { input: '10\n7\n', expected_output: '17\n', is_sample: true },
      { input: '0\n0\n', expected_output: '0\n', is_sample: false },
      { input: '-5\n3\n', expected_output: '-2\n', is_sample: false },
    ]
  },
  {
    slug: 'factorial-off-by-one',
    title: 'Factorial Off-by-One',
    statement: `## Factorial Off-by-One Bug

You are given a buggy recursive factorial function that has an off-by-one error.

**Your task:** Fix the bug so that the function correctly calculates n! (n factorial).

**Input:** A non-negative integer n
**Output:** The factorial of n

**Example:**
- Input: 5
- Output: 120 (because 5! = 5 × 4 × 3 × 2 × 1 = 120)`,
    language_id: 71, // Python
    buggy_code: `def factorial(n):
    if n == 0:
        return 1
    # BUG: Should multiply by n, not n-1
    return (n-1) * factorial(n-1)

n = int(input())
print(factorial(n))`,
    difficulty: 'medium',
    testcases: [
      { input: '5\n', expected_output: '120\n', is_sample: true },
      { input: '3\n', expected_output: '6\n', is_sample: true },
      { input: '0\n', expected_output: '1\n', is_sample: false },
      { input: '1\n', expected_output: '1\n', is_sample: false },
      { input: '4\n', expected_output: '24\n', is_sample: false },
    ]
  },
  {
    slug: 'array-max-bug',
    title: 'Array Maximum Bug',
    statement: `## Array Maximum Bug

You are given a buggy function that should find the maximum element in an array, but it has initialization and comparison errors.

**Your task:** Fix the bugs so that the function correctly finds and returns the maximum element.

**Input:** 
- First line: number of elements n
- Second line: n space-separated integers

**Output:** The maximum element in the array

**Example:**
- Input: 5\\n3 7 2 9 1
- Output: 9`,
    language_id: 71, // Python
    buggy_code: `n = int(input())
arr = list(map(int, input().split()))

# BUG: Wrong initialization and comparison
max_val = 0  # Should be arr[0] or negative infinity
for i in range(n):
    if arr[i] < max_val:  # Should be > not <
        max_val = arr[i]

print(max_val)`,
    difficulty: 'medium',
    testcases: [
      { input: '5\n3 7 2 9 1\n', expected_output: '9\n', is_sample: true },
      { input: '3\n-5 -2 -8\n', expected_output: '-2\n', is_sample: true },
      { input: '1\n42\n', expected_output: '42\n', is_sample: false },
      { input: '4\n-10 -20 -5 -15\n', expected_output: '-5\n', is_sample: false },
    ]
  }
];

async function addBugHunterProblems() {
  console.log('Adding Bug Hunter problems...');
  
  for (const problemData of bugHunterProblems) {
    console.log(`Adding problem: ${problemData.title}`);
    
    // Insert problem
    const { data: problem, error: problemError } = await supabase
      .from('bughunter_problems')
      .upsert({
        slug: problemData.slug,
        title: problemData.title,
        statement: problemData.statement,
        language_id: problemData.language_id,
        buggy_code: problemData.buggy_code,
        difficulty: problemData.difficulty,
        time_limit_ms: 2000,
        memory_limit_kb: 65536,
      }, { onConflict: 'slug' })
      .select('id')
      .single();
    
    if (problemError) {
      console.error(`Error adding problem ${problemData.title}:`, problemError);
      continue;
    }
    
    // Delete existing testcases for this problem
    await supabase
      .from('bughunter_testcases')
      .delete()
      .eq('problem_id', problem.id);
    
    // Insert testcases
    const testcases = problemData.testcases.map(tc => ({
      problem_id: problem.id,
      input: tc.input,
      expected_output: tc.expected_output,
      is_sample: tc.is_sample,
    }));
    
    const { error: testcaseError } = await supabase
      .from('bughunter_testcases')
      .insert(testcases);
    
    if (testcaseError) {
      console.error(`Error adding testcases for ${problemData.title}:`, testcaseError);
    } else {
      console.log(`✓ Added ${testcases.length} testcases for ${problemData.title}`);
    }
  }
  
  console.log('✅ Bug Hunter problems added successfully!');
}

addBugHunterProblems().catch(console.error);
