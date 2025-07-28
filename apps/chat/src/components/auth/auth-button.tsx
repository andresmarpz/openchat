import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "~/components/auth/logout-button";
import { Button } from "~/components/ui/button";
import { createClient } from "~/lib/supabase/server";

export async function AuthButton() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return user ? (
    <div className="flex items-center gap-4">
      {user.email}!
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/auth/login">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
