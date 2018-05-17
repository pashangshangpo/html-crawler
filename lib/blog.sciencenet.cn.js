/**
 * @file http://blog.sciencenet.cn/
 * @author pashangshangpo
 * @createTime 2018年5月16日 下午10:17
 */

const http = require('http')
const iconv = require('iconv-lite')
const JSDOM = require('jsdom').JSDOM
const parseHTML = require('../common/parseHTML')

const urls = [
  'http://blog.sciencenet.cn/home.php?mod=space&uid=330732&do=blog&view=me&classid=141280&from=space&page=17',
  'http://blog.sciencenet.cn/home.php?mod=space&uid=330732&do=blog&view=me&classid=141280&from=space&page=16'
]

// forPage(urls).then(result => {
//   console.log(result)
// })

class Crawl {
  constructor(baseUrl, pageUrls, decode) {
    this.baseUrl = baseUrl
    this.pageUrls = pageUrls
    this.decode = decode

    this.init()
  }

  getHTML = (url, decode = 'utf-8') => {
    return new Promise(resolve => {
      http.get(url, res => {
        let chunks = []
        res.on('data', check => chunks.push(check))
        res.on('end', () => {
          resolve(iconv.decode(Buffer.concat(chunks), decode))
        })
      })
    })
  }

  getPage = (url, decode, baseUrl) => {
    return getHTML(url, decode).then(html => {
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
      await (async function () {
        for (let item of navList) {
          await getHTML(item.href, decode).then(html => {
            const document = new JSDOM(html).window.document
            const content = document.querySelector('#blog_article').innerHTML
            const resultHTML = parseHTML(content, baseUrl)
  
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
    })
  }

  forPage = async (decode, baseUrl, pageUrls) => {
    let result = []
    for (let url of pageUrls) {
      result = result.concat(await getPage(url, decode, baseUrl))
    }
  
    return result
  }

  init() {
    this.forPage(this.decode, this.baseUrl, this.pageUrls)
  }
}

class BlogSciencenetCn extends Crawl {
  onStart() {
  }
}
// 'gb2312'
new BlogSciencenetCn()