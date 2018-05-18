/**
 * @file https://yuguo.us/
 * @author pashangshangpo
 * @createTime 2018年5月18日 下午10:06
 */

const { resolve } = require('path')
const jsonToMobi = require('jsonToMobi')
const Crawl = require('../common/crawl')

class C extends Crawl {
    getNavList(document) {
        const list = Array.from(document.querySelectorAll('.posts .post a'))
        
        return list.map(item => {
            return {
                title: item.firstChild.textContent,
                href: item.href
            }
        }).filter(item => {
          return item.href.indexOf('isux.tencent.com') === -1 && item.href.indexOf('www.qcloud.com') === -1
        })
    }

    getContent(document, url) {
      if (url.indexOf('zhihu.com') > -1) {
        return document.querySelector('.RichText').innerHTML
      }
      return document.querySelector('.postbody').innerHTML
    }
}

new C('https://yuguo.us', ['https://yuguo.us/weblog/']).getArticles().then(res => {
    jsonToMobi(
        {
            name: '余果',
            chapters: res
        },
        resolve('.')
    )
})