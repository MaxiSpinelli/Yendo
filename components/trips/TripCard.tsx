import Link from "next/link";
import type { Trip } from "@/lib/types/database";
import { formatShortDate } from "@/lib/utils/date";

interface TripCardProps {
  trip: Trip;
  itemCount: number;
  isOwner: boolean;
}

export default function TripCard({ trip, itemCount, isOwner }: TripCardProps) {
  const isPast = new Date(trip.end_date) < new Date();
  const isUpcoming = new Date(trip.start_date) > new Date();

  return (
    <Link href={`/trips/${trip.id}`} className="block group">
      <div className="card p-5 hover:border-amber/40 hover:shadow-md transition-all duration-200 group-hover:-translate-y-0.5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-navy-900 truncate group-hover:text-amber transition-colors">
              {trip.name}
            </h3>
            <p className="text-sm text-navy-300 mt-0.5 truncate">{trip.destination}</p>
          </div>
          <div className="ml-3 flex-shrink-0 flex items-center gap-1.5">
            {!isOwner && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-cream-dark text-navy-700">
                Compartido
              </span>
            )}
            <span
              className={`flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${
                isPast
                  ? "bg-cream-dark text-navy-300"
                  : isUpcoming
                  ? "bg-amber-light text-amber-hover"
                  : "bg-amber-50 text-amber-600"
              }`}
            >
              {isPast ? "Finalizado" : isUpcoming ? "Próximo" : "En curso"}
            </span>
          </div>
        </div>

        {/* Dates */}
        <div className="flex items-center gap-1.5 text-xs text-navy-300 mb-3">
          <svg className="w-3.5 h-3.5 text-navy-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{formatShortDate(trip.start_date)} → {formatShortDate(trip.end_date)}</span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-navy-300">
            {itemCount} {itemCount === 1 ? "elemento" : "elementos"}
          </span>
          <span className="text-amber text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            Ver viaje →
          </span>
        </div>
      </div>
    </Link>
  );
}