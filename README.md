# Nodejs 简单博客项目

blog1 文件夹：

- 不使用框架实现博客项目，使用 npm run dev 进行启动
- 还需要设置好数据库 mysql，使用 8000 端口
- 启动 redis，切换到 redis 所在目录执行`redis-server.exe redis.windows.conf`

html 文件夹：

- 博客简单页面
- 使用 http-server -p 8001 进行启动

启动 nginx：

- nginx.conf 文件配置 8000 和 8001 端口都指向 8080 端口，解决跨域问题

blog-express 文件夹：

- 使用 express 实现博客项目
- `npm i mysql xss --save`
- 复用 bd/mysql.js、conf/db.js、controller文件夹、model文件夹、utils/crpy.js
- 使用 express-session 和 connect-redis 插件，`npm i express-session --save`，`npm i redis connect-redis --save`
- `npm run prd` 后记录日志到 logs/access.log

mysql 和 redis 配置：

- conf/db.js，mysql 密码需要修改
