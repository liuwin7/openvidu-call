import * as dotenv from 'dotenv';
// load env from .env file
// see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();

import {
    SERVER_PORT, OPENVIDU_URL, OPENVIDU_SECRET,
    CALL_OPENVIDU_CERTTYPE, SERVER_TYPE, SERVER_SSL_CERT, SERVER_SSL_CERT_KEY
} from './config';
import * as express from 'express';
import { app as callController } from './controllers/CallController';
import { app as dashboardController } from './controllers/DashboardController';
import * as http from 'http';
import * as https from 'https';
import * as fs from "fs";
import * as _ from 'lodash';
import * as ExpressWs from 'express-ws';
import { WebSocket } from 'ws';
import * as morgan from "morgan";

import * as log4js from "log4js";

export const logger = log4js.getLogger();
logger.level = "debug";

// call database in memory
export const wsDB: {
    [key: string]: {
        ws: WebSocket;
        userId: string;
        userName: string;
    }
} = {};

const app = express();

const listeningHandler = () => {
    logger.info("---------------------------------------------------------");
    logger.info(" ")
    logger.info(`OPENVIDU URL: ${OPENVIDU_URL}`);
    logger.info(`OPENVIDU SECRET: ${OPENVIDU_SECRET}`);
    logger.info(`CALL OPENVIDU CERTTYPE: ${CALL_OPENVIDU_CERTTYPE}`);
    logger.info(`OpenVidu Call Server is listening on port ${SERVER_PORT}`);
    logger.info(`OpenVidu Call Server type is ${SERVER_TYPE.toLocaleLowerCase() === "https" ? "HTTPS" : "HTTP"}`);
    if (SERVER_TYPE.toLocaleLowerCase() === "https") {
        logger.info(`-- SSL certificate path is ${SERVER_SSL_CERT}`);
        logger.info(`-- SSL certificate key path is ${SERVER_SSL_CERT_KEY}`);
    }
    logger.info(" ")
    logger.info("---------------------------------------------------------");
};

const server = SERVER_TYPE.toLocaleLowerCase() === "https"
    ? https.createServer({
        cert: fs.readFileSync(SERVER_SSL_CERT),
        key: fs.readFileSync(SERVER_SSL_CERT_KEY),
    }, app)
    : http.createServer(app);

// start server listening
server.on("listening", listeningHandler).listen(SERVER_PORT);

const { app: wsApp } = ExpressWs(app, server);

// 需要再express-ws初始化以后再导入，否则会报错，参考
// https://github.com/HenningM/express-ws#:~:text=before%20loading%20or%20defining%20your%20routers
import wsController from './controllers/WSController';

// modify the res header to allow origin
app.all('*', (req, res, next) => {
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header('Access-Control-Allow-Headers', "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Credentials", "true");
    if (req.method === "OPTIONS") {
        res.sendStatus(200);
    } else {
        next();
    }
});

wsApp.use(express.static('public'));
wsApp.use(express.json());
wsApp.use(morgan("common"));
wsApp.use('/call', callController);
wsApp.use('/my-call', wsController);
wsApp.use('/dashboard', dashboardController);