/**
 * @file http://blog.sciencenet.cn/
 * @author pashangshangpo
 * @createTime 2018年5月16日 下午10:17
 */

const http = require('http')
const iconv = require('iconv-lite')
const JSDOM = require('jsdom').JSDOM
const parseHTML = require('../common/parseHTML')

const url = 'http://blog.sciencenet.cn/home.php?mod=space&uid=330732&do=blog&view=me&classid=141280&from=space&page=17'

const getHTML = url => {
  return new Promise(resolve => {
    http.get(url, res => {
      let chunks = []
      res.on('data', check => chunks.push(check))
      res.on('end', () => {
        resolve(iconv.decode(Buffer.concat(chunks), 'gb2312'))
      })
    })
  })
}

getHTML(url).then(html => {
  const document = new JSDOM(html).window.document
  const list = Array.from(document.querySelectorAll('#ct .bm_c .xld .xs2'))

  return list.map(item => {
    const link = item.lastElementChild

    return {
      title: link.textContent,
      href: link.href
    }
  })
}).then(async navList => {
  const result = []
  await (async function() {
    for (let item of navList) {
      await getHTML(item.href).then(html => {
        const document = new JSDOM(html).window.document
        const html = document.querySelector('#blog_article').innerHTML
        const resultHTML = parseHTML(html)

        result.push({
          title: item.title,
          href: item.href,
          content: resultHTML.html,
          imgs: resultHTML.imgs
        })
      })
    }
  }())

  return result
}).then(result => {
  console.log(result)
})