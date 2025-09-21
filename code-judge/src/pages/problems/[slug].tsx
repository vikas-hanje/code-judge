import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { languages, defaultTemplateFor } from '../../lib/languages';
import Editor from '../../components/Editor';
import ProblemView from '../../components/ProblemView';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';

export default function ProblemDetailPage() {
  const router = useRouter();
  const slug = router.query.slug as string;

  const [problem, setProblem] = useState<any | null>(null);
  const [samples, setSamples] = useState<any[]>([]);
  const [problems, setProblems] = useState<any[]>([]);
  const [languageId, setLanguageId] = useState<number>(71);
  const [code, setCode] = useState<string>(defaultTemplateFor(71));
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
        fetch('/api/problems', { headers }),
        slug ? fetch(`/api/problems/${slug}`, { headers }) : Promise.resolve(null),
        slug ? fetch(`/api/problems/${slug}/status`, { headers }) : Promise.resolve(null),
      ]);
      const list = await listRes.json();
      setProblems(list.problems || []);
      if (probRes) {
        const data = await probRes.json();
        setProblem(data.problem);
        setSamples(data.samples || []);
        // Debug logging
        console.log(`[problems/${slug}] Received ${data.samples?.length || 0} sample test cases:`, data.samples);
      }
      if (statusRes) {
        const statusData = await statusRes.json();
        setHasSubmitted(statusData.hasSubmitted);
      }
    })();
  }, [slug, router]);

  // Reset template when language changes if code is empty or default
  useEffect(() => {
    setCode((prev) => (prev ? prev : defaultTemplateFor(languageId)));
  }, [languageId]);

  const monacoLang = useMemo(() => {
    const lang = languages.find((l) => l.id === languageId);
    if (!lang) return 'plaintext';
    if (lang.value === 'python') return 'python';
    if (lang.value === 'c') return 'c';
    return 'plaintext';
  }, [languageId]);

  async function withAuthHeaders() {
    const { data: session } = await supabase.auth.getSession();
    const token = session.session?.access_token;
    return { Authorization: `Bearer ${token}` } as any;
  }

  async function run() {
    setLoading(true);
    setResult(null);
    setSampleResults(undefined); // Clear previous sample results
    try {
      const headers = { ...(await withAuthHeaders()), 'Content-Type': 'application/json' };
      const res = await fetch('/api/run', {
        method: 'POST',
        headers,
        body: JSON.stringify({ source_code: code, language_id: languageId, stdin, problemSlug: slug }),
      });
      const json = await res.json();
      setResult(json);
      console.log('Run result:', json); // Debug log
      if (json.sampleResults) {
        console.log('Sample results:', json.sampleResults); // Debug log
        setSampleResults(json.sampleResults);
      }
      // Don't update submission status for Run - only for Submit
    } finally {
      setLoading(false);
    }
  }

  async function submit() {
    setLoading(true);
    setResult(null);
    try {
      const headers = { ...(await withAuthHeaders()), 'Content-Type': 'application/json' };
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers,
        body: JSON.stringify({ source_code: code, language_id: languageId, problemSlug: slug }),
      });
      const json = await res.json();
      setResult(json);
      // Only mark as submitted after actual submission, regardless of result
      setHasSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <aside className="card md:col-span-1">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Problems</h2>
          <Link className="text-sm hover:underline" style={{ color: 'rgb(var(--accent))' }} href="/problems">All</Link>
        </div>
        <ul className="space-y-1">
          {problems.map((p) => (
            <li key={p.id}>
              <Link 
                className={`hover:underline ${p.slug === slug ? 'font-semibold' : ''}`} 
                style={{ color: p.slug === slug ? 'rgb(var(--accent-hover))' : 'rgb(var(--accent))' }}
                href={`/problems/${p.slug}`}
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
            <ProblemView 
              title={problem.title} 
              statement={problem.statement} 
              samples={samples}
              sampleResults={sampleResults}
            />
          </div>
        )}
        <div className="card space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <label className="label m-0">Language</label>
              <select className="input" value={languageId} onChange={(e)=>setLanguageId(parseInt(e.target.value))}>
                {languages.map((l) => (
                  <option key={l.id} value={l.id}>{l.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn btn-secondary" onClick={run} disabled={loading}>Run (Ctrl/Cmd+Enter)</button>
              <button 
                className={`btn ${hasSubmitted ? 'btn-disabled' : 'btn-primary'}`} 
                onClick={submit} 
                disabled={loading || hasSubmitted}
                title={hasSubmitted ? 'You have already submitted this problem' : 'Submit your solution'}
              >
                {hasSubmitted ? 'Already Submitted' : 'Submit'}
              </button>
            </div>
          </div>
          <Editor language={monacoLang} value={code} onChange={setCode} onRun={run} onSubmit={submit} />
          <div>
            <label className="label">stdin</label>
            <textarea className="input min-h-[100px] font-mono" value={stdin} onChange={(e)=>setStdin(e.target.value)} placeholder="Optional input to program" />
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
                      <pre className="whitespace-pre-wrap rounded border p-2 text-xs bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100" style={{ borderColor: 'rgb(var(--border))' }}>{JSON.stringify(result.summary, null, 2)}</pre>
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
