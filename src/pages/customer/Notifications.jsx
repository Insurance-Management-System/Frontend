import { Bell, CreditCard, ShieldCheck, FileText } from "lucide-react"
import { PageHeader } from "../../components/PageHeader.jsx"
import { useData } from "../../lib/data-context.jsx"

const typeMeta = {
  claim: { icon: FileText },
  payment: { icon: CreditCard },
  policy: { icon: ShieldCheck },
  general: { icon: Bell },
}

export default function CustomerNotifications() {
  const { notifications } = useData()
  const mine = notifications.filter((n) => n.target === "customers" || n.target === "all")

  return (
    <div>
      <PageHeader title="Notifications" description="Stay up to date with alerts about your policies." />

      {mine.length === 0 ? (
        <div className="card border-0 shadow-sm p-5 text-center">
          <Bell size={40} className="text-muted mb-3" />
          <p className="fw-medium mb-1">No notifications</p>
          <p className="text-muted small mb-0">You&apos;re all caught up.</p>
        </div>
      ) : (
        <div className="card border-0 shadow-sm p-4">
          <div className="d-flex flex-column gap-2">
            {mine.map((n) => {
              const meta = typeMeta[n.type] || typeMeta.general
              const Icon = meta.icon
              return (
                <div key={n.id} className="d-flex gap-3 border rounded-3 p-3">
                  <div className="rounded bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 40, height: 40 }}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between">
                      <p className="fw-medium mb-0 small">{n.title}</p>
                      <span className="text-muted" style={{ fontSize: "0.72rem" }}>{n.date}</span>
                    </div>
                    <p className="text-muted mb-0" style={{ fontSize: "0.8rem" }}>{n.message}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
