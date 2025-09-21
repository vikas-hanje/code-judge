const API_BASE = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
const API_KEY = process.env.JUDGE0_API_KEY;
const API_HOST = process.env.JUDGE0_API_HOST || 'judge0-ce.p.rapidapi.com';

export type Judge0SubmissionPayload = {
  source_code: string;
  language_id: number;
  stdin?: string;
  expected_output?: string;
  cpu_time_limit?: number; // seconds
  memory_limit?: number; // KB
};

export type Judge0Result = {
  token: string;
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  time?: string | null;
  memory?: number | null;
  status: { id: number; description: string };
};

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function submitToJudge0(payload: Judge0SubmissionPayload): Promise<{ token: string }> {
  const res = await fetch(`${API_BASE}/submissions?base64_encoded=false&wait=false`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-RapidAPI-Key': API_KEY || '',
      'X-RapidAPI-Host': API_HOST,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Judge0 submit failed: ${res.status} ${text}`);
  }
  return res.json();
}

export async function getJudge0Result(token: string): Promise<Judge0Result> {
  const res = await fetch(`${API_BASE}/submissions/${token}?base64_encoded=false`, {
    headers: {
      'X-RapidAPI-Key': API_KEY || '',
      'X-RapidAPI-Host': API_HOST,
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Judge0 get result failed: ${res.status} ${text}`);
  }
  return res.json();
}

export async function runOnJudge0(payload: Judge0SubmissionPayload, { maxWaitMs = 30000, pollIntervalMs = 1200 } = {}) {
  const { token } = await submitToJudge0(payload);
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const result = await getJudge0Result(token);
    if (result.status && result.status.id > 2) {
      return result;
    }
    await sleep(pollIntervalMs);
  }
  throw new Error('Judge0 polling timed out');
}
