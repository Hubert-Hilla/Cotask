// app/dashboard/page.tsx (UPDATED)
import { createClient } from "@/lib/supabase/server";
import DashboardPage from "../../components/dashboard/DashBoard";
import { redirect } from 'next/navigation';
import { Suspense } from "react";

// Helper function to get initials from name
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0] || '')
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

export default async function Dashboard() {
  const supabase = await createClient();

  // Authenticate user
  const user = await supabase.auth.getUser();
  if (user.error || !user.data.user) {
    console.log("No user found, redirecting to login");
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

  // Fetch lists owned by the user
  const listsOwned = await supabase
    .from("lists")
    .select('*, tasks(*)')
    .eq("created_by", user.data.user.id);
    
  if (listsOwned.error) {
    console.log('Error fetching lists:', listsOwned.error);
  }

  // Fetch lists shared with the user
  const listsShared = await supabase
    .from("list_shares")
    .select(`
      *,
      lists (*, tasks(*)),
      profiles!list_shares_shared_by_fkey(id, name, username, avatar_url)
    `)
    .eq('user_id', user.data.user.id);
    
  if (listsShared.error) {
    console.log('Error fetching shared lists:', listsShared.error);
  }

  // Fetch notes owned by the user
  const notesOwned = await supabase
    .from("notes")
    .select('*')
    .eq('created_by', user.data.user.id);
    
  if (notesOwned.error) {
    console.log('Error fetching notes:', notesOwned.error);
  }

  // Fetch notes shared with the user
  const notesShared = await supabase
    .from("note_shares")
    .select(`
      *,
      notes (*),
      profiles!note_shares_shared_by_fkey(id, name, username, avatar_url)
    `)
    .eq("user_id", user.data.user.id);
    
  if (notesShared.error) {
    console.log("Error fetching shared notes: ", notesShared.error);
  }

  // Fetch shared users for owned lists
  const ownedListsWithShares = await Promise.all(
    (listsOwned.data || []).map(async (list) => {
      const { data: shares } = await supabase
        .from('list_shares')
        .select(`
          *,
          profiles!list_shares_user_id_fkey(id, name, username, avatar_url)
        `)
        .eq('list_id', list.id);
        
      return {
        ...list,
        is_shared: false,
        shared_users: (shares || []).map(share => ({
          id: share.profiles.id,
          name: share.profiles.name,
          username: share.profiles.username,
          avatar_url: share.profiles.avatar_url,
          initials: getInitials(share.profiles.name),
          permission: share.permission
        }))
      };
    })
  );

  // Fetch shared users for owned notes
  const ownedNotesWithShares = await Promise.all(
    (notesOwned.data || []).map(async (note) => {
      const { data: shares } = await supabase
        .from('note_shares')
        .select(`
          *,
          profiles!note_shares_user_id_fkey(id, name, username, avatar_url)
        `)
        .eq('note_id', note.id);
        
      return {
        ...note,
        is_shared: false,
        shared_users: (shares || []).map(share => ({
          id: share.profiles.id,
          name: share.profiles.name,
          username: share.profiles.username,
          avatar_url: share.profiles.avatar_url,
          initials: getInitials(share.profiles.name),
          permission: share.permission
        }))
      };
    })
  );

  // Process shared lists
  const processedSharedLists = (listsShared.data || []).map(item => {
    return {
      ...item.lists,
      is_shared: true,
      shared_by: {
        id: item.profiles.id,
        name: item.profiles.name,
        username: item.profiles.username,
        avatar_url: item.profiles.avatar_url,
        initials: getInitials(item.profiles.name)
      },
      shared_users: []
    };
  });

  // Process shared notes
  const processedSharedNotes = (notesShared.data || []).map(item => {
    return {
      ...item.notes,
      is_shared: true,
      shared_by: {
        id: item.profiles.id,
        name: item.profiles.name,
        username: item.profiles.username,
        avatar_url: item.profiles.avatar_url,
        initials: getInitials(item.profiles.name)
      },
      shared_users: []
    };
  });

  // Merge owned and shared items
  const allLists = [...ownedListsWithShares, ...processedSharedLists];
  const allNotes = [...ownedNotesWithShares, ...processedSharedNotes];

  const userData = {
    name: profile.data.name,
    email: user.data.user.email!,
    username: profile.data.username,
    id: profile.data.id,
    avatar: profile.data.avatar_url || "",
    initials: getInitials(profile.data.name)
  };

  return (
    <Suspense>
      <DashboardPage
        user={userData}
        allLists={allLists as any}
        allNotes={allNotes as any}
      />
    </Suspense>
  );
}