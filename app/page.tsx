import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Nav */}
      <header className="px-6 py-5 flex items-center justify-between max-w-5xl mx-auto w-full">
        <span
  className="text-3xl text-[#1a3d2b] tracking-tight"
  style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 700 }}
>
  Yendo
</span>
        <Link href="/auth/login" className="btn-secondary text-sm">
          Iniciar sesión
        </Link>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center max-w-3xl mx-auto w-full">
        <h1 className="font-display text-5xl sm:text-6xl text-navy-900 leading-tight mb-5">
          Todo tu viaje
          <br />
          <span className="text-amber italic">en un solo lugar</span>
        </h1>

        <p className="text-navy-700 text-lg sm:text-xl leading-relaxed mb-10 max-w-xl">
          Centralizá vuelos, alojamientos y actividades.
          Compartilo con quienes viajan con vos.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link href="/auth/login" className="btn-primary text-base px-8 py-3.5 rounded-2xl shadow-lg shadow-amber/20">
            Crear mi primer viaje →
          </Link>
          <Link href="/demo" className="btn-secondary text-base px-8 py-3.5 rounded-2xl">
            Ver demo
          </Link>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2.5 mt-14">
          {[
            "✈️ Vuelos",
            "🏨 Alojamientos",
            "📍 Actividades",
            "🗓️ Timeline unificado",
            "👥 Compartir con el grupo",
          ].map((f) => (
            <span
              key={f}
              className="px-3.5 py-1.5 bg-white border border-navy-100 rounded-full text-sm text-navy-700 shadow-sm"
            >
              {f}
            </span>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-navy-300">
        Yendo © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
