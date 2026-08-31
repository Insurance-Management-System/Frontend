import { Link } from "react-router-dom"
import { FileWarning, IndianRupee, ShieldCheck, Users } from "lucide-react"
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { PageHeader } from "../../components/PageHeader.jsx"
import { StatCard } from "../../components/StatCard.jsx"
import { StatusBadge } from "../../components/StatusBadge.jsx"
import { useData, formatINR } from "../../lib/data-context.jsx"

export default function AdminDashboard() {
  const { customers, policies, claims, payments, policyDistribution, revenueByMonth, getCustomer } = useData()

  const revenue = payments.filter((p) => p.status === "Paid").reduce((sum, payment) => sum + payment.amount, 0)
  const openClaims = claims.filter((claim) => claim.status === "Submitted").length
  const recentClaims = [...claims].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)
  const recentPayments = [...payments].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4)

  let cumulative = 0
  const revenueTrend = revenueByMonth.map((m) => {
    cumulative += m.revenue
    return { month: m.month, revenue: m.revenue, cumulative }
  })

  return (
    <div>
      <PageHeader title="Admin Dashboard" description="Quick view of the insurance system." />

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <StatCard label="Customers" value={customers.length} icon={Users} />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard label="Plans" value={policies.length} icon={ShieldCheck} accent="blue" />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard label="Revenue" value={formatINR(revenue)} icon={IndianRupee} accent="green" />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard label="Pending Claims" value={openClaims} icon={FileWarning} accent="amber" />
        </div>
      </div>

      <div className="card border-0 shadow-sm p-4 mb-4">
        <h2 className="h6 fw-semibold mb-3">Revenue Trend</h2>
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <LineChart data={revenueTrend} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
              <Tooltip formatter={(value) => formatINR(value)} />
              <Legend />
              <Line type="monotone" dataKey="revenue" name="Monthly Revenue" stroke="#0d6efd" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="cumulative" name="Cumulative Revenue" stroke="#198754" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm p-4 h-100">
            <h2 className="h6 fw-semibold mb-3">Policy Mix</h2>
            <div style={{ width: "100%", height: 240 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={policyDistribution}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                    label={({ name, value }) => `${name} ${value}%`}
                  >
                    {policyDistribution.map((item) => (
                      <Cell key={item.name} fill={item.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm p-4 h-100">
            <h2 className="h6 fw-semibold mb-3">Recent Payments</h2>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Payment</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="fw-medium">{payment.id}</td>
                      <td>{formatINR(payment.amount)}</td>
                      <td className="text-muted">{payment.date}</td>
                      <td>
                        <StatusBadge status={payment.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="d-flex align-items-center justify-content-between p-4 pb-3">
          <h2 className="h6 fw-semibold mb-0">Recent Claims</h2>
          <Link to="/admin/claims" className="btn btn-sm btn-link text-primary text-decoration-none">
            View all
          </Link>
        </div>
        <div className="p-4 pt-0 table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Claim ID</th>
                <th>Customer</th>
                <th>Amount</th>
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
                  <td>
                    <StatusBadge status={claim.status} />
                  </td>
                  <td className="d-none d-sm-table-cell text-muted">{claim.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
