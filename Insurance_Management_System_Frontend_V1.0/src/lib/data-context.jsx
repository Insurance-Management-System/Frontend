import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { CORE_API, DOCUMENT_API, PAYMENT_API, request } from "./api.js"
import { useAuth } from "./auth-context.jsx"

const DataContext = createContext(null)

const emptyData = {
  customers: [],
  policies: [],
  purchasedPolicies: [],
  claims: [],
  payments: [],
  notifications: [],
  categories: [],
  documentTypes: [],
  policyDistribution: [],
  revenueByMonth: [],
}

function loadRazorpayCheckout() {
  if (window.Razorpay) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = resolve
    script.onerror = () => reject(new Error("Unable to load Razorpay checkout. Check your internet connection."))
    document.body.appendChild(script)
  })
}

export function DataProvider({ children }) {
  const { user } = useAuth()
  const [data, setData] = useState(emptyData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const refresh = useCallback(async () => {
    if (!user) {
      setData(emptyData)
      return
    }
    setLoading(true)
    setError("")
    try {
      setData(await request(`${CORE_API}/dashboard/bootstrap`))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  function getCustomer(id) {
    return data.customers.find((c) => c.id === String(id))
  }

  function getPolicy(id) {
    return data.policies.find((p) => p.id === String(id))
  }

  async function savePolicy(policy) {
    await request(`${CORE_API}/policies`, {
      method: "POST",
      body: JSON.stringify(policy),
    })
    await refresh()
  }

  async function setPolicyActive(id, active) {
    await request(`${CORE_API}/policies/${id}/active`, {
      method: "PATCH",
      body: JSON.stringify({ active }),
    })
    await refresh()
  }

  async function saveCategory(category) {
    await request(`${CORE_API}/categories`, {
      method: "POST",
      body: JSON.stringify(category),
    })
    await refresh()
  }

  async function deleteCategory(id) {
    await request(`${CORE_API}/categories/${id}`, { method: "DELETE" })
    await refresh()
  }

  async function setClaimStatus(id, status) {
    await request(`${CORE_API}/claims/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    })
    await refresh()
  }

  async function saveDocumentType(type) {
    const saved = await request(`${CORE_API}/document-types`, {
      method: "POST",
      body: JSON.stringify(type),
    })
    await refresh()
    return saved
  }

  async function setDocumentTypeActive(id, active) {
    await request(`${CORE_API}/document-types/${id}/active`, {
      method: "PATCH",
      body: JSON.stringify({ active }),
    })
    await refresh()
  }

  async function buyPolicy(policy, customerId) {
    const purchase = await request(`${CORE_API}/purchases`, {
      method: "POST",
      body: JSON.stringify({ policyId: policy.id, customerId }),
    })
    await refresh()
    return purchase
  }

  async function requestPolicyCancellation(purchaseId) {
    await request(`${CORE_API}/purchases/${purchaseId}/request-cancellation`, { method: "PATCH" })
    await refresh()
  }

  async function confirmPolicyCancellation(purchaseId) {
    await request(`${CORE_API}/purchases/${purchaseId}/cancel`, { method: "PATCH" })
    await refresh()
  }

  async function createClaimDraft(draft) {
    const created = await request(`${CORE_API}/claims/draft`, {
      method: "POST",
      body: JSON.stringify(draft),
    })
    await refresh()
    return created
  }

  async function submitClaim(id, submission) {
    const submitted = await request(`${CORE_API}/claims/${id}/submit`, {
      method: "PATCH",
      body: JSON.stringify(submission),
    })
    await refresh()
    return submitted
  }

  async function payPremium(paymentInput) {
    const payment = typeof paymentInput === "string" ? data.payments.find((p) => p.id === paymentInput) : paymentInput
    if (!payment) throw new Error("Payment record not found.")
    await loadRazorpayCheckout()
    // A customer can never selectively pay just one missed installment while older ones are
    // still outstanding - every pending/overdue installment for this policy must be settled
    // together, so the Razorpay order is raised for their combined total.
    const pendingForPolicy = data.payments.filter(
      (p) => p.customerPolicyId === payment.customerPolicyId && p.status !== "Paid",
    )
    const totalDue = pendingForPolicy.reduce((sum, p) => sum + p.amount, 0) || payment.amount
    const order = await request(`${PAYMENT_API}/orders`, {
      method: "POST",
      body: JSON.stringify({
        customerId: Number(payment.customerId),
        customerPolicyId: Number(payment.customerPolicyId),
        amount: totalDue,
      }),
    })

    await new Promise((resolve, reject) => {
      const checkout = new window.Razorpay({
        key: order.razorpayKeyId,
        amount: Math.round(Number(order.amount) * 100),
        currency: order.currency,
        name: "AegisInsure",
        description:
          pendingForPolicy.length > 1
            ? `${pendingForPolicy.length} pending premium installments`
            : `Premium payment ${payment.id}`,
        order_id: order.razorpayOrderId,
        prefill: {
          name: user?.name ?? "",
          email: user?.email ?? "",
          contact: user?.phone ?? "",
        },
        notes: {
          imsPaymentId: payment.id,
          customerPolicyId: payment.customerPolicyId,
        },
        handler: async (response) => {
          try {
            await request(`${PAYMENT_API}/${order.paymentNumber}/success`, {
              method: "PATCH",
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            })
            await request(`${CORE_API}/payments/${payment.id}/pay`, {
              method: "PATCH",
              body: JSON.stringify({ paymentGateway: "RAZORPAY", paymentReference: response.razorpay_payment_id }),
            })
            resolve()
          } catch (err) {
            reject(err)
          }
        },
        modal: {
          ondismiss: async () => {
            await request(`${PAYMENT_API}/${order.paymentNumber}/failure`, {
              method: "PATCH",
              body: JSON.stringify({ reason: "Checkout closed by user" }),
            }).catch(() => null)
            reject(new Error("Payment cancelled."))
          },
        },
      })
      checkout.on("payment.failed", async (response) => {
        await request(`${PAYMENT_API}/${order.paymentNumber}/failure`, {
          method: "PATCH",
          body: JSON.stringify({ reason: response.error?.description ?? "Razorpay payment failed" }),
        }).catch(() => null)
        await request(`${CORE_API}/payments/${payment.id}/fail`, {
          method: "PATCH",
          body: JSON.stringify({ reason: response.error?.description ?? "Razorpay payment failed" }),
        }).catch(() => null)
        reject(new Error(response.error?.description ?? "Payment failed."))
      })
      checkout.open()
    })

    await refresh()
  }

  async function addNotification(note) {
    await request(`${CORE_API}/notifications`, {
      method: "POST",
      body: JSON.stringify(note),
    })
    await refresh()
  }

  async function markNotificationRead(id) {
    await request(`${CORE_API}/notifications/${id}/read`, { method: "PATCH" })
    await refresh()
  }

  async function markAllNotificationsRead() {
    await request(`${CORE_API}/notifications/read-all`, { method: "PATCH" })
    await refresh()
  }

  async function updateCustomer(id, customer) {
    await request(`${CORE_API}/customers/${id}`, {
      method: "PUT",
      body: JSON.stringify(customer),
    })
    await refresh()
  }

  async function completeKyc(kyc) {
    await request(`${CORE_API}/kyc`, {
      method: "POST",
      body: JSON.stringify(kyc),
    })
    await refresh()
  }

  async function listDocuments(referenceType, referenceId) {
    return request(`${DOCUMENT_API}/reference/${referenceType}/${referenceId}`)
  }

  async function listDocumentsByCustomer() {
    return request(`${CORE_API}/documents/by-customer`)
  }

  async function recordDocumentDecision({ referenceType, referenceId, documentType, status, remarks }) {
    return request(`${CORE_API}/documents/notify-decision`, {
      method: "POST",
      body: JSON.stringify({ referenceType, referenceId, documentType, status, remarks }),
    })
  }

  async function listAllDocuments(filters = {}) {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })
    return request(`${DOCUMENT_API}${params.toString() ? `?${params}` : ""}`)
  }

  async function uploadDocument({ referenceType, referenceId, documentType, uploadedBy, file }) {
    const form = new FormData()
    form.append("referenceType", referenceType)
    form.append("referenceId", referenceId)
    form.append("documentType", documentType)
    form.append("uploadedBy", uploadedBy)
    form.append("file", file)
    return request(`${DOCUMENT_API}`, {
      method: "POST",
      body: form,
    })
  }

  async function verifyDocument(id, status, remarks = "") {
    return request(`${DOCUMENT_API}/${id}/verify`, {
      method: "PATCH",
      body: JSON.stringify({ status, verifiedBy: Number(user.id), remarks }),
    })
  }

  async function deleteDocument(id) {
    return request(`${DOCUMENT_API}/${id}`, { method: "DELETE" })
  }

  async function getDocument(id) {
    return request(`${DOCUMENT_API}/${id}`)
  }

  async function analyzeDocument(id) {
    return request(`${DOCUMENT_API}/${id}/analyze`, { method: "POST" })
  }

  const value = useMemo(
    () => ({
      ...data,
      loading,
      error,
      refresh,
      getCustomer,
      getPolicy,
      savePolicy,
      setPolicyActive,
      saveCategory,
      deleteCategory,
      setClaimStatus,
      saveDocumentType,
      setDocumentTypeActive,
      buyPolicy,
      requestPolicyCancellation,
      confirmPolicyCancellation,
      createClaimDraft,
      submitClaim,
      payPremium,
      addNotification,
      markNotificationRead,
      markAllNotificationsRead,
      updateCustomer,
      completeKyc,
      listDocuments,
      listAllDocuments,
      listDocumentsByCustomer,
      recordDocumentDecision,
      uploadDocument,
      verifyDocument,
      deleteDocument,
      getDocument,
      analyzeDocument,
    }),
    [data, loading, error, refresh],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error("useData must be used within DataProvider")
  return ctx
}

export function formatINR(value) {
  return `Rs. ${Number(value || 0).toLocaleString("en-IN")}`
}
