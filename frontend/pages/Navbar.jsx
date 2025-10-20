import React from 'react'
import { NavLink } from 'react-router-dom'

const Navbar = () => {
    return (
        <aside className="sidebar">
            <div className="sidebar__brand">Coder</div>
            <nav className="sidebar__nav">
                <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink>
                <NavLink to="/home" className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink>
                <NavLink to="/users" className={({ isActive }) => isActive ? 'active' : ''}>Users</NavLink>
                <NavLink to="/chat" className={({ isActive }) => isActive ? 'active' : ''}>Chat</NavLink>
            </nav>
        </aside>
    )
}

export default Navbar
