import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const Home = () => {
    const user = useSelector((state) => state.auth.user);
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [friends, setFriends] = useState([]);
    const [roomName, setRoomName] = useState("");
    const [members, setMembers] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [search, setSearch] = useState("");

    // ✅ Fetch rooms
    const getRooms = async () => {
        try {
            const response = await fetch(
                `http://localhost:3000/api/rooms?userId=${user.id}`
            );
            const data = await response.json();
            setRooms(data);
        } catch (error) {
            console.error("Error fetching rooms:", error);
        }
    };

    // ✅ Fetch friends
    const getFriends = async () => {
        try {
            const response = await fetch(
                `http://localhost:3000/api/users/friends?userId=${user.id}`
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
            const response = await fetch(`http://localhost:3000/api/rooms/create`, {
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
            } else {
                console.error("Failed to create room");
            }
        } catch (error) {
            console.error("Error creating room:", error);
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
        <div className="p-6">
            {/* ✅ Create Room Button */}
            <button
                onClick={() => setShowPopup(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md mb-4"
            >
                Create Room
            </button>

            {/* ✅ Rooms List */}
            <h2 className="text-xl font-semibold mb-2 text-white mt-5">My Rooms</h2>
            <ul className="space-y-2">
                {rooms.map((room) => (
                    <button onClick={() => navigate(`/editor/${room.roomId}`)}>
                        <li
                            key={room.roomId}
                            className="border p-3 rounded-md shadow-sm bg-gray-50"
                        >
                            <p className="font-medium">{room.roomName}</p>
                            <span className="text-sm text-gray-500">
                                Created at: {new Date(room.createdAt).toLocaleString()}
                            </span>
                        </li>
                    </button>
                ))}
            </ul>

            {/* ✅ Popup for Create Room */}
            {showPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white w-full h-full p-6 overflow-y-auto">
                        {/* Close button */}
                        <button
                            onClick={() => setShowPopup(false)}
                            className="absolute top-4 right-4 text-gray-600 hover:text-black"
                        >
                            ✕
                        </button>

                        {/* Room Name Input */}
                        <h2 className="text-2xl font-semibold mb-4">Create a Room</h2>
                        <input
                            type="text"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            placeholder="Enter room name"
                            className="w-full border px-3 py-2 rounded-md mb-4"
                        />

                        {/* Search Bar */}
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search friends..."
                            className="w-full border px-3 py-2 rounded-md mb-4"
                        />

                        {/* Friends List */}
                        <div className="space-y-2">
                            {filteredFriends.length === 0 ? (
                                <p className="text-gray-500">No friends found</p>
                            ) : (
                                filteredFriends.map((friend) => (
                                    <div
                                        key={friend._id}
                                        className="flex justify-between items-center border p-3 rounded-md"
                                    >
                                        <span>{friend.username}</span>
                                        <button
                                            onClick={() => toggleMember(friend._id)}
                                            className={`px-3 py-1 rounded-md ${members.includes(friend._id)
                                                ? "bg-green-500 text-white"
                                                : "bg-blue-500 text-white"
                                                }`}
                                        >
                                            {members.includes(friend._id) ? "Added" : "Add"}
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Create Room Button */}
                        <button
                            onClick={createRoom}
                            className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-md w-full"
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
