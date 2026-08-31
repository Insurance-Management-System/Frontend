export const AUTH_API = import.meta.env.VITE_AUTH_API_URL ?? "http://localhost:9092/api/auth"
export const CORE_API = import.meta.env.VITE_CORE_API_URL ?? "http://localhost:8081/api"
export const PAYMENT_API = import.meta.env.VITE_PAYMENT_API_URL ?? "http://localhost:8082/api/payments"
export const DOCUMENT_API = import.meta.env.VITE_DOCUMENT_API_URL ?? "http://localhost:8084/api/documents"

// Auth tokens live in sessionStorage, not a cookie. A cookie is shared by every tab on this
// origin, so logging in as a different role in a second tab (e.g. testing Admin and Customer
// side by side) silently overwrote the first tab's tokens with the second login's - the first
// tab would keep rendering its old, cached user info while every API call underneath it quietly
// started authenticating as the other user. sessionStorage is scoped per tab, so each login stays
// isolated to the tab that created it.
export function getCookie(name) {
  const value = sessionStorage.getItem(name)
  return value == null ? undefined : encodeURIComponent(value)
}

export function setCookie(name, value) {
  sessionStorage.setItem(name, value)
}

export function deleteCookie(name) {
  sessionStorage.removeItem(name)
}

export function setAuthTokens({ accessToken, refreshToken }) {
  if (accessToken) setCookie("accessToken", accessToken, 15 * 60)
  if (refreshToken) setCookie("refreshToken", refreshToken, 7 * 24 * 60 * 60)
}

export function clearAuthTokens() {
  deleteCookie("accessToken")
  deleteCookie("refreshToken")
}

export function authHeaders() {
  const token = getCookie("accessToken")
  return token ? { Authorization: `Bearer ${decodeURIComponent(token)}` } : {}
}

async function refreshAccessToken() {
  const refreshToken = getCookie("refreshToken")
  if (!refreshToken) return false
  const response = await fetch(`${AUTH_API}/refresh-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: decodeURIComponent(refreshToken) }),
  })
  if (!response.ok) {
    clearAuthTokens()
    return false
  }
  const payload = await response.json()
  setAuthTokens(payload)
  if (payload.user) {
    sessionStorage.setItem("user", JSON.stringify(toStoredSession(payload)))
  }
  return true
}

function toStoredSession(payload) {
  const user = payload.user
  const role = String(user.role || "").toLowerCase()
  return {
    id: String(user.id),
    name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email,
    email: user.email,
    phone: user.phone,
    role,
  }
}

export async function request(url, options = {}) {
  const isFormData = options.body instanceof FormData
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...authHeaders(),
      ...(options.headers ?? {}),
    },
  })

  if (response.status === 401 && !options.skipRefresh) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      return request(url, { ...options, skipRefresh: true })
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || `Request failed with status ${response.status}`)
  }

  if (response.status === 204) return null
  const text = await response.text()
  if (!text) return null
  return JSON.parse(text)
}
