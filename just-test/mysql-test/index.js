const mysql = require('mysql')

// 创建链接对象
const con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456789',
  port: '3306',
  database: 'myblog'
})

// 开始连接
con.connect()

// 执行 sql 语句
// const sql = `insert into blogs (title, content, createtime, author) values ('标题C', '内容C', '20210918', 'laowang');`
// const sql = `delete from blogs where id='4';`
const sql = `select * from blogs;`
con.query(sql, (err, result) => {
  if (err) {
    console.error(err)
    return
  }
  console.log(result)
})

// 关闭连接
con.end()