/**
 * @file http://www.chouyu.com.cn/
 * @author pashangshangpo
 * @createTime 2018年5月18日 下午9:17
 */

const { resolve } = require('path')
const jsonToMobi = require('jsonToMobi')
const Crawl = require('../common/crawl')

class C extends Crawl {
    getNavList(document) {
        const list = Array.from(document.querySelectorAll('#left .post h2 > a'))
        
        return list.map(item => {
            return {
                title: item.textContent,
                href: item.href
            }
        })
    }

    getContent(document) {
        const main = document.querySelector('#left .post')
        main.removeChild(main.querySelector('h2'))
        main.removeChild(main.querySelector('.entrytime'))

        return main.innerHTML
    }
}

new C('http://www.chouyu.com.cn/', new Array(13).fill(true).map((item, index) => {
  return `http://www.chouyu.com.cn/?paged=${index + 1}`
})).getArticles().then(res => {
    jsonToMobi(
        {
            name: '臭鱼的交互设计',
            chapters: res
        },
        resolve('.')
    )
})