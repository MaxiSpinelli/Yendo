export default function TripLoading() {
  return (
    <div style={{ minHeight: "100vh", background: "#faf7f2" }}>

      {/* Hero skeleton */}
      <div
        style={{ height: "55vh", minHeight: 380, maxHeight: 520, background: "#1a1714", position: "relative" }}
        className="animate-pulse"
      >
        {/* Top bar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ width: 90, height: 32, borderRadius: 99, background: "rgba(255,255,255,0.1)" }} />
          <div style={{ width: 70, height: 26, borderRadius: 8, background: "rgba(255,255,255,0.1)" }} />
        </div>
        {/* Bottom content */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 24px 24px" }}>
          <div style={{ width: 280, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.1)", marginBottom: 10 }} />
          <div style={{ width: 160, height: 18, borderRadius: 6, background: "rgba(255,255,255,0.08)", marginBottom: 16 }} />
          <div style={{ display: "flex", gap: 8 }}>
            {[120, 80, 90, 100].map((w, i) => (
              <div key={i} style={{ width: w, height: 26, borderRadius: 99, background: "rgba(255,255,255,0.08)" }} />
            ))}
          </div>
        </div>
      </div>

      {/* Stats bar skeleton */}
      <div style={{ background: "#f0ebe3", borderBottom: "1px solid #e8e0d8", padding: "0 24px", display: "flex", gap: 0, overflowX: "auto" }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} style={{ minWidth: 90, padding: "20px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, borderRight: "1px solid #e8e0d8" }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: "#e8e0d8" }} className="animate-pulse" />
            <div style={{ width: 32, height: 22, borderRadius: 6, background: "#e8e0d8" }} className="animate-pulse" />
            <div style={{ width: 48, height: 10, borderRadius: 4, background: "#e8e0d8" }} className="animate-pulse" />
          </div>
        ))}
      </div>

      {/* Content skeleton — mobile */}
      <div className="lg:hidden" style={{ padding: "16px 16px 100px" }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ marginBottom: 16 }}>
            {/* Ciudad header */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#e8e0d8" }} className="animate-pulse" />
              <div>
                <div style={{ width: 100, height: 18, borderRadius: 6, background: "#e8e0d8", marginBottom: 6 }} className="animate-pulse" />
                <div style={{ width: 70, height: 12, borderRadius: 4, background: "#e8e0d8" }} className="animate-pulse" />
              </div>
            </div>
            {/* Card */}
            <div style={{ marginLeft: 56, borderRadius: 16, background: "#f0ebe3", border: "1px solid #e8e0d8", height: 90 }} className="animate-pulse" />
          </div>
        ))}
      </div>

      {/* Content skeleton — desktop */}
      <div className="hidden lg:flex" style={{ maxWidth: 1152, margin: "0 auto", padding: "40px 32px", gap: 40 }}>
        {/* Timeline */}
        <div style={{ flex: 1 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#e8e0d8" }} className="animate-pulse" />
                <div>
                  <div style={{ width: 120, height: 20, borderRadius: 6, background: "#e8e0d8", marginBottom: 6 }} className="animate-pulse" />
                  <div style={{ width: 80, height: 13, borderRadius: 4, background: "#e8e0d8" }} className="animate-pulse" />
                </div>
              </div>
              <div style={{ marginLeft: 56, borderRadius: 16, background: "#f0ebe3", border: "1px solid #e8e0d8", height: 100 }} className="animate-pulse" />
            </div>
          ))}
        </div>
        {/* Sidebar */}
        <div style={{ width: 288, flexShrink: 0 }}>
          <div style={{ borderRadius: 16, background: "#f0ebe3", border: "1px solid #e8e0d8", height: 110, marginBottom: 12 }} className="animate-pulse" />
          <div style={{ borderRadius: 16, background: "#f0ebe3", border: "1px solid #e8e0d8", height: 160, marginBottom: 12 }} className="animate-pulse" />
          <div style={{ borderRadius: 16, background: "#f0ebe3", border: "1px solid #e8e0d8", height: 130 }} className="animate-pulse" />
        </div>
      </div>

    </div>
  );
}
