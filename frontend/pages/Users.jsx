import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';

const Users = () => {

    const user = useSelector((state) => state.auth.user);
    const [allUsers, setAllUsers] = useState([])
    const [search, setSearch] = useState("")


    const fetchUsers = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/users/all-users?userId=${user.id}`);
            const data = await response.json();
            setAllUsers(data)
        }
        catch (error) {
            console.error("Error fetching users:", error);
        }
    }

    useEffect(() => {
        if (user?.id) {
            fetchUsers();
        }

    }, [])

    const sendRequest = async (targetId) => {
        try {
            const response = await fetch("http://localhost:3000/api/users/send-request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fromUserId: user.id, toUserId: targetId }),
            });
            if (response.ok) fetchUsers();
        } catch (error) {
            console.error("Error sending request:", error);
        }
    };

    const acceptRequest = async (senderId) => {
        try {
            const response = await fetch("http://localhost:3000/api/users/accept-request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fromUserId: senderId, toUserId: user.id }),
            });
            if (response.ok) fetchUsers();
        } catch (error) {
            console.error("Error accepting request:", error);
        }
    };

    const denyRequest = async (senderId) => {
        try {
            const response = await fetch("http://localhost:3000/api/users/deny-request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fromUserId: senderId, toUserId: user.id }),
            });
            if (response.ok) fetchUsers();
        } catch (error) {
            console.error("Error denying request:", error);
        }
    };
    const removeFriend = async (friendId) => {
        if (window.confirm("Are you sure you want to remove this friend?")) {

        }
        // If Cancel, nothing happens
    };


    const filteredUsers = allUsers.filter((u) => u.username.toLowerCase().includes(search.toLowerCase()) && u._id !== user?.id)

    return (
        <div className="users-container max-w-6xl mx-auto py-8">
            <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight">Community</h1>
                    <p className="text-slate-400 mt-2">Connect with other developers and start collaborating.</p>
                </div>

                <div className="relative w-full md:w-80">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search users..."
                        className="w-full bg-slate-900/50 border border-white/10 text-white pl-12 pr-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-inner"
                    />
                    <svg className="w-5 h-5 absolute left-4 top-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </header>

            <div className="room-grid">
                {filteredUsers.map((u) => (
                    <div key={u._id} className="room-card group">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border border-blue-500/20 flex items-center justify-center text-xl font-bold text-blue-400 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                {u.username ? u.username[0].toUpperCase() : "?"}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{u.username}</h3>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className={`w-2 h-2 rounded-full ${u.status === "Friend" ? "bg-green-500" : "bg-slate-500"}`}></span>
                                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">{u.status || "User"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto pt-4 border-t border-white/5 flex justify-end">
                            {u.status === "Friend" ? (
                                <button className="w-full px-4 py-2.5 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20 font-bold text-sm hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all" onClick={() => removeFriend(u._id)}>
                                    Friend
                                </button>
                            ) : u.status === "Request Sent" ? (
                                <button className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 text-slate-400 border border-white/5 font-bold text-sm cursor-not-allowed" disabled>
                                    Request Sent
                                </button>
                            ) : u.status === "Pending" ? (
                                <div className="flex gap-2 w-full">
                                    <button
                                        onClick={() => acceptRequest(u._id)}
                                        className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                                    >
                                        Accept
                                    </button>
                                    <button
                                        onClick={() => denyRequest(u._id)}
                                        className="px-4 py-2.5 rounded-xl bg-slate-800/50 hover:bg-red-600 text-slate-300 hover:text-white border border-white/10 font-bold text-sm transition-all active:scale-95"
                                    >
                                        Deny
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => sendRequest(u._id)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                                >
                                    Connect
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {filteredUsers.length === 0 && (
                <div className="bg-slate-800/30 border border-white/5 rounded-3xl p-16 text-center">
                    <div className="w-20 h-20 bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-300">No users habitat here</h3>
                    <p className="text-slate-500 mt-2">Try searching for a different username.</p>
                </div>
            )}
        </div>
    );
}

export default Users
