"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface NavbarProps {
  email?: string;
  userName?: string;
  breadcrumb?: { label: string; href: string };
}

export default function Navbar({ email, userName, breadcrumb }: NavbarProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const initials = userName
    ? userName.slice(0, 2).toUpperCase()
    : email?.slice(0, 2).toUpperCase() ?? "??";

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 40, background: "#faf7f2", borderBottom: "1px solid #e8e0d8", height: "64px", display: "flex", alignItems: "center" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 24px", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>

        {/* Izquierda: logo + breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Link
            href="/dashboard"
            style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 700, fontSize: "20px", color: "#1a1714", textDecoration: "none" }}
          >
            Yendo
          </Link>
          {breadcrumb && (
            <>
              <span style={{ fontSize: "16px", color: "#c8bdb5", margin: "0 2px" }}>/</span>
              <Link
                href={breadcrumb.href}
                style={{ fontSize: "14px", fontWeight: 500, color: "#6b5f54", textDecoration: "none" }}
              >
                {breadcrumb.label}
              </Link>
            </>
          )}
        </div>

        {/* Derecha: nuevo viaje + usuario */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Link
            href="/trips/new"
            style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "#1a1714", color: "#faf7f2", borderRadius: "99px", padding: "8px 16px", fontSize: "13px", fontWeight: 500, textDecoration: "none" }}
          >
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo viaje
          </Link>

          {/* User menu */}
          <div ref={dropdownRef} style={{ position: "relative" }}>
            <button
              onClick={() => setOpen((v) => !v)}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "transparent", border: "1px solid #e8e0d8", borderRadius: "99px", padding: "6px 12px 6px 6px", cursor: "pointer" }}
            >
              <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#1a1714", color: "#faf7f2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 500, flexShrink: 0 }}>
                {initials}
              </div>
              <span style={{ fontSize: "13px", fontWeight: 500, color: "#1a1714" }}>
                {userName ?? email?.split("@")[0] ?? "Usuario"}
              </span>
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "#a09088" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {open && (
              <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: "#faf7f2", border: "1px solid #e8e0d8", borderRadius: "12px", padding: "6px", width: "220px", zIndex: 50 }}>
                <div style={{ padding: "10px 12px", borderBottom: "1px solid #e8e0d8", marginBottom: "4px" }}>
                  <p style={{ fontSize: "13px", fontWeight: 500, color: "#1a1714", margin: "0 0 2px" }}>
                    {userName ?? email?.split("@")[0] ?? "Usuario"}
                  </p>
                  {email && (
                    <p style={{ fontSize: "11px", color: "#a09088", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {email}
                    </p>
                  )}
                </div>

                <Link
                  href="/profile"
                  onClick={() => setOpen(false)}
                  style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderRadius: "8px", fontSize: "13px", color: "#1a1714", textDecoration: "none" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f0ebe3")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Mi perfil
                </Link>

                <div style={{ height: "1px", background: "#e8e0d8", margin: "4px 0" }} />

                <button
                  onClick={handleSignOut}
                  style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderRadius: "8px", fontSize: "13px", color: "#c4622d", background: "transparent", border: "none", cursor: "pointer", width: "100%" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f5ede8")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}