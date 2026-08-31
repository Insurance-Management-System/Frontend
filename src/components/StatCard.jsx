const accentStyles = {
  primary: "bg-primary-subtle text-primary",
  teal: "bg-info-subtle text-info",
  green: "bg-success-subtle text-success",
  amber: "bg-warning-subtle text-warning",
  blue: "bg-primary-subtle text-primary",
}

export function StatCard({ label, value, icon: Icon, trend, accent = "primary" }) {
  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="d-flex align-items-center justify-content-between p-4">
        <div className="d-flex flex-column gap-1">
          <span className="small text-muted">{label}</span>
          <span className="fs-3 fw-semibold lh-1">{value}</span>
          {trend && <span className="text-muted" style={{ fontSize: "0.72rem" }}>{trend}</span>}
        </div>
        <div
          className={`rounded d-inline-flex align-items-center justify-content-center ${accentStyles[accent] || accentStyles.primary}`}
          style={{ width: 40, height: 40 }}
        >
          {Icon && <Icon size={22} />}
        </div>
      </div>
    </div>
  )
}
