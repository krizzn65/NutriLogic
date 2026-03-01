import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import {
    STATUS_COLOR_MAP,
    STATUS_BG_COLOR_MAP,
    STATUS_LABELS,
} from "../../../constants/statusColors";

export default function KaderNutritionChartCard({
    statistics,
    totalChildren,
    pieChartData,
    activeIndex,
    setActiveIndex,
    hoveredLegend,
    setHoveredLegend,
    isChartHovered,
    setIsChartHovered,
}) {
    return (
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">
                        Distribusi Status Gizi
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Gambaran status gizi anak-anak di posyandu
                    </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm font-semibold text-gray-700">
                        Total: {totalChildren}
                    </span>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row items-center gap-8 flex-1">
                <div className="w-full lg:w-1/2 h-64 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieChartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={110}
                                paddingAngle={3}
                                dataKey="value"
                                activeIndex={activeIndex}
                                activeShape={{
                                    outerRadius: 118,
                                    strokeWidth: 4,
                                    stroke: "#fff",
                                }}
                                onMouseEnter={(_, index) => {
                                    setActiveIndex(index);
                                    setIsChartHovered(true);
                                }}
                                onMouseLeave={() => {
                                    setActiveIndex(null);
                                    setIsChartHovered(false);
                                }}
                                animationBegin={0}
                                animationDuration={800}
                                animationEasing="ease-out"
                            >
                                {pieChartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={
                                            STATUS_COLOR_MAP[entry.rawName] ||
                                            "#94a3b8"
                                        }
                                        strokeWidth={0}
                                        opacity={
                                            hoveredLegend === null ||
                                            hoveredLegend === entry.rawName
                                                ? 1
                                                : 0.3
                                        }
                                        style={{
                                            cursor: "pointer",
                                            transition: "all 0.3s ease",
                                        }}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    borderRadius: "12px",
                                    border: "none",
                                    boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                                    padding: "12px 16px",
                                }}
                                itemStyle={{
                                    color: "#1e293b",
                                    fontWeight: "600",
                                    fontSize: "14px",
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>

                    <AnimatePresence mode="wait">
                        {!isChartHovered && (
                            <motion.div
                                key={hoveredLegend || "total"}
                                className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <span className="text-4xl font-bold text-gray-800 tracking-tight">
                                    {hoveredLegend &&
                                    statistics.nutritional_status
                                        ? statistics.nutritional_status[
                                              hoveredLegend
                                          ]
                                        : totalChildren}
                                </span>
                                <span className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-wide">
                                    {hoveredLegend
                                        ? STATUS_LABELS[hoveredLegend]
                                        : "Total Anak"}
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="w-full lg:w-1/2 grid grid-cols-2 gap-3">
                    {statistics.nutritional_status &&
                        Object.entries(statistics.nutritional_status).map(
                            ([status, count]) => (
                                <motion.div
                                    key={status}
                                    whileHover={{ scale: 1.02 }}
                                    onMouseEnter={() => {
                                        setHoveredLegend(status);
                                        const pieIndex =
                                            pieChartData.findIndex(
                                                (d) => d.rawName === status,
                                            );
                                        setActiveIndex(
                                            pieIndex >= 0 ? pieIndex : null,
                                        );
                                    }}
                                    onMouseLeave={() => {
                                        setHoveredLegend(null);
                                        setActiveIndex(null);
                                    }}
                                    className={`flex items-center justify-between p-3 rounded-xl border border-transparent hover:border-gray-100 hover:bg-gray-50 transition-all cursor-pointer ${hoveredLegend === status ? "bg-gray-50 ring-1 ring-gray-100" : ""}`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div
                                            className={`w-3 h-3 rounded-full ${STATUS_BG_COLOR_MAP[status] || "bg-gray-400"}`}
                                        />
                                        <span className="text-sm font-medium text-gray-600">
                                            {STATUS_LABELS[status] || status}
                                        </span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900">
                                        {count}
                                    </span>
                                </motion.div>
                            ),
                        )}
                </div>
            </div>
        </div>
    );
}
