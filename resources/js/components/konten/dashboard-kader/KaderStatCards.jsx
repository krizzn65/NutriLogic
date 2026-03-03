import React from "react";
import { motion } from "framer-motion";

export default function KaderStatCards({ statCards, onCardClick }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {statCards.map((card, index) => (
                <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                    whileHover={{ y: -4 }}
                    onClick={() => card.link && onCardClick(card.link)}
                    className={`bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:shadow-blue-500/5 transition-all group ${card.link ? "cursor-pointer" : ""}`}
                >
                    <div className="flex justify-between items-start mb-4">
                        <div
                            className={`p-3 rounded-2xl ${card.iconBg} ${card.iconColor} group-hover:scale-110 transition-transform duration-300`}
                        >
                            <card.icon className="w-6 h-6" />
                        </div>
                        {card.badge && (
                            <span
                                className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${card.badgeColor} ${card.badgePulse ? "animate-pulse" : ""}`}
                            >
                                {card.badge}
                            </span>
                        )}
                    </div>
                    <div>
                        <h3 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-1">
                            {card.value}
                        </h3>
                        <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                            {card.title}
                            {card.link && (
                                <svg
                                    className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            )}
                        </p>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
