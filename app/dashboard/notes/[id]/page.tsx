// app/dashboard/notes/[id]/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import NoteEditor from "@/components/dashboard/notes/NoteEditor";

export default async function NotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { id: noteId } = await params;

  // Authenticate user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth/login");
  }

  // Fetch note
  const { data: note, error: noteError } = await supabase
    .from("notes")
    .select("*")
    .eq("id", noteId)
    .single();

  if (noteError || !note) {
    console.error("Error fetching note:", noteError);
    notFound();
  }

  // Check if user has access to this note
  const isOwner = note.created_by === user.id;

  if (!isOwner) {
    // Check if note is shared with user
    const { data: sharedNote } = await supabase
      .from("note_shares")
      .select("*")
      .eq("note_id", noteId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!sharedNote) {
      redirect("/dashboard"); // No access
    }
  }

  // Fetch note owner profile
  const { data: ownerProfile } = await supabase
    .from("profiles")
    .select("username, name")
    .eq("id", note.created_by)
    .single();

  return (
    <NoteEditor
      noteId={note.id}
      initialTitle={note.title}
      initialContent={note.content || ''}
      isOwner={isOwner}
    />
  );
}