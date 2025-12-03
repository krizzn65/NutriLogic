/**
 * Shared animation configurations for consistent and optimized animations
 * across the Jurnal Makan UI components
 * 
 * Performance optimizations:
 * - Use transform and opacity for GPU acceleration
 * - Avoid animating layout properties (width, height, margin, padding)
 * - Use will-change sparingly and only when needed
 * - Prefer spring animations for natural feel
 */

// Optimized spring configuration for smooth animations
export const springConfig = {
    type: 'spring',
    stiffness: 300,
    damping: 30,
    mass: 0.8, // Lighter mass for snappier feel
};

// Fast spring for quick interactions
export const fastSpring = {
    type: 'spring',
    stiffness: 400,
    damping: 25,
    mass: 0.5, // Very light for instant feedback
};

// Smooth spring for gentle animations
export const smoothSpring = {
    type: 'spring',
    stiffness: 200,
    damping: 20,
    mass: 1, // Heavier for smoother, more gradual motion
};

// Page transition variants
export const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
        opacity: 1, 
        y: 0,
        transition: {
            duration: 0.4,
            ease: 'easeOut',
        }
    },
    exit: { 
        opacity: 0, 
        y: -20,
        transition: {
            duration: 0.3,
            ease: 'easeIn',
        }
    }
};

// Section fade-in variants
export const sectionVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
        opacity: 1, 
        y: 0,
        transition: {
            duration: 0.3,
            ease: 'easeOut',
        }
    }
};

// Stagger container variants
export const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.05,
        }
    }
};

// Stagger item variants
export const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: {
            duration: 0.3,
            ease: 'easeOut',
        }
    }
};

// Hover scale effect (optimized for performance)
export const hoverScale = {
    scale: 1.02,
    transition: {
        duration: 0.2,
        ease: 'easeOut',
    }
};

// Tap scale effect
export const tapScale = {
    scale: 0.98,
    transition: {
        duration: 0.1,
        ease: 'easeOut',
    }
};

// Fade in animation
export const fadeIn = {
    initial: { opacity: 0 },
    animate: { 
        opacity: 1,
        transition: {
            duration: 0.3,
            ease: 'easeOut',
        }
    },
    exit: { 
        opacity: 0,
        transition: {
            duration: 0.2,
            ease: 'easeIn',
        }
    }
};

// Slide in from left
export const slideInLeft = {
    initial: { opacity: 0, x: -20 },
    animate: { 
        opacity: 1, 
        x: 0,
        transition: {
            duration: 0.3,
            ease: 'easeOut',
        }
    }
};

// Slide in from right
export const slideInRight = {
    initial: { opacity: 0, x: 20 },
    animate: { 
        opacity: 1, 
        x: 0,
        transition: {
            duration: 0.3,
            ease: 'easeOut',
        }
    }
};

// Scale in animation
export const scaleIn = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { 
        opacity: 1, 
        scale: 1,
        transition: {
            duration: 0.3,
            ease: 'easeOut',
        }
    }
};

// Rotate in animation
export const rotateIn = {
    initial: { opacity: 0, scale: 0.8, rotate: -180 },
    animate: { 
        opacity: 1, 
        scale: 1, 
        rotate: 0,
        transition: {
            ...springConfig,
        }
    }
};

// Success animation (for checkmarks, etc.)
export const successAnimation = {
    initial: { scale: 0, rotate: -180 },
    animate: { 
        scale: 1, 
        rotate: 0,
        transition: {
            ...fastSpring,
        }
    }
};

// Pulse animation (for loading indicators)
export const pulseAnimation = {
    scale: [1, 1.05, 1],
    transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
    }
};

// Shimmer animation (for loading states)
export const shimmerAnimation = {
    x: ['-100%', '200%'],
    transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'linear',
    }
};

// Bounce animation
export const bounceAnimation = {
    y: [0, -10, 0],
    transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: 'easeInOut',
    }
};

// Optimized layout transition (prevents layout shift)
export const layoutTransition = {
    layout: true,
    transition: {
        duration: 0.3,
        ease: 'easeOut',
    }
};

// Optimized card hover (GPU accelerated)
export const cardHover = {
    scale: 1.02,
    y: -4,
    transition: {
        duration: 0.2,
        ease: 'easeOut',
    }
};

// Optimized button press (GPU accelerated)
export const buttonPress = {
    scale: 0.97,
    transition: {
        duration: 0.1,
        ease: 'easeOut',
    }
};

// Optimized fade and slide up
export const fadeSlideUp = {
    initial: { opacity: 0, y: 20 },
    animate: { 
        opacity: 1, 
        y: 0,
        transition: {
            duration: 0.3,
            ease: [0.25, 0.1, 0.25, 1], // Custom easing for smooth motion
        }
    },
    exit: { 
        opacity: 0, 
        y: -10,
        transition: {
            duration: 0.2,
            ease: 'easeIn',
        }
    }
};

// Optimized stagger with reduced motion support
export const staggerContainerOptimized = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08, // Slightly faster for better perceived performance
            delayChildren: 0.02,
            when: "beforeChildren",
        }
    }
};

// Reduced motion variants for accessibility
export const reducedMotion = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.1 } }
};
