// difficult: Implements an in-memory cache with TTL and size limits

export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of items in the cache
}

export class Cache<K, V> {
  private cache: Map<K, { value: V; expiresAt: number }>;
  private readonly ttl: number;
  private readonly maxSize: number;
  private accessTimes: Map<K, number>; // For LRU eviction

  constructor(config: CacheConfig) {
    this.cache = new Map();
    this.accessTimes = new Map();
    this.ttl = config.ttl;
    this.maxSize = config.maxSize;
  }

  /**
   * Get a value from the cache
   */
  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    
    // If no entry exists, return undefined
    if (!entry) {
      return undefined;
    }

    // If entry is expired, remove it and return undefined
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.accessTimes.delete(key);
      return undefined;
    }

    // Update last accessed time for LRU
    this.accessTimes.set(key, Date.now());
    
    return entry.value;
  }

  /**
   * Set a value in the cache
   */
  set(key: K, value: V, ttl?: number): void {
    // If we've reached max size, evict the least recently used item
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    const expiresAt = Date.now() + (ttl || this.ttl);
    this.cache.set(key, { value, expiresAt });
    this.accessTimes.set(key, Date.now());
  }

  /**
   * Evicts the least recently used item from the cache
   * @private
   */
  private evictLRU(): void {
    if (this.accessTimes.size === 0) return;
    
    // Find the key with the oldest access time
    let lruKey: K | null = null;
    let oldestTime = Date.now();
    
    // Use forEach instead of for...of to be compatible with older targets
    this.accessTimes.forEach((time, key) => {
      if (time < oldestTime) {
        oldestTime = time;
        lruKey = key;
      }
    });
    
    // Remove the least recently used item
    if (lruKey !== null) {
      this.cache.delete(lruKey);
      this.accessTimes.delete(lruKey);
    }
  }

  /**
   * Delete a value from the cache
   */
  delete(key: K): boolean {
    this.accessTimes.delete(key);
    return this.cache.delete(key);
  }

  /**
   * Clear the entire cache
   */
  clear(): void {
    this.cache.clear();
    this.accessTimes.clear();
  }

  /**
   * Get the number of items in the cache
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Check if a key exists in the cache
   */
  has(key: K): boolean {
    return this.cache.has(key);
  }

  /**
   * Get all keys in the cache
   */
  keys(): IterableIterator<K> {
    return this.cache.keys();
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    // Convert to array first to avoid iteration issues
    Array.from(this.cache.entries()).forEach(([key, entry]) => {
      if (entry.expiresAt <= now) {
        this.cache.delete(key);
        this.accessTimes.delete(key);
      }
    });
  }

  /**
   * Evict the least recently used item
   */
  private evictIfNeeded(): void {
    if (this.cache.size <= this.maxSize) return;
    
    // Sort entries by access time (oldest first)
    const entries = Array.from(this.accessTimes.entries())
      .sort((a, b) => a[1] - b[1]);
    
    // Remove the oldest entries until we're under the limit
    const entriesToRemove = entries.slice(0, this.cache.size - this.maxSize);
    entriesToRemove.forEach(([key]) => {
      this.cache.delete(key);
      this.accessTimes.delete(key);
    });
  }
}
