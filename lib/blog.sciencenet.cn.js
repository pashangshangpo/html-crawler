/**
 * @file http://blog.sciencenet.cn/
 * @author pashangshangpo
 * @createTime 2018年5月16日 下午10:17
 */

const http = require('http')
const iconv = require('iconv-lite')
const JSDOM = require('jsdom').JSDOM
const parseHTML = require('../common/parseHTML')

/**
 * @start-def: Crawl: baseUrl, pageUrls, decode => undefined
 *   baseUrl: String 基础url
 *   pageUrls: Array [Item]
 *     Item: String 页面URL
 *   decode: String 编码格式
 * 
 *   Function
 *     getArticles: () => Array 获取文章列表
 * 
 * 使用说明,获取文章列表需要覆盖Crawl的两个方法
 *   getNavList: document => Array [Item] 需要返回导航数组列表
 *     Item: Object
 *       title: String 标题
 *       href: String 文章链接地址, 绝对路径
 *   getContent: document => String 需要返回文章内容
 */
class Crawl {
  constructor(baseUrl, pageUrls, decode) {
    this.baseUrl = baseUrl
    this.pageUrls = pageUrls
    this.decode = decode
  }

  getHTML(url, decode = 'utf-8') {
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

  getPage(url, decode, baseUrl) {
    return this.getHTML(url, decode).then(html => {
      const document = new JSDOM(html).window.document
      return this.getNavList(document)
    }).then(async navList => {
      const result = []
      const getInfo = async () => {
        for (let item of navList) {
          await this.getHTML(item.href, decode).then(html => {
            const document = new JSDOM(html).window.document
            const content = this.getContent(document)
            const resultHTML = parseHTML(content, baseUrl)

            result.push({
              title: item.title,
              href: item.href,
              content: resultHTML.html,
              imgs: resultHTML.imgs
            })
          })
        }
      }

      await getInfo()
      return result
    })
  }

  async forPage(decode, baseUrl, pageUrls) {
    let result = []
    for (let url of pageUrls) {
      result = result.concat(await this.getPage(url, decode, baseUrl))
    }

    return result
  }

  getArticles() {
    return this.forPage(this.decode, this.baseUrl, this.pageUrls)
  }
}

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

const urls = [
  'http://blog.sciencenet.cn/home.php?mod=space&uid=330732&do=blog&view=me&classid=141280&from=space&page=17',
  'http://blog.sciencenet.cn/home.php?mod=space&uid=330732&do=blog&view=me&classid=141280&from=space&page=16'
];

new BlogSciencenetCn('http://blog.sciencenet.cn/', urls, 'gb2312').getArticles().then(res => {
  console.log(res)
})