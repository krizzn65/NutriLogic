import { useState, useEffect } from 'react';

/**
 * Custom hook for responsive design - checks if a media query matches
 * @param {string} query - CSS media query string (e.g., '(min-width: 1280px)')
 * @returns {boolean} - Whether the media query matches
 */
export function useMediaQuery(query) {
    const [matches, setMatches] = useState(() => {
        // SSR safe: return false during server-side rendering
        if (typeof window === 'undefined') return false;
        return window.matchMedia(query).matches;
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const mediaQuery = window.matchMedia(query);
        
        // Set initial value
        setMatches(mediaQuery.matches);

        // Create event handler
        const handler = (event) => setMatches(event.matches);

        // Add listener (using modern API with fallback)
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handler);
        } else {
            // Fallback for older browsers
            mediaQuery.addListener(handler);
        }

        // Cleanup
        return () => {
            if (mediaQuery.removeEventListener) {
                mediaQuery.removeEventListener('change', handler);
            } else {
                mediaQuery.removeListener(handler);
            }
        };
    }, [query]);

    return matches;
}

/**
 * Predefined breakpoint hooks for Tailwind CSS breakpoints
 */
export function useIsDesktop() {
    return useMediaQuery('(min-width: 1280px)'); // xl breakpoint
}

export function useIsTablet() {
    return useMediaQuery('(min-width: 768px)'); // md breakpoint
}

export function useIsMobile() {
    return !useMediaQuery('(min-width: 768px)');
}

export default useMediaQuery;
