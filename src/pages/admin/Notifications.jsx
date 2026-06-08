import { useState } from "react"
import { Send, Bell, CreditCard, ShieldCheck, FileText } from "lucide-react"
import { PageHeader } from "../../components/PageHeader.jsx"

import { useData } from "../../lib/data-context.jsx"

const typeMeta = {
  claim: { icon: FileText },
  payment: { icon: CreditCard },
  policy: { icon: ShieldCheck },
  general: { icon: Bell },
}

export default function AdminNotifications() {
  const { notifications, addNotification } = useData()
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [type, setType] = useState("general")
  const [sent, setSent] = useState(false)

  function submit(e) {
    e.preventDefault()
    addNotification({
      id: `n${Date.now()}`,
      title,
      message,
      type,
      target: "customers",
      date: new Date().toISOString().slice(0, 10),
    })
    setTitle("")
    setMessage("")
    setType("general")
    setSent(true)
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <div>
      <PageHeader title="Notifications" description="Broadcast announcements to your customers." />

      <div className="row g-3">
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm p-4">
            <h2 className="h6 fw-semibold mb-3">Send Notification</h2>
            {sent && (
              <div className="alert alert-success p-2 px-3 small mb-3">Notification sent to all customers.</div>
            )}
            <form onSubmit={submit} className="d-flex flex-column gap-3">
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
                <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="general">General</option>
                  <option value="policy">Policy</option>
                  <option value="payment">Payment</option>
                  <option value="claim">Claim</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary d-flex align-items-center justify-content-center gap-2">
                <Send size={16} /> Send Broadcast
              </button>
            </form>
          </div>
        </div>

        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm p-4">
            <h2 className="h6 fw-semibold mb-3">Sent History</h2>
            <div className="d-flex flex-column gap-2">
              {notifications.map((n) => {
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
        </div>
      </div>
    </div>
  )
}
