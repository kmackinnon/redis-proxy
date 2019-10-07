'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);

const sleep = require('util').promisify(setTimeout)
const HttpStatus = require('http-status-codes');
const redisClient = require('../lib/redis-client');
const PROXY_URL = process.env.PROXY_URL || 'http://localhost:3000';

describe('Redis Proxy', () => {

  it('should show static page when default route requested', (done) => {
    chai.request(PROXY_URL)
      .get('/')
      .then((res) => {
        expect(res.text).to.contain('Keith\'s Proxy Service');
        expect(res).to.have.status(HttpStatus.OK);
        done();
      });
  });

  it('should fail when invalid api route entered', (done) => {
    chai.request(PROXY_URL)
      .get('/api/v1/my-key')
      .then((res) => {
        expect(res.text).to.contain('Cannot GET /api/v1/my-key');
        expect(res).to.have.status(HttpStatus.NOT_FOUND);
        done();
      });
  });

  describe('with Redis', () => {
    let firstTestVal = JSON.stringify({ 'Vancouver': 'BC' });
    let secondTestVal = JSON.stringify({ 'SF': 'CA' });
    let thirdTestVal = JSON.stringify({ 'NYC': 'NY' });

    async function addKVToRedis(key, val) {
      redisClient.setAsync(key, val);
    }

    async function proxyGET(key, expectedVal, expectedSource, expectedStatus=HttpStatus.OK) {
      try {
        await chai.request(PROXY_URL)
          .get(`/api/v1/values/${key}`)
          .then((res) => {
            expect(res.text).to.contain(expectedVal);
            expect(res).to.have.header('Content-Source', expectedSource);
            expect(res).to.have.status(expectedStatus);
          });
      } catch (err) {
        expect.fail(err);
      }
    }

    before(async () => {
      addKVToRedis('first-key', firstTestVal);
      addKVToRedis('second-key', secondTestVal);
    });

    it('should fail when key does not exist', async () => {
      await proxyGET('my-key', 'Not Found', undefined, HttpStatus.NOT_FOUND);
    });

    it('should return value from backing redis first request', async () => {
      await proxyGET('first-key', firstTestVal, 'backing-redis');
    });

    it('should return value from local cache on subsequent call', async () => {
      await proxyGET('first-key', firstTestVal, 'local-cache');
    });

    // note: cache capacity set to 2 in docker-compose
    it('should remove LRU and enforce max limit of keys in cache', async () => {
      await proxyGET('second-key', secondTestVal, 'backing-redis');
      await proxyGET('second-key', secondTestVal, 'local-cache');

      await addKVToRedis('third-key', thirdTestVal);

      await proxyGET('third-key', thirdTestVal, 'backing-redis');
      await proxyGET('third-key', thirdTestVal, 'local-cache');

      // first key should have been evicted
      await proxyGET('first-key', firstTestVal, 'backing-redis');
    });

    // note: cache expiry time set to 1s in docker-compose
    it('should enforce cache expiry time', async () => {
      await sleep(1100);
      await proxyGET('second-key', secondTestVal, 'backing-redis');
      await proxyGET('third-key', thirdTestVal, 'backing-redis');
    });

  });
});
