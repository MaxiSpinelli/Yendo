"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface NavbarProps {
  email?: string;
}

export default function Navbar({ email }: NavbarProps) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="font-display text-xl text-brand-700 tracking-tight hover:text-brand-800 transition-colors"
        >
          Yendo
        </Link>

        <div className="flex items-center gap-3">
          {email && (
            <span className="hidden sm:block text-xs text-stone-400 truncate max-w-[160px]">
              {email}
            </span>
          )}
          <button
            onClick={handleSignOut}
            className="btn-ghost text-xs px-3 py-1.5"
          >
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}
