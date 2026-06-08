

function App() {
  

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

export default App
