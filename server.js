// TODO linting

const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const redisClient = require('./redis-client');

console.log(process.env)

// create local cache with max capacity and max age params
const LRU = require("lru-cache")
  options = {
              max: parseInt(process.env.CACHE_CAPACITY) || 5,
              maxAge: parseInt(process.env.CACHE_EXPIRY) || 1000 * 60 * 60
            }
  , localCache = new LRU(options);

const HttpStatus = require('http-status-codes');

const path = require("path");

// configure express to use body-parser as middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// curl http://localhost:3000/my-key
app.get('/:key', async (req, res) => {
  const { key } = req.params;
  console.log(key);

  // check if local proxy contains value for requested key
  const val = localCache.get(key);
  if (typeof val !== 'undefined') {
    console.log('fetching from local cache');
    return res.json(JSON.parse(val));
  }

  // look for the specified key in backing redis
  console.log('fetching from redis cache');``
  const redisVal = await redisClient.getAsync(key);
  if (redisVal == null) {
    res.sendStatus(HttpStatus.NOT_FOUND);
    return;
  }

  localCache.set(key, redisVal);
  return res.json(JSON.parse(redisVal));
});

// TODO use POST
// curl http://localhost:3000/store/my-key\?some\=value\&some-other\=other-value
app.get('/store/:key', async (req, res) => {
  const { key } = req.params;
  const value = req.query;
  await redisClient.setAsync(key, JSON.stringify(value));
  return res.send('Success');
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
