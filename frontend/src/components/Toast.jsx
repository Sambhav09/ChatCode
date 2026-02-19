import React from 'react';

const Toast = ({ message, type, onClose }) => {
    const getTypeStyles = () => {
        switch (type) {
            case 'success':
                return 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400';
            case 'error':
                return 'bg-rose-500/20 border-rose-500/50 text-rose-400';
            case 'info':
                return 'bg-blue-500/20 border-blue-500/50 text-blue-400';
            default:
                return 'bg-slate-800/80 border-white/10 text-slate-200';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                );
            case 'error':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                );
            case 'info':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            default:
                return null;
        }
    };

    return (
        <div className={`pointer-events-auto min-w-[300px] max-w-md backdrop-blur-md border rounded-2xl p-4 flex items-center gap-3 shadow-2xl animate-toast-slide-in ${getTypeStyles()}`}>
            <div className="flex-shrink-0">
                {getIcon()}
            </div>
            <div className="flex-1 text-sm font-semibold tracking-tight">
                {message}
            </div>
            <button
                onClick={onClose}
                className="flex-shrink-0 hover:opacity-70 transition-opacity"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
};

export default Toast;
