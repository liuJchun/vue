/* @flow */
// flow 注释必须在第一行

import config from 'core/config'
import { warn, cached } from 'core/util/index'
import { mark, measure } from 'core/util/perf'

import Vue from './runtime/index'
import { query } from './util/index'
import { compileToFunctions } from './compiler/index'
import {
  shouldDecodeNewlines,
  shouldDecodeNewlinesForHref,
} from './util/compat'

// 闭包 缓存 cache对象
const idToTemplate = cached((id) => {
  // 查找 Element 找不到 返回 div dom
  const el = query(id)
  return el && el.innerHTML
})

const mount = Vue.prototype.$mount

// 重写 $mount 方法
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && query(el)

  /* istanbul ignore if */
  // 不能挂载到 body html 节点
  if (el === document.body || el === document.documentElement) {
    process.env.NODE_ENV !== 'production' &&
      warn(
        'Do not mount Vue to <html> or <body> - mount to normal elements instead.'
      )
    return this
  }

  const options = this.$options
  // resolve template/el and convert to render function
  // 如果不存在 render 方法 , 将 template 转化成 render方法
  // 如果同时存在template, 优先执行 render 方法
  if (!options.render) {
    let template = options.template
    // 获取template的内容，如果以#开头，查找的dom，找不到创建一个div dom
    if (template) {
      if (typeof template === 'string') {
        if (template.charAt(0) === '#') {
          // 闭包，将 template dom 缓存
          template = idToTemplate(template)
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'production' && !template) {
            warn(
              `Template element not found or is empty: ${options.template}`,
              this
            )
          }
        }
        
      } else if (template.nodeType) {// template 是一个真实的dom
        template = template.innerHTML
      } else {
        if (process.env.NODE_ENV !== 'production') {
          warn('invalid template option:' + template, this)
        }
        // this
        return this
      }
    } else if (el) {
      template = getOuterHTML(el)
    }
    
    if (template) {
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile')
      }
      // staticRenderFns 是一个数组
      const { render, staticRenderFns } = compileToFunctions(
        template,
        {
          outputSourceRange: process.env.NODE_ENV !== 'production',
          shouldDecodeNewlines,
          shouldDecodeNewlinesForHref,
          delimiters: options.delimiters,
          comments: options.comments,
        },
        this
      )
      // render 、 staticRenderFns 挂载 到 $options 中
      options.render = render
      options.staticRenderFns = staticRenderFns

      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile end')
        measure(`vue ${this._name} compile`, 'compile', 'compile end')
      }
    }
  }
  return mount.call(this, el, hydrating)
}

/**
 * Get outerHTML of elements, taking care
 * of SVG elements in IE as well.
 */
function getOuterHTML(el: Element): string {
  if (el.outerHTML) {
    return el.outerHTML
  } else {
    const container = document.createElement('div')
    container.appendChild(el.cloneNode(true))
    return container.innerHTML
  }
}

Vue.compile = compileToFunctions

export default Vue
