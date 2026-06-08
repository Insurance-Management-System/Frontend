import {NavLink, useLocation} from "react-router-dom"
import {Logo} from "./Logo.jsx"
import { navForRole } from "../lib/nav-config.js"
import { useAuth } from "../lib/auth-context.jsx"

export function Sidebar(){
    const {user} = useAuth()
    if(!user) return null

    const items = navForRole(user.role)
    const roleHome=user.role === "admin" ? "/admin" : "/customer"

    return(
        <aside className="ag-sidebar d-none d-md-flex">
            <div className="d-flex align-items-center px-4" style={{height:64, borderBottom:"1px solid var(--ag-border)"}}>
                <NavLink to={roleHome}>
                    <Logo/>
                </NavLink>
                </div>
                <nav className ="d-flex flex-column gap-1 p-3 flex-grow-1">
                    <p className="px-2 pt-2 pb-1 text-uppercase text-muted-2 fw-semibold" style={{ fontSize: "0.7rem", letterSpacing: "0.05em" }}>
                     {user.role === "admin"? "Administration" : "My Account"}
                    </p>
                    {items.map((item)=>{
                        const Icon=item.icon
                        return (
                            <NavLink key={item.href} to={item.href} end={item.href === roleHome} className="ag-nav-link">
                                <Icon size={18}/>
                                {item.label}
                            </NavLink>
                        )
                    })}
                </nav>
                <div className="p-3" style={{ borderTop: "1px solid var(--ag-border)" }}>
                    <p className="small text-muted-2 mb-0">Insurance Management v1.0</p>
                </div>

        </aside>
    )
}