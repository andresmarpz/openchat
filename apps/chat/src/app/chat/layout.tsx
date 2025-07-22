import { redirect } from "next/navigation";
import { AuthButton } from "~/components/auth/auth-button";
import { SidebarLayout } from "~/components/dashboard/sidebar";
import { createClient } from "~/lib/supabase/server";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="w-full flex justify-end border-b border-b-foreground/10 h-16 px-4">
        <AuthButton />
      </nav>

      <div className="flex-1 flex">
        <SidebarLayout>{children}</SidebarLayout>
      </div>

      <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-4">
        <p>Powered by openchat</p>
      </footer>
    </div>
  );
}
