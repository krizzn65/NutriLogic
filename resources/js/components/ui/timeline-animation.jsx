"use client";
import React, { useRef, useEffect, useState, createElement } from "react";
import { motion, useInView } from "framer-motion";

/**
 * TimelineContent - A scroll-triggered animation wrapper component.
 * Renders any HTML element with entrance animations triggered by viewport visibility.
 *
 * @param {string} as - The HTML element to render (e.g., "div", "span", "figure", "a", "button")
 * @param {number} animationNum - Index used for stagger delay calculation
 * @param {React.RefObject} timelineRef - Ref to the parent container for viewport detection
 * @param {object} customVariants - Framer Motion variants { hidden, visible }
 * @param {string} className - CSS class names
 * @param {React.ReactNode} children - Child elements
 * @param {object} rest - Additional HTML props (href, target, etc.)
 */
export function TimelineContent({
    as = "div",
    animationNum = 0,
    timelineRef,
    customVariants,
    children,
    className,
    ...rest
}) {
    const isInView = useInView(timelineRef, {
        once: true,
        margin: "0px 0px -100px 0px",
    });

    const defaultVariants = {
        hidden: {
            opacity: 0,
            y: 20,
            filter: "blur(8px)",
        },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: {
                delay: i * 0.3,
                duration: 0.5,
                ease: "easeOut",
            },
        }),
    };

    const variants = customVariants || defaultVariants;

    // Use motion components for common elements
    const MotionComponent = motion.create(as);

    return (
        <MotionComponent
            custom={animationNum}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={variants}
            className={className}
            {...rest}
        >
            {children}
        </MotionComponent>
    );
}
