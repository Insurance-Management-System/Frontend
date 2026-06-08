import { createContext, useContext, useState, useCallback } from "react"

const AuthContext = createContext(null)


const DEMO_USERS = {
  "admin@gmail.com": { id: "a1", name: "admin", email: "admin@gmail.com", role: "admin" },
  "vrushabh@gmail.com": {
    id: "c1",
    name: "vrushabh",
    email: "vrushabh@gmail.com",
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
            name: role === "admin" ? "admin" : "vrushabh",
            email: email || (role === "admin" ? "admin@gmail.com" : "vrushabh@gmail.com"),
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
