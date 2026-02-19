import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getSocket } from '../src/socket';
import { useToast } from '../src/context/ToastContext';
import Skeleton from '../src/components/Skeleton';

const Notifications = () => {
    const { showToast } = useToast();
    const user = useSelector((state) => state.auth.user);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/notifications?userId=${user.id}`);
            const data = await response.json();
            setNotifications(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching notifications:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();

        const socket = getSocket();
        if (socket) {
            socket.on("new-notification", () => {
                fetchNotifications();
            });
        }

        return () => {
            if (socket) socket.off("new-notification");
        };
    }, [user.id]);

    const handleInviteAction = async (notificationId, status) => {
        try {
            const response = await fetch(`http://localhost:3000/api/notifications/respond`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notificationId, status }),
            });
            if (response.ok) {
                // Optimistic update or refetch
                setNotifications(prev => prev.map(n =>
                    n._id === notificationId ? { ...n, status } : n
                ));
                showToast(`Invitation ${status.toLowerCase()} successfully`, "success");
            } else {
                showToast("Failed to process invitation", "error");
            }
        } catch (error) {
            console.error("Error responding to invite:", error);
            showToast("Server error occurred", "error");
        }
    };

    return (
        <div className="notifications-container max-w-4xl mx-auto py-12 px-6">
            <header className="mb-12">
                <h1 className="text-4xl font-extrabold text-white tracking-tight">Notifications</h1>
                <p className="text-slate-400 mt-2">Manage your room invitations and alerts.</p>
            </header>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 flex items-center justify-between gap-6">
                            <div className="flex items-center gap-4 flex-1">
                                <Skeleton className="w-12 h-12 rounded-xl" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-1/4" />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Skeleton className="w-24 h-10 rounded-xl" />
                                <Skeleton className="w-24 h-10 rounded-xl" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : notifications.length === 0 ? (
                <div className="bg-slate-800/30 border border-white/5 rounded-3xl p-16 text-center">
                    <div className="w-20 h-20 bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-300">Quiet for now</h3>
                    <p className="text-slate-500 mt-2">You don't have any new notifications.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {notifications.map((n) => (
                        <div key={n._id} className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:bg-white/5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold shrink-0">
                                    {n.sender ? n.sender.username[0].toUpperCase() : "?"}
                                </div>
                                <div>
                                    <p className="text-white">
                                        <span className="font-bold text-blue-400">{n.sender?.username}</span> invited you to join
                                        <span className="font-bold text-white"> "{n.room?.name}"</span>
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-mono">
                                        Room Invite • {new Date(n.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {n.status === 'Pending' ? (
                                    <>
                                        <button
                                            onClick={() => handleInviteAction(n._id, 'Accepted')}
                                            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                                        >
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => handleInviteAction(n._id, 'Rejected')}
                                            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white border border-white/10 font-bold text-sm transition-all active:scale-95"
                                        >
                                            Reject
                                        </button>
                                    </>
                                ) : (
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border ${n.status === 'Accepted'
                                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                                        }`}>
                                        {n.status}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Notifications;
