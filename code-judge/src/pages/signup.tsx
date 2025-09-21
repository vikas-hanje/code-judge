import dynamic from 'next/dynamic';
import Link from 'next/link';

const Auth = dynamic(() => import('../components/Auth/Auth'), { ssr: false });

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-md">
      <Auth mode="signup" />
      <p className="mt-4 text-center text-sm text-gray-700">
        Already have an account?{' '}
        <Link className="text-indigo-600 hover:underline" href="/login">Log in</Link>
      </p>
    </div>
  );
}
