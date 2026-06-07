"use client";

import { useEffect, useState } from "react";
import YendoLogo from "./YendoLogo";

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (!isStandalone) {
      setVisible(false);
      return;
    }

    const timer = setTimeout(() => {
      setFading(true);
      setTimeout(() => setVisible(false), 400);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#1a1714",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transition: "opacity 0.4s ease",
        opacity: fading ? 0 : 1,
      }}
    >
      {/* Ícono centrado */}
      <img
        src="/icons/icon-512.png"
        alt="Yendo"
        style={{
          width: 110,
          height: 110,
          animation: "splashIn 0.5s ease forwards",
        }}
      />

      {/* Logo completo abajo */}
      <div
        style={{
          position: "absolute",
          bottom: "48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "splashIn 0.6s ease forwards",
        }}
      >
        <YendoLogo height={22} color="#faf7f2" />
      </div>

      <style>{`
        @keyframes splashIn {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}