const styles = {
  Active: "text-bg-success",
  Approved: "text-bg-success",
  Paid: "text-bg-success",
  Pending: "text-bg-warning",
  Expired: "text-bg-secondary",
  Rejected: "text-bg-danger",
  Failed: "text-bg-danger",
}

export function StatusBadge({ status }) {
  return <span className={`badge rounded-pill ${styles[status] || "text-bg-secondary"}`}>{status}</span>
}
