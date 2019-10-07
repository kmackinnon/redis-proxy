// defaults
const CACHE_CAPACITY = 1000; // number of keys
const CACHE_EXPIRY = 1000 * 60 * 60 * 2; // 2 hours i.e. 7,200,000 ms

// create local cache with max capacity and max age params
const LRU = require("lru-cache")
  , options = {
            max: parseInt(process.env.CACHE_CAPACITY) || CACHE_CAPACITY,
            maxAge: parseInt(process.env.CACHE_EXPIRY) || CACHE_EXPIRY
          }
  , cache = new LRU(options);

module.exports = cache;
