import React from 'react';

const Skeleton = ({ className, variant = 'rect' }) => {
    const getBaseStyles = () => {
        let base = 'bg-white/5 animate-pulse ';
        if (variant === 'circle') base += 'rounded-full ';
        else if (variant === 'text') base += 'rounded h-4 w-full ';
        else base += 'rounded-2xl ';
        return base;
    };

    return (
        <div className={`${getBaseStyles()} ${className}`}>
            <div className="w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
        </div>
    );
};

export default Skeleton;
