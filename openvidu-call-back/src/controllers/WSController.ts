import * as express from 'express';
import * as _ from 'lodash';
import { logger, wsDB } from '../app';

// util function
const findWSById = (userId: string) => {
    const wsItem = wsDB[userId];
    if (!wsItem) {
        return null;
    }
    return wsItem.ws;
};

// setup router
const router = express.Router();
router.ws('/', (ws, req, next) => {
    ws.onmessage = event => {
        const msg = event.data.toString();
        logger.info("<Client Message> " + msg);
        
        var data: any;
        try {
            data = JSON.parse(msg);
        } catch (error) {
            logger.error("<WS Error> 错误的JSON数据格式 " + msg);
            return;
        }
        if (data.type === 'invite') { // 呼出
            const { action, originUserId, peerUserId } = data;
            // 响铃，拒接
            if (action === 'ring'
                || action === 'cancel'
                || action === 'busy') {
                const peerWS = findWSById(peerUserId);
                if (!peerWS) {
                    return ws.send(JSON.stringify({ error: 'not online' }));
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
                    return ws.send(JSON.stringify({ error: 'not online' }));
                }
                const connectData = {
                    type: 'connect',
                    session: 'session_' + originUserId + '_' + peerUserId + '_' + (new Date()).getTime(),
                };
                peerWS.send(JSON.stringify(connectData));
                ws.send(JSON.stringify(connectData));
            } else {
                console.warn('【Default msg】', msg);
            }
        } else if (data.type === 'disconnect') {
            const { action, originUserId, peerUserId } = data;
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
            const { userId, userName } = data;
            const lastWSItem = wsDB[userId];
            if (lastWSItem) {
                const { ws: lastWS } = lastWSItem;
                if (lastWS !== ws) {
                    lastWS.close(4001, `用户ID[${userId}]被顶替下线!`);
                }
            }
            wsDB[userId] = { ws, userId, userName };
        }
    };
    ws.onerror = () => {
        const clientUserId = _.findKey(wsDB, { 'ws': ws });
        if (clientUserId) {
            _.unset(wsDB, clientUserId);
            logger.info(clientUserId + ' offline.');
        }
    };
    ws.onclose = event => {
        if (event.code === 4001) {
            // userId冲突，主动关闭，不做处理
            return;
        }
        const clientUserId = _.findKey(wsDB, { 'ws': ws });
        if (clientUserId) {
            _.unset(wsDB, clientUserId);
            logger.info(clientUserId + ' offline.');
        }
    };
    next();
});

export default router;