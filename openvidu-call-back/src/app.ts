import * as express from 'express';
import { SERVER_PORT, OPENVIDU_URL, OPENVIDU_SECRET, CALL_OPENVIDU_CERTTYPE } from './config';
import { app as callController } from './controllers/CallController';
import { app as dashboardController } from './controllers/DashboardController';
import * as dotenv from 'dotenv';
import * as http from 'http';
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

const httpServer = http.createServer(app)
    .on('listening', () => {
        console.log("---------------------------------------------------------");
        console.log(" ")
        console.log(`OPENVIDU URL: ${OPENVIDU_URL}`);
        console.log(`OPENVIDU SECRET: ${OPENVIDU_SECRET}`);
        console.log(`CALL OPENVIDU CERTTYPE: ${CALL_OPENVIDU_CERTTYPE}`);
        console.log(`OpenVidu Call Server is listening on port ${SERVER_PORT}`);
        console.log(" ")
        console.log("---------------------------------------------------------");
    })
    .listen(SERVER_PORT);

const { app: wsApp } = ExpressWs(app, httpServer);

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