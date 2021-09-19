const xss = require('xss')
const { exec } = require("../db/mysql")

const getList = (author, keyword) => {
  // 如果没有 1=1，也没有 author 和 keyword，那么 where 后面直接加 order by ... 会报错
  let sql = `select * from blogs where 1=1 `
  if (author) {
    sql += `and author='${author}' `
  }
  if (keyword) {
    sql += `and title like '%${keyword}%' `
  }
  sql += `order by createtime desc;`

  // 返回 promise
  return exec(sql)
  // return [
  //   {
  //     id: 1,
  //     title: '标题A',
  //     content: '内容A',
  //     createTime: 1234424,
  //     author: 'gull'
  //   },
  //   {
  //     id: 2,
  //     title: '标题B',
  //     content: '内容B',
  //     createTime: 1234424,
  //     author: 'pull'
  //   },
  // ]
}

const getDetail = (id) => {
  const sql = `select * from blogs where id='${id}'`  // 数组
  return exec(sql).then((rows) => {
    return rows[0]
  })

  // return {
  //   id: 1,
  //   title: '标题A',
  //   content: '内容A',
  //   createTime: 1234424,
  //   author: 'gull'
  // }
}

const newBlog = (blogData = {}) => {
  // blogData 是一个博客对象，包含 title、content 属性
  const title = xss(blogData.title)
  const content = xss(blogData.content)
  const author = blogData.author
  const createtime = Date.now()

  const sql = `
    insert into blogs (title, content, createtime, author)
    values ('${title}', '${content}', ${createtime}, '${author}')
  `
  return exec(sql).then((insertData) => {
    console.log(insertData)
    return {
      id: insertData.insertId
    }
  })
  // return {
  //   id: 3 // 插入到数据表里的 id
  // }
}

const updateBlog = (id, blogData = {}) => {
  const title = xss(blogData.title)
  const content = xss(blogData.content)

  const sql = `
    update blogs set title='${title}', content='${content}' where id='${id}'
  `
  return exec(sql).then((updateData) => {
    console.log(updateData)
    if (updateData.affectedRows > 0) {
      return true
    }
    return false
  })
}

const delBlog = (id, author) => {
  const sql = `
    delete from blogs where id='${id}' and author='${author}'
  `
  return exec(sql).then((delData) => {
    console.log(delData)
    if (delData.affectedRows > 0) {
      return true
    }
    return false
  })
}

module.exports = {
  getList,
  getDetail,
  newBlog,
  updateBlog,
  delBlog
}
