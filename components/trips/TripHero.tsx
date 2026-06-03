"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Trip } from "@/lib/types/database";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

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
      className="flex items-center gap-1.5 text-sm font-medium text-white bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/25 px-4 py-2 rounded-full transition-all"
    >
      {copied ? (
        <>
          <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          ¡Link copiado!
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Compartir
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

      {/* Fondo — imagen o gradiente de fallback mientras carga */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={trip.destination}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          }}
        />
      )}

      {/* Overlay degradado */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.75) 100%)",
        }}
      />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium transition-colors backdrop-blur-sm bg-white/10 px-3 py-1.5 rounded-full"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Mis viajes
          </Link>

          <div className="flex items-center gap-3">
            <span
              className="text-white text-2xl tracking-tight"
              style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 700 }}
            >
              Yendo
            </span>
            <div className="w-px h-5 bg-white/30" />
            <button
              onClick={handleSignOut}
              className="text-xs text-white/70 hover:text-white transition-colors"
            >
              Salir
            </button>
          </div>
        </div>
      </div>

      {/* Contenido — parte inferior */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          <h1
            className="text-white mb-2"
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: 400,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            {trip.name}
          </h1>

          <p className="text-white/80 text-lg mb-5 font-light tracking-wide">
            {trip.destination}
          </p>

          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="bg-white/15 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/20">
              📅 {formatHeroDate(trip.start_date)} → {formatHeroDate(trip.end_date)}
            </span>
            <span className="bg-white/15 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/20">
              🗓 {tripDays} {tripDays === 1 ? "día" : "días"}
            </span>
            <span className="bg-white/15 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/20">
              👥 {participants.length} {participants.length === 1 ? "viajero" : "viajeros"}
            </span>
            {totalActivities > 0 && (
              <span className="bg-white/15 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/20">
                🎯 {totalActivities} {totalActivities === 1 ? "actividad" : "actividades"}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {canEdit && <ShareButton shareToken={trip.share_token} />}
            {isOwner && (
              <Link
                href={`/trips/${trip.id}/edit`}
                className="flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Editar viaje
              </Link>
            )}

            {participants.length > 0 && (
              <div className="flex -space-x-2 ml-2">
                {participants.slice(0, 4).map((p) => (
                  <div
                    key={p.id}
                    className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center text-xs font-semibold text-white"
                    title={p.nickname ?? p.first_name ?? "?"}
                  >
                    {(p.nickname ?? p.first_name ?? "?")[0].toUpperCase()}
                  </div>
                ))}
                {participants.length > 4 && (
                  <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center text-xs font-semibold text-white">
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