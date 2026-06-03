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
    <header className="sticky top-0 z-40 bg-amber border-b border-amber-hover">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="text-3xl text-[#1a3d2b] tracking-tight hover:text-[#14301f] transition-colors"
style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 700 }}
        >
          Yendo
        </Link>

        <div className="flex items-center gap-1">
          {email && (
            <span className="hidden sm:block text-xs text-[#1a3d2b]/70 truncate max-w-[160px] mr-2">
              {email}
            </span>
          )}
          <Link
            href="/profile"
            className="text-xs text-[#1a3d2b] font-medium hover:bg-amber-hover/20 px-3 py-1.5 rounded-xl transition-all"
          >
            Mi perfil
          </Link>
          <button
            onClick={handleSignOut}
            className="text-xs text-[#1a3d2b]/70 hover:text-[#1a3d2b] hover:bg-amber-hover/20 px-3 py-1.5 rounded-xl transition-all"
          >
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}