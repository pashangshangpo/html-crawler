/**
 * @file 抓取文章列表数据
 * @author pashangshangpo
 * @createTime 2018年5月17日 上午11:31:06
 */

const http = require('http')
const https = require('https')
const urlTool = require('url')
const zlib = require('zlib')
const iconv = require('iconv-lite')
const JSDOM = require('jsdom').JSDOM

/**
 * @start-def: Crawl: config => undefined
 *   config: Object
 *     pageUrls: Array
 *       Item: String 页面URL
 *     decode: String 解码格式 默认utf-8
 *     getNavList: document => Array 需要返回页面导航列表
 *       Item: Object
 *         title: String 标题
 *         href: String 链接
 *     getContent: document => String 需要返回html内容
 *     getArticles: res => undefined 获取文章列表, 最终结果
 */
module.exports = class Crawl {
  constructor(config) {
    const {
      pageUrls,
      decode = 'utf-8',
      getNavList,
      getContent,
      getArticles
    } = config

    this.pageUrls = pageUrls
    this.decode = decode
    this.getNavList = getNavList
    this.getContent = getContent

    this.init().then(getArticles)
  }

  getHTML(url, decode) {
    return new Promise(resolve => {
      let type = http
      if (url.indexOf('https') === 0) {
        type = https
      }

      const urlParse = new urlTool.URL(url)
      const options = {
        protocol: urlParse.protocol,
        host: urlParse.host,
        hostname: urlParse.hostname,
        port: urlParse.port,
        path: urlParse.pathname + urlParse.search,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.170 Safari/537.36'
        }
      }

      type.get(options, res => {
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

  getPage(url, decode) {
    return this.getHTML(url, decode).then(html => {
      const document = new JSDOM(html).window.document
      return this.getNavList(document, url)
    }).then(async navList => {
      let list = []
      const urlParse = urlTool.parse(url)
      const baseUrl = `${urlParse.protocol}//${urlParse.host}`

      navList = navList.map(item => {
        if (urlTool.parse(item.href).protocol == null) {
          item.href = `${baseUrl}/${item.href}`
        }

        item.href = decodeURI(item.href)

        return item
      })

      for (let item of navList) {
        list.push(
          this.getHTML(item.href, decode).then(html => {
            const document = new JSDOM(html).window.document

            return {
              title: item.title,
              href: item.href,
              content: this.getContent(document, item.href)
            }
          })
        )
      }

      return await Promise.all(list)
    })
  }

  async forPage(decode, pageUrls) {
    let list = []

    for (let url of pageUrls) {
      list.push(this.getPage(url, decode))
    }

    return await Promise.all(list)
  }

  init() {
    return this.forPage(this.decode, this.pageUrls).then(values => {
      const result = []

      values.forEach(list => result.push(...list))

      return result
    })
  }
}