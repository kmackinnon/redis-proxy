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

// parse application/json
app.use(bodyParser.json());

// curl http://localhost:3000/keith
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

// curl -X POST http://localhost:3000/keith -H 'Content-Type: application/json' -d '{"location": "Vancouver"}'
app.post("/:key", async (req, res) => {
  const key = req.params['key'];
  const value = JSON.stringify(req.body);

  if (typeof value === 'undefined') {
    res.sendStatus(HttpStatus.BAD_REQUEST);
    return;
  }

  await redisClient.setAsync(key, value);
  return res.send('Success');
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
