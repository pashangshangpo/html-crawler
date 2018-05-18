/**
 * @file http://blog.cssforest.org/
 * @author pashangshangpo
 * @createTime 2018年5月18日 下午2:43:24
 */

const { resolve } = require('path')
const jsonToMobi = require('jsonToMobi')
const Crawl = require('../common/crawl')

class C extends Crawl {
    getNavList(document) {
        const list = Array.from(document.querySelectorAll('#content .listing h4 a'))
        
        return list.map(item => {
            return {
                title: item.textContent,
                href: item.href
            }
        })
    }

    getContent(document) {
        const main = document.querySelector('#content article')
        // main.removeChild(main.querySelector('header'))
        // main.removeChild(main.querySelector('footer'))

        // return main.innerHTML
    }
}

// new C('http://blog.cssforest.org', [
//     'http://blog.cssforest.org/',
//     'http://blog.cssforest.org/page2/'
// ]).getArticles().then(res => {
//     jsonToMobi(
//         {
//             name: 'CSS森林',
//             chapters: res
//         },
//         resolve('.')
//     )
// })

new C().getHTML("http://blog.cssforest.org/2018/04/09/2018-CSS裸奔节.html").then(html => {
    console.log(html)
})