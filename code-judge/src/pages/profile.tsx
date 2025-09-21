import { useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

const ProfileForm = dynamic(() => import('../components/ProfileForm'), { ssr: false });

export default function ProfilePage() {
  const router = useRouter();
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) router.replace('/login');
    })();
  }, [router]);
  return <ProfileForm />;
}
