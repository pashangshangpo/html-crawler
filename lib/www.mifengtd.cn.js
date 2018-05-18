/**
 * @file www.mifengtd.cn
 * @author pashangshangpo
 * @createTime 2018年5月17日 下午7:43:19
 */

const { resolve } = require('path')
const jsonToMobi = require('jsonToMobi')
const Crawl = require('../common/crawl')

class WwwMifengtdCn extends Crawl {
  getNavList(document) {
    const list = Array.from(document.querySelectorAll('#main .content .nav-title a'))

    return list.map(item => {
      return {
        title: item.textContent,
        href: item.href
      }
    })
  }

  getContent(document) {
    return document.querySelector('#main .e-content').innerHTML
  }
}

const url = 'https://www.mifengtd.cn/articles/'
const urls = new Array(1).fill(true).map((item, index) => {
  if (index === 0) {
    return url
  }

  return `${url}${index + 1}/`
});

new WwwMifengtdCn('https://www.mifengtd.cn/', urls, 'utf-8').getArticles().then(res => {
  jsonToMobi(
    {
      name: '褪墨-时间管理',
      chapters: res
    },
    resolve('.')
  )
})