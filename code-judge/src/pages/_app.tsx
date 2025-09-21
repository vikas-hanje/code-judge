import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { useRouter } from 'next/router';
import NavBar from '../components/NavBar';
import { ThemeProvider } from '../contexts/ThemeContext';

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const noNavRoutes = ['/login', '/signup'];
  const showNav = !noNavRoutes.includes(router.pathname);

  return (
    <ThemeProvider>
      <div className="min-h-screen transition-colors" style={{ backgroundColor: 'rgb(var(--bg))' }}>
        {showNav && <NavBar />}
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Component {...pageProps} />
        </main>
      </div>
    </ThemeProvider>
  );
}
