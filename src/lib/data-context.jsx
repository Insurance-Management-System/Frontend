import { createContext, useContext, useMemo, useState, useCallback } from "react"
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

  const getCustomer = useCallback((id) => customers.find((c) => c.id === id), [customers])
  const getPolicy = useCallback((id) => policies.find((p) => p.id === id), [policies])

  // ----- Admin: create / update a policy plan -----
  const savePolicy = useCallback((policy) => {
    setPolicies((prev) => {
      const exists = prev.some((p) => p.id === policy.id)
      return exists ? prev.map((p) => (p.id === policy.id ? policy : p)) : [...prev, policy]
    })
  }, [])

  // ----- Admin: approve / reject a claim -----
  const setClaimStatus = useCallback((id, status) => {
    setClaims((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)))
  }, [])

  // ----- Customer: buy a policy (completes the Buy flow) -----
  const buyPolicy = useCallback((policy, customerId) => {
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
  }, [])

  // ----- Customer: file a claim -----
  const createClaim = useCallback((claim) => {
    setClaims((prev) => [claim, ...prev])
  }, [])

  // ----- Customer: pay a pending / failed premium (completes Pay Now) -----
  const payPremium = useCallback((paymentId) => {
    const today = new Date().toISOString().slice(0, 10)
    setPayments((prev) =>
      prev.map((p) => (p.id === paymentId ? { ...p, status: "Paid", date: today } : p)),
    )
  }, [])

  // ----- Admin: broadcast a notification -----
  const addNotification = useCallback((note) => {
    setNotifications((prev) => [note, ...prev])
  }, [])

  const value = useMemo(
    () => ({
      customers,
      policies,
      purchasedPolicies,
      claims,
      payments,
      notifications,
      revenueByMonth: seed.revenueByMonth,
      policyDistribution: seed.policyDistribution,
      getCustomer,
      getPolicy,
      savePolicy,
      setClaimStatus,
      buyPolicy,
      createClaim,
      payPremium,
      addNotification,
    }),
    [
      customers,
      policies,
      purchasedPolicies,
      claims,
      payments,
      notifications,
      getCustomer,
      getPolicy,
      savePolicy,
      setClaimStatus,
      buyPolicy,
      createClaim,
      payPremium,
      addNotification,
    ],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error("useData must be used within DataProvider")
  return ctx
}

export { formatINR } from "./seed-data.js"
