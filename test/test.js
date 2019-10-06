'use strict';

console.log('Test is running');

/*
const app = require('../server');
const chai = require('chai');
const request = require('supertest');

var expect = chai.expect;

describe('API Tests', function() {

  before((done) => {
    request('http://localhost:3000')
    done();
  });

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
*/
