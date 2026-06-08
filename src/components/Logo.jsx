import { ShieldCheck } from "lucide-react"

export function Logo({ showText = true, light = false }) {
  return (
    <div className="d-flex align-items-center gap-2">
      <div
        className={`rounded d-inline-flex align-items-center justify-content-center ${
          light ? "bg-white" : "bg-primary"
        }`}
        style={{ width: 34, height: 34 }}
      >
        <ShieldCheck size={20} className={light ? "text-primary" : "text-white"} />
      </div>
      {showText && (
        <span className={`fw-bold ${light ? "text-white" : "text-dark"}`} style={{ fontSize: "1.1rem" }}>
          Aegis<span className={light ? "text-white-50" : "text-primary"}>Insure</span>
        </span>
      )}
    </div>
  )
}
