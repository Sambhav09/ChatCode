import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Signup = () => {
    const [form, setForm] = useState({ username: "", email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("http://localhost:3000/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json();
            if (res.ok) {
                navigate("/login");
            } else {
                setError(data.error || "Signup failed");
            }
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center gradient-bg p-4 overflow-hidden relative auth-container">
            {/* Background elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse-slow"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse-slow"></div>

            <div className="w-full max-w-5xl flex flex-col md:flex-row-reverse glass-card rounded-3xl overflow-hidden animate-in fade-in zoom-in duration-700">
                {/* Branding Side */}
                <div className="hidden md:flex flex-col justify-center items-center bg-indigo-600/10 p-12 w-1/2 border-l border-white/5">
                    <div className="animate-float">
                        <div className="w-20 h-20 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/50 mb-8">
                            <span className="text-4xl font-bold text-white">{"</>"}</span>
                        </div>
                    </div>
                    <h1 className="text-5xl font-black tracking-tight text-white mb-4 bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-transparent">
                        Join Us
                    </h1>
                    <p className="text-indigo-200/60 text-lg text-center font-medium max-w-xs leading-relaxed">
                        Start your journey with ChatCode today. Connect, create, and share your passion.
                    </p>
                </div>

                {/* Form Side */}
                <div className="flex-1 p-8 md:p-14 bg-white/[0.02]">
                    <div className="max-w-md mx-auto">
                        <div className="md:hidden flex flex-col items-center mb-10">
                            <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center mb-4">
                                <span className="text-2xl font-bold text-white">{"</>"}</span>
                            </div>
                            <h2 className="text-3xl font-bold text-white">ChatCode</h2>
                        </div>

                        <div className="mb-10 text-center md:text-left">
                            <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
                            <p className="text-slate-400">Be part of the developer community.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300 ml-1">Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    onChange={handleChange}
                                    placeholder="johndoe"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300 ml-1">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    onChange={handleChange}
                                    placeholder="name@company.com"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300 ml-1">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300"
                                />
                            </div>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm text-center">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Creating account...</span>
                                    </div>
                                ) : (
                                    "Sign Up"
                                )}
                            </button>
                        </form>

                        <div className="mt-10 text-center">
                            <p className="text-slate-400">
                                Already have an account?{" "}
                                <button
                                    onClick={() => navigate("/login")}
                                    className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors ml-1"
                                >
                                    Log in
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
