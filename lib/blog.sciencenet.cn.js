/**
 * @file http://blog.sciencenet.cn/
 * @author pashangshangpo
 * @createTime 2018年5月16日 下午10:17
 */

const { resolve } = require('path')
const jsonToMobi = require('jsonToMobi')
const Crawl = require('../common/crawl')

const argv = process.argv.slice(2)
const name = argv[0]
const pages = argv[1]
const url = argv[2]

class BlogSciencenetCn extends Crawl {
  getNavList(document) {
    const list = Array.from(document.querySelectorAll('#ct .bm_c .xld .xs2'))

    return list.map(item => {
      const link = item.lastElementChild

      return {
        title: link.textContent,
        href: link.href
      }
    })
  }

  getContent(document) {
    return document.querySelector('#blog_article').innerHTML
  }
}

const urls = new Array(pages).fill(true).map((item, index) => {
  return `${url}${index + 1}`
});

new BlogSciencenetCn('http://blog.sciencenet.cn/', urls, 'gb2312').getArticles().then(res => {
  jsonToMobi(
    {
      name: name,
      chapters: res
    },
    resolve('.')
  )
})