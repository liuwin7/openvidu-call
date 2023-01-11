import * as express from 'express';
import { SERVER_PORT, OPENVIDU_URL, OPENVIDU_SECRET, CALL_OPENVIDU_CERTTYPE, USE_SSL } from './config';
import { app as callController } from './controllers/CallController';
import { app as dashboardController } from './controllers/DashboardController';
import * as dotenv from 'dotenv';
import * as http from 'http';
import * as https from 'https';
import * as fs from "fs";
import * as _ from 'lodash';
import * as ExpressWs from 'express-ws';
import { WebSocket } from 'ws';

dotenv.config();

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
    console.log("---------------------------------------------------------");
    console.log(" ")
    console.log(`OPENVIDU URL: ${OPENVIDU_URL}`);
    console.log(`OPENVIDU SECRET: ${OPENVIDU_SECRET}`);
    console.log(`CALL OPENVIDU CERTTYPE: ${CALL_OPENVIDU_CERTTYPE}`);
    console.log(`OpenVidu Call Server is listening on port ${SERVER_PORT}`);
    console.log(`Openvidu Call Server uses ${USE_SSL ? "HTTPS" : "HTTP"}`);
    console.log(" ")
    console.log("---------------------------------------------------------");
};

const server = USE_SSL
    ? https.createServer({
        key: fs.readFileSync(__dirname + '/certs/private.key'),
        cert: fs.readFileSync(__dirname + '/certs/full_chain.pem'),
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
wsApp.use('/call', callController);
wsApp.use('/my-call', wsController);
wsApp.use('/dashboard', dashboardController);