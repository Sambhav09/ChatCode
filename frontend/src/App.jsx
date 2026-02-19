

import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Dashboard from "../pages/Dashboard";
import PrivateRoute from "../component/PrivateRoute";
import Home from "../pages/Home";
import EditorPage from "../pages/Editor";
import Users from "../pages/Users";
import Chat from "../pages/Chat";
import Profile from "../pages/Profile";
import Notifications from "../pages/Notifications";
import "./App.css";
import Edit from "../pages/Edit";
import ProtectedLayout from "../pages/ProtectedLayout";

const App = () => {
  const socketRef = useRef(null); // store socket instance
  const [Message, setMessage] = useState("");
  const [PrevMessage, setPrevMessage] = useState([]);


  const isLoggedIn = () => {
    return !!localStorage.getItem("token");
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={isLoggedIn() ? <Navigate to="/home" /> : <Navigate to="/login" />}
        />


        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<PrivateRoute><ProtectedLayout /></PrivateRoute>}>
          <Route path="/home" element={<Home />} />
          <Route path="/editor/:roomId" element={<EditorPage />} />
          <Route path="/users" element={<Users />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/edit" element={<Edit />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
