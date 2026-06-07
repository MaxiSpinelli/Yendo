import Link from "next/link";
import YendoLogo from "@/components/ui/YendoLogo";
import PageTransition from "@/components/ui/PageTransition";

const destinations = [
  { name: "París", color: "#0066ff" },
  { name: "Roma", color: "#f5620f" },
  { name: "Tokio", color: "#00a67e" },
  { name: "Bangkok", color: "#8b5cf6" },
  { name: "Barcelona", color: "#f5c842" },
  { name: "Nueva York", color: "#0066ff" },
  { name: "Lisboa", color: "#f5620f" },
];

const features = [
  {
    emoji: "✈️",
    bg: "#e8f0ff",
    title: "Vuelos con IA",
    desc: "Subí tu pasaje y extraemos toda la info automáticamente.",
  },
  {
    emoji: "🗓️",
    bg: "#e8fff8",
    title: "Timeline por ciudad",
    desc: "Tu itinerario organizado por destino, no solo por fecha.",
  },
  {
    emoji: "👥",
    bg: "#fff4e8",
    title: "Compartir al instante",
    desc: "Un link y todos ven el mismo itinerario en tiempo real.",
  },
];

const heroImages = [
  "/landing/toronto.jpg",
  "/landing/paris.jpg",
  "/landing/rome.jpg",
];

export default function LandingPage() {
  return (
    <PageTransition>
    <div style={{ minHeight: "100vh", background: "#ffffff", fontFamily: "var(--font-sans)" }}>

      {/* Nav */}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 40px" }}>
        <YendoLogo height={36} color="#0a0a0b" />
        <Link
          href="/auth/login"
          style={{ border: "1px solid #e0e0e0", borderRadius: "99px", padding: "8px 18px", fontSize: "13px", color: "#0a0a0b", background: "transparent", textDecoration: "none" }}
        >
          Iniciar sesión
        </Link>
      </header>

      {/* Hero */}
      <div style={{ margin: "0 24px", borderRadius: "20px", overflow: "hidden", height: "480px", position: "relative", display: "flex", alignItems: "flex-end" }}>
        <div style={{ position: "absolute", inset: 0 }} className="hero-grid">
          {heroImages.map((src, i) => (
            <div
              key={i}
              style={{ backgroundImage: `url('${src}')`, backgroundSize: "cover", backgroundPosition: "center" }}
              className={i !== 0 ? "hidden sm:block" : ""}
            />
          ))}
        </div>

        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)" }} />

        <div style={{ position: "relative", zIndex: 2, padding: "40px", width: "100%" }}>
          {/* Logo grande sobre el hero */}
          <div style={{ marginBottom: "24px" }}>
            <YendoLogo height={56} color="#ffffff" />
          </div>

          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "99px", padding: "5px 12px", fontSize: "12px", color: "rgba(255,255,255,0.9)", marginBottom: "16px" }}>
            ✦ Organización de viajes grupales
          </div>

          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px, 5vw, 54px)", fontWeight: 700, color: "#ffffff", lineHeight: 1.1, margin: "0 0 12px" }}>
            Todo tu viaje,<br />
            <span style={{ color: "#f5c842" }}>en un solo lugar</span>
          </h1>

          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.75)", margin: "0 0 28px", maxWidth: "420px", lineHeight: 1.6 }}>
            Centralizá vuelos, alojamientos y actividades. Compartilo con quienes viajan con vos.
          </p>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Link
              href="/auth/login"
              style={{ background: "#ffffff", color: "#0a0a0b", border: "none", borderRadius: "99px", padding: "12px 24px", fontSize: "14px", fontWeight: 500, textDecoration: "none", display: "inline-block" }}
            >
              Crear mi primer viaje →
            </Link>
            <Link
              href="/demo"
              style={{ background: "rgba(255,255,255,0.12)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "99px", padding: "12px 24px", fontSize: "14px", textDecoration: "none", display: "inline-block" }}
            >
              Ver demo
            </Link>
          </div>
        </div>
      </div>

      {/* Destinos */}
      <div style={{ display: "flex", gap: "8px", padding: "28px 40px 0", overflowX: "auto", scrollbarWidth: "none" }}>
        {destinations.map((d) => (
          <div
            key={d.name}
            style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f7f7f8", border: "1px solid #ebebed", borderRadius: "99px", padding: "8px 14px", fontSize: "13px", color: "#6b6b7b", whiteSpace: "nowrap", flexShrink: 0 }}
          >
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: d.color }} />
            {d.name}
          </div>
        ))}
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 px-5 sm:px-10 pt-5">
        {features.map((f) => (
          <div key={f.title} style={{ background: "#f7f7f8", borderRadius: "16px", padding: "20px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: f.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px", fontSize: "18px" }}>
              {f.emoji}
            </div>
            <p style={{ fontSize: "14px", fontWeight: 500, color: "#0a0a0b", margin: "0 0 6px" }}>{f.title}</p>
            <p style={{ fontSize: "13px", color: "#6b6b7b", margin: 0, lineHeight: 1.5 }}>{f.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA final */}
      <div style={{ margin: "20px 40px 40px", background: "#0a0a0b", borderRadius: "20px", padding: "40px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px", flexWrap: "wrap" }}>
        <div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "32px", fontWeight: 700, color: "#ffffff", margin: "0 0 8px", fontStyle: "italic" }}>
            ¿A dónde vas<br />este año?
          </h3>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", margin: "0 0 16px" }}>
            Más de 200 viajes organizados este mes
          </p>
          <div style={{ display: "flex" }}>
            {["MG", "AS", "LR", "JP"].map((initials, i) => (
              <div
                key={initials}
                style={{ width: "32px", height: "32px", borderRadius: "50%", border: "2px solid #0a0a0b", marginLeft: i === 0 ? 0 : "-8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 500, color: "#fff", background: ["#0066ff", "#f5620f", "#00a67e", "#8b5cf6"][i] }}
              >
                {initials}
              </div>
            ))}
          </div>
        </div>
        <Link
          href="/auth/login"
          style={{ background: "#f5c842", color: "#0a0a0b", border: "none", borderRadius: "99px", padding: "14px 28px", fontSize: "14px", fontWeight: 500, textDecoration: "none", display: "inline-block", whiteSpace: "nowrap" }}
        >
          Empezar gratis →
        </Link>
      </div>

      {/* Footer */}
      <footer style={{ textAlign: "center", padding: "0 0 32px", fontSize: "12px", color: "#a0a0b0" }}>
        Yendo © {new Date().getFullYear()}
      </footer>

    </div>
    </PageTransition>
  );
}