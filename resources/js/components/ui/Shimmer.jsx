import React from "react";

export default function Shimmer({ className = "", variant = "rectangle" }) {
    const baseClasses = "animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]";

    const variantClasses = {
        rectangle: "rounded-lg",
        circle: "rounded-full",
        text: "rounded h-4",
    };

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant] || variantClasses.rectangle} ${className}`}
            style={{
                animation: 'shimmer 1.5s ease-in-out infinite',
            }}
        />
    );
}
