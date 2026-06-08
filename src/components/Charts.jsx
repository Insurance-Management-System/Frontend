import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { useData } from "../lib/data-context.jsx"

const tooltipStyle = {
  backgroundColor: "#fff",
  border: "1px solid var(--ag-border)",
  borderRadius: "0.5rem",
  fontSize: "0.75rem",
}

export function RevenueChart() {
  const { revenueByMonth } = useData()
  return (
    <div className="ag-card h-100">
      <div className="ag-card-header p-4 pb-2">
        <h2 className="h6 fw-semibold mb-0">Monthly Revenue vs Claims</h2>
      </div>
      <div className="p-4 pt-2" style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={revenueByMonth} margin={{ left: -10, right: 8, top: 8 }}>
            <defs>
              <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2f4b8f" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#2f4b8f" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="clm" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e0903c" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#e0903c" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e6e8ef" vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="#6b7280" />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={12}
              stroke="#6b7280"
              tickFormatter={(v) => `${v / 1000}k`}
            />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => `₹${v.toLocaleString("en-IN")}`} />
            <Area type="monotone" dataKey="revenue" stroke="#2f4b8f" strokeWidth={2} fill="url(#rev)" name="Revenue" />
            <Area type="monotone" dataKey="claims" stroke="#e0903c" strokeWidth={2} fill="url(#clm)" name="Claims" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function PolicyDistributionChart() {
  const { policyDistribution } = useData()
  return (
    <div className="ag-card h-100">
      <div className="ag-card-header p-4 pb-2">
        <h2 className="h6 fw-semibold mb-0">Policy Distribution</h2>
      </div>
      <div className="p-4 pt-2">
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={policyDistribution} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                {policyDistribution.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} stroke="#fff" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="row g-2 mt-1">
          {policyDistribution.map((entry) => (
            <div key={entry.name} className="col-6 d-flex align-items-center gap-2 small">
              <span style={{ width: 10, height: 10, borderRadius: 999, backgroundColor: entry.fill }} />
              <span className="text-muted-2">{entry.name}</span>
              <span className="ms-auto fw-medium">{entry.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
