import React, { useState, useRef, useEffect } from 'react';

/**
 * LazyImage component - Only loads images when they're in viewport
 * Uses Intersection Observer for true lazy loading
 */
const LazyImage = ({
    src,
    alt,
    className = '',
    placeholderClassName = '',
    rootMargin = '200px',
    ...props
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const imgRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            {
                rootMargin, // Start loading 200px before entering viewport
                threshold: 0
            }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, [rootMargin]);

    return (
        <div ref={imgRef} className={`relative ${className}`} {...props}>
            {/* Placeholder/Skeleton */}
            {!isLoaded && (
                <div
                    className={`absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse ${placeholderClassName}`}
                />
            )}

            {/* Actual Image - only load src when in view */}
            {isInView && (
                <img
                    src={src}
                    alt={alt}
                    className={`w-full h-full object-cover transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                    onLoad={() => setIsLoaded(true)}
                />
            )}
        </div>
    );
};

export default LazyImage;
