/**
 * @file http://blog.sciencenet.cn/
 * @author pashangshangpo
 * @createTime 2018年5月16日 下午10:17
 */

const { resolve } = require('path')
const jsonToMobi = require('jsonToMobi')
const Crawl = require('../common/crawl')

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

const urls = new Array(17).fill(true).map((item, index) => {
  return `http://blog.sciencenet.cn/home.php?mod=space&uid=330732&do=blog&view=me&classid=141280&from=space&page=${17 - index}`
});

new BlogSciencenetCn('http://blog.sciencenet.cn/', urls, 'gb2312').getArticles().then(res => {
  jsonToMobi(
    {
      name: '戴世强博文',
      chapters: res
    },
    resolve('.')
  )
})