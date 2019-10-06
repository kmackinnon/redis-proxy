FROM node:10
COPY test /test
COPY .env package-lock.json package.json redis-client.js /
RUN npm install
ENTRYPOINT [ "node", "test/test.js" ]
