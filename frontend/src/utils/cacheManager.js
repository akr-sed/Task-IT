/**
 * Cache Manager - Handles client-side caching with TTL (Time To Live)
 * Reduces API calls and improves page load times significantly
 */

import { useState, useCallback } from 'react';

class CacheManager {
  constructor() {
    this.memoryCache = new Map();
    this.cacheExpiry = new Map();
  }

  /**
   * Set cache with TTL
   * @param {string} key - Cache key
   * @param {any} value - Data to cache
   * @param {number} ttlMs - Time to live in milliseconds (default 5 minutes)
   */
  set(key, value, ttlMs = 5 * 60 * 1000) {
    this.memoryCache.set(key, value);
    
    // Set expiry time
    const expiryTime = Date.now() + ttlMs;
    this.cacheExpiry.set(key, expiryTime);
    
    console.log(`[Cache] Set key: ${key}, TTL: ${ttlMs}ms`);
  }

  /**
   * Get cache value if not expired
   * @param {string} key - Cache key
   * @returns {any|null} - Cached value or null if expired/not found
   */
  get(key) {
    const expiry = this.cacheExpiry.get(key);
    
    // Check if cache has expired
    if (expiry && Date.now() > expiry) {
      this.delete(key);
      console.log(`[Cache] Key expired: ${key}`);
      return null;
    }
    
    const value = this.memoryCache.get(key);
    if (value) {
      console.log(`[Cache] Cache hit: ${key}`);
    }
    return value || null;
  }

  /**
   * Delete cache entry
   * @param {string} key - Cache key
   */
  delete(key) {
    this.memoryCache.delete(key);
    this.cacheExpiry.delete(key);
    console.log(`[Cache] Deleted: ${key}`);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.memoryCache.clear();
    this.cacheExpiry.clear();
    console.log(`[Cache] All cache cleared`);
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.memoryCache.size,
      keys: Array.from(this.memoryCache.keys()),
    };
  }
}

// Create singleton instance
export const cacheManager = new CacheManager();

/**
 * Custom hook for cached API calls
 */
export function useCachedFetch(key, fetchFn, ttlMs = 5 * 60 * 1000) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (skipCache = false) => {
    // Check cache first
    if (!skipCache) {
      const cachedData = cacheManager.get(key);
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
        return cachedData;
      }
    }

    setLoading(true);
    try {
      const result = await fetchFn();
      cacheManager.set(key, result, ttlMs);
      setData(result);
      setError(null);
      return result;
    } catch (err) {
      setError(err);
      console.error(`[Cache] Error fetching ${key}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [key, fetchFn, ttlMs]);

  return { data, loading, error, fetchData };
}

export default cacheManager;
