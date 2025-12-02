import * as React from "react";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * A responsive and animated card component to display weekly activity data.
 * Features a bar chart animated with Framer Motion and supports shadcn theming.
 */
export const ActivityChartCard = ({
  title = "Activity",
  totalValue,
  data,
  className,
  description
}) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [hoveredIndex, setHoveredIndex] = React.useState(null);

  // Extract numeric value for animation
  const numericValue = React.useMemo(() => {
    const match = totalValue.toString().match(/([\d.]+)/);
    return match ? parseFloat(match[0]) : 0;
  }, [totalValue]);

  const suffix = React.useMemo(() => {
    return totalValue.toString().replace(/[\d.]+/, '');
  }, [totalValue]);

  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { duration: 2000 });
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    if (isInView) {
      motionValue.set(numericValue);
    }
  }, [isInView, numericValue, motionValue]);

  React.useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      setDisplayValue(latest);
    });
    return unsubscribe;
  }, [springValue]);

  // Find the minimum and maximum value to create better visual contrast
  const { minValue, maxValue } = React.useMemo(() => {
    const values = data.map(item => item.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    // Create a range that emphasizes differences
    // Use 25% of min value as baseline for extreme visual contrast
    const baselineMin = min * 0.25;
    return { minValue: baselineMin, maxValue: max };
  }, [data]);

  // Calculate height with maximum contrast
  const calculateHeight = (value) => {
    const range = maxValue - minValue;
    if (range === 0) return 100;
    // Map value to 15-100% range for extreme visual differentiation
    const normalized = ((value - minValue) / range);
    return 15 + (normalized * 85);
  };

  // Framer Motion variants for animations
  const chartVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Animate each child (bar) with a delay
      },
    },
  };

  const barVariants = {
    hidden: { scaleY: 0, opacity: 0, transformOrigin: "bottom" },
    visible: {
      scaleY: 1,
      opacity: 1,
      transformOrigin: "bottom",
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1], // Cubic bezier for a smooth bounce effect
      },
    },
  };

  return (
    <motion.div
      whileHover={{
        y: -8,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="font-montserrat w-full"
    >
      <Card
        className={cn("w-full border-0 shadow-md hover:shadow-xl transition-shadow duration-300", className)}
        aria-labelledby="activity-card-title">
        <CardHeader className="pb-2">
          <CardTitle id="activity-card-title" className="text-base md:text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-2 sm:gap-4">
            {/* Total Value */}
            <div className="flex flex-col" ref={ref}>
              <p className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter text-gray-900">
                {displayValue.toFixed(suffix.includes('%') ? 1 : 0)}{suffix}
              </p>
              {description && (
                <p className="text-sm text-gray-500 mt-2">
                  {description}
                </p>
              )}
            </div>

            {/* Bar Chart */}
            <motion.div
              className="flex h-24 sm:h-28 md:h-36 w-full items-end justify-between gap-1 sm:gap-2 md:gap-3"
              variants={chartVariants}
              initial="hidden"
              animate="visible"
              aria-label="Activity chart">
              {data.map((item, index) => {
                const heightPercentage = calculateHeight(item.value);
                const isHovered = hoveredIndex === index;

                return (
                  <div
                    key={index}
                    className="flex h-full w-full flex-col items-center justify-end gap-2 relative"
                    role="presentation"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}>

                    {/* Tooltip yang muncul saat hover */}
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.8 }}
                        className="absolute -top-12 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-bold shadow-xl z-10 whitespace-nowrap">
                        {item.value}{suffix}
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900 rotate-45" />
                      </motion.div>
                    )}

                    <motion.div
                      className="w-full rounded-t-xl cursor-pointer relative overflow-hidden"
                      style={{
                        height: `${heightPercentage}%`,
                        filter: isHovered
                          ? 'drop-shadow(0 0 12px rgba(0, 191, 239, 0.8)) drop-shadow(0 0 24px rgba(0, 191, 239, 0.6))'
                          : 'drop-shadow(0 0 8px rgba(0, 191, 239, 0.5)) drop-shadow(0 0 16px rgba(0, 191, 239, 0.3))',
                      }}
                      variants={barVariants}
                      whileHover={{
                        scale: 1.15,
                        y: -4,
                        transition: { duration: 0.25, type: "spring", stiffness: 400, damping: 20 }
                      }}
                      aria-label={`${item.day}: ${item.value}`}>
                      {/* Gradient background with glow */}
                      <div
                        className="absolute inset-0 transition-all duration-300"
                        style={{
                          background: isHovered
                            ? 'linear-gradient(to top, #0088c2 0%, #00a8e6 30%, #00BFEF 60%, #33d0f5 100%)'
                            : 'linear-gradient(to top, #00a8e6 0%, #00BFEF 40%, #33d0f5 80%, #66dcf8 100%)',
                          boxShadow: isHovered
                            ? 'inset 0 0 20px rgba(102, 220, 248, 0.4), inset 0 -2px 10px rgba(0, 136, 194, 0.6))'
                            : 'inset 0 0 15px rgba(102, 220, 248, 0.3), inset 0 -2px 8px rgba(0, 168, 230, 0.4)',
                        }}
                      />
                      {/* Inner glow effect */}
                      <div
                        className="absolute inset-0 opacity-40 blur-sm"
                        style={{
                          background: 'linear-gradient(to top, transparent 0%, rgba(102, 220, 248, 0.8) 100%)',
                        }}
                      />
                      {/* Shine effect on hover */}
                      {isHovered && (
                        <motion.div
                          initial={{ y: '100%' }}
                          animate={{ y: '-100%' }}
                          transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.5 }}
                          className="absolute inset-0 bg-gradient-to-b from-transparent via-white/40 to-transparent"
                        />
                      )}
                    </motion.div>

                    <span className={`text-xs font-medium transition-all duration-200 ${isHovered ? 'text-gray-900 font-bold scale-110' : 'text-gray-500'
                      }`}>
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};