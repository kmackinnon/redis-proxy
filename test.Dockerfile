FROM node:10

COPY test test/
COPY lib lib/
COPY package-lock.json package.json /

RUN npm install
ENV REDIS_URL='redis://cache'
ENV PROXY_URL='proxy:3000'
ENV CACHE_EXPIRY=3600000
ENV CACHE_CAPACITY=10

ENTRYPOINT [ "./node_modules/mocha/bin/mocha", "--exit" ]
