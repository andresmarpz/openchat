import { Suspense } from "react";
import { AuthButton } from "~/components/auth/auth-button";
import { HydrateClient } from "~/query/server";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <HydrateClient>
      <div className="min-h-screen flex flex-col container m-auto">
        <nav className="w-full flex justify-end border-b border-b-foreground/10 h-16 px-4">
          <Suspense fallback={<div>Loading...</div>}>
            <AuthButton />
          </Suspense>
        </nav>

        <div className="flex-1 flex">{children}</div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-4">
          <p>Powered by openchat</p>
        </footer>
      </div>
    </HydrateClient>
  );
}
