FROM node:18

WORKDIR /usr/src/platform-server

COPY . .

RUN npm install

EXPOSE 3000

CMD ["/usr/local/bin/node", "server.js"]