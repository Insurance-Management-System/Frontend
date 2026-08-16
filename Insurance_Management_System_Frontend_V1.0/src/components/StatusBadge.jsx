const styles = {
  Active: "text-bg-success",
  Approved: "text-bg-success",
  Paid: "text-bg-success",
  Verified: "text-bg-success",
  Pending: "text-bg-warning",
  "Pending Payment": "text-bg-warning",
  Submitted: "text-bg-warning",
  Draft: "text-bg-secondary",
  Missing: "text-bg-secondary",
  Expired: "text-bg-secondary",
  Rejected: "text-bg-danger",
  Failed: "text-bg-danger",
  Lapsed: "text-bg-danger",
  Cancelled: "text-bg-secondary",
  "Cancellation Requested": "text-bg-warning",
  "Payment Due": "text-bg-info",
  "Grace Period": "text-bg-warning",
  Overdue: "text-bg-danger",
  Inactive: "text-bg-secondary",
}

export function StatusBadge({ status }) {
  return <span className={`badge rounded-pill ${styles[status] || "text-bg-secondary"}`}>{status}</span>
}
