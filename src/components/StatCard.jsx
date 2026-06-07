const accentStyles={
    primary : {backgroundColor : "var(--ag-primary-light)", color : "var(--ag-primary"},
    teal: { backgroundColor: "#e0f5f1", color: "#0f9d8c" },
    green: { backgroundColor: "#dcfce7", color: "#15803d" },
    amber: { backgroundColor: "#fef3c7", color: "#b45309" },
    blue: { backgroundColor: "#e3effb", color: "#3f87a6" },
}

export function StatCard({ label, value, icon : Icon, trend, accent = "primary" }){
    return(
        <div className="ag-card h-100">
            <div className="d-flex align-items-center justify-content-between p-4">
        <div className="d-flex flex-column gap-1">
          <span className="small text-muted-2">{label}</span>
          <span className="fs-3 fw-semibold lh-1">{value}</span>
          {trend && <span className="text-muted-2" style={{ fontSize: "0.72rem" }}>{trend}</span>}
          </div>
        <div className="ag-stat-icon" style={accentStyles[accent] || accentStyles.primary}>
          {Icon && <Icon size={22} />}
        </div>
      </div>
        </div>
    )
}