import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';

const languages = [
  { id: 71, label: 'Python 3.8.1' },
  { id: 63, label: 'JavaScript (Node.js 12.14.0)' },
  { id: 54, label: 'C++ (GCC 9.2.0)' },
  { id: 50, label: 'C (GCC 9.2.0)' },
  { id: 62, label: 'Java (OpenJDK 13.0.1)' },
];

export default function BugHunterProblems() {
  const router = useRouter();
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        router.replace('/login');
        return;
      }
      
      const token = session.session.access_token;
      const headers = { Authorization: `Bearer ${token}` };
      
      try {
        const res = await fetch('/api/bughunter/problems', { headers });
        const data = await res.json();
        setProblems(data.problems || []);
      } catch (error) {
        console.error('Error fetching Bug Hunter problems:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const getLanguageLabel = (languageId: number) => {
    const lang = languages.find(l => l.id === languageId);
    return lang ? lang.label : `Language ${languageId}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-600 dark:text-green-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'hard': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading Bug Hunter problems...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'rgb(var(--fg))' }}>
            🐛 Bug Hunter
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Fix buggy code to make it pass all test cases. Each problem comes with broken starter code that you need to debug and repair.
          </p>
        </div>
      </div>

      {problems.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold mb-2">No Bug Hunter Problems Yet</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Bug Hunter problems will appear here once they're added to the platform.
          </p>
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'rgb(var(--border))' }}>
                  <th className="text-left py-3 px-4 font-semibold">Problem</th>
                  <th className="text-left py-3 px-4 font-semibold">Difficulty</th>
                  <th className="text-left py-3 px-4 font-semibold">Language</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {problems.map((problem) => (
                  <tr 
                    key={problem.id} 
                    className="border-b hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                    style={{ borderColor: 'rgb(var(--border))' }}
                  >
                    <td className="py-3 px-4">
                      <Link 
                        href={`/bughunter/${problem.slug}`}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium transition-colors"
                      >
                        {problem.title}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-medium capitalize ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty || 'Medium'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">
                        {getLanguageLabel(problem.language_id)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Not Attempted
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="text-lg font-semibold mb-3">How Bug Hunter Works</h2>
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-xs font-semibold">1</span>
            <p>Each Bug Hunter problem provides you with <strong>buggy starter code</strong> that doesn't work correctly.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-xs font-semibold">2</span>
            <p>Your task is to <strong>identify and fix the bugs</strong> to make the code produce correct outputs.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-xs font-semibold">3</span>
            <p>Use the <strong>Run</strong> button to test your fixes with sample inputs, then <strong>Submit</strong> when ready.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-xs font-semibold">4</span>
            <p>Success means your fixed code passes <strong>all hidden test cases</strong> for the problem.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
