/**
 * @file http://ifeve.com/thinking-in-ali/
 * @author pashangshangpo
 * @createTime 2018年5月18日 下午1:17:52
 */

const { resolve } = require('path')
const jsonToMobi = require('jsonToMobi')
const Crawl = require('../common/crawl')

class IfeveCom extends Crawl {
    getNavList(document) {
        const list = Array.from(document.querySelectorAll('.post_content > ol > li > a'))

        return [{
            title: '阿里内贸团队敏捷实践-前言',
            href: 'http://ifeve.com/ali-itu-agile/'
        }].concat(list.map(item => {
            return {
                title: item.textContent,
                href: item.href
            }
        }))
    }

    getContent(document) {
        return document.querySelector('.post_content').innerHTML
    }
}

new IfeveCom('http://ifeve.com/', ['http://ifeve.com/ali-itu-agile/']).getArticles().then(res => {
    jsonToMobi(
        {
            name: '阿里内贸团队敏捷实践',
            chapters: res
        },
        resolve('.')
    )
})
