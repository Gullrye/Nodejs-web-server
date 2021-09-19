const fs = require('fs')
const path = require('path')  // 兼容不同操作系统目录路径拼接方式

const fileName = path.resolve(__dirname, 'data.txt')

fs.readFile(fileName, (err, data) => {
  if (err) {
    console.error(err)
    return
  }
  // data 是二进制类型，需要转换为字符串
  // console.log(data)  // Buffer，因为未指定编码
  console.log(data.toString())
})

const content = '新写入的内容\n'
const opt = {
  flag: 'a'  // 追加写入。覆盖用 'w'
}
fs.writeFile(fileName, content, opt, (err) => {
  if (err) {
    console.error(err)
  }
})

// 判断文件是否存在
fs.access(fileName, (err) => {
  console.log(`${err ? 'does not exist' : 'exists'}`);
})