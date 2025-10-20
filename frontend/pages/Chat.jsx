import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { connectSocket, getSocket } from "../src/socket";

const Chat = () => {
    const user = useSelector((state) => state.auth.user);
    const [friends, setFriends] = useState([]);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef(null);

    // Fetch user's friends
    const getFriends = async () => {
        try {
            const response = await fetch(
                `http://localhost:3000/api/users/friends?userId=${user.id}`
            );
            const data = await response.json();
            setFriends(data);
        } catch (error) {
            console.error("Error fetching friends:", error);
        }
    };

    // Fetch messages for selected friend
    const getMessages = async (friendId) => {
        try {
            const response = await fetch(
                `http://localhost:3000/api/messages?from=${user.id}&to=${friendId}`
            );
            const data = await response.json();
            console.log("fetched messages:", data);
            setMessages(data);

        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    // Send message
    const sendMessage = () => {
        if (!newMessage.trim()) return;
        const socket = getSocket();

        if (socket && selectedFriend) {
            socket.emit("private message", {
                from: user.id,
                to: selectedFriend._id,
                message: newMessage,
            });

            // add to local state immediately
            setMessages((prev) => [
                ...prev,
                { sender: user.id, receiver: selectedFriend._id, text: newMessage },
            ]);
            setNewMessage("");
        }
    };

    // Connect socket + listen for messages
    useEffect(() => {
        if (user?.id) {
            connectSocket(user.id);
            const socket = getSocket();

            if (socket) {
                socket.on("private message", ({ from, message }) => {
                    if (from === selectedFriend?._id) {
                        setMessages((prev) => [...prev, { from, to: user.id, message }]);
                    }
                });
            }

            getFriends();
        }

        return () => {
            const socket = getSocket();
            if (socket) socket.off("private message");
        };
    }, [user, selectedFriend?._id]);

    // Auto-scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        console.log("Messages updated:", messages);
    }, [messages]);

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="flex h-full bg-gray-100 font-sans text-gray-800 relative">
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-lg"
            >
                {isSidebarOpen ? '✕' : '☰'}
            </button>

            {/* Sidebar - Friends List */}
            <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } transform transition-transform duration-300 ease-in-out fixed lg:static lg:transform-none w-full sm:w-80 lg:w-1/4 border-r border-gray-300 bg-white p-4 sm:p-6 shadow-lg rounded-r-3xl flex flex-col h-full z-40`}>
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-700 mt-12 lg:mt-0">Friends</h2>
                <ul className="space-y-2 sm:space-y-3 flex-grow overflow-y-auto">
                    {friends.map((friend) => (
                        <li
                            key={friend._id}
                            className={`cursor-pointer p-4 rounded-xl transition-colors ${selectedFriend?._id === friend._id
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 hover:bg-gray-200"
                                }`}
                            onClick={() => {
                                setSelectedFriend(friend);
                                getMessages(friend._id);
                            }}
                        >
                            {friend.username}
                        </li>
                    ))}
                </ul>

                {/* All Users option removed from Chat */}
            </div>

            {/* Chat Window */}
            <div className="flex-1 flex flex-col p-3 sm:p-6 w-full">
                {selectedFriend ? (
                    <>
                        <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4 pl-12 lg:pl-0">
                            Chat with {selectedFriend.username}
                        </h2>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto space-y-2 sm:space-y-3 p-2 sm:p-4 bg-white rounded-lg shadow-inner">
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`p-2 sm:p-3 rounded-lg max-w-[75%] sm:max-w-xs break-words ${msg.sender === user.id
                                        ? "bg-blue-500 text-white self-end ml-auto"
                                        : "bg-gray-200 text-gray-800 self-start"
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            ))}
                            <div ref={messagesEndRef} /> {/* auto-scroll anchor */}
                        </div>

                        {/* Input box */}
                        <div className="mt-2 sm:mt-4 flex items-center gap-1 sm:gap-2 px-2 sm:px-0">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 border px-3 sm:px-4 py-2 text-sm sm:text-base rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            />
                            <button
                                onClick={sendMessage}
                                className="bg-blue-600 text-white px-3 sm:px-5 py-2 rounded-full hover:bg-blue-700 text-sm sm:text-base"
                            >
                                Send
                            </button>
                        </div>
                    </>
                ) : (
                    <p className="text-gray-500 text-lg italic flex-1 flex items-center justify-center">
                        Select a friend to start chatting
                    </p>
                )}
            </div>

            {/* All Users popup removed from Chat */}
        </div>
    );
};

export default Chat;
