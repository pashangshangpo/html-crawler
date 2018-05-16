/**
 * @file 解析html,并将img路径转换成绝对路径, 并且过滤属性
 * @author pashangshangpo
 * @createTime 2018年5月16日 下午11:56
 */

const JSDOM = require('jsdom').JSDOM
const xmlserializer = require('xmlserializer')

module.exports = (html, url) => {
  const document = new JSDOM('<!DOCTYPE html>' + html).window.document

  const imgs = document.querySelectorAll('img')
  const resultImgs = []
  
  // 转换成绝对路径, 对于../之类的直接忽略并删除,因为获取不到路径
  Array.from(imgs).forEach(img => {
    const prefix = img.src.slice(0, 2)
    if (prefix === './') {
      img.src = url + img.src.slice(2)
    }
    else if (prefix.indexOf('/') > -1 && prefix !== '//') {
      img.src = url + img.src.slice(1)
    }
    else if (prefix !== '//' && img.src.indexOf('http') === -1 && prefix.indexOf('.') === -1) {
      img.src = url + img.src
    }
    else if (img.src.indexOf('http') !== 0 && img.src.indexOf('//') !== 0) {
      img.parentNode.removeChild(img)
      return
    }
  
    resultImgs.push(img.src)
  })
  
  // 过滤script,link,iframe
  Array.from(document.querySelectorAll('script,link,iframe')).forEach(el => {
    el.parentNode.removeChild(el)
  })
  
  // 删除除src,href外的所有元素属性
  Array.from(document.body.querySelectorAll('*')).forEach(el => {
    Array.from(el.attributes).forEach(attr => {
       if (['src', 'href'].indexOf(attr.name) === -1) {
        el.removeAttribute(attr.name)
       }
    })
  })
  
  return {
    html: xmlserializer.serializeToString(document)
    .replace('<html xmlns="http://www.w3.org/1999/xhtml"><head/><body>', '')
    .replace('</body></html>', '')
    .trim(),
    imgs: resultImgs,
    document
  }
}
