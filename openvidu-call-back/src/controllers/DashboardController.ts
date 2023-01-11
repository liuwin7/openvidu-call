import * as express from 'express';
import { wsDB } from '../app';

export const app = express.Router({
    strict: true
});

app.get('/onlineUsers', (req, res) => {
    res.send({
        users: Object.values(wsDB)
            .map(({ userId, userName }) => ({ userId, userName })),
    });
});
