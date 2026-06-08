import { Routes, Route, Navigate } from "react-router-dom"
import { AppShell } from "./components/AppShell.jsx"
import LoginPage from "./pages/LoginPage.jsx"

import AdminDashboard from "./pages/admin/Dashboard.jsx"
import AdminCustomers from "./pages/admin/Customers.jsx"
import AdminPolicies from "./pages/admin/Policies.jsx"
import AdminClaims from "./pages/admin/Claims.jsx"
import AdminPayments from "./pages/admin/Payments.jsx"
import AdminNotifications from "./pages/admin/Notifications.jsx"
import AdminSettings from "./pages/admin/Settings.jsx"

import CustomerDashboard from "./pages/customer/Dashboard.jsx"
import BrowsePolicies from "./pages/customer/BrowsePolicies.jsx"
import MyPolicies from "./pages/customer/MyPolicies.jsx"
import CustomerClaims from "./pages/customer/Claims.jsx"
import CustomerPayments from "./pages/customer/Payments.jsx"
import CustomerNotifications from "./pages/customer/Notifications.jsx"
import CustomerProfile from "./pages/customer/Profile.jsx"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />

      <Route element={<AppShell role="admin" />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/customers" element={<AdminCustomers />} />
        <Route path="/admin/policies" element={<AdminPolicies />} />
        <Route path="/admin/claims" element={<AdminClaims />} />
        <Route path="/admin/payments" element={<AdminPayments />} />
        <Route path="/admin/notifications" element={<AdminNotifications />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Route>

      <Route element={<AppShell role="customer" />}>
        <Route path="/customer" element={<CustomerDashboard />} />
        <Route path="/customer/policies" element={<BrowsePolicies />} />
        <Route path="/customer/my-policies" element={<MyPolicies />} />
        <Route path="/customer/claims" element={<CustomerClaims />} />
        <Route path="/customer/payments" element={<CustomerPayments />} />
        <Route path="/customer/notifications" element={<CustomerNotifications />} />
        <Route path="/customer/profile" element={<CustomerProfile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
