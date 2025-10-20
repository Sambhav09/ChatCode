import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import { connectSocket, getSocket } from '../src/socket'
import { useSelector } from 'react-redux'

const EditorPage = () => {
    const { roomId } = useParams()
    const user = useSelector((state) => state.auth.user);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const skipNextUpdate = useRef(false);
    const [code, setcode] = useState("console.log('Hello, world!')")
    const [allUsers, setAllUsers] = useState([])
    const [showPopup, setShowPopup] = useState(false);
    const [search, setsearch] = useState('')

    const handleCodeChange = (value) => {
        setcode(value)
        const socket = getSocket()
        if (!skipNextUpdate.current) {
            socket.emit("code-change", { roomId, code: value })
        }
        skipNextUpdate.current = false;
    }

    const saveCode = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/rooms/save-code`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    roomId,
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

    const addUser = async (userId) => {
        try {
            const response = await fetch(`http://localhost:3000/api/rooms/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    roomId,
                    userId,
                }),
            });
            if (response.ok) {
                console.log("User added to room successfully");
            }
        } catch (error) {
            console.error("Error adding user:", error);
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
            const response = await fetch(`http://localhost:3000/api/rooms/get-code?roomId=${roomId}`);

            const data = await response.json();
            setcode(data.code || "// Start coding...");
        }
        catch (error) {
            console.error("Error fetching code:", error);
        }
    }

    const getMessages = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/rooms/get-messages?roomId=${roomId}`);
            const data = await response.json();
            console.log("Messages fetched for room:", data);
            setMessages(data);
        }
        catch (error) {
            console.error("Error fetching messages:", error);
        }
    }

    useEffect(() => {
        getCode();
        getMessages();
    }, [roomId]);

    useEffect(() => {
        if (!user?.id) return;
        fetchUsers();
        const socket = connectSocket(user?.id)
        socket.emit("join-room", { roomId, userId: user?.id })

        socket.on("new-message", ({ sender, message }) => {
            setMessages(prev => [...prev, { sender: sender || 'Guest', text: message }]);
        });

        return () => {
            socket.off("code-update");
            socket.off("chat-message");
        };
    }, [user?.id, roomId])

    const filteredUsers = allUsers.filter((u) => u.username.toLowerCase().includes(search.toLowerCase()) && u._id !== user.id)

    return (
        <div className='h-full w-full'>
            {/* Top bar */}
            <div className='h-10 w-full mb-5 bg-white flex justify-around items-center'>
                <button onClick={() => setShowPopup(true)}>
                    <img src="/add-user.png" className='h-8 w-9' alt="user" />
                </button>
                <button onClick={() => saveCode()}>
                    <img src="/save.png" alt="save" className='h-9' />
                </button>
            </div>

            {/* Popup Modal */}
            {showPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                    <div className="bg-white rounded-xl p-6 w-96 shadow-xl relative">
                        <div className='flex justify-between mb-10'>
                            <input type="text" placeholder="Enter username"
                                className='p-2 border-2'
                                value={search}
                                onChange={(e) => setsearch(e.target.value)}
                            />
                            <button onClick={() => setShowPopup(false)}>
                                Cancel
                            </button>
                        </div>
                        {filteredUsers.map((u) => (
                            <div key={u._id} className="flex justify-between items-center bg-white border border-gray-200 p-4 rounded">
                                <span className="font-medium">{u.username}</span>
                                <button className="px-5 py-2 rounded-full bg-green-500 text-white font-semibold" onClick={() => addUser(u._id)}>
                                    Add
                                </button>
                            </div>
                        ))}
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
                />

                <div className='bg-gray-500 h-full ml-5 w-2/6 relative'>
                    {messages.map((msg, idx) => {
                        const isCurrentUser = msg.sender === user?.username;
                        return (
                            <div
                                key={idx}
                                className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} mx-2`}
                            >
                                <span className={`text-xs mb-1 px-2 ${isCurrentUser ? 'text-blue-200' : 'text-gray-200'}`}>
                                    {msg.sender}
                                </span>
                                <div
                                    className={`px-4 py-2 rounded-2xl max-w-[80%] break-words shadow-md ${isCurrentUser
                                        ? 'bg-blue-500 text-white rounded-br-none'
                                        : 'bg-gray-300 text-gray-900 rounded-bl-none'
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        );
                    })}

                    <div className='absolute bottom-0 flex justify-center items-center w-full'>
                        <form onSubmit={handleSendMessage} className='flex w-full justify-center'>
                            <input
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                type="text"
                                placeholder='Enter the message'
                                className='text-white p-4 border-2 rounded-3xl w-80 m-2 bg-transparent placeholder-gray-300'
                            />
                            <button type='submit' className='text-center rounded-full bg-blue-400 p-3 h-10'>
                                Send
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EditorPage
