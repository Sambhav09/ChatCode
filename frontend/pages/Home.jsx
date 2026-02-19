import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Skeleton from "../src/components/Skeleton";
import { useToast } from "../src/context/ToastContext";
import { BACKEND_URL } from "../src/config";

const Home = () => {
    const { showToast } = useToast();
    const user = useSelector((state) => state.auth.user);
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [friends, setFriends] = useState([]);
    const [roomName, setRoomName] = useState("");
    const [members, setMembers] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    // ✅ Fetch rooms
    const getRooms = async () => {
        try {
            const response = await fetch(
                `${BACKEND_URL}/api/rooms?userId=${user.id}`
            );
            const data = await response.json();
            setRooms(data);
        } catch (error) {
            console.error("Error fetching rooms:", error);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Fetch friends
    const getFriends = async () => {
        try {
            const response = await fetch(
                `${BACKEND_URL}/api/users/friends?userId=${user.id}`
            );
            const data = await response.json();
            console.log("Fetched friends:", data);
            setFriends(data);
        } catch (error) {
            console.error("Error fetching friends:", error);
        }
    };

    // ✅ Create room
    const createRoom = async (e) => {
        e.preventDefault();
        try {
            getFriends();
            const response = await fetch(`${BACKEND_URL}/api/rooms/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: roomName,
                    createdBy: user.id,
                    members: [...members, user.id],
                }),
            });

            if (response.ok) {
                setRoomName("");
                setMembers([]);
                setShowPopup(false);
                getRooms(); // refresh rooms
                showToast("Room created successfully!", "success");
            } else {
                console.error("Failed to create room");
                showToast("Failed to create room", "error");
            }
        } catch (error) {
            console.error("Error creating room:", error);
            showToast("Server error occurred", "error");
        }
    };

    // ✅ Toggle member add/remove
    const toggleMember = (friendId) => {
        if (members.includes(friendId)) {
            setMembers(members.filter((id) => id !== friendId));
        } else {
            setMembers([...members, friendId]);
        }
    };

    useEffect(() => {
        if (user?.id) {
            getRooms();
            getFriends();
        }
    }, [user]);

    // ✅ Filter friends by search
    const filteredFriends = friends.filter((f) =>
        f.username.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="home-container">
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight">
                        Welcome back, <span className="text-blue-500">{user?.username}</span>
                    </h1>
                    <p className="text-slate-400 mt-2">Pick a room and start coding together.</p>
                </div>
                <button
                    onClick={() => setShowPopup(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                >
                    + Create New Room
                </button>
            </header>

            {/* ✅ Rooms List */}
            <section>
                <h2 className="text-xl font-semibold text-slate-200 mb-6 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                    Your Active Rooms
                </h2>

                {loading ? (
                    <div className="room-grid">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="room-card border-none bg-white/5 opacity-50">
                                <Skeleton className="h-6 w-3/4 mb-4" />
                                <Skeleton className="h-4 w-1/2 mb-2" />
                                <Skeleton className="h-4 w-1/4 mt-auto pt-4" />
                            </div>
                        ))}
                    </div>
                ) : rooms.length === 0 ? (
                    <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-12 text-center text-slate-500">
                        <p className="text-lg">No rooms found. Create one to get started!</p>
                    </div>
                ) : (
                    <div className="room-grid">
                        {rooms.map((room) => (
                            <button
                                key={room.roomId}
                                onClick={() => navigate(`/editor/${room.roomId}`)}
                                className="room-card"
                            >
                                <div className="room-card__title">{room.roomName}</div>
                                <div className="room-card__meta flex items-center gap-2">
                                    <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded text-xs font-mono uppercase">Room ID: {room.roomId.slice(0, 8)}</span>
                                </div>
                                <div className="room-card__meta mt-auto pt-4 border-t border-white/5 italic">
                                    Created {new Date(room.createdAt).toLocaleDateString()}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </section>

            {/* ✅ Popup for Create Room */}
            {showPopup && (
                <div className="fixed inset-0 z-50 flex justify-center items-center px-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPopup(false)}></div>

                    <div className="glass-popup w-full max-w-lg rounded-3xl p-8 relative overflow-hidden">
                        {/* Close button */}
                        <button
                            onClick={() => setShowPopup(false)}
                            className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <h2 className="text-2xl font-bold text-white mb-6">Create New Room</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-slate-400 text-sm font-medium mb-2">Room Name</label>
                                <input
                                    type="text"
                                    value={roomName}
                                    onChange={(e) => setRoomName(e.target.value)}
                                    placeholder="Enter a descriptive name"
                                    className="w-full bg-slate-900/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-inner"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-400 text-sm font-medium mb-2">Search Friends</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Type to search..."
                                        className="w-full bg-slate-900/50 border border-white/10 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-inner"
                                    />
                                    <svg className="w-5 h-5 absolute left-3 top-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>

                            <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                {filteredFriends.length === 0 ? (
                                    <p className="text-slate-500 text-center py-4 italic text-sm">No friends found</p>
                                ) : (
                                    filteredFriends.map((friend) => (
                                        <div
                                            key={friend._id}
                                            className="flex justify-between items-center bg-slate-900/40 border border-white/5 p-3 rounded-xl hover:border-white/10 transition-colors"
                                        >
                                            <span className="text-slate-200 text-sm font-medium">{friend.username}</span>
                                            <button
                                                onClick={() => toggleMember(friend._id)}
                                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${members.includes(friend._id)
                                                    ? "bg-green-500/20 text-green-400 border border-green-500/20"
                                                    : "bg-blue-600 hover:bg-blue-700 text-white"
                                                    }`}
                                            >
                                                {members.includes(friend._id) ? "Selected" : "Add"}
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <button
                            onClick={createRoom}
                            disabled={!roomName.trim()}
                            className="mt-8 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl w-full shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                        >
                            Create Room
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
