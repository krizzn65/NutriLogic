import React, { createContext, useContext, useState, useCallback } from 'react';

const DataCacheContext = createContext(null);

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

export function DataCacheProvider({ children }) {
    const [cache, setCache] = useState({});
    const cacheRef = React.useRef({});

    const getCachedData = useCallback((key) => {
        const cached = cacheRef.current[key];
        if (!cached) return null;

        const now = Date.now();
        const isExpired = now - cached.timestamp > CACHE_TTL;

        if (isExpired) {
            // Remove expired cache
            setCache(prev => {
                const newCache = { ...prev };
                delete newCache[key];
                cacheRef.current = newCache;
                return newCache;
            });
            return null;
        }

        return cached.data;
    }, []);

    const setCachedData = useCallback((key, data) => {
        setCache(prev => {
            const newCache = {
                ...prev,
                [key]: {
                    data,
                    timestamp: Date.now(),
                },
            };
            cacheRef.current = newCache;
            return newCache;
        });
    }, []);

    const invalidateCache = useCallback((key) => {
        if (key) {
            // Invalidate specific key
            setCache(prev => {
                const newCache = { ...prev };
                delete newCache[key];
                cacheRef.current = newCache;
                return newCache;
            });
        } else {
            // Invalidate all cache
            setCache({});
            cacheRef.current = {};
        }
    }, []);

    const value = {
        getCachedData,
        setCachedData,
        invalidateCache,
    };

    return (
        <DataCacheContext.Provider value={value}>
            {children}
        </DataCacheContext.Provider>
    );
}

export function useDataCache() {
    const context = useContext(DataCacheContext);
    if (!context) {
        throw new Error('useDataCache must be used within DataCacheProvider');
    }
    return context;
}
