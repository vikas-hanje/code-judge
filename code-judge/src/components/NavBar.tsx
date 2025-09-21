import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function NavBar() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_ev, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <nav className="sticky top-0 z-40 w-full border-b backdrop-blur transition-colors" style={{ backgroundColor: 'rgb(var(--nav-bg) / 0.8)', borderColor: 'rgb(var(--border))' }}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link href="/problems" className="flex items-center gap-2">
            <span className="inline-block rounded px-2 py-1 text-xs font-semibold text-white" style={{ backgroundColor: 'rgb(var(--accent))' }}>CJ</span>
            <span className="text-base font-semibold" style={{ color: 'rgb(var(--fg))' }}>Code Judge</span>
          </Link>
          <div className="hidden items-center gap-4 md:flex">
            <Link href="/problems" className="text-sm transition-all duration-200 hover:scale-105" style={{ color: 'rgb(var(--muted))' }} onMouseEnter={(e) => e.currentTarget.style.color = 'rgb(var(--accent))'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgb(var(--muted))'}>Problems</Link>
            <Link href="/bughunter" className="text-sm transition-all duration-200 hover:scale-105" style={{ color: 'rgb(var(--muted))' }} onMouseEnter={(e) => e.currentTarget.style.color = 'rgb(var(--accent))'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgb(var(--muted))'}>Bug Hunter</Link>
            <Link href="/submissions" className="text-sm transition-all duration-200 hover:scale-105" style={{ color: 'rgb(var(--muted))' }} onMouseEnter={(e) => e.currentTarget.style.color = 'rgb(var(--accent))'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgb(var(--muted))'}>My Submissions</Link>
            <Link href="/leaderboard" className="text-sm transition-all duration-200 hover:scale-105" style={{ color: 'rgb(var(--muted))' }} onMouseEnter={(e) => e.currentTarget.style.color = 'rgb(var(--accent))'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgb(var(--muted))'}>Leaderboard</Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="rounded-md p-2 transition-all duration-200 hover:scale-110"
            style={{ 
              color: 'rgb(var(--muted))',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgb(var(--border) / 0.3)';
              e.currentTarget.style.color = 'rgb(var(--accent))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'rgb(var(--muted))';
            }}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-3">
            {email ? (
              <>
                <Link href="/profile" className="text-sm transition-all duration-200 hover:scale-105" style={{ color: 'rgb(var(--muted))' }} onMouseEnter={(e) => e.currentTarget.style.color = 'rgb(var(--accent))'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgb(var(--muted))'}>Profile</Link>
                <button onClick={logout} className="btn btn-secondary">Logout</button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn btn-primary">Login</Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-md p-2 transition-all duration-200"
            style={{ 
              color: 'rgb(var(--muted))',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgb(var(--border) / 0.3)';
              e.currentTarget.style.color = 'rgb(var(--accent))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'rgb(var(--muted))';
            }}
            title="Menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t" style={{ backgroundColor: 'rgb(var(--nav-bg))', borderColor: 'rgb(var(--border))' }}>
          <div className="px-4 py-3 space-y-3">
            <Link 
              href="/problems" 
              className="block text-sm transition-colors py-2" 
              style={{ color: 'rgb(var(--muted))' }}
              onClick={() => setMobileMenuOpen(false)}
              onMouseEnter={(e) => e.currentTarget.style.color = 'rgb(var(--accent))'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgb(var(--muted))'}
            >
              Problems
            </Link>
            <Link 
              href="/bughunter" 
              className="block text-sm transition-colors py-2" 
              style={{ color: 'rgb(var(--muted))' }}
              onClick={() => setMobileMenuOpen(false)}
              onMouseEnter={(e) => e.currentTarget.style.color = 'rgb(var(--accent))'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgb(var(--muted))'}
            >
              Bug Hunter
            </Link>
            <Link 
              href="/submissions" 
              className="block text-sm transition-colors py-2" 
              style={{ color: 'rgb(var(--muted))' }}
              onClick={() => setMobileMenuOpen(false)}
              onMouseEnter={(e) => e.currentTarget.style.color = 'rgb(var(--accent))'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgb(var(--muted))'}
            >
              My Submissions
            </Link>
            <Link 
              href="/leaderboard" 
              className="block text-sm transition-colors py-2" 
              style={{ color: 'rgb(var(--muted))' }}
              onClick={() => setMobileMenuOpen(false)}
              onMouseEnter={(e) => e.currentTarget.style.color = 'rgb(var(--accent))'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgb(var(--muted))'}
            >
              Leaderboard
            </Link>
            
            <div className="pt-3 border-t" style={{ borderColor: 'rgb(var(--border))' }}>
              {email ? (
                <>
                  <Link 
                    href="/profile" 
                    className="block text-sm transition-colors py-2" 
                    style={{ color: 'rgb(var(--muted))' }}
                    onClick={() => setMobileMenuOpen(false)}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'rgb(var(--accent))'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgb(var(--muted))'}
                  >
                    Profile
                  </Link>
                  <button 
                    onClick={() => { logout(); setMobileMenuOpen(false); }} 
                    className="block w-full text-left text-sm transition-colors py-2" 
                    style={{ color: 'rgb(var(--muted))' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'rgb(var(--accent))'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgb(var(--muted))'}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link 
                  href="/login" 
                  className="block text-sm transition-colors py-2" 
                  style={{ color: 'rgb(var(--accent))' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
