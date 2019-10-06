// TODO linting
// TODO separate cache code into service

const express = require('express');
const app = express();
const HttpStatus = require('http-status-codes');
const path = require("path");
const redisClient = require('./redis-client');

// create local cache with max capacity and max age params
const LRU = require("lru-cache")
  options = {
              max: parseInt(process.env.CACHE_CAPACITY),
              maxAge: parseInt(process.env.CACHE_EXPIRY)
            }
  , localCache = new LRU(options);

/**
 * curl http://localhost:3000/api/v1/values/key-id
 */
app.get('/api/v1/values/:key', async (req, res) => {
  const { key } = req.params;

  // check if local proxy contains value for requested key
  const val = localCache.get(key);
  if (typeof val !== 'undefined') {
    console.log('Local cache');
    return res.json(JSON.parse(val));
  }

  // look for the specified key in backing redis
  const redisVal = await redisClient.getAsync(key);
  if (redisVal == null) {
    res.sendStatus(HttpStatus.NOT_FOUND);
    return;
  }

  localCache.set(key, redisVal);
  return res.json(JSON.parse(redisVal));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'));
});

const PORT = process.env.PROXY_PORT;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

module.exports = app;
