FROM node:lts
ENV NODE_ENV=production
RUN npm config set registry https://registry.npm.taobao.org
RUN npm install pm2 -g && pm2 install pm2-logrotate && pm2 set pm2-logrotate:retain 30
WORKDIR /usr/src/app
COPY ["./dist", "./"]
EXPOSE 40002 
RUN chown -R node /usr/src/app
USER node
CMD ["pm2", "start", "openvidu-call-server.js", "--watch", "--no-daemon"]
