import { ShieldCheck } from "lucide-react"

export function Logo({ showText = true, light = false }) {
  return (
    <div className="d-flex align-items-center gap-2">
      <div className="ag-logo-badge" style={light ? { backgroundColor: "#fff", color: "var(--ag-primary)" } : undefined}>
        <ShieldCheck size={20} />
      </div>
      {showText && (
        <span className="fw-semibold" style={{ fontSize: "1.1rem", letterSpacing: "-0.01em", color: light ? "#fff" : "var(--ag-text)" }}>
          Aegis<span style={{ color: light ? "#cdd9f5" : "var(--ag-primary)" }}>Insure</span>
        </span>
      )}
    </div>
  )
}
