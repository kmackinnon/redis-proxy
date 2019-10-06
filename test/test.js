'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const redisClient = require('../redis-client');

chai.use(chaiHttp);

const PROXY_URL = process.env.PROXY_URL || 'http://localhost:3000';

describe('Redis Proxy', (done) => {

  it('default route should show static page', (done) => {
    chai.request(PROXY_URL)
      .get('/')
      .then((res) => {
        expect(res.text).to.contain('Keith\'s Proxy Service');
        expect(res).to.have.status(200);
        done();
      });
  });

  it('request should fail when invalid api route entered', (done) => {
    chai.request(PROXY_URL)
      .get('/api/v1/my-key')
      .then((res) => {
        expect(res.text).to.contain('Cannot GET /api/v1/my-key');
        expect(res).to.have.status(404);
        done();
      });
  });

  it('request should fail when key does not exist', (done) => {
    chai.request(PROXY_URL)
      .get('/api/v1/values/my-key')
      .then((res) => {
        expect(res.text).to.contain('Not Found');
        expect(res).to.have.status(404);
        done();
      });
  });

  describe('with Redis', (done) => {
    let testVal;

    before(async (done) => {
      testVal = {
        'location': 'Vancouver'
      };
      redisClient.setAsync('test-key', JSON.stringify(testVal));
      done();
    });

    it('request should return value in cache', (done) => {
      chai.request(PROXY_URL)
        .get('/api/v1/values/test-key')
        .then((res) => {
          expect(res.text).to.contain(JSON.stringify(testVal));
          expect(res).to.have.status(200);
          done();
        }).catch((err) => {
          done(err);
        });
    });
  });
});
