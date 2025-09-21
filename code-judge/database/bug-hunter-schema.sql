-- Bug Hunter Problems Table
CREATE TABLE bughunter_problems (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  statement TEXT NOT NULL,
  language_id INTEGER NOT NULL, -- Judge0 language ID (locked language)
  buggy_code TEXT NOT NULL, -- The buggy starter code
  time_limit_ms INTEGER DEFAULT 2000,
  memory_limit_kb INTEGER DEFAULT 65536,
  difficulty VARCHAR(50) DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bug Hunter Test Cases Table
CREATE TABLE bughunter_testcases (
  id SERIAL PRIMARY KEY,
  problem_id INTEGER REFERENCES bughunter_problems(id) ON DELETE CASCADE,
  input TEXT NOT NULL,
  expected_output TEXT NOT NULL,
  is_sample BOOLEAN DEFAULT FALSE, -- Sample test cases visible to users
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bug Hunter Submissions Table
CREATE TABLE bughunter_submissions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id INTEGER REFERENCES bughunter_problems(id) ON DELETE CASCADE,
  source_code TEXT NOT NULL,
  language_id INTEGER NOT NULL,
  status VARCHAR(100) DEFAULT 'pending',
  passed_testcases INTEGER DEFAULT 0,
  total_testcases INTEGER DEFAULT 0,
  time_ms INTEGER,
  memory_kb INTEGER,
  is_submission BOOLEAN DEFAULT TRUE, -- TRUE for submissions, FALSE for runs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_bughunter_problems_slug ON bughunter_problems(slug);
CREATE INDEX idx_bughunter_testcases_problem_id ON bughunter_testcases(problem_id);
CREATE INDEX idx_bughunter_testcases_is_sample ON bughunter_testcases(is_sample);
CREATE INDEX idx_bughunter_submissions_user_id ON bughunter_submissions(user_id);
CREATE INDEX idx_bughunter_submissions_problem_id ON bughunter_submissions(problem_id);
CREATE INDEX idx_bughunter_submissions_created_at ON bughunter_submissions(created_at);

-- Row Level Security (RLS) policies
ALTER TABLE bughunter_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE bughunter_testcases ENABLE ROW LEVEL SECURITY;
ALTER TABLE bughunter_submissions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read problems
CREATE POLICY "Allow authenticated users to read bughunter problems" ON bughunter_problems
  FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to read sample testcases only
CREATE POLICY "Allow authenticated users to read sample bughunter testcases" ON bughunter_testcases
  FOR SELECT TO authenticated USING (is_sample = true);

-- Allow service role to read all testcases
CREATE POLICY "Allow service role to read all bughunter testcases" ON bughunter_testcases
  FOR SELECT TO service_role USING (true);

-- Allow users to read their own submissions
CREATE POLICY "Allow users to read their own bughunter submissions" ON bughunter_submissions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Allow users to insert their own submissions
CREATE POLICY "Allow users to insert their own bughunter submissions" ON bughunter_submissions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Allow service role full access to all tables
CREATE POLICY "Allow service role full access to bughunter problems" ON bughunter_problems
  FOR ALL TO service_role USING (true);

CREATE POLICY "Allow service role full access to bughunter testcases" ON bughunter_testcases
  FOR ALL TO service_role USING (true);

CREATE POLICY "Allow service role full access to bughunter submissions" ON bughunter_submissions
  FOR ALL TO service_role USING (true);
