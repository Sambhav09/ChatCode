import React from "react";
import { useSelector } from "react-redux";

const Profile = () => {
    const user = useSelector((state) => state.auth.user);

    if (!user) {
        return (
            <div className="flex items-center justify-center h-full text-white">
                <p>Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-10 px-6">
            <h1 className="text-3xl font-extrabold text-white mb-8">My Profile</h1>

            <div className="bg-slate-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-xl">
                <div className="flex items-center gap-6 mb-8">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                        {user.username ? user.username[0].toUpperCase() : "U"}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">{user.username}</h2>
                        <p className="text-blue-400 font-medium">{user.email}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                        <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">User ID</p>
                        <p className="text-slate-200 font-mono text-sm">{user.id || user._id}</p>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                        <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">Account Created</p>
                        <p className="text-slate-200">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-8 p-6 bg-blue-600/10 border border-blue-500/20 rounded-2xl">
                <h3 className="text-blue-400 font-semibold mb-2">Account Security</h3>
                <p className="text-slate-400 text-sm">
                    Keep your account secure by using a strong password. You can change your password in the security settings soon.
                </p>
            </div>
        </div>
    );
};

export default Profile;
