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

  // Find the maximum value in the data to normalize bar heights
  const maxValue = React.useMemo(() => {
    return data.reduce((max, item) => (item.value > max ? item.value : max), 0);
  }, [data]);

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
    >
      <Card
        className={cn("w-full max-w-md border-0 shadow-md hover:shadow-xl transition-shadow duration-300", className)}
        aria-labelledby="activity-card-title">
        <CardHeader>
          <CardTitle id="activity-card-title">{title}</CardTitle>
        </CardHeader>
        <CardContent>
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
          {/* Total Value */}
          <div className="flex flex-col" ref={ref}>
            <p className="text-5xl font-bold tracking-tighter text-foreground">
              {displayValue.toFixed(suffix.includes('%') ? 1 : 0)}{suffix}
            </p>
            {description && (
              <p className="text-sm text-muted-foreground mt-2">
                {description}
              </p>
            )}
          </div>

          {/* Bar Chart */}
          <motion.div
            className="flex h-28 w-full items-end justify-between gap-2"
            variants={chartVariants}
            initial="hidden"
            animate="visible"
            aria-label="Activity chart">
            {data.map((item, index) => (
              <div
                key={index}
                className="flex h-full w-full flex-col items-center justify-end gap-2"
                role="presentation">
                <motion.div
                  className="w-full rounded-md bg-blue-500"
                  style={{
                    height: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%`,
                  }}
                  variants={barVariants}
                  aria-label={`${item.day}: ${item.value} hours`} />
                <span className="text-xs text-muted-foreground">
                  {item.day}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </CardContent>
    </Card>
    </motion.div>
  );
};