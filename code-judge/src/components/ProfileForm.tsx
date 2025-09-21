import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function ProfileForm() {
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: session } = await supabase.auth.getSession();
      const user = session.session?.user;
      if (!user) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, avatar, bio')
        .eq('id', user.id)
        .maybeSingle();
      if (!error && data) {
        setDisplayName(data.display_name || '');
        setAvatarUrl(data.avatar || '');
        setBio(data.bio || '');
      }
      setLoading(false);
    })();
  }, []);

  async function save() {
    setMessage(null);
    const { data: session } = await supabase.auth.getSession();
    const user = session.session?.user;
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, display_name: displayName, avatar: avatarUrl, bio }, { onConflict: 'id' });
    if (error) setMessage(error.message);
    else setMessage('Saved!');
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div className="card max-w-xl">
      <h1 className="mb-4 text-xl font-semibold">Profile</h1>
      <div className="space-y-3">
        <div>
          <label className="label">Display name</label>
          <input className="input" value={displayName} onChange={(e)=>setDisplayName(e.target.value)} />
        </div>
        <div>
          <label className="label">Avatar URL</label>
          <input className="input" value={avatarUrl} onChange={(e)=>setAvatarUrl(e.target.value)} />
        </div>
        <div>
          <label className="label">Bio</label>
          <textarea className="input min-h-[100px]" value={bio} onChange={(e)=>setBio(e.target.value)} />
        </div>
        {message && <p className="text-sm text-gray-700">{message}</p>}
        <button className="btn btn-primary" onClick={save}>Save</button>
      </div>
    </div>
  );
}
