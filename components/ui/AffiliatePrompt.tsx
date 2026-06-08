"use client";

import { AFFILIATE_LINKS } from "@/lib/affiliates";

interface AffiliatePromptProps {
  type: "accommodation" | "flight";
  destination?: string;
  origin?: string;
  onContinue: () => void;
}

export default function AffiliatePrompt({
  type,
  destination,
  origin,
  onContinue,
}: AffiliatePromptProps) {
  const isAccommodation = type === "accommodation";

  const primaryLink = isAccommodation
    ? destination
      ? AFFILIATE_LINKS.booking.search(destination)
      : AFFILIATE_LINKS.booking.homepage
    : origin && destination
    ? AFFILIATE_LINKS.flights.search(origin, destination)
    : AFFILIATE_LINKS.flights.homepage;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* Mensaje */}
      <p style={{ fontSize: "13px", color: "#6b5f54", margin: 0, lineHeight: 1.6 }}>
        {isAccommodation
          ? "¿Todavía no reservaste el alojamiento? Encontrá las mejores opciones en Booking."
          : "¿Todavía no compraste el pasaje? Buscá vuelos en Booking."}
      </p>

      {/* Botón principal afiliado */}
      <a
        href={primaryLink}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          padding: "14px",
          borderRadius: "14px",
          background: "#003580",
          color: "#ffffff",
          textDecoration: "none",
          fontSize: "14px",
          fontWeight: 600,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
        </svg>
        {isAccommodation
          ? destination
            ? `Buscar alojamiento en ${destination}`
            : "Buscar en Booking.com"
          : origin && destination
          ? `Buscar vuelo ${origin} → ${destination}`
          : "Buscar vuelos en Booking.com"}
      </a>

      {/* Divisor */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ flex: 1, height: "1px", background: "#e8e0d8" }} />
        <span style={{ fontSize: "11px", color: "#a09088", whiteSpace: "nowrap" }}>
          ya tengo la reserva
        </span>
        <div style={{ flex: 1, height: "1px", background: "#e8e0d8" }} />
      </div>

      {/* Botón continuar al formulario */}
      <button
        onClick={onContinue}
        className="btn-touch"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          padding: "12px",
          borderRadius: "14px",
          background: "#f0ebe3",
          border: "1px solid #e8e0d8",
          color: "#1a1714",
          fontSize: "13px",
          fontWeight: 500,
          cursor: "pointer",
          width: "100%",
        }}
      >
        Cargar reserva →
      </button>

    </div>
  );
}
