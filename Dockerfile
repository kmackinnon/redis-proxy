FROM node:10
WORKDIR '/var/www/app'
COPY .env package-lock.json package.json redis-client.js index.html server.js /var/www/app/
RUN npm install --production
ENTRYPOINT [ "node", "server.js" ]
