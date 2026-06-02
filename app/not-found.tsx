import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-6 text-center">
      <span className="text-5xl mb-5">🗺️</span>
      <h1 className="text-2xl font-semibold text-stone-900 mb-2">Página no encontrada</h1>
      <p className="text-stone-500 mb-8">Este destino no existe en el mapa.</p>
      <Link href="/dashboard" className="btn-primary">
        Volver al inicio
      </Link>
    </div>
  );
}
