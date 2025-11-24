"use client";
import React from "react";
import { motion } from "framer-motion";
import { Badge } from "./badge-2";

export function RoadmapCard({
  title = "Product Roadmap",
  description = "Upcoming features and releases",
  items
}) {
  return (
    <div className="w-full max-w-4xl">
      <div className="pb-4">
        {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
        {description && <p className="text-sm text-white/80">{description}</p>}
      </div>
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-0 right-0 top-4 h-px bg-white/30" />

        <div className="flex justify-between">
          {items.map((item, index) => (
            <motion.div
              key={index}
              className="relative pt-8 text-center w-1/4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.15 }}>
              {/* Timeline Dot */}
              <motion.div
                whileHover={{ scale: 1.2 }}
                className={`absolute left-1/2 top-2 -translate-x-1/2 h-4 w-4 rounded-full flex items-center justify-center ${item.status === "done" || item.status === "in-progress"
                  ? "bg-white"
                  : "bg-white/30"
                  }`}>
                <div className={`h-1.5 w-1.5 rounded-full ${item.status === "done" || item.status === "in-progress"
                  ? "bg-[#0088c2]"
                  : "bg-[#0088c2]/50"
                  }`} />
              </motion.div>

              {/* Quarter */}
              <Badge
                variant={
                  item.status === "done" || item.status === "in-progress"
                    ? "secondary"
                    : "outline"
                }
                className={`mb-2 text-[10px] px-2 py-0.5 h-auto ${item.status === "done" || item.status === "in-progress"
                  ? ""
                  : "text-white border-white/50"
                  }`}>
                {item.quarter}
              </Badge>

              {/* Title + Description */}
              <h4 className="text-sm font-bold text-white">{item.title}</h4>
              <p className="text-[10px] text-white/80 mt-0.5 leading-tight">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
