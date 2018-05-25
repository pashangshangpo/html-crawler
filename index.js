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
  constructor(config) {
    const { 
      baseUrl, 
      pageUrls, 
      decode = 'utf-8',
      getNavList,
      getContent,
      getArticles
    } = config

    this.baseUrl = baseUrl
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

  getPage(url, decode, baseUrl) {
    return this.getHTML(url, decode).then(html => {
      const document = new JSDOM(html).window.document
      return this.getNavList(document, url)
    }).then(async navList => {
      const result = []
      const getInfo = async () => {
        navList = navList.map(item => {
          if (urlTool.parse(item.href).protocol == null) {
            item.href = `${this.baseUrl}/${item.href}`
          }

          item.href = decodeURI(item.href)

          return item
        })

        for (let item of navList) {
          await this.getHTML(item.href, decode).then(html => {
            const document = new JSDOM(html).window.document
            const content = this.getContent(document, item.href)
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

  init() {
    return this.forPage(this.decode, this.baseUrl, this.pageUrls)
  }
}