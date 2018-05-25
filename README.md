# html-crawler
文章列表抓取工具

## 使用示例

```
const Crawl = require('html-crawler')

new Crawl({
    pageUrls: [
        'http://xx.com/pages/1',
        'http://xx.com/pages/2'
    ],
    getNavList(document) {
        const list = Array.from(document.querySelectorAll('.post_content > ol > li > a'))

        return list.map(item => {
            return {
                title: item.textContent,
                href: item.href
            }
        })
    },
    getContent(document) {
        return document.querySelector('.post_content').innerHTML
    },
    getArticles(res) {
        console.log(res)
    }
})
```

## API文档

```
Crawl: config => undefined
  config: Object
    pageUrls: Array
      Item: String 页面URL
    decode: String 解码格式 默认utf-8
    getNavList: document => Array 需要返回页面导航列表
      Item: Object
        title: String 标题
        href: String 链接
    getContent: document => String 需要返回html内容
    getArticles: res => undefined 获取文章列表, 最终结果
```
