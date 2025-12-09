// app/dashboard/lists/[id]/page.tsx - UPDATED
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import ListDetailView from "@/components/dashboard/lists/ListDetailView";

export default async function ListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { id: listId } = await params;

  // Authenticate user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth/login");
  }

  // Fetch list with tasks
  const { data: list, error: listError } = await supabase
    .from("lists")
    .select(`
      *,
      tasks (*)
    `)
    .eq("id", listId)
    .single();

  if (listError || !list) {
    console.error("Error fetching list:", listError);
    notFound();
  }

  // Check if user has access to this list
  const isOwner = list.created_by === user.id;

  if (!isOwner) {
    // Check if list is shared with user
    const { data: sharedList } = await supabase
      .from("list_shares")
      .select("*")
      .eq("list_id", listId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!sharedList) {
      redirect("/dashboard"); // No access
    }
  }

  // Fetch list owner profile
  const { data: ownerProfile } = await supabase
    .from("profiles")
    .select("username, name")
    .eq("id", list.created_by)
    .single();

  // Count completed tasks
  const completedTasks = (list.tasks || []).filter(task => task.is_completed).length;
  const totalTasks = (list.tasks || []).length;

  const listData = {
    id: list.id,
    title: list.title,
    description: list.description || "",
    icon: list.icon || "📋",
    color: list.color || "indigo",
    is_pinned: list.is_pinned || false,
    is_archived: list.is_archived || false,
    created_by: list.created_by,
    created_at: list.created_at,
    updated_at: list.updated_at,
    owner: {
      id: list.created_by,
      name: ownerProfile?.name || "Unknown",
      username: ownerProfile?.username || "",
    },
    tasks: (list.tasks || []).map((task) => ({
      id: task.id,
      list_id: task.list_id,
      title: task.title,
      description: task.description || "",
      is_completed: task.is_completed,
      due_date: task.due_date,
      priority: task.priority || "medium",
      created_at: task.created_at,
      updated_at: task.updated_at,
      completed_at: task.completed_at,
      created_by: task.created_by,
      completed_by: task.completed_by,
    })),
  };

  return (
    <ListDetailView
      list={listData as any}
      userId={user.id}
      isOwner={isOwner}
      initialCompletedCount={completedTasks}
      initialTotalTasks={totalTasks}
    />
  );
}