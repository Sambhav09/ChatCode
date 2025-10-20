import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../store/authSlice";

const Dashboard = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        dispatch(logout());
        navigate("/login");
    };

    return (
        <div>
            <h1>Welcome, {user?.username}</h1>
            <p>Email: {user?.email}</p>
            <button onClick={handleLogout}>Logout</button>
            <button onClick={() => navigate('/editor')}>editor</button>
        </div>
    );
};

export default Dashboard;
