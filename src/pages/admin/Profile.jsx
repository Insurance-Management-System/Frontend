import { useState } from "react"
import { PageHeader } from "../../components/PageHeader"

export default function AdminSettings(){
    const {user} = useAuth()
    const {saved, setSaved} = useState(false)

    function save(e){
        e.preventDefault()
        setSaved(true)
        setTimeout(() => setSaved(false,2500))
    }

    return(
        <div>
            <PageHeader title="Profile" description="Manage your admin account and platform preferences." />

                <div className="row g-3">
                    <div className="col-12 col-lg-7">
                        <div className="ag-card p-4">
                            <h2 className="h6 fw-semibold mb-3">Profile</h2>
                            <div className="d-flex align-items-center gap-3 mb-4">
                                <Avatar name={user.name} size={56} primary />
                            <div>
                                <p className="fw-medium mb-0">{user.name}</p>
                                <p className="text-muted-2 small mb-0">Administrator</p>
                            </div>
                        </div>
                        {saved && <div className="ag-success-banner p-2 px-3 small mb-3">Settings saved successfully.</div>}
                        <form onSubmit={save} className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label small fw-medium">Full Name</label>
                                <input className="form-control" defaultValue={user.name} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-medium">Email</label>
                                <input className="form-control" defaultValue={user.email} type="email" />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-medium">Phone</label>
                                <input className="form-control" defaultValue="+91 98000 11122" />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-medium">Role</label>
                                <input className="form-control" defaultValue="Administrator" disabled />
                            </div>
                            <div className="col-12">
                                <button type="submit" className="btn btn-primary">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>


            <div className="col-12 col-lg-4">
          <div className="ag-card p-4 mb-3">
            <h2 className="h6 fw-semibold d-flex align-items-center gap-2 mb-3">
              <KeyRound size={18} className="text-primary" /> Change Password
            </h2>
            {savedPassword && <div className="ag-success-banner p-2 px-3 small mb-3">Password updated.</div>}
            <form onSubmit={savePassword} className="d-flex flex-column gap-3">
              <div>
                <label className="form-label small fw-medium">Current Password</label>
                <input className="form-control" type="password" placeholder="••••••••" />
              </div>
              <div>
                <label className="form-label small fw-medium">New Password</label>
                <input className="form-control" type="password" placeholder="••••••••" />
              </div>
              <button type="submit" className="btn btn-outline-primary w-100">Update Password</button>
            </form>
          </div>


          <div className="ag-card p-4">
            <p className="text-muted-2 small mb-3">Sign out of your account on this device.</p>
            <button className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2" onClick={handleLogout}>
              <LogOut size={16} /> Logout
            </button>
          </div>

                
            </div>
        </div>

    </div>
    )
}