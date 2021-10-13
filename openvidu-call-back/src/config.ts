export const SERVER_PORT = process.env.SERVER_PORT || 40002;
// TODO: - 由于公司网络不允许内网的请求，所以，使用内网的HTTPS连接，并忽略HTTPS的验证
export const OPENVIDU_URL = process.env.OPENVIDU_URL || 'https://172.16.0.127:40002';
// export const OPENVIDU_URL = process.env.OPENVIDU_URL || 'https://uniplay.boyfu.xyz:40001';
export const CALL_OPENVIDU_CERTTYPE = process.env.CALL_OPENVIDU_CERTTYPE || 'owncert';
export const OPENVIDU_SECRET = process.env.OPENVIDU_SECRET || 'openvidu';
