import { createContext, useContext, useState } from "react"

const AuthContext = createContext(null)

// Mock directory of demo accounts.
const DEMO_USERS = {
  "admin@insure.com": { id: "a1", name: "SunLight Admin", email: "admin@insure.com", role: "admin" },
  "vrushabh@gmail.com": {
    id: "c1",
    name: "Vrushabh T",
    email: "vrushabh@gmail.com",
    role: "customer",
  },
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  function login(email, role) {
    const existing = DEMO_USERS[email.toLowerCase()]
    const session =
      existing && existing.role === role
        ? existing
        : {
            id: role === "admin" ? "a1" : "c1",
            name: role === "admin" ? "SunLight Admin" : "Vrushabh T",
            email: email || (role === "admin" ? "admin@insure.com" : "vrushabh@gmail.com"),
            role,
          }
    setUser(session)
    return session
  }

  function logout() {
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
