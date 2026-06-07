"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function TripError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: "#faf7f2" }}
    >
      <span className="text-5xl mb-5">✈️</span>
      <h1 className="text-2xl font-semibold mb-2" style={{ color: "#1a1714" }}>
        Algo salió mal
      </h1>
      <p className="mb-8 text-sm" style={{ color: "#6b5f54" }}>
        No pudimos cargar este viaje. Puede ser un problema temporal.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95"
          style={{ background: "#1a1714", color: "#faf7f2" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#2d2825"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#1a1714"; }}
        >
          Reintentar
        </button>
        <Link
          href="/dashboard"
          className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95"
          style={{ background: "#f0ebe3", color: "#1a1714", border: "1px solid #e8e0d8" }}
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
