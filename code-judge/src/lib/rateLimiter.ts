import { SupabaseClient } from '@supabase/supabase-js';

export async function enforceRateLimit(
  admin: SupabaseClient,
  userId: string,
  limitPerMinute = 15
) {
  const since = new Date(Date.now() - 60 * 1000).toISOString();
  const { count, error } = await admin
    .from('submissions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', since);

  if (error) throw error;
  if ((count || 0) >= limitPerMinute) {
    const err: any = new Error('Rate limit exceeded. Please wait a bit.');
    err.status = 429;
    throw err;
  }
}
