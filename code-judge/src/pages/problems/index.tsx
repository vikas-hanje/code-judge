import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function ProblemsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  useEffect(() => {
    (async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        window.location.href = '/login';
        return;
      }
      const token = session.session.access_token;
      const res = await fetch('/api/problems', { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      setItems(json.problems || []);
      setLoading(false);
    })();
  }, []);

  const list = items.filter((p) => p.title?.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <aside className="card md:col-span-1">
        <h2 className="mb-2 text-lg font-semibold">Problems</h2>
        <input className="input mb-3" placeholder="Search..." value={q} onChange={(e)=>setQ(e.target.value)} />
        {loading ? (
          <p>Loading...</p>
        ) : (
          <ul className="space-y-1">
            {list.map((p) => (
              <li key={p.id}>
                <Link className="text-indigo-600 hover:underline" href={`/problems/${p.slug}`}>{p.title}</Link>
              </li>
            ))}
          </ul>
        )}
      </aside>
      <section className="md:col-span-2">
        <div className="card">
          <h3 className="text-gray-700">Select a problem from the list.</h3>
        </div>
      </section>
    </div>
  );
}
