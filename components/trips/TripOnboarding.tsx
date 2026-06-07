"use client";

import { useState } from "react";
import Link from "next/link";

interface TripOnboardingProps {
  tripId: string;
  hasFlights: boolean;
  hasAccommodation: boolean;
  hasMembers: boolean;
  shareToken: string;
}

export default function TripOnboarding({
  tripId,
  hasFlights,
  hasAccommodation,
  hasMembers,
  shareToken,
}: TripOnboardingProps) {
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);

  const allDone = hasFlights && hasAccommodation && hasMembers;

  if (dismissed || allDone) return null;

  const joinUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/trips/join/${shareToken}`
      : `/trips/join/${shareToken}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback silencioso
    }
  }

  const steps = [
    {
      done: hasFlights,
      label: "Agregá tu primer tramo",
      description: "Un vuelo, bus o auto — lo que sea que los lleve.",
      action: (
        <Link
          href={`/trips/${tripId}`}
          className="btn-touch"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            fontSize: "12px",
            fontWeight: 500,
            color: "#2563eb",
            textDecoration: "none",
            background: "#e8f0ff",
            borderRadius: "8px",
            padding: "5px 10px",
          }}
        >
          Agregar tramo
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      ),
    },
    {
      done: hasMembers,
      label: "Invitá a alguien",
      description: "Compartí el link para que el grupo pueda editar el itinerario.",
      action: (
        <button
          onClick={handleCopy}
          className="btn-touch"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            fontSize: "12px",
            fontWeight: 500,
            color: copied ? "#2d6a4f" : "#1a1714",
            background: copied ? "#e8f5ee" : "#e8e0d8",
            border: "none",
            borderRadius: "8px",
            padding: "5px 10px",
            cursor: "pointer",
          }}
        >
          {copied ? (
            <>
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              ¡Copiado!
            </>
          ) : (
            <>
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copiar link
            </>
          )}
        </button>
      ),
    },
    {
      done: hasAccommodation,
      label: "Cargá dónde se quedan",
      description: "El hotel, el Airbnb, la casa de alguien — lo que sea.",
      action: (
        <Link
          href={`/trips/${tripId}`}
          className="btn-touch"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            fontSize: "12px",
            fontWeight: 500,
            color: "#2d6a4f",
            textDecoration: "none",
            background: "#e8f5ee",
            borderRadius: "8px",
            padding: "5px 10px",
          }}
        >
          Agregar alojamiento
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      ),
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;

  return (
    <div
      style={{
        background: "#f0ebe3",
        border: "1px solid #e8e0d8",
        borderRadius: "16px",
        padding: "20px 24px",
        marginBottom: "28px",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <div>
          <p style={{ fontSize: "13px", fontWeight: 600, color: "#1a1714", margin: "0 0 2px" }}>
            Empecemos 🗺️
          </p>
          <p style={{ fontSize: "12px", color: "#a09088", margin: 0 }}>
            {completedCount} de 3 pasos completados
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="btn-touch"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#a09088",
            padding: "4px",
            display: "flex",
            alignItems: "center",
          }}
          aria-label="Cerrar"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ height: "3px", background: "#e8e0d8", borderRadius: "99px", marginBottom: "20px", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${(completedCount / 3) * 100}%`,
            background: "#c4622d",
            borderRadius: "99px",
            transition: "width 0.4s ease",
          }}
        />
      </div>

      {/* Steps */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {steps.map((step, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              opacity: step.done ? 0.5 : 1,
            }}
          >
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: step.done ? "#2d6a4f" : "#e8e0d8",
                color: step.done ? "#fff" : "#a09088",
                fontSize: "11px",
                fontWeight: 600,
              }}
            >
              {step.done ? (
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                i + 1
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#1a1714",
                  margin: "0 0 1px",
                  textDecoration: step.done ? "line-through" : "none",
                }}
              >
                {step.label}
              </p>
              {!step.done && (
                <p style={{ fontSize: "12px", color: "#6b5f54", margin: 0 }}>
                  {step.description}
                </p>
              )}
            </div>

            {!step.done && (
              <div style={{ flexShrink: 0 }}>
                {step.action}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
