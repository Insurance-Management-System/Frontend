import { Link } from "react-router-dom"
import { HeartPulse, Heart, Car, Plane, ShieldCheck, CalendarRange } from "lucide-react"
import { PageHeader } from "../../components/PageHeader.jsx"
import { StatusBadge } from "../../components/StatusBadge.jsx"
import { useAuth } from "../../lib/auth-context.jsx"
import { useData, formatINR } from "../../lib/data-context.jsx"

const typeIcons = { Health: HeartPulse, Life: Heart, Vehicle: Car, Travel: Plane }

export default function MyPolicies() {
  const { user } = useAuth()
  const { purchasedPolicies, getPolicy } = useData()
  const mine = purchasedPolicies.filter((p) => p.customerId === user.id)

  return (
    <div>
      <PageHeader title="My Policies" description="All your active and past insurance plans."
        action={<Link to="/customer/policies" className="btn btn-primary">Browse More</Link>}/>

      {mine.length === 0 ? (
        <div className="ag-card p-5 text-center">
          <ShieldCheck size={40} className="text-muted-2 mb-3" />
          <p className="fw-medium mb-1">No policies yet</p>
          <p className="text-muted-2 small mb-3">Browse our plans to get protected today.</p>
          <Link to="/customer/policies" className="btn btn-primary">Browse Policies</Link>
        </div>
      ) : (<div className="row g-3">
            {
            mine.map((p) => {
                const plan = getPolicy(p.policyId)
                const Icon = typeIcons[plan?.type] || ShieldCheck
                return (
                <div key={p.id} className="col-12 col-md-6">
                    <div className="ag-card h-100 p-4">
                    <div className="d-flex align-items-start justify-content-between mb-3">
                        <div className="d-flex align-items-center gap-3">
                        <div className="ag-stat-icon ag-soft-icon"><Icon size={22} /></div>
                        <div>
                            <p className="fw-semibold mb-0"> { plan?.name } </p>
                            <p className="text-muted-2 small mb-0"> { plan?.type } Insurance</p>
                        </div>
                        </div>
                        <StatusBadge status={p.status} />
                    </div>
                    <div className="row g-3 small">
                        <div className="col-6">
                        <p className="text-muted-2 mb-0" style={ { fontSize: "0.72rem" } }>Coverage</p>
                        <p className="fw-medium mb-0">{formatINR(plan?.coverage)}</p>
                        </div>
                        <div className="col-6">
                        <p className="text-muted-2 mb-0" style={ { fontSize: "0.72rem" } }>Premium</p>
                        <p className="fw-medium mb-0">{ formatINR(plan?.premium) }</p>
                        </div>
                    </div>
                    <div className="d-flex align-items-center gap-2 text-muted-2 small mt-3 pt-3 border-top">
                        <CalendarRange size={16} />
                        <span>{p.startDate} → {p.endDate}</span>
                    </div>
                    </div>
                </div>
                )
            })
            }
        </div>
      )}
    </div>
  )
}
