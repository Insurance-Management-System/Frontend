import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  FileText,
  CreditCard,
  Bell,
  Settings,
  FolderOpen,
  UserCircle,
} from "lucide-react"

export const adminNav = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Policies", href: "/admin/policies", icon: ShieldCheck },
  { label: "Claims", href: "/admin/claims", icon: FileText },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Notifications", href: "/admin/notifications", icon: Bell },
  { label: "Profile", href: "/admin/settings", icon: UserCircle },
]

export const customerNav = [
  { label: "Dashboard", href: "/customer", icon: LayoutDashboard },
  { label: "Browse Policies", href: "/customer/policies", icon: ShieldCheck },
  { label: "My Policies", href: "/customer/my-policies", icon: FolderOpen },
  { label: "Claims", href: "/customer/claims", icon: FileText },
  { label: "Payments", href: "/customer/payments", icon: CreditCard },
  { label: "Notifications", href: "/customer/notifications", icon: Bell },
  { label: "Profile", href: "/customer/profile", icon: UserCircle },
]

export function navForRole(role) {
  return role === "admin" ? adminNav : customerNav
}
