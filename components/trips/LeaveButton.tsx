"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  tripId: string;
}

export default function LeaveButton({ tripId }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleLeave() {
    if (!confirm("¿Querés abandonar este viaje? Vas a perder el acceso.")) return;
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("trip_members")
      .delete()
      .eq("trip_id", tripId)
      .eq("user_id", user.id);

    window.location.href = "/dashboard";
  }

  return (
    <button
      onClick={handleLeave}
      disabled={loading}
      className="btn-ghost text-sm text-red-500 hover:text-red-600 flex-shrink-0 flex items-center gap-1.5"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
      </svg>
      {loading ? "Abandonando..." : "Abandonar viaje"}
    </button>
  );
}