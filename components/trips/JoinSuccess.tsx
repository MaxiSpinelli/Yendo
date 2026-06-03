"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface Props {
  tripId: string;
  tripName: string;
  ownerName: string;
  isNew: boolean;
}

export default function JoinSuccess({ tripId, tripName, ownerName, isNew }: Props) {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(`/trips/${tripId}`);
    }, 2500);
    return () => clearTimeout(timer);
  }, [tripId, router]);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-full bg-amber-light flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-xl font-semibold text-navy-900 mb-2">
          {isNew ? "¡Te uniste al viaje!" : "¡Ya sos parte de este viaje!"}
        </h1>

        <p className="text-navy-700 text-sm mb-1">
          <span className="font-medium text-navy-900">{tripName}</span>
        </p>
        <p className="text-navy-300 text-sm mb-8">
          Organizado por {ownerName}
        </p>

        <p className="text-xs text-navy-300">Redirigiendo al viaje...</p>
      </div>
    </div>
  );
}
