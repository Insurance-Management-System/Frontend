import { createContext, useCallback, useContext, useMemo, useState } from "react"
import { AUTH_API, clearAuthTokens, getCookie, request, setAuthTokens } from "./api.js"

const AuthContext = createContext(null)

function toSession(payload) {
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

function saveSession(session) {
  sessionStorage.setItem("user", JSON.stringify(session))
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = sessionStorage.getItem("user")
    return raw ? JSON.parse(raw) : null
  })

  const login = useCallback(async (email, password, expectedRole) => {
    const payload = await request(`${AUTH_API}/login`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: {},
      skipRefresh: true,
    })
    const session = toSession(payload)
    if (expectedRole && session.role !== expectedRole) {
      throw new Error(`Please select the ${session.role} role for this account.`)
    }
    setAuthTokens(payload)
    saveSession(session)
    setUser(session)
    return session
  }, [])

  const register = useCallback(async (form) => {
    await request(`${AUTH_API}/register`, {
      method: "POST",
      body: JSON.stringify(form),
      headers: {},
      skipRefresh: true,
    })
  }, [])

  const listUsers = useCallback(async () => request(`${AUTH_API}/users`), [])

  const deleteUser = useCallback(async (id) => request(`${AUTH_API}/users/${id}`, { method: "DELETE" }), [])

  const updateUser = useCallback(async (id, body) => {
    const updated = await request(`${AUTH_API}/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    })
    const nextUser = {
      id: String(updated.id),
      name: `${updated.firstName ?? ""} ${updated.lastName ?? ""}`.trim() || updated.email,
      email: updated.email,
      phone: updated.phone,
      role: String(updated.role || "").toLowerCase(),
    }
    saveSession(nextUser)
    setUser(nextUser)
    return nextUser
  }, [])

  const changePassword = useCallback(async (oldPassword, newPassword, confirmPassword) => {
    await request(`${AUTH_API}/change-password`, {
      method: "POST",
      body: JSON.stringify({ oldPassword, newPassword, confirmPassword }),
    })
  }, [])

  const logout = useCallback(async () => {
    const refreshToken = getCookie("refreshToken")
    if (refreshToken) {
      await request(`${AUTH_API}/logout`, {
        method: "POST",
        body: JSON.stringify({ refreshToken: decodeURIComponent(refreshToken) }),
        skipRefresh: true,
      }).catch(() => null)
    }
    clearAuthTokens()
    sessionStorage.removeItem("user")
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, login, register, logout, listUsers, deleteUser, updateUser, changePassword }),
    [user, login, register, logout, listUsers, deleteUser, updateUser, changePassword],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
