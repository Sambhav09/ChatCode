import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import { connectSocket, getSocket } from '../src/socket'
import { useSelector } from 'react-redux'
import { useToast } from '../src/context/ToastContext'
import Skeleton from '../src/components/Skeleton'
import { BACKEND_URL } from '../src/config';

const EditorPage = () => {
    const { showToast } = useToast();
    const { roomId } = useParams()
    const user = useSelector((state) => state.auth.user);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const skipNextUpdate = useRef(false);
    const [code, setcode] = useState("console.log('Hello, world!')")
    const [allUsers, setAllUsers] = useState([])
    const [showPopup, setShowPopup] = useState(false);
    const [search, setsearch] = useState('')
    const [roomDetails, setRoomDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const editorRef = useRef(null);
    const saveTimeoutRef = useRef(null);

    const handleEditorMount = (editor) => {
        editorRef.current = editor;
    };

    const saveCode = async () => {
        try {
            console.log("Auto-saving code for user:", user?.id);
            const response = await fetch(`${BACKEND_URL}/api/rooms/save-code`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    roomId,
                    userId: user?.id,
                    code,
                }),
            });
            if (response.ok) {
                console.log("Code saved successfully");
            }
        } catch (error) {
            console.error("Error saving code:", error);
        }
    }

    const handleCodeChange = (value) => {
        setcode(value)
        const socket = getSocket()
        if (!skipNextUpdate.current) {
            socket.emit("code-change", { roomId, code: value })
        }
        skipNextUpdate.current = false;

        // Debounced Auto-save
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
            saveCode();
        }, 1000);
    }

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/users/all-users?userId=${user.id}`);
            const data = await response.json();
            setAllUsers(data)
        }
        catch (error) {
            console.error("Error fetching users:", error);
        }
    }

    const fetchRoomDetails = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/rooms/get-details?roomId=${roomId}`);
            const data = await response.json();
            setRoomDetails(data);
        } catch (error) {
            console.error("Error fetching room details:", error);
        }
    };

    const sendInvite = async (recipientId) => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/notifications/send`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    recipient: recipientId,
                    sender: user.id,
                    room: roomId
                }),
            });

            if (response.ok) {
                const socket = getSocket();
                if (socket) {
                    socket.emit("send-invite", {
                        recipientId,
                        senderName: user.username,
                        roomName: roomDetails?.name
                    });
                }
                showToast("Invite sent successfully!", "success");
            } else {
                const data = await response.json();
                showToast(data.message || "Failed to send invite", "error");
            }
        } catch (error) {
            console.error("Error sending invite:", error);
        }
    }

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        const socket = getSocket();
        if (socket) {
            socket.emit("chat-message", { roomId, message: newMessage, sender: user?.username, userId: user?.id });
            setMessages(prev => [...prev, { sender: user?.username, text: newMessage }]);
            setNewMessage('');
        }
    }

    const getCode = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/rooms/get-code?roomId=${roomId}`);

            const data = await response.json();
            setcode(data.code || "// Start coding...");
        }
        catch (error) {
            console.error("Error fetching code:", error);
        }
    }

    const getMessages = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/rooms/get-messages?roomId=${roomId}`);
            const data = await response.json();
            setMessages(data);
        }
        catch (error) {
            console.error("Error fetching messages:", error);
        }
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            await Promise.all([
                getCode(),
                getMessages(),
                fetchRoomDetails()
            ]);
            setLoading(false);
        };
        fetchInitialData();
    }, [roomId]);

    useEffect(() => {
        if (!user?.id) return;
        fetchUsers();
        const socket = connectSocket(user?.id)
        socket.emit("join-room", { roomId, userId: user?.id })

        socket.on("new-message", ({ sender, message }) => {
            setMessages(prev => [...prev, { sender: sender || 'Guest', text: message }]);
        });

        socket.on("code-update", ({ code }) => {
            skipNextUpdate.current = true;
            setcode(code);
        });

        return () => {
            socket.off("code-update");
            socket.off("chat-message");
            socket.off("new-message");
        };
    }, [user?.id, roomId])

    const isCreator = roomDetails?.createdBy === user?.id;
    const filteredUsers = allUsers.filter((u) => u.username.toLowerCase().includes(search.toLowerCase()) && u._id !== user.id)

    return (
        <div className='h-full w-full bg-[#0b0f17] flex flex-col'>
            {/* Top bar */}
            <div className='h-16 w-full border-b border-white/5 bg-[#0f172a]/80 backdrop-blur-md flex justify-between items-center px-8'>
                <div className='flex items-center gap-4'>
                    {loading ? (
                        <>
                            <Skeleton className='w-10 h-10 rounded-xl' />
                            <div className="space-y-2">
                                <Skeleton className='h-4 w-32' />
                                <Skeleton className='h-3 w-20' />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className='w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold'>
                                {roomDetails?.name?.[0].toUpperCase()}
                            </div>
                            <div>
                                <h2 className='text-white font-bold tracking-tight'>{roomDetails?.name}</h2>
                                <p className='text-xs text-slate-500 font-mono uppercase tracking-widest'>Room ID: {roomId.slice(0, 8)}</p>
                            </div>
                        </>
                    )}
                </div>

                <div className='flex items-center gap-4'>
                    {isCreator && (
                        <button
                            onClick={() => setShowPopup(true)}
                            className='flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all active:scale-95 shadow-lg shadow-blue-500/20'
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5 a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                            Invite
                        </button>
                    )}
                    <button
                        onClick={() => saveCode()}
                        className='p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all active:scale-95 border border-white/5'
                        title="Save Changes"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M8 7h8" /></svg>
                    </button>
                </div>
            </div>

            {/* Popup Modal */}
            {showPopup && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-6">
                    <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl">
                        <div className='flex justify-between items-center mb-8'>
                            <h2 className='text-2xl font-bold text-white'>Invite Developer</h2>
                            <button onClick={() => setShowPopup(false)} className='text-slate-500 hover:text-white transition-colors'>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className='relative mb-6'>
                            <input
                                type="text"
                                placeholder="Search friends..."
                                className='w-full bg-slate-900/50 border border-white/10 text-white pl-12 pr-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-inner'
                                value={search}
                                onChange={(e) => setsearch(e.target.value)}
                            />
                            <svg className="w-5 h-5 absolute left-4 top-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>

                        <div className='space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-2'>
                            {filteredUsers.length === 0 ? (
                                <p className='text-center text-slate-500 py-8 italic'>No users matching your search</p>
                            ) : (
                                filteredUsers.map((u) => (
                                    <div key={u._id} className="flex justify-between items-center bg-white/5 border border-white/5 p-4 rounded-2xl hover:bg-white/10 transition-colors">
                                        <div className='flex items-center gap-3'>
                                            <div className='w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold'>
                                                {u.username[0].toUpperCase()}
                                            </div>
                                            <span className="font-bold text-slate-200">{u.username}</span>
                                        </div>
                                        <button
                                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all active:scale-95"
                                            onClick={() => sendInvite(u._id)}
                                        >
                                            Invite
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Main editor + chat section */}
            <div className='flex h-[85vh] w-full'>
                <Editor
                    height="85vh"
                    width="70%"
                    language="javascript"
                    value={code}
                    theme="vs-dark"
                    onChange={handleCodeChange}
                    onMount={handleEditorMount}
                />

                <div className='flex-1 bg-[#0f172a]/50 backdrop-blur-md border border-white/5 rounded-3xl ml-6 flex flex-col overflow-hidden shadow-2xl relative'>
                    <div className='p-6 border-b border-white/5 bg-slate-900/40'>
                        <h3 className='text-lg font-bold text-white flex items-center gap-2'>
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                            Room Chat
                        </h3>
                    </div>

                    <div className='flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar'>
                        {loading ? (
                            [1, 2, 3, 4].map((i) => (
                                <div key={i} className={`flex flex-col ${i % 2 === 0 ? 'items-end' : 'items-start'}`}>
                                    <Skeleton className="h-3 w-16 mb-2" />
                                    <Skeleton className={`h-10 ${i % 2 === 0 ? 'w-3/4' : 'w-2/3'} rounded-2xl ${i % 2 === 0 ? 'rounded-br-none' : 'rounded-bl-none'}`} />
                                </div>
                            ))
                        ) : messages.length === 0 ? (
                            <div className='h-full flex flex-col items-center justify-center text-slate-500 opacity-50 italic'>
                                <p>No messages yet</p>
                            </div>
                        ) : (
                            messages.map((msg, idx) => {
                                const isCurrentUser = msg.sender === user?.username;
                                return (
                                    <div
                                        key={idx}
                                        className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}
                                    >
                                        <span className={`text-[10px] mb-1 px-2 font-bold uppercase tracking-widest ${isCurrentUser ? 'text-blue-400' : 'text-slate-500'}`}>
                                            {msg.sender}
                                        </span>
                                        <div
                                            className={`px-4 py-2.5 rounded-2xl max-w-[90%] break-words shadow-lg text-sm leading-relaxed transition-all ${isCurrentUser
                                                ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-br-none'
                                                : 'bg-slate-800 text-slate-200 border border-white/5 rounded-bl-none'
                                                }`}
                                        >
                                            {msg.text}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className='p-6 bg-slate-900/40 border-t border-white/5'>
                        <form onSubmit={handleSendMessage} className='flex items-center gap-2 bg-white/5 border border-white/10 p-1.5 pl-4 rounded-2xl focus-within:ring-2 focus-within:ring-blue-500/50 transition-all'>
                            <input
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                type="text"
                                placeholder='Type a message...'
                                className='flex-1 bg-transparent border-none py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none text-sm'
                            />
                            <button type='submit' className='bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90 shadow-lg shadow-blue-500/20'>
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EditorPage
