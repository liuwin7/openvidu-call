# __部署openvidu-call-back__

_说明：项目使用pm2管理相关进程_

## __部署过程__

1. 安装node.js环境，推荐使用nvm安装v16.19.0 [nvm](https://github.com/nvm-sh/nvm/blob/master/README.md)
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
nvm install v16
```

2. 使用npm安装[pm2](https://pm2.keymetrics.io/)
```bash
npm install pm2 -g
```

3. 安装项目依赖
```bash
cd <openvidu-call/openvidu-call-backend>
npm install
```

4. 使用pm2启动项目  
```
pm2 start npm --name openvidu-call-back -- run start
```

## __修改配置信息__

1. 配置文件位置`<项目目录>/openvidu-call-back/.env`
2. 配置信息
```

# 配置项目使用的端口号
SERVER_PORT=40002

# Openvidu Call服务器类型，默认配置是`https`。
# 如果配置为https，将会使用<项目目录/openvidu-call-back/src/cert/full_chain.pem>和
# <项目目录/openvidu-call-back/src/cert/private.key>。
# 其中，private.key，没有在版本库中，需要手动上传到该位置。
# 如果配置为http，将使用HTTP。
SERVER_TYPE=https

# Openvidu服务器的URL
OPENVIDU_URL=http://120.48.83.53:5443

# Openvidu服务器的证书类型
CALL_OPENVIDU_CERTTYPE=owncert

# Openvidu服务器的密码
OPENVIDU_SECRET=openvidu

```

3. 修改完配置文件以后，需要手动重启一下服务并加载环境变量。 
```
pm2 restart openvidu-call-back --update-env
```