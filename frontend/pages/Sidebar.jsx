import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { logout } from '../store/authSlice'

const Sidebar = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogout = () => {
        // Clear LocalStorage
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Clear Redux State
        dispatch(logout());

        // Redirect to Login
        navigate("/login");
    };

    return (
        <aside className="sidebar">
            <div className="brand">Coder</div>

            <nav className="nav">
                <NavLink to="/home" className={({ isActive }) => (isActive ? 'active' : '')}>
                    <span>🏠</span> Home
                </NavLink>
                <NavLink to="/users" className={({ isActive }) => (isActive ? 'active' : '')}>
                    <span>👥</span> Users
                </NavLink>
                <NavLink to="/chat" className={({ isActive }) => (isActive ? 'active' : '')}>
                    <span>💬</span> Chat
                </NavLink>
                <NavLink to="/profile" className={({ isActive }) => (isActive ? 'active' : '')}>
                    <span>👤</span> Profile
                </NavLink>
                <NavLink to="/notifications" className={({ isActive }) => (isActive ? 'active' : '')}>
                    <span>🔔</span> Notifications
                </NavLink>
            </nav>

            <div className="sidebar__footer">
                <button onClick={handleLogout} className="logout-btn">
                    <span>🚪</span> Logout
                </button>
            </div>
        </aside>
    )
}

export default Sidebar
