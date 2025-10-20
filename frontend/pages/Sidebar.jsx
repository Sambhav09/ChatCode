import React from 'react'
import { NavLink } from 'react-router-dom'

// Sidebar renders only the left column (30%). The right content is provided
// by the parent layout (e.g. <div className="app"><Sidebar/><main>...</main></div>)
const Sidebar = () => {
    return (
        <aside className="sidebar">
            <div className="brand">Coder</div>
            <nav className="nav">

                <NavLink to="/home" className={({ isActive }) => (isActive ? 'active' : '')}>Home</NavLink>
                <NavLink to="/users" className={({ isActive }) => (isActive ? 'active' : '')}>Users</NavLink>
                <NavLink to="/chat" className={({ isActive }) => (isActive ? 'active' : '')}>Chat</NavLink>
            </nav>
        </aside>
    )
}

export default Sidebar
