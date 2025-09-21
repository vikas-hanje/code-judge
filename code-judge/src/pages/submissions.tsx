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
      <h1 className="mb-3 text-xl font-semibold">My Submissions</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-3 py-2">Created</th>
                <th className="px-3 py-2">Problem</th>
                <th className="px-3 py-2">Lang</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Time (ms)</th>
                <th className="px-3 py-2">Mem (KB)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id} className="border-b">
                  <td className="px-3 py-2">{new Date(s.created_at).toLocaleString()}</td>
                  <td className="px-3 py-2">{s.problem_id}</td>
                  <td className="px-3 py-2">{s.language_id}</td>
                  <td className="px-3 py-2">{s.status}</td>
                  <td className="px-3 py-2">{s.time_ms ?? '-'}</td>
                  <td className="px-3 py-2">{s.memory_kb ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
