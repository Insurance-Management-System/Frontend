import { useState } from "react"
import { Search, Eye, Phone, Mail, MapPin, Calendar, X } from "lucide-react"
import { PageHeader } from "../../components/PageHeader.jsx"
import { StatusBadge } from "../../components/StatusBadge.jsx"
import { Avatar } from "../../components/Avatar.jsx"
import { useData, formatINR } from "../../lib/data-context.jsx"

export default function AdminCustomers() {
  const { customers, purchasedPolicies } = useData()
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState(null)

  const searchText = query.toLowerCase()
  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchText) ||
      c.email.toLowerCase().includes(searchText) ||
      c.phone.includes(query),
  )

  return (
    <div>
      <PageHeader title="Customer Management" description="Search and manage all policyholders." />

      <div className="card border-0 shadow-sm p-4">
        <div className="position-relative mb-3" style={{ maxWidth: 360 }}>
          <Search size={16} className="position-absolute text-muted" style={{ left: 12, top: 11 }} />
          <input
            className="form-control ps-5"
            placeholder="Search by name, email or phone..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Name</th>
                <th className="d-none d-md-table-cell">Email</th>
                <th className="d-none d-lg-table-cell">Phone</th>
                <th className="d-none d-lg-table-cell">Aadhaar</th>
                <th>Policies</th>
                <th className="text-end">View</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const count = purchasedPolicies.filter((p) => p.customerId === c.id).length
                return (
                  <tr key={c.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <Avatar name={c.name} size={32} />
                        <span className="fw-medium">{c.name}</span>
                      </div>
                    </td>
                    <td className="d-none d-md-table-cell text-muted">{c.email}</td>
                    <td className="d-none d-lg-table-cell text-muted">{c.phone}</td>
                    <td className="d-none d-lg-table-cell text-muted">{c.aadhaar}</td>
                    <td>{count}</td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-link text-primary text-decoration-none d-inline-flex align-items-center gap-1" onClick={() => setSelected(c)}>
                        <Eye size={16} /> View
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selected && <CustomerDetail customer={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

function CustomerDetail({ customer, onClose }) {
  const { purchasedPolicies, claims, payments, getPolicy } = useData()
  const [tab, setTab] = useState("policies")

  const cPolicies = purchasedPolicies.filter((p) => p.customerId === customer.id)
  const cClaims = claims.filter((c) => c.customerId === customer.id)
  const cPayments = payments.filter((p) => p.customerId === customer.id)

  return (
    <>
      <div className="modal fade show d-block" tabIndex={-1} role="dialog">
        <div className="modal-dialog modal-dialog-scrollable modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Customer Profile</h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Close" />
            </div>
            <div className="modal-body">
              <div className="d-flex align-items-center gap-3 mb-4">
                <Avatar name={customer.name} size={56} primary />
                <div>
                  <p className="fs-5 fw-semibold mb-0">{customer.name}</p>
                  <p className="text-muted small mb-0">{customer.aadhaar}</p>
                </div>
              </div>

              <div className="border rounded-3 p-3 mb-4 d-flex flex-column gap-2 small">
                <InfoRow icon={<Mail size={16} />} value={customer.email} />
                <InfoRow icon={<Phone size={16} />} value={customer.phone} />
                <InfoRow icon={<MapPin size={16} />} value={customer.address} />
                <InfoRow icon={<Calendar size={16} />} value={`Joined ${customer.joinedDate}`} />
              </div>

              <ul className="nav nav-pills nav-fill mb-3 gap-2">
                {["policies", "claims", "payments"].map((t) => (
                  <li key={t} className="nav-item">
                    <button className={`nav-link text-capitalize ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
                      {t}
                    </button>
                  </li>
                ))}
              </ul>

              {tab === "policies" && (
                <div className="d-flex flex-column gap-2">
                  {cPolicies.length === 0 && <Empty>No policies purchased.</Empty>}
                  {cPolicies.map((p) => (
                    <div key={p.id} className="d-flex align-items-center justify-content-between border rounded-3 p-3 small">
                      <div>
                        <p className="fw-medium mb-0">{getPolicy(p.policyId)?.name}</p>
                        <p className="text-muted mb-0" style={{ fontSize: "0.75rem" }}>{p.startDate} to {p.endDate}</p>
                      </div>
                      <StatusBadge status={p.status} />
                    </div>
                  ))}
                </div>
              )}

              {tab === "claims" && (
                <div className="d-flex flex-column gap-2">
                  {cClaims.length === 0 && <Empty>No claims filed.</Empty>}
                  {cClaims.map((c) => (
                    <div key={c.id} className="d-flex align-items-center justify-content-between border rounded-3 p-3 small">
                      <div>
                        <p className="fw-medium mb-0">{c.id} - {formatINR(c.amount)}</p>
                        <p className="text-muted mb-0 text-truncate" style={{ fontSize: "0.75rem", maxWidth: 240 }}>{c.reason}</p>
                      </div>
                      <StatusBadge status={c.status} />
                    </div>
                  ))}
                </div>
              )}

              {tab === "payments" && (
                <div className="d-flex flex-column gap-2">
                  {cPayments.length === 0 && <Empty>No payment history.</Empty>}
                  {cPayments.map((p) => (
                    <div key={p.id} className="d-flex align-items-center justify-content-between border rounded-3 p-3 small">
                      <div>
                        <p className="fw-medium mb-0">{p.id} - {formatINR(p.amount)}</p>
                        <p className="text-muted mb-0" style={{ fontSize: "0.75rem" }}>{p.date}</p>
                      </div>
                      <StatusBadge status={p.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" onClick={onClose} />
    </>
  )
}

function InfoRow({ icon, value }) {
  return (
    <div className="d-flex align-items-center gap-2">
      <span className="text-primary">{icon}</span>
      <span>{value}</span>
    </div>
  )
}

function Empty({ children }) {
  return <p className="py-4 text-center text-muted small mb-0">{children}</p>
}
