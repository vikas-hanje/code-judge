import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function SubmissionsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        window.location.href = '/login';
        return;
      }
      const token = session.session.access_token;
      const res = await fetch('/api/submissions', { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      setItems(json.submissions || []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="card">
      <h1 className="mb-3 text-xl font-semibold" style={{ color: 'rgb(var(--fg))' }}>My Submissions</h1>
      {loading ? (
        <p style={{ color: 'rgb(var(--fg))' }}>Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b" style={{ backgroundColor: 'rgb(var(--input-bg))', borderColor: 'rgb(var(--border))' }}>
                <th className="px-3 py-2 font-semibold" style={{ color: 'rgb(var(--fg))' }}>Created</th>
                <th className="px-3 py-2 font-semibold" style={{ color: 'rgb(var(--fg))' }}>Problem</th>
                <th className="px-3 py-2 font-semibold" style={{ color: 'rgb(var(--fg))' }}>Lang</th>
                <th className="px-3 py-2 font-semibold" style={{ color: 'rgb(var(--fg))' }}>Status</th>
                <th className="px-3 py-2 font-semibold" style={{ color: 'rgb(var(--fg))' }}>Time (ms)</th>
                <th className="px-3 py-2 font-semibold" style={{ color: 'rgb(var(--fg))' }}>Mem (KB)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id} className="border-b hover:bg-opacity-50 transition-colors" style={{ borderColor: 'rgb(var(--border))' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(var(--border) / 0.1)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td className="px-3 py-2" style={{ color: 'rgb(var(--fg))' }}>{new Date(s.created_at).toLocaleString()}</td>
                  <td className="px-3 py-2" style={{ color: 'rgb(var(--fg))' }}>{s.problem_id}</td>
                  <td className="px-3 py-2" style={{ color: 'rgb(var(--fg))' }}>{s.language_id}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      s.status === 'Accepted' ? 'text-green-800 bg-green-100 dark:text-green-300 dark:bg-green-900/30' :
                      s.status === 'Wrong Answer' || s.status === 'Runtime Error' ? 'text-red-800 bg-red-100 dark:text-red-300 dark:bg-red-900/30' :
                      'text-yellow-800 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/30'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-3 py-2" style={{ color: 'rgb(var(--fg))' }}>{s.time_ms ?? '-'}</td>
                  <td className="px-3 py-2" style={{ color: 'rgb(var(--fg))' }}>{s.memory_kb ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
