"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Trip } from "@/lib/types/database";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import YendoLogo from "@/components/ui/YendoLogo";

interface Participant {
  id: string;
  nickname: string | null;
  first_name: string | null;
  isOwner: boolean;
}

interface TripHeroProps {
  trip: Trip;
  participants: Participant[];
  tripDays: number;
  totalActivities: number;
  isOwner: boolean;
  canEdit: boolean;
}

function formatHeroDate(iso: string) {
  return format(parseISO(iso), "d MMM yyyy", { locale: es });
}

function ShareButton({ shareToken }: { shareToken: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const url = `${window.location.origin}/trips/join/${shareToken}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 500, color: "#ffffff", background: "rgba(250,247,242,0.15)", border: "1px solid rgba(250,247,242,0.25)", padding: "8px 16px", borderRadius: "99px", cursor: "pointer", transition: "all 0.15s" }}
    >
      {copied ? (
        <>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#2d6a4f" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          ¡Link copiado!
        </>
      ) : (
        <>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Agregar Viajeros
        </>
      )}
    </button>
  );
}

export default function TripHero({
  trip,
  participants,
  tripDays,
  totalActivities,
  isOwner,
  canEdit,
}: TripHeroProps) {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const firstCity = trip.destination.split(/[,·\-\/]/)[0].trim();
    const query = `${firstCity} travel city landscape`;
    fetch(`/api/hero-image?q=${encodeURIComponent(query)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.url) setImageUrl(data.url);
      })
      .catch(() => {});
  }, [trip.destination]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="relative w-full" style={{ height: "65vh", minHeight: 480 }}>

      {/* Fondo */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={trip.destination}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, #1a1714 0%, #2d1f14 50%, #3d2a1a 100%)" }}
        />
      )}

      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.75) 100%)" }}
      />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/dashboard"
            style={{ display: "flex", alignItems: "center", gap: "6px", color: "rgba(250,247,242,0.8)", fontSize: "13px", fontWeight: 500, textDecoration: "none", background: "rgba(250,247,242,0.1)", padding: "6px 12px", borderRadius: "99px", border: "1px solid rgba(250,247,242,0.15)" }}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Mis viajes
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
           <YendoLogo height={28} color="#ffffff" />
            <div style={{ width: "1px", height: "18px", background: "rgba(250,247,242,0.25)" }} />
            <button
              onClick={handleSignOut}
              style={{ fontSize: "12px", color: "rgba(250,247,242,0.6)", background: "transparent", border: "none", cursor: "pointer" }}
            >
              Salir
            </button>
          </div>
        </div>
      </div>

      {/* Contenido inferior */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: 400,
              color: "#faf7f2",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              margin: "0 0 8px",
            }}
          >
            {trip.name}
          </h1>

          <p style={{ color: "rgba(250,247,242,0.8)", fontSize: "18px", margin: "0 0 20px", fontWeight: 300, letterSpacing: "0.02em" }}>
            {trip.destination}
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
            {[
              `📅 ${formatHeroDate(trip.start_date)} → ${formatHeroDate(trip.end_date)}`,
              `🗓 ${tripDays} ${tripDays === 1 ? "día" : "días"}`,
              `👥 ${participants.length} ${participants.length === 1 ? "viajero" : "viajeros"}`,
              ...(totalActivities > 0 ? [`🎯 ${totalActivities} ${totalActivities === 1 ? "actividad" : "actividades"}`] : []),
            ].map((pill) => (
              <span
                key={pill}
                style={{ background: "rgba(250,247,242,0.15)", border: "1px solid rgba(250,247,242,0.2)", color: "#faf7f2", fontSize: "12px", fontWeight: 500, padding: "6px 12px", borderRadius: "99px" }}
              >
                {pill}
              </span>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            {canEdit && <ShareButton shareToken={trip.share_token} />}
            {isOwner && (
              <Link
                href={`/trips/${trip.id}/edit`}
                style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 500, color: "rgba(250,247,242,0.8)", background: "rgba(250,247,242,0.1)", border: "1px solid rgba(250,247,242,0.2)", padding: "8px 16px", borderRadius: "99px", textDecoration: "none" }}
              >
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Editar viaje
              </Link>
            )}

            {participants.length > 0 && (
              <div style={{ display: "flex", marginLeft: "8px" }}>
                {participants.slice(0, 4).map((p, i) => (
                  <div
                    key={p.id}
                    title={p.nickname ?? p.first_name ?? "?"}
                    style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(250,247,242,0.2)", border: "2px solid rgba(250,247,242,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 600, color: "#faf7f2", marginLeft: i === 0 ? 0 : "-8px" }}
                  >
                    {(p.nickname ?? p.first_name ?? "?")[0].toUpperCase()}
                  </div>
                ))}
                {participants.length > 4 && (
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(250,247,242,0.2)", border: "2px solid rgba(250,247,242,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 600, color: "#faf7f2", marginLeft: "-8px" }}>
                    +{participants.length - 4}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}