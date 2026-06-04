import Link from "next/link";
import type { Trip } from "@/lib/types/database";
import { formatShortDate } from "@/lib/utils/date";

interface TripCardProps {
  trip: Trip;
  isOwner: boolean;
}

export default function TripCard({ trip, isOwner }: TripCardProps) {
  const now = new Date();
  const isPast = new Date(trip.end_date) < now;
  const isUpcoming = new Date(trip.start_date) > now;

  const badgeLabel = isPast ? "Finalizado" : isUpcoming ? "Próximo" : "En curso";
  const badgeStyle = isPast
    ? { background: "#e8e0d8", color: "#a09088" }
    : isUpcoming
    ? { background: "#f5ede8", color: "#c4622d" }
    : { background: "#e8f0e8", color: "#2d6a4f" };

  const cities = trip.destination.split(",").map((c) => c.trim()).slice(0, 3);

  return (
    <Link href={`/trips/${trip.id}`} style={{ textDecoration: "none", display: "block" }}>
      <div style={{ background: "#f0ebe3", border: "1px solid #e8e0d8", borderRadius: "16px", padding: "16px", cursor: "pointer", height: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "10px", fontWeight: 500, padding: "2px 7px", borderRadius: "99px", ...badgeStyle }}>
            {badgeLabel}
          </span>
          {!isOwner && (
            <span style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "99px", background: "#e8e0d8", color: "#6b5f54" }}>
              Compartido
            </span>
          )}
        </div>

        <p style={{ fontSize: "13px", fontWeight: 500, color: "#1a1714", margin: "0 0 8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {trip.name}
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "10px" }}>
          {cities.map((city) => (
            <span key={city} style={{ fontSize: "11px", background: "#e8e0d8", color: "#6b5f54", borderRadius: "99px", padding: "2px 8px" }}>
              {city}
            </span>
          ))}
        </div>

        <p style={{ fontSize: "11px", color: "#a09088", margin: 0 }}>
          {formatShortDate(trip.start_date)} → {formatShortDate(trip.end_date)}
        </p>
      </div>
    </Link>
  );
}