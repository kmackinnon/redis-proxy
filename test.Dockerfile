FROM node:10
COPY test test/
COPY .env package-lock.json package.json redis-client.js /
RUN npm install
ENV REDIS_URL='redis://cache'
ENV PROXY_URL='proxy:3000'
ENTRYPOINT [ "./node_modules/mocha/bin/mocha", "--exit" ]
