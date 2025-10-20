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


    const filteredUsers = allUsers.filter((u) => u.username.toLowerCase().includes(search.toLowerCase()) && u._id !== user.id)

    return (
        <div className="p-6">
            <h2 className="text-white text-2xl font-bold mb-4">All Users</h2>
            <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users..."
                className="text-white w-full max-w-md border border-gray-300 px-4 py-2 rounded mb-4"
            />
            <div className="grid  sm:grid-cols-2 gap-16 pt-10">
                {filteredUsers.map((u) => (
                    <div key={u._id} className="flex justify-between items-center bg-white border border-gray-200 p-4 rounded">
                        <span className="font-medium">{u.username}</span>
                        {u.status === "Friend" ? (
                            <button className="px-5 py-2 rounded-full bg-green-500 text-white font-semibold" onClick={() => removeFriend(u._id)}>
                                Friend
                            </button>
                        ) : u.status === "Request Sent" ? (
                            <button className="px-5 py-2 rounded-full bg-yellow-500 text-white font-semibold" disabled>
                                Request Sent
                            </button>
                        ) : u.status === "Pending" ? (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => acceptRequest(u._id)}
                                    className="px-5 py-2 rounded-full bg-purple-500 text-white font-semibold hover:bg-purple-600 transition-colors"
                                >
                                    Accept
                                </button>
                                <button
                                    onClick={() => denyRequest(u._id)}
                                    className="px-5 py-2 rounded-full bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors"
                                >
                                    Deny
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => sendRequest(u._id)}
                                className="px-5 py-2 rounded-full bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors"
                            >
                                Send Request
                            </button>
                        )}
                    </div>
                ))}
                {filteredUsers.length === 0 && (
                    <p className="text-gray-500">No users found.</p>
                )}
            </div>
        </div>
    )
}

export default Users
