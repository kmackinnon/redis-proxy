'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const redisClient = require('../lib/redis-client');

chai.use(chaiHttp);

const PROXY_URL = process.env.PROXY_URL || 'http://localhost:3000';

describe('Redis Proxy', () => {

  it('should show static page when default route requested', (done) => {
    chai.request(PROXY_URL)
      .get('/')
      .then((res) => {
        expect(res.text).to.contain('Keith\'s Proxy Service');
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should fail when invalid api route entered', (done) => {
    chai.request(PROXY_URL)
      .get('/api/v1/my-key')
      .then((res) => {
        expect(res.text).to.contain('Cannot GET /api/v1/my-key');
        expect(res).to.have.status(404);
        done();
      });
  });

  describe('with Redis', () => {
    let testVal;
    before(async (done) => {
      testVal = {
        'location': 'Vancouver'
      };
      redisClient.setAsync('test-key', JSON.stringify(testVal));
      done();
    });

    function verifyContentSource(source, cb) {
      chai.request(PROXY_URL)
        .get('/api/v1/values/test-key')
        .then((res) => {
          expect(res.text).to.contain(JSON.stringify(testVal));
          expect(res).to.have.header('Content-Source', source);
          expect(res).to.have.status(200);
          cb();
        }).catch((err) => {
          cb(err);
        });
    }

    it('should fail when key does not exist', (done) => {
      chai.request(PROXY_URL)
        .get('/api/v1/values/my-key')
        .then((res) => {
          expect(res.text).to.contain('Not Found');
          expect(res).to.have.status(404);
          done();
        });
    });

    it('should return value from backing redis', (done) => {
      verifyContentSource('backing-redis', done);
    });

    it('should return value from local cache on subsequent call', (done) => {
      verifyContentSource('local-cache', done);
    });

    // TODO max keys locally

    // TODO LRU eviction

    // TODO cache expiry

  });
});
