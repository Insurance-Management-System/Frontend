import { createContext, useContext, useState } from "react"
import * as seed from "./seed-data.js"

const DataContext = createContext(null)

function addYears(dateStr, years) {
  const d = new Date(dateStr)
  d.setFullYear(d.getFullYear() + years)
  return d.toISOString().slice(0, 10)
}

export function DataProvider({ children }) {
  const [customers] = useState(seed.customers)
  const [policies, setPolicies] = useState(seed.policies)
  const [purchasedPolicies, setPurchasedPolicies] = useState(seed.purchasedPolicies)
  const [claims, setClaims] = useState(seed.claims)
  const [payments, setPayments] = useState(seed.payments)
  const [notifications, setNotifications] = useState(seed.notifications)

  function getCustomer(id) {
    return customers.find((c) => c.id === id)
  }

  function getPolicy(id) {
    return policies.find((p) => p.id === id)
  }

  function savePolicy(policy) {
    setPolicies((prev) => {
      const exists = prev.some((p) => p.id === policy.id)
      return exists ? prev.map((p) => (p.id === policy.id ? policy : p)) : [...prev, policy]
    })
  }

  function setClaimStatus(id, status) {
    setClaims((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)))
  }

  function buyPolicy(policy, customerId) {
    const today = new Date().toISOString().slice(0, 10)
    const years = policy.duration.includes("20") ? 20 : 1
    const purchase = {
      id: `pp${Date.now()}`,
      policyId: policy.id,
      customerId,
      startDate: today,
      endDate: addYears(today, years),
      status: "Active",
    }
    const payment = {
      id: `PAY-${Math.floor(2000 + Math.random() * 8000)}`,
      customerId,
      policyId: policy.id,
      amount: policy.premium,
      date: today,
      status: "Paid",
    }
    setPurchasedPolicies((prev) => [...prev, purchase])
    setPayments((prev) => [payment, ...prev])
    return purchase
  }

  function createClaim(claim) {
    setClaims((prev) => [claim, ...prev])
  }

  function payPremium(paymentId) {
    const today = new Date().toISOString().slice(0, 10)
    setPayments((prev) =>
      prev.map((p) => (p.id === paymentId ? { ...p, status: "Paid", date: today } : p)),
    )
  }

  function addNotification(note) {
    setNotifications((prev) => [note, ...prev])
  }

  const value = {
    customers,
    policies,
    purchasedPolicies,
    claims,
    payments,
    notifications,
    policyDistribution: seed.policyDistribution,
    revenueByMonth: seed.revenueByMonth,
    getCustomer,
    getPolicy,
    savePolicy,
    setClaimStatus,
    buyPolicy,
    createClaim,
    payPremium,
    addNotification,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error("useData must be used within DataProvider")
  return ctx
}

export { formatINR } from "./seed-data.js"
