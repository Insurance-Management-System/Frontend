import { useState } from "react"
import { Send, Bell, CreditCard, ShieldCheck, FileText, FolderCheck, UserCog, Lock, Settings, CheckCheck } from "lucide-react"
import { PageHeader } from "../../components/PageHeader.jsx"

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

const categoryOptions = ["SYSTEM", "POLICY", "PAYMENT", "CLAIM", "KYC", "DOCUMENT", "PROFILE", "SECURITY"]

const filters = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "read", label: "Read" },
]

export default function AdminNotifications() {
  const { notifications, customers, addNotification, markNotificationRead, markAllNotificationsRead } = useData()
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [category, setCategory] = useState("SYSTEM")
  const [recipient, setRecipient] = useState("")
  const [sent, setSent] = useState(false)
  const [filter, setFilter] = useState("all")

  async function submit(e) {
    e.preventDefault()
    await addNotification({
      title,
      message,
      category,
      userId: recipient ? Number(recipient) : null,
    })
    setTitle("")
    setMessage("")
    setCategory("SYSTEM")
    setRecipient("")
    setSent(true)
    setTimeout(() => setSent(false), 3000)
  }

  const sorted = [...notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const visible = sorted.filter((n) => (filter === "unread" ? !n.read : filter === "read" ? n.read : true))
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div>
      <PageHeader title="Notifications" description="Send announcements and review your activity feed." />

      <div className="row g-3">
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm p-4">
            <h2 className="h6 fw-semibold mb-3">Send Notification</h2>
            {sent && (
              <div className="alert alert-success p-2 px-3 small mb-3">
                Notification sent{recipient ? "" : " to all customers"}.
              </div>
            )}
            <form onSubmit={submit} className="d-flex flex-column gap-3">
              <div>
                <label className="form-label small fw-medium">Recipient</label>
                <select className="form-select" value={recipient} onChange={(e) => setRecipient(e.target.value)}>
                  <option value="">Broadcast to all customers</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label small fw-medium">Title</label>
                <input className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div>
                <label className="form-label small fw-medium">Message</label>
                <textarea className="form-control" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} required />
              </div>
              <div>
                <label className="form-label small fw-medium">Category</label>
                <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {categoryOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt.charAt(0) + opt.slice(1).toLowerCase()}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-primary d-flex align-items-center justify-content-center gap-2">
                <Send size={16} /> {recipient ? "Send to Customer" : "Send Broadcast"}
              </button>
            </form>
          </div>
        </div>

        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm p-4">
            <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
              <h2 className="h6 fw-semibold mb-0">Activity Feed</h2>
              <div className="d-flex align-items-center gap-2">
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
            </div>
            <div className="d-flex flex-column gap-2" style={{ maxHeight: 520, overflowY: "auto" }}>
              {visible.length === 0 && <p className="text-muted small mb-0">Nothing here yet.</p>}
              {visible.map((n) => {
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
        </div>
      </div>
    </div>
  )
}
