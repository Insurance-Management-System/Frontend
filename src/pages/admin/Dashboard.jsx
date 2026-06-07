import { Link } from "react-router-dom"
import {Users, ShieldCheck, IndianRupee, FileWarning} from "lucide-react"
import { PageHeader } from "../../components/PageHeader.jsx"
import { StatCard } from "../../components/StatCard.jsx"
import { StatusBadge } from "../../components/StatusBadge.jsx"
import { RevenueChart, PolicyDistributionChart } from "../../components/Charts.jsx"
import { useData, formatINR } from "../../lib/data-context.jsx"

export default function AdminDashboard(){
    const { customers, policies, claims, payments, getCustomer } = useData()

    const revenue = payments.filter((p)=>p.status === "paid").reduce((s,p)=> s + p.amount, 0)
    const openClaims = claims.filter((c)=> c.status === "pending").length
    const recentClaims = [...claims].sort((a,b) => b.date.localeCompare(a.date)).slice(0,5)

    return (
        <div>
        <PageHeader title="Dashboard" description="Overview of your insurance operations"/>
        <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <StatCard label="Total Customers" value={customers.length} icon={Users} trend="+12% this month" accent="primary" />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard label="Total Policies" value={policies.length} icon={ShieldCheck} trend="4 plan types" accent="blue" />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard label="Revenue" value={formatINR(revenue)} icon={IndianRupee} trend="+8.2% vs last month" accent="teal" />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard label="Open Claims" value={openClaims} icon={FileWarning} trend="Awaiting review" accent="amber" />
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-lg-8">
          <RevenueChart />
        </div>
        <div className="col-12 col-lg-4">
          <PolicyDistributionChart />
        </div>
      </div>
      <div className="ag-card">
        <div className="ag-card-header d-flex align-items-center justify-content-between p-4 pb-3">
          <h2 className="h6 fw-semibold mb-0">Recent Claims</h2>
          <Link to="/admin/claims" className="btn btn-sm btn-link text-primary text-decoration-none">View all</Link>
        </div>
        <div className="p-4 pt-0 table-responsive">
          <table className="table ag-table align-middle">
            <thead>
              <tr>
                <th>Claim ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th className="d-none d-md-table-cell">Reason</th>
                <th>Status</th>
                <th className="d-none d-sm-table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentClaims.map((claim) => (
                <tr key={claim.id}>
                  <td className="fw-medium">{claim.id}</td>
                  <td>{getCustomer(claim.customerId)?.name}</td>
                  <td>{formatINR(claim.amount)}</td>
                  <td className="d-none d-md-table-cell text-muted-2 text-truncate" style={{ maxWidth: 240 }}>{claim.reason}</td>
                  <td><StatusBadge status={claim.status} /></td>
                  <td className="d-none d-sm-table-cell text-muted-2">{claim.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
        </div>
    )
}