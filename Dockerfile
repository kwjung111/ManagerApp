FROM node:18

WORKDIR /usr/src/platform-server

COPY . .

RUN npm install && \
    ln -sf /usr/share/zoneinfo/Asia/Seoul /etc/localtime

EXPOSE 3000

CMD ["npm", "run" ,"start"]