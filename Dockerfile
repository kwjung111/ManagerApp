FROM node:18

WORKDIR /usr/src/platform-server

COPY . .

RUN npm install

EXPOSE 3000
CMD ["ln" ,"-sf", "/usr/share/zoneinfo/Asia/Seoul", "/etc/localtime"]
CMD ["/usr/local/bin/node", "server.js"]