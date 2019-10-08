'use strict';

const express = require('express');
const app = express();
const HttpStatus = require('http-status-codes');
const path = require('path');

const redisClient = require('./lib/redis-client');
const cache = require('./lib/cache');

// Note: implementation expects stored values to be objects
app.get('/api/v1/values/:key', async (req, res) => {
  const { key } = req.params;

  // check if local cache contains value of requested key
  const val = cache.get(key);
  if (typeof val !== 'undefined') {
    res.set('Content-Source', 'local-cache');
    return res.json(JSON.parse(val));
  }

  // look for the specified key in backing redis
  const redisVal = await redisClient.getAsync(key);
  if (redisVal == null) {
    res.sendStatus(HttpStatus.NOT_FOUND);
    return;
  }

  // store in local cache for future requests
  cache.set(key, redisVal);

  res.set('Content-Source', 'backing-redis');
  return res.json(JSON.parse(redisVal));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'));
});

const PORT = process.env.PROXY_PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

module.exports = app;
