import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { connectSocket, getSocket } from "../src/socket";
import { BACKEND_URL } from "../src/config";

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
                `${BACKEND_URL}/api/users/friends?userId=${user.id}`
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
                `${BACKEND_URL}/api/messages?from=${user.id}&to=${friendId}`
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
                socket.on("private message", ({ sender, text }) => {
                    if (sender === selectedFriend?._id) {
                        setMessages((prev) => [...prev, { sender, receiver: user.id, text }]);
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
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[#0b0f17] font-sans text-slate-200">
            {/* Sidebar - Friends List */}
            <div className={`fixed inset-y-0 left-0 z-40 w-80 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} bg-[#0f172a] border-r border-white/5 flex flex-col shadow-2xl`}>
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Messages</h2>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto custom-scrollbar p-4 space-y-2">
                    {friends.length === 0 ? (
                        <p className="text-slate-500 text-center py-10 italic">No friends yet</p>
                    ) : (
                        friends.map((friend) => (
                            <div
                                key={friend._id}
                                className={`group flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-200 ${selectedFriend?._id === friend._id
                                    ? "bg-blue-600/20 border border-blue-500/30 text-white shadow-lg"
                                    : "hover:bg-white/5 border border-transparent text-slate-400 hover:text-slate-200"
                                    }`}
                                onClick={() => {
                                    setSelectedFriend(friend);
                                    getMessages(friend._id);
                                    if (window.innerWidth < 1024) setIsSidebarOpen(false);
                                }}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-inner transition-transform group-hover:scale-105 ${selectedFriend?._id === friend._id ? "bg-blue-500 text-white" : "bg-slate-800 text-slate-400"}`}>
                                    {friend.username[0].toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold truncate">{friend.username}</div>
                                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                        Online
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Mobile Menu Button (when sidebar is closed) */}
            {!isSidebarOpen && (
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="lg:hidden fixed bottom-6 left-6 z-50 p-4 bg-blue-600 text-white rounded-2xl shadow-xl active:scale-95 transition-all"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
            )}

            {/* Chat Window */}
            <div className="flex-1 flex flex-col bg-[#0b0f17] relative">
                {selectedFriend ? (
                    <>
                        {/* Chat Header */}
                        <header className="p-4 sm:p-6 border-b border-white/5 bg-slate-900/40 backdrop-blur-md sticky top-0 z-30 flex items-center gap-4">
                            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-400 hover:text-white">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
                            </button>
                            <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
                                {selectedFriend.username[0].toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">{selectedFriend.username}</h2>
                                <p className="text-xs text-slate-500">Active now</p>
                            </div>
                        </header>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 custom-scrollbar">
                            {messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50 space-y-4">
                                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                    </div>
                                    <p className="text-sm font-medium">Start the conversation</p>
                                </div>
                            ) : (
                                messages.map((msg, idx) => (
                                    <div
                                        key={idx}
                                        className={`flex flex-col ${msg.sender === user.id ? "items-end" : "items-start"}`}
                                    >
                                        <div
                                            className={`group relative max-w-[85%] sm:max-w-[70%] px-5 py-3 rounded-2xl text-sm sm:text-base leading-relaxed break-words shadow-lg transition-all ${msg.sender === user.id
                                                ? "bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-br-none"
                                                : "bg-[#1e293b] text-slate-200 border border-white/5 rounded-bl-none"
                                                }`}
                                        >
                                            {msg.text}
                                            <div className={`mt-1.5 text-[10px] opacity-40 uppercase tracking-widest font-bold ${msg.sender === user.id ? "text-right" : "text-left"}`}>
                                                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 sm:p-6 bg-[#0b0f17] border-t border-white/5">
                            <div className="max-w-4xl mx-auto flex items-end gap-3 bg-white/5 hover:bg-white/10 border border-white/10 p-2 pl-4 rounded-[2rem] transition-all focus-within:ring-2 focus-within:ring-blue-500/50 shadow-inner">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-transparent border-none py-3 text-slate-200 placeholder-slate-500 focus:outline-none min-h-[44px]"
                                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!newMessage.trim()}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:grayscale text-white w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-lg shadow-blue-500/30"
                                >
                                    <svg className="w-5 h-5 rotate-90" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
                        <div className="w-32 h-32 bg-blue-600/10 rounded-full flex items-center justify-center border border-blue-500/20 shadow-2xl animate-bounce">
                            <svg className="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
                        </div>
                        <div className="max-w-xs">
                            <h3 className="text-2xl font-bold text-white mb-2">Private Messaging</h3>
                            <p className="text-slate-500">Pick a friend from the sidebar and start collaborating in real-time.</p>
                        </div>
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden bg-blue-600 px-6 py-2 rounded-xl font-bold">Open Friends List</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
