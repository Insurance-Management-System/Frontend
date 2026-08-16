import { useState } from "react"
import { Link } from "react-router-dom"
import { Bell, CreditCard, ShieldCheck, FileText, FolderCheck, UserCog, Lock, Settings, AlertTriangle, CheckCheck } from "lucide-react"
import { PageHeader } from "../../components/PageHeader.jsx"
import { useAuth } from "../../lib/auth-context.jsx"
import { useData } from "../../lib/data-context.jsx"

const categoryIcons = {
  POLICY: ShieldCheck,
  PAYMENT: CreditCard,
  CLAIM: FileText,
  KYC: FolderCheck,
  DOCUMENT: FolderCheck,
  PROFILE: UserCog,
  SECURITY: Lock,
  SYSTEM: Settings,
}

const kycReminder = {
  NOT_STARTED: {
    title: "Complete your KYC",
    action: "Complete KYC",
    message: "Complete your KYC verification before purchasing an insurance policy.",
  },
  PENDING_VERIFICATION: {
    title: "KYC pending verification",
    action: "View KYC Status",
    message: "Your KYC documents are awaiting admin approval before you can purchase a policy.",
  },
  REJECTED: {
    title: "KYC verification rejected",
    action: "Update KYC",
    message: "Your KYC verification was rejected. Please review the reason and resubmit the affected documents.",
  },
}

const filters = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "read", label: "Read" },
]

export default function CustomerNotifications() {
  const { user } = useAuth()
  const { notifications, getCustomer, markNotificationRead, markAllNotificationsRead } = useData()
  const [filter, setFilter] = useState("all")
  const customer = getCustomer(user.id)
  const pinned = kycReminder[customer?.kycStatus]

  const sorted = [...notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const mine = sorted.filter((n) => (filter === "unread" ? !n.read : filter === "read" ? n.read : true))
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div>
      <PageHeader title="Notifications" description="Stay up to date with alerts about your policies." />

      {pinned && (
        <div className="card border-0 shadow-sm p-3 mb-3 d-flex flex-row gap-3 align-items-center border-start border-4 border-warning">
          <div className="rounded bg-warning-subtle text-warning d-inline-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 40, height: 40 }}>
            <AlertTriangle size={18} />
          </div>
          <div className="flex-grow-1">
            <p className="fw-semibold mb-0 small text-body">{pinned.title}</p>
            <p className="text-muted mb-0" style={{ fontSize: "0.8rem" }}>{pinned.message}</p>
          </div>
          <Link to="/customer/profile#kyc" className="btn btn-warning btn-sm text-nowrap">{pinned.action}</Link>
        </div>
      )}

      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="btn-group" role="group">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              className={`btn btn-sm ${filter === f.key ? "btn-primary" : "btn-outline-secondary"}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}{f.key === "unread" && unreadCount > 0 ? ` (${unreadCount})` : ""}
            </button>
          ))}
        </div>
        {unreadCount > 0 && (
          <button type="button" className="btn btn-link btn-sm text-decoration-none d-flex align-items-center gap-1" onClick={() => markAllNotificationsRead()}>
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      {mine.length === 0 ? (
        <div className="card border-0 shadow-sm p-5 text-center">
          <Bell size={40} className="text-muted mb-3" />
          <p className="fw-medium mb-1">No notifications</p>
          <p className="text-muted small mb-0">
            {filter === "unread" ? "You're all caught up." : filter === "read" ? "No read notifications yet." : "You're all caught up."}
          </p>
        </div>
      ) : (
        <div className="card border-0 shadow-sm p-4">
          <div className="d-flex flex-column gap-2">
            {mine.map((n) => {
              const Icon = categoryIcons[n.category] || Bell
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => !n.read && markNotificationRead(n.id)}
                  className={`d-flex gap-3 border rounded-3 p-3 btn text-start ${n.read ? "" : "bg-primary-subtle bg-opacity-10 border-primary-subtle"}`}
                >
                  <div className="rounded bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 40, height: 40 }}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between">
                      <p className={`mb-0 small ${n.read ? "fw-medium" : "fw-bold"}`}>{n.title}</p>
                      <span className="text-muted" style={{ fontSize: "0.72rem" }}>{new Date(n.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-muted mb-0" style={{ fontSize: "0.8rem" }}>{n.message}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
