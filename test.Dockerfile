FROM node:10

COPY test test/
COPY lib/redis-client.js lib/
COPY package-lock.json package.json /

RUN npm install
ENV REDIS_URL='redis://cache'
ENV PROXY_URL='proxy:3000'

ENTRYPOINT [ "./node_modules/mocha/bin/mocha", "--exit" ]
