FROM node:10
WORKDIR '/var/www/app'

COPY lib /var/www/app/lib/
COPY .env package-lock.json package.json index.html server.js /var/www/app/

RUN npm install --production
ENTRYPOINT [ "node", "server.js" ]
