import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Bell, CreditCard, ShieldCheck, FileText, FolderCheck, UserCog, Lock, Settings, CheckCheck } from "lucide-react"
import { useAuth } from "../lib/auth-context.jsx"
import { useData } from "../lib/data-context.jsx"

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

function formatWhen(createdAt) {
  if (!createdAt) return ""
  const date = new Date(createdAt)
  if (Number.isNaN(date.getTime())) return ""
  const diffMs = Date.now() - date.getTime()
  const diffMin = Math.round(diffMs / 60000)
  if (diffMin < 1) return "just now"
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.round(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.round(diffHr / 24)
  if (diffDay < 7) return `${diffDay}d ago`
  return date.toLocaleDateString()
}

export function NotificationBell() {
  const { user } = useAuth()
  const { notifications, markNotificationRead, markAllNotificationsRead } = useData()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const unread = notifications
    .filter((n) => !n.read)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const notificationsHref = user.role === "admin" ? "/admin/notifications" : "/customer/notifications"

  async function openNotification(n) {
    setOpen(false)
    await markNotificationRead(n.id).catch(() => null)
    navigate(notificationsHref)
  }

  async function markAll() {
    await markAllNotificationsRead().catch(() => null)
  }

  return (
    <div className="position-relative">
      <button
        type="button"
        className="btn btn-outline-secondary btn-sm position-relative d-inline-flex align-items-center"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
      >
        <Bell size={15} />
        {unread.length > 0 && (
          <span
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light"
            style={{ fontSize: "0.6rem", padding: "0.25em 0.4em" }}
          >
            {unread.length > 9 ? "9+" : unread.length}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="position-fixed top-0 start-0 w-100 h-100" style={{ zIndex: 1040 }} onClick={() => setOpen(false)} />
          <div
            className="position-absolute end-0 mt-2 card border-0 shadow-lg"
            style={{ width: 340, zIndex: 1050 }}
          >
            <div className="p-3 border-bottom d-flex align-items-center justify-content-between">
              <p className="fw-semibold small mb-0">Notifications</p>
              {unread.length > 0 && (
                <button type="button" className="btn btn-link btn-sm text-decoration-none p-0 d-flex align-items-center gap-1" onClick={markAll}>
                  <CheckCheck size={14} /> Mark all read
                </button>
              )}
            </div>
            <div style={{ maxHeight: 340, overflowY: "auto" }}>
              {unread.length === 0 && <p className="text-muted small p-3 mb-0">You&apos;re all caught up.</p>}
              {unread.map((n) => {
                const Icon = categoryIcons[n.category] || Bell
                return (
                  <button
                    key={n.id}
                    type="button"
                    className="btn btn-light w-100 text-start rounded-0 border-0 border-bottom p-3 bg-primary-subtle"
                    onClick={() => openNotification(n)}
                  >
                    <div className="d-flex gap-2">
                      <Icon size={16} className="text-primary flex-shrink-0 mt-1" />
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between gap-2">
                          <p className="mb-1 small fw-bold">{n.title}</p>
                          <span className="text-muted text-nowrap" style={{ fontSize: "0.7rem" }}>{formatWhen(n.createdAt)}</span>
                        </div>
                        <p className="text-muted mb-0 text-truncate" style={{ fontSize: "0.78rem" }}>{n.message}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
            <button type="button" className="btn btn-link btn-sm text-decoration-none" onClick={() => { setOpen(false); navigate(notificationsHref) }}>
              View all
            </button>
          </div>
        </>
      )}
    </div>
  )
}
