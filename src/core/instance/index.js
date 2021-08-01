import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

// 此处不用class的原因是为了方便 Vue 示例的混入实例成员
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}

// 注册 vm 的 _init 方法
initMixin(Vue)
// 注册 vm 的 $data / $props / $set / $delete / $watch
stateMixin(Vue)
// 注册相关事件 $on / $off / $once / $emit
eventsMixin(Vue)
// 注册生命周期相关的混入方法 _update / $forcedUpdate / $destory
lifecycleMixin(Vue)
// 混入 render / $nextTick
renderMixin(Vue)

export default Vue
