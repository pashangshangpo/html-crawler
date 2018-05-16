/**
 * @file http://blog.sciencenet.cn/
 * @author pashangshangpo
 * @createTime 2018年5月16日 下午10:17
 */

const http = require('http')
const parseHTML = require('../common/parseHTML')

const url = 'http://blog.sciencenet.cn/home.php?mod=space&uid=330732&do=blog&view=me&classid=141280&from=space&page=17'

const getHTML = url => {
  return new Promise(resolve => {
    http.get(url, res => {
      let data = ''
      res.on('data', check => data += check)
      res.on('end', () => {
        resolve(data)
      })
    })
  })
}

// getHTML(url)