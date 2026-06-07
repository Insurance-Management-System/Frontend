import { createContext, useContext, useState, useCallback } from "react"

const AuthContext = createContext(null)

// Mock directory of demo accounts.
const DEMO_USERS = {
  "admin@insure.com": { id: "a1", name: "Meera Iyer", email: "admin@insure.com", role: "admin" },
  "aarav.sharma@example.com": {
    id: "c1",
    name: "Aarav Sharma",
    email: "aarav.sharma@example.com",
    role: "customer",
  },
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  const login = useCallback((email, role) => {
    const existing = DEMO_USERS[email.toLowerCase()]
    const session =
      existing && existing.role === role
        ? existing
        : {
            id: role === "admin" ? "a1" : "c1",
            name: role === "admin" ? "Meera Iyer" : "Aarav Sharma",
            email: email || (role === "admin" ? "admin@insure.com" : "aarav.sharma@example.com"),
            role,
          }
    setUser(session)
    return session
  }, [])

  const logout = useCallback(() => setUser(null), [])

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
