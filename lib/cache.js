'use strict';

// defaults in case of no env vars
const MAX_SIZE = 1000;
const MAX_AGE = 1000 * 60 * 60 * 2; // 2 hours

const LRU = require("lru-cache")
  , options = {
            max: parseInt(process.env.CACHE_CAPACITY) || MAX_SIZE,
            maxAge: parseInt(process.env.CACHE_EXPIRY) || MAX_AGE
          }
  , cache = new LRU(options);

module.exports = cache;
