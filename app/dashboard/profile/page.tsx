// app/dashboard/profile/page.tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProfilePage from '@/components/dashboard/profile/ProfilePage';

export default async function Profile() {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch user profile data
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !profile) {
    console.error('Error fetching profile:', error);
    redirect('/dashboard');
  }

  // Combine auth user data with profile data
  const userData = {
    id: user.id,
    email: user.email!,
    name: profile.name,
    username: profile.username,
    avatar_url: profile.avatar_url,
    created_at: profile.created_at,
  };

  return <ProfilePage user={userData} />;
}