/**
 * Request Deduplication - Prevents duplicate concurrent API calls
 * If the same request is made multiple times before the first one completes,
 * subsequent requests will reuse the same promise
 */

class RequestDeduplicator {
  constructor() {
    this.pendingRequests = new Map();
  }

  /**
   * Deduplicate request - returns same promise if request is already in flight
   * @param {string} key - Unique request identifier
   * @param {Function} requestFn - Async function that makes the API call
   * @returns {Promise} - Resolves with API response
   */
  async deduplicate(key, requestFn) {
    // If request is already in flight, return the same promise
    if (this.pendingRequests.has(key)) {
      console.log(`[Dedup] Reusing pending request: ${key}`);
      return this.pendingRequests.get(key);
    }

    // Create new promise and store it
    const promise = requestFn()
      .then(response => {
        // Remove from pending after successful completion
        this.pendingRequests.delete(key);
        console.log(`[Dedup] Request completed: ${key}`);
        return response;
      })
      .catch(error => {
        // Remove from pending after error
        this.pendingRequests.delete(key);
        console.log(`[Dedup] Request failed: ${key}`);
        throw error;
      });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  /**
   * Clear specific pending request
   */
  clear(key) {
    this.pendingRequests.delete(key);
  }

  /**
   * Clear all pending requests
   */
  clearAll() {
    this.pendingRequests.clear();
    console.log(`[Dedup] Cleared all pending requests`);
  }

  /**
   * Get pending requests stats
   */
  getStats() {
    return {
      pendingCount: this.pendingRequests.size,
      pendingKeys: Array.from(this.pendingRequests.keys()),
    };
  }
}

// Create singleton instance
export const requestDeduplicator = new RequestDeduplicator();

export default requestDeduplicator;
