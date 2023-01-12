export const SERVER_PORT = process.env.SERVER_PORT || 40002;
export const SERVER_TYPE = process.env.SERVER_TYPE || "https";
// TODO: - 由于公司网络不允许内网的请求，所以，使用内网的HTTPS连接，并忽略HTTPS的验证

// export const OPENVIDU_URL = process.env.OPENVIDU_URL || 'http://localhost:5443';
//export const OPENVIDU_URL = process.env.OPENVIDU_URL || 'http://120.48.83.53:5443'
//export const OPENVIDU_URL = process.env.OPENVIDU_URL || 'http://raymedy.cn:5443'
//export const OPENVIDU_URL = process.env.OPENVIDU_URL || 'https://uniplay.cm-topsci.com:40001';
export const OPENVIDU_URL = process.env.OPENVIDU_URL || 'http://61.51.178.38:40043'
export const CALL_OPENVIDU_CERTTYPE = process.env.CALL_OPENVIDU_CERTTYPE || 'owncert';
export const OPENVIDU_SECRET = process.env.OPENVIDU_SECRET || 'openvidu';
