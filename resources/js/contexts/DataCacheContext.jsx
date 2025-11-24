import React, { createContext, useContext, useState, useCallback } from 'react';

const DataCacheContext = createContext(null);

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

export function DataCacheProvider({ children }) {
    const [cache, setCache] = useState({});

    const getCachedData = useCallback((key) => {
        const cached = cache[key];
        if (!cached) return null;

        const now = Date.now();
        const isExpired = now - cached.timestamp > CACHE_TTL;

        if (isExpired) {
            // Remove expired cache
            setCache(prev => {
                const newCache = { ...prev };
                delete newCache[key];
                return newCache;
            });
            return null;
        }

        return cached.data;
    }, [cache]);

    const setCachedData = useCallback((key, data) => {
        setCache(prev => ({
            ...prev,
            [key]: {
                data,
                timestamp: Date.now(),
            },
        }));
    }, []);

    const invalidateCache = useCallback((key) => {
        if (key) {
            // Invalidate specific key
            setCache(prev => {
                const newCache = { ...prev };
                delete newCache[key];
                return newCache;
            });
        } else {
            // Invalidate all cache
            setCache({});
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
