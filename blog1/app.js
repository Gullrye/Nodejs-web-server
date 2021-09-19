const querystring = require('querystring')
const { set, get } = require('./src/db/redis')
const handleBlogRouter = require("./src/router/blog")
const handleUserRouter = require("./src/router/user")
const { access } = require('./src/utils/log')

// 获取 cookie 过期时间
const getCookieExpires = () => {
  const d = new Date()
  d.setTime(d.getTime() + (24 * 60 * 60 * 1000))  // 重新设置 d 的时间为 当前 d 的时间加上一天，其中 1000单位为 ms
  // console.log(d.toGMTString())
  return d.toGMTString()
}

// const SESSION_DATA = {}

const getPostData = (req) => {
  const promise = new Promise((resolve, reject) => {
    if (req.method !== 'POST') {
      resolve({})
      return
    }
    if (req.headers['content-type'] !== 'application/json') {
      resolve({})
      return
    }
    let postData = ''
    req.on('data', (chunk) => {
      postData += chunk.toString()
    })
    req.on('end', () => {
      if (!postData) {
        resolve({})
        return
      }
      resolve(
        JSON.parse(postData)
      )
    })
  })
  return promise
}

const serverHandle = (req, res) => {
  // 记录 access log
  access(`${req.method} -- ${req.url} -- ${req.headers['user-agent']} -- ${Date.now()}`)

  // 设置返回格式 JSON
  res.setHeader('Content-type', 'application/json')

  // 获取 path
  const url = req.url
  req.path = url.split('?')[0]

  // 解析 query
  req.query = querystring.parse(url.split('?')[1])

  // 解析 cookie
  req.cookie = {}
  const cookieStr = req.headers.cookie || ''  // 格式 k1=v1;k2=v2;k3=v3;
  cookieStr.split(';').forEach(item => {
    if (!item) {
      return
    }
    const arr = item.split('=')
    const key = arr[0].trim()
    const val = arr[1].trim()
    req.cookie[key] = val
  })
  // console.log(req.cookie)

  // // 解析 session
  // let needSetCookie = false
  // let userId = req.cookie.userid
  // if (userId) {
  //   if (!SESSION_DATA[userId]) {
  //     SESSION_DATA[userId] = {}
  //   }
  // } else {
  //   needSetCookie = true
  //   userId = `${Date.now()}_${Math.random()}`
  //   SESSION_DATA[userId] = {}
  // }
  // req.session = SESSION_DATA[userId]

  // 解析 session (使用 redis)
  let needSetCookie = false
  let userId = req.cookie.userid
  if (!userId) {
    needSetCookie = true  // 为 true 时后面处理路由时会设置 cookie
    userId = `${Date.now()}_${Math.random()}`
    // 初始化 redis 中的 session 值，userId 是一个 key!
    set(userId, {}) // 1631875087865_0.4812143244053817: {}
  }
  // 获取 session
  req.sessionId = userId
  get(req.sessionId).then((sessionData) => {  // req.sessionId key 对应的 val 为 req.session即，{username realname} ，见 router/uer.js 设置
    if (sessionData === null) {
      // 初始化 redis 中的 session 值
      set(req.sessionId, {})
      // 设置 session
      req.session = {}
    } else {
      req.session = sessionData
    }
    // console.log(req.session)

    // 处理 post data
    return getPostData(req)
  })
  .then(postData => {
    req.body = postData // 获取 post 的数据，如 { username: 'gull', password: '123' }
    // console.log(req.body)

    // 处理 blog 路由
    // let blogData = handleBlogRouter(req, res)
    // if (blogData) {
    //   res.end(
    //     JSON.stringify(blogData)
    //   )
    //   return
    // }
    const blogResult = handleBlogRouter(req, res)
    if (blogResult) {
      blogResult.then((blogData) => {
        if (needSetCookie) {
          res.setHeader('Set-cookie', `userid=${userId}; path=/; httpOnly; expires=${getCookieExpires()}`)
        }
        res.end(
          JSON.stringify(blogData)
        )
      })
      return
    }

    // 处理 user 路由
    // let userData = handleUserRouter(req, res)
    // if (userData) {
    //   res.end(
    //     JSON.stringify(userData)
    //   )
    //   return
    // }
    const userResult = handleUserRouter(req, res)
    if (userResult) {
      userResult.then((userData) => {
        if (needSetCookie) {
          res.setHeader('Set-cookie', `userid=${userId}; path=/; httpOnly; expires=${getCookieExpires()}`)
        }
        res.end(
          JSON.stringify(userData)
        )
      })
      return
    }

    // 未命中路由，返回 404
    res.writeHead(404, { "Content-type": "text/plain" })
    res.write('404 Not Found\n')
    res.end()
  })

}

module.exports = serverHandle

// 查看环境，开发还是生产
// env: process.env.NODE_ENV