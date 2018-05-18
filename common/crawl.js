/**
 * @file 抓取文章列表数据
 * @author pashangshangpo
 * @createTime 2018年5月17日 上午11:31:06
 */

const http = require('http')
const https = require('https')
const zlib = require('zlib')
const iconv = require('iconv-lite')
const JSDOM = require('jsdom').JSDOM
const parseHTML = require('./parseHTML')

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
module.exports = class Crawl {
  constructor(baseUrl, pageUrls, decode) {
    this.baseUrl = baseUrl
    this.pageUrls = pageUrls
    this.decode = decode
  }

  getHTML(url, decode = 'utf-8') {
    return new Promise(resolve => {
      let type = http
      if (url.indexOf('https') === 0) {
        type = https
      }
      
      type.get(url, res => {
        let encoding = res.headers['content-encoding']
        let chunks = []

        console.log('正在获取: ', url)

        res.on('data', check => chunks.push(check))
        res.on('end', () => {
          let buffer = Buffer.concat(chunks)

          if (encoding === 'gzip') {
            zlib.unzip(buffer, (err, decoded) => {
              if (!err) {
                resolve(decoded.toString())
              }
              else {
                throw err
              }
            })
          }
          else if (encoding === 'deflate') {
            zlib.inflate(buffer, (err, decoded) => {
                if (!err) {
                  resolve(decoded.toString())
                }
                else {
                  throw err
                }
            })
          }
          else {
            resolve(iconv.decode(buffer, decode))
          }
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
        navList = navList.map(item => {
          if (url.parse(item.href).protocol == null) {
            item.href = `${this.baseUrl}/${item.href}`
          }

          return item
        })

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