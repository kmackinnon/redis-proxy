// create local cache with max capacity and max age params
const LRU = require("lru-cache")
  , options = {
            max: parseInt(process.env.CACHE_CAPACITY),
            maxAge: parseInt(process.env.CACHE_EXPIRY)
          }
  , cache = new LRU(options);

module.exports = cache;
