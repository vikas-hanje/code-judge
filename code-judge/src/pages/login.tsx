import dynamic from 'next/dynamic';
import Link from 'next/link';

const Auth = dynamic(() => import('../components/Auth/Auth'), { ssr: false });

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md">
      <Auth mode="login" />
      <p className="mt-4 text-center text-sm text-gray-700">
        New here?{' '}
        <Link className="text-indigo-600 hover:underline" href="/signup">Create an account</Link>
      </p>
    </div>
  );
}
