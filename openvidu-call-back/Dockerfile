FROM nikolaik/python-nodejs:python3.8-nodejs18-alpine

WORKDIR /usr/src/app

COPY ["./", "./"]

RUN npm config set registry https://registry.npm.taobao.org

RUN npm install
RUN npm run build

EXPOSE 40002

CMD [ "node", "dist/openvidu-call-server.js" ]
