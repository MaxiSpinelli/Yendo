import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: "#faf7f2" }}
    >
      <span className="text-5xl mb-5">🗺️</span>
      <h1 className="text-2xl font-semibold mb-2" style={{ color: "#1a1714" }}>
        Página no encontrada
      </h1>
      <p className="mb-8 text-sm" style={{ color: "#6b5f54" }}>
        Este destino no existe en el mapa.
      </p>
      <Link
        href="/dashboard"
        className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
        style={{ background: "#1a1714", color: "#faf7f2" }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "#2d2825"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "#1a1714"; }}
      >
        Volver al inicio
      </Link>
    </div>
  );
}
