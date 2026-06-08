export const customers = [
  {
    id: "c1",
    name: "Shashank C",
    email: "shashank@gmail.com",
    phone: "+91 98765 43210",
    aadhaar: "XXXX-XXXX-1234",
    address: "12 MG Road, Pune",
    joinedDate: "2023-04-12",
  },
  {
    id: "c2",
    name: "Mihir R",
    email: "mihir@gmail.com",
    phone: "+91 91234 56789",
    aadhaar: "XXXX-XXXX-5678",
    address: "44 Marine Drive, Mumbai, Maharashtra",
    joinedDate: "2023-06-22",
  },
  {
    id: "c3",
    name: "Sidhhant O",
    email: "sidhhant@gmail.com",
    phone: "+91 99887 76655",
    aadhaar: "XXXX-XXXX-9012",
    address: "7 Park Street, Kolkata, West Bengal",
    joinedDate: "2023-08-01",
  },
  {
    id: "c4",
    name: "Prakhar S",
    email: "prakhar@gmail.com",
    phone: "+91 90011 22334",
    aadhaar: "XXXX-XXXX-3456",
    address: "23 Banjara Hills, Hyderabad, Telangana",
    joinedDate: "2024-01-15",
  },
  {
    id: "c5",
    name: "vrushabh",
    email: "vrushabh@gmail.com",
    phone: "+91 98989 12121",
    aadhaar: "XXXX-XXXX-7890",
    address: "5 Civil Lines, Jaipur, Rajasthan",
    joinedDate: "2024-03-09",
  },
]

export const policies = [
  {
    id: "p1",
    name: "SecureHealth Plus",
    type: "Health",
    coverage: 1000000,
    premium: 12000,
    duration: "1 Year",
    description:
      "Comprehensive health cover including hospitalization, day-care procedures and pre/post hospitalization expenses.",
    benefits: [
      "Cashless treatment at 8000+ hospitals",
      "No-claim bonus up to 50%",
      "Covers pre-existing diseases after 2 years",
      "Free annual health checkup",
    ],
  },
  {
    id: "p2",
    name: "LifeShield Term",
    type: "Life",
    coverage: 5000000,
    premium: 18000,
    duration: "20 Years",
    description:
      "A pure term life insurance plan providing financial security to your family in your absence.",
    benefits: [
      "High sum assured at low premium",
      "Tax benefits under Section 80C",
      "Optional critical illness rider",
      "Flexible payout options",
    ],
  },
  {
    id: "p3",
    name: "DriveSafe Auto",
    type: "Vehicle",
    coverage: 800000,
    premium: 9500,
    duration: "1 Year",
    description:
      "Complete vehicle protection covering own damage, third-party liability and roadside assistance.",
    benefits: [
      "24x7 roadside assistance",
      "Zero depreciation cover",
      "Quick cashless garage network",
      "Personal accident cover included",
    ],
  },
  {
    id: "p4",
    name: "Voyage Travel Guard",
    type: "Travel",
    coverage: 600000,
    premium: 3500,
    duration: "Per Trip",
    description:
      "Worldwide travel insurance covering medical emergencies, trip cancellations and lost baggage.",
    benefits: [
      "Emergency medical coverage abroad",
      "Trip cancellation reimbursement",
      "Lost baggage & passport assistance",
      "24x7 global helpline",
    ],
  },
]

export const purchasedPolicies = [
  { id: "pp1", policyId: "p1", customerId: "c1", startDate: "2024-04-12", endDate: "2025-04-11", status: "Active" },
  { id: "pp2", policyId: "p3", customerId: "c1", startDate: "2024-05-01", endDate: "2025-04-30", status: "Active" },
  { id: "pp3", policyId: "p2", customerId: "c2", startDate: "2024-06-22", endDate: "2044-06-21", status: "Active" },
  { id: "pp4", policyId: "p4", customerId: "c3", startDate: "2024-08-01", endDate: "2024-08-15", status: "Expired" },
  { id: "pp5", policyId: "p1", customerId: "c4", startDate: "2024-09-10", endDate: "2025-09-09", status: "Active" },
]

export const claims = [
  {
    id: "CLM-1001",
    customerId: "c1",
    policyId: "p1",
    amount: 45000,
    reason: "Hospitalization for appendectomy surgery",
    status: "Approved",
    date: "2024-09-18",
    documents: ["discharge_summary.pdf", "hospital_bill.pdf"],
  },
  {
    id: "CLM-1002",
    customerId: "c2",
    policyId: "p2",
    amount: 120000,
    reason: "Critical illness rider claim",
    status: "Pending",
    date: "2024-10-02",
    documents: ["medical_report.pdf"],
  },
  {
    id: "CLM-1003",
    customerId: "c1",
    policyId: "p3",
    amount: 22000,
    reason: "Vehicle accident - bumper and headlight damage",
    status: "Pending",
    date: "2024-10-10",
    documents: ["fir_copy.pdf", "garage_estimate.pdf"],
  },
  {
    id: "CLM-1004",
    customerId: "c3",
    policyId: "p4",
    amount: 18000,
    reason: "Trip cancellation due to medical emergency",
    status: "Rejected",
    date: "2024-08-05",
    documents: ["cancellation_proof.pdf"],
  },
  {
    id: "CLM-1005",
    customerId: "c4",
    policyId: "p1",
    amount: 60000,
    reason: "Day-care procedure - cataract surgery",
    status: "Pending",
    date: "2024-10-12",
    documents: ["prescription.pdf", "bill.pdf"],
  },
]

export const payments = [
  { id: "PAY-2001", customerId: "c1", policyId: "p1", amount: 12000, date: "2024-04-12", status: "Paid" },
  { id: "PAY-2002", customerId: "c1", policyId: "p3", amount: 9500, date: "2024-05-01", status: "Paid" },
  { id: "PAY-2003", customerId: "c2", policyId: "p2", amount: 18000, date: "2024-06-22", status: "Paid" },
  { id: "PAY-2004", customerId: "c4", policyId: "p1", amount: 12000, date: "2024-09-10", status: "Paid" },
  { id: "PAY-2005", customerId: "c1", policyId: "p1", amount: 12000, date: "2025-04-12", status: "Pending" },
  { id: "PAY-2006", customerId: "c3", policyId: "p4", amount: 3500, date: "2024-08-01", status: "Failed" },
]

export const notifications = [
  {
    id: "n1",
    title: "Claim Approved",
    message: "Your claim CLM-1001 for ₹45,000 has been approved and will be credited within 3 working days.",
    date: "2024-09-20",
    type: "claim",
    target: "customers",
  },
  {
    id: "n2",
    title: "Premium Due",
    message: "Your SecureHealth Plus premium of ₹12,000 is due on 12 Apr 2025. Pay now to avoid lapse.",
    date: "2025-03-28",
    type: "payment",
    target: "customers",
  },
  {
    id: "n3",
    title: "Policy Expiring Soon",
    message: "Your DriveSafe Auto policy expires on 30 Apr 2025. Renew to stay protected.",
    date: "2025-04-01",
    type: "policy",
    target: "customers",
  },
  {
    id: "n4",
    title: "Payment Successful",
    message: "Payment of ₹18,000 for LifeShield Term received successfully.",
    date: "2024-06-22",
    type: "payment",
    target: "customers",
  },
]

export const revenueByMonth = [
  { month: "Jan", revenue: 142000, claims: 38000 },
  { month: "Feb", revenue: 168000, claims: 52000 },
  { month: "Mar", revenue: 195000, claims: 41000 },
  { month: "Apr", revenue: 221000, claims: 67000 },
  { month: "May", revenue: 198000, claims: 58000 },
  { month: "Jun", revenue: 245000, claims: 72000 },
  { month: "Jul", revenue: 268000, claims: 61000 },
  { month: "Aug", revenue: 252000, claims: 84000 },
  { month: "Sep", revenue: 289000, claims: 76000 },
  { month: "Oct", revenue: 312000, claims: 69000 },
]

export const policyDistribution = [
  { name: "Health", value: 42, fill: "#2f4b8f" },
  { name: "Life", value: 28, fill: "#3f87a6" },
  { name: "Vehicle", value: 20, fill: "#0f9d8c" },
  { name: "Travel", value: 10, fill: "#e0903c" },
]

export function formatINR(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0)
}
