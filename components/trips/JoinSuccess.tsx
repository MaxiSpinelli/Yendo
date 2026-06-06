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
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#faf7f2" }}
    >
      <div className="text-center max-w-sm">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: "#f0ebe3", border: "1px solid #e8e0d8" }}
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="#2d6a4f" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-xl font-semibold mb-2" style={{ color: "#1a1714" }}>
          {isNew ? "¡Te uniste al viaje!" : "¡Ya sos parte de este viaje!"}
        </h1>

        <p className="text-sm mb-1" style={{ color: "#1a1714" }}>
          <span className="font-medium">{tripName}</span>
        </p>
        <p className="text-sm mb-8" style={{ color: "#a09088" }}>
          Organizado por {ownerName}
        </p>

        <p className="text-xs" style={{ color: "#a09088" }}>Redirigiendo al viaje...</p>
      </div>
    </div>
  );
}
