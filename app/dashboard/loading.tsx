export default function DashboardLoading() {
  return (
    <div style={{ minHeight: "100vh", background: "#faf7f2", fontFamily: "var(--font-sans)" }}>

      {/* Navbar skeleton */}
      <div style={{ height: 64, borderBottom: "1px solid #e8e0d8", background: "#faf7f2", display: "flex", alignItems: "center", padding: "0 24px", justifyContent: "space-between" }}>
        <div style={{ width: 80, height: 24, borderRadius: 8, background: "#e8e0d8" }} className="animate-pulse" />
        <div style={{ width: 120, height: 32, borderRadius: 99, background: "#e8e0d8" }} className="animate-pulse" />
      </div>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <div style={{ width: 160, height: 22, borderRadius: 8, background: "#e8e0d8", marginBottom: 8 }} className="animate-pulse" />
            <div style={{ width: 220, height: 14, borderRadius: 6, background: "#e8e0d8" }} className="animate-pulse" />
          </div>
        </div>

        {/* Next trip card skeleton */}
        <div style={{ borderRadius: 20, background: "#1a1714", padding: 24, marginBottom: 12, height: 200 }} className="animate-pulse" />

        {/* Upcoming events skeleton */}
        <div style={{ borderRadius: 20, background: "#f0ebe3", border: "1px solid #e8e0d8", padding: 20, marginBottom: 32, height: 120 }} className="animate-pulse" />

        {/* Grid label */}
        <div style={{ width: 80, height: 11, borderRadius: 4, background: "#e8e0d8", marginBottom: 12 }} className="animate-pulse" />

        {/* Trip cards grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{ borderRadius: 16, background: "#f0ebe3", border: "1px solid #e8e0d8", height: 110 }}
              className="animate-pulse"
            />
          ))}
        </div>

      </main>
    </div>
  );
}
