import * as express from 'express';
import { SERVER_PORT, OPENVIDU_URL, OPENVIDU_SECRET, CALL_OPENVIDU_CERTTYPE } from './config';
import {app as callController} from './controllers/CallController';
import * as dotenv from 'dotenv';
import * as https from 'https';
import * as fs from "fs";
const expressWs = require('express-ws');
const _ = require('lodash');

dotenv.config();
const app = express();

const httpsServer = https.createServer({
    key: fs.readFileSync(__dirname + '/certs/private.key'),
    cert: fs.readFileSync(__dirname + '/certs/full_chain.pem'),
}, app)
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

const {app: wsApp} = expressWs(app, httpsServer);

// modify the res header to allow origin
app.all('*', (req, res, next) => {
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header('Access-Control-Allow-Headers', "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Credentials","true");
    next();
});

wsApp.use(express.static('public'));
wsApp.use(express.json());
wsApp.use('/call', callController);

// call database in memory
const wsDB = {};

// util function
const findWSById = userId => {
    const wsItem = wsDB[userId];
    if (!wsItem) {
        return null;
    }
    return wsItem.ws;
};

wsApp.ws('/my-call', (ws, req) => {
    ws.on('close', ev => {
        const clientUserId = _.findKey(wsDB, {'ws': ws});
        if (clientUserId) {
            _.unset(wsDB, clientUserId);
            console.log(clientUserId + ' offline.');
        }
    });
    ws.on('message', msg => {
        console.log('msg', msg);
        const data = JSON.parse(msg);
        if (data.type === 'invite') { // 呼出
            const {action, originUserId, peerUserId} = data;
            // 响铃，拒接
            if (action === 'ring'
                || action === 'cancel') {
                const peerWS = findWSById(peerUserId);
                if (!peerWS) {
                    return ws.send(JSON.stringify({error: 'not online'}));
                }
                peerWS.send(msg); // 转发消息给对方
            } else if (action === 'reject') {
                const originWS = findWSById(originUserId);
                const peerWS = findWSById(peerUserId);
                for (const w of [originWS, peerWS]) {
                    if (w !== ws) {
                        // 转发给对方
                        w.send(msg);
                    }
                }
            } else if (action === 'answer') { // 应答
                const peerWS = findWSById(originUserId);
                if (!peerWS) {
                    return ws.send(JSON.stringify({error: 'not online'}));
                }
                const connectData = {
                    type: 'connect',
                    session: 'session_' + originUserId + '_' + peerUserId,
                };
                peerWS.send(JSON.stringify(connectData));
                ws.send(JSON.stringify(connectData));
            } else if (action === 'busy') { // 转发busy
                const peerWS = findWSById(originUserId);
                if (!peerWS) {
                    return ws.send(JSON.stringify({error: 'not online'}));
                }
                peerWS.send(JSON.stringify({
                    type: 'invite',
                    action: 'busy',
                }));
            } else {
                console.warn('【Default msg】', msg);
            }
        } else if (data.type === 'disconnect') {
            const {action, originUserId, peerUserId} = data;
            if (action === 'handoff') {
                const originWS = findWSById(originUserId);
                const peerWS = findWSById(peerUserId);
                const disconnectData = JSON.stringify({
                    type: 'disconnect',
                });
                if (originWS) {
                    originWS.send(disconnectData);
                }
                if (peerWS) {
                    peerWS.send(disconnectData);
                }
            }
        } else if (data.type === 'registration') { // 注册
            const {userId, userName} = data;
            const lastWSItem = wsDB[userId];
            if (lastWSItem) {
                const {ws: lastWS} = lastWSItem;
                if (lastWS !== ws) {
                    lastWS.close();
                }
            }
            wsDB[userId] = {ws, userId, userName};
        }
    });
});
wsApp.get('/dashboard/onlineUsers', (req, res) => {
    res.send({
        users: Object.values(wsDB)
            .map(({userId, userName}) => ({userId, userName})),
    });
});
