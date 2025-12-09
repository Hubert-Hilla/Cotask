// app/dashboard/page.tsx (Server Component)
import { createClient } from "@/lib/supabase/server";
import DashboardPage from "../../components/dashboard/DashBoard";
import {redirect} from 'next/navigation';
import { Suspense } from "react";

// This would fetch data from your database
export default async function Dashboard() {
  const supabase = await createClient();

  //authenticate user
  const user = await supabase.auth.getUser();
  if (user.error || !user.data.user) {
    console.log("fetched this user: ", user)
    console.log('No user found, redirecting to login');
    redirect('/auth/login');
  }   

  // Fetch user data from Supabase
  const profile = await supabase
    .from("profiles")
    .select('*')
    .eq('id', user.data.user.id)
    .single();
  if (profile.error) {
    console.log('Error fetching profile:', profile.error);
    redirect('/auth/login');
  }

  /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
   * Fetch lists owned by the user, and shared to him by others                                              *
   * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
  const listsOwned = await supabase
    .from("lists")
    .select('*, tasks(*)')
    .eq("created_by", user.data.user.id);
  if (listsOwned.error) {
    console.log('Error fetching lists:', listsOwned.error);
  }

  const listsShared = await supabase
    .from("list_shares")
    .select('lists(*)')
    .eq('user_id', user.data.user.id);
  if (listsShared.error) {
    console.log('Error fetching shared lists:', listsShared.error);
  }

  /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
   * Fetch lists owned by the user, and shared to him by others                                              *
   * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
  const notesOwned = await supabase
    .from("notes")
    .select('*')
    .eq('created_by', user.data.user.id);
  if (listsOwned.error) {
    console.log('Error fetching lists:', listsOwned.error);
  }

  const notesShared = await supabase
  .from("note_shares")
  .select("notes(*)")
  .eq("user_id", user.data.user.id);
  if(notesShared.error) {
    console.log("Error fetching shared notes: ", notesShared.error)
  }
  
  const userData = {
    name: profile.data.name,
    email: user.data.user.email,
    username: profile.data.username,
    id: profile.data.id,
    avatar: ""
  };

  return (
    <Suspense>
    <DashboardPage
      user={userData as any}
      lists={listsOwned.data as any}
      notes={notesOwned.data! as any}
      sharedLists={listsShared.data! as any}
      sharedNotes={notesShared.data! as any}
      pendingRequestsCount={0}
    />
    </Suspense>
  );
}

