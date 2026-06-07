const styles = {
    Active: "ag-badge-green",
    Approved: "ag-badge-green",
    Paid: "ag-badge-green",
    Pending: "ag-badge-amber",
    Expired: "ag-badge-gray",
    Rejected: "ag-badge-red",
    Failed: "ag-badge-red",
  }
  
  export function StatusBadge({ status }) {
    return <span className={`ag-badge ${styles[status] || "ag-badge-gray"}`}>{status}</span>
  }