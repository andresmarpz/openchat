import { redirect } from "next/navigation";

import { createClient } from "~/lib/supabase/server";
import Chat from "~/components/chat/chat";

export default async function ChatPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="flex-grow"></div>
      <Chat />
    </div>
  );
}
