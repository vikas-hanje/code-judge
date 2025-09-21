import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import Editor from '../../components/Editor';
import ProblemView from '../../components/ProblemView';

const languages = [
  { id: 71, label: 'Python 3.8.1', monaco: 'python' },
  { id: 63, label: 'JavaScript (Node.js 12.14.0)', monaco: 'javascript' },
  { id: 54, label: 'C++ (GCC 9.2.0)', monaco: 'cpp' },
  { id: 50, label: 'C (GCC 9.2.0)', monaco: 'c' },
  { id: 62, label: 'Java (OpenJDK 13.0.1)', monaco: 'java' },
];

export default function BugHunterProblemDetail() {
  const router = useRouter();
  const slug = router.query.slug as string;

  const [problem, setProblem] = useState<any | null>(null);
  const [samples, setSamples] = useState<any[]>([]);
  const [problems, setProblems] = useState<any[]>([]);
  const [code, setCode] = useState<string>('');
  const [stdin, setStdin] = useState<string>('');
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [sampleResults, setSampleResults] = useState<{ [key: number]: { stdout: string; status: string } } | undefined>(undefined);

  useEffect(() => {
    (async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        router.replace('/login');
        return;
      }
      const token = session.session.access_token;
      const headers = { Authorization: `Bearer ${token}` } as any;
      
      const [listRes, probRes, statusRes] = await Promise.all([
        fetch('/api/bughunter/problems', { headers }),
        slug ? fetch(`/api/bughunter/problems/${slug}`, { headers }) : Promise.resolve(null),
        slug ? fetch(`/api/bughunter/problems/${slug}/status`, { headers }) : Promise.resolve(null),
      ]);
      
      const list = await listRes.json();
      setProblems(list.problems || []);
      
      if (probRes) {
        const data = await probRes.json();
        setProblem(data.problem);
        setSamples(data.samples || []);
        // Set the buggy starter code
        setCode(data.problem?.buggy_code || '');
      }

      // Check submission status
      if (statusRes) {
        const statusData = await statusRes.json();
        setHasSubmitted(statusData.hasSubmitted || false);
      }
    })();
  }, [slug, router]);

  const monacoLang = useMemo(() => {
    if (!problem) return 'python';
    const lang = languages.find((l) => l.id === problem.language_id);
    return lang?.monaco || 'python';
  }, [problem]);

  const getLanguageLabel = (languageId: number) => {
    const lang = languages.find(l => l.id === languageId);
    return lang ? lang.label : `Language ${languageId}`;
  };

  async function withAuthHeaders() {
    const { data: session } = await supabase.auth.getSession();
    const token = session.session?.access_token;
    return { Authorization: `Bearer ${token}` } as any;
  }

  async function run() {
    setLoading(true);
    setResult(null);
    setSampleResults(undefined);
    try {
      const headers = { ...(await withAuthHeaders()), 'Content-Type': 'application/json' };
      const res = await fetch('/api/bughunter/run', {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          source_code: code, 
          language_id: problem.language_id, 
          stdin, 
          problemSlug: slug 
        }),
      });
      const json = await res.json();
      setResult(json);
      console.log('Bug Hunter run result:', json);
      if (json.sampleResults) {
        console.log('Sample results:', json.sampleResults);
        setSampleResults(json.sampleResults);
      }
    } finally {
      setLoading(false);
    }
  }

  async function submit() {
    setLoading(true);
    setResult(null);
    try {
      const headers = { ...(await withAuthHeaders()), 'Content-Type': 'application/json' };
      const res = await fetch('/api/bughunter/submit', {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          source_code: code, 
          language_id: problem.language_id, 
          problemSlug: slug 
        }),
      });
      const json = await res.json();
      setResult(json);
      // Mark as submitted after actual submission
      setHasSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  if (!problem) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading Bug Hunter problem...</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <aside className="card md:col-span-1">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold">🐛 Bug Hunter Problems</h2>
          <Link href="/bughunter" className="text-sm hover:underline" style={{ color: 'rgb(var(--accent))' }}>
            All
          </Link>
        </div>
        <ul className="space-y-1">
          {problems.map((p) => (
            <li key={p.id}>
              <Link 
                className={`hover:underline ${p.slug === slug ? 'font-semibold' : ''}`} 
                style={{ color: p.slug === slug ? 'rgb(var(--accent-hover))' : 'rgb(var(--accent))' }}
                href={`/bughunter/${p.slug}`}
              >
                {p.title}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
      
      <section className="md:col-span-2 space-y-4">
        {problem && (
          <div className="card">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2">{problem.title}</h1>
                <div className="flex items-center gap-4 text-sm" style={{ color: 'rgb(var(--muted))' }}>
                  <span className="px-2 py-1 rounded" style={{ backgroundColor: 'rgb(var(--warning) / 0.2)', color: 'rgb(var(--warning))' }}>
                    🐛 Bug Hunter
                  </span>
                  <span className={`font-medium capitalize`} style={{ 
                    color: problem.difficulty === 'easy' ? 'rgb(var(--success))' :
                           problem.difficulty === 'hard' ? 'rgb(var(--error))' :
                           'rgb(var(--warning))'
                  }}>
                    {problem.difficulty || 'Medium'}
                  </span>
                  <span className="px-2 py-1 rounded" style={{ backgroundColor: 'rgb(var(--border))', color: 'rgb(var(--fg))' }}>
                    {getLanguageLabel(problem.language_id)}
                  </span>
                </div>
              </div>
            </div>
            
            <ProblemView 
              title=""
              statement={problem.statement} 
              samples={samples}
              sampleResults={sampleResults}
            />
          </div>
        )}
        
        <div className="card space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Language:</span>
              <span className="text-sm bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">
                {getLanguageLabel(problem.language_id)} (Locked)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn btn-secondary" onClick={run} disabled={loading}>
                Run (Ctrl/Cmd+Enter)
              </button>
              <button 
                className={`btn ${hasSubmitted ? 'btn-disabled' : 'btn-primary'}`} 
                onClick={submit} 
                disabled={loading || hasSubmitted}
                title={hasSubmitted ? 'You have already submitted this problem' : 'Submit your fixed solution'}
              >
                {hasSubmitted ? 'Already Submitted' : 'Submit'}
              </button>
            </div>
          </div>
          
          <div>
            <label className="label">Fix the buggy code below:</label>
            <Editor 
              language={monacoLang} 
              value={code} 
              onChange={setCode} 
              onRun={run} 
              onSubmit={submit} 
            />
          </div>
          
          <div>
            <label className="label">stdin (optional - for testing)</label>
            <textarea 
              className="input min-h-[100px] font-mono" 
              value={stdin} 
              onChange={(e) => setStdin(e.target.value)} 
              placeholder="Optional input to test your fixed code" 
            />
          </div>
          
          {result && (
            <div className="card">
              {result.error ? (
                <p className="text-sm text-red-600 dark:text-red-400">{result.error}</p>
              ) : (
                <div className="space-y-4 text-sm">
                  {'status' in result && (
                    <p>
                      <span className="font-semibold">Status:</span> 
                      <span className={`ml-2 font-medium ${
                        result.status === 'Accepted' || (result.summary && result.summary.passed === result.summary.total)
                          ? 'text-green-600 dark:text-green-400'
                          : result.status.toLowerCase().includes('error') || result.status.toLowerCase().includes('failed') || result.status.includes('NZEC')
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-yellow-600 dark:text-yellow-400'
                      }`}>
                        {result.status.includes('NZEC') ? 'Runtime Error (NZEC)' : result.status}
                      </span>
                    </p>
                  )}
                  
                  {/* Custom Input Results (only if user provided stdin) */}
                  {stdin && (
                    <div className="border-t pt-3" style={{ borderColor: 'rgb(var(--border))' }}>
                      <h4 className="font-semibold mb-2">Custom Input Result</h4>
                      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                        <div>
                          <div className="label">Your Input</div>
                          <pre className="whitespace-pre-wrap rounded border p-2 text-xs bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100" style={{ borderColor: 'rgb(var(--border))' }}>{stdin}</pre>
                        </div>
                        <div>
                          <div className="label">Output</div>
                          <pre className="whitespace-pre-wrap rounded border p-2 text-xs bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100" style={{ borderColor: 'rgb(var(--border))' }}>{result.stdout || '(no output)'}</pre>
                        </div>
                      </div>
                      {result.stderr && (
                        <div className="mt-2">
                          <div className="label">Error Output</div>
                          <pre className="whitespace-pre-wrap rounded border border-red-200 p-2 text-xs bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700">{result.stderr}</pre>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Summary for submissions */}
                  {'summary' in result && result.summary && (
                    <div className="border-t pt-3" style={{ borderColor: 'rgb(var(--border))' }}>
                      <div className="label">Submission Summary</div>
                      <div className="bg-gray-50 dark:bg-slate-800 rounded p-3">
                        <div className="text-lg font-semibold mb-2">
                          {result.summary.passed === result.summary.total ? (
                            <span className="text-green-600 dark:text-green-400">🎉 All Tests Passed!</span>
                          ) : (
                            <span className="text-red-600 dark:text-red-400">❌ Some Tests Failed</span>
                          )}
                        </div>
                        <div className="text-sm space-y-1">
                          <p><strong>Passed:</strong> {result.summary.passed}/{result.summary.total} test cases</p>
                          {result.time_ms && <p><strong>Time:</strong> {result.time_ms}ms</p>}
                          {result.memory_kb && <p><strong>Memory:</strong> {result.memory_kb}KB</p>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
