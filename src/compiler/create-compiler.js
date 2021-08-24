/* @flow */

import { extend } from 'shared/util'
import { detectErrors } from './error-detector'
import { createCompileToFunctionFn } from './to-function'

export function createCompilerCreator (baseCompile: Function): Function {
  // baseOptions : 一些编译规则（web/compiler/options.js 中定义）
  // baseOptions是跟平台相关的 options
  return function createCompiler (baseOptions: CompilerOptions) {
    // compile
    function compile (
      template: string,
      options?: CompilerOptions
    ): CompiledResult {
      // 参数中的 options 是调用 compileToFunctions 中的选项，也是Vue中的options
      // finalOptions 作用是 用来合并 baseOptions 和 options
      const finalOptions = Object.create(baseOptions)
      // 用来存储编译过程中的 错误 和 信息
      const errors = []
      const tips = []
      // 把消息放入到对应的数组中
      let warn = (msg, range, tip) => {
        (tip ? tips : errors).push(msg)
      }
      // 如果options存在的话，合并options
      if (options) {
        if (process.env.NODE_ENV !== 'production' && options.outputSourceRange) {
          // $flow-disable-line
          const leadingSpaceLength = template.match(/^\s*/)[0].length

          warn = (msg, range, tip) => {
            const data: WarningMessage = { msg }
            if (range) {
              if (range.start != null) {
                data.start = range.start + leadingSpaceLength
              }
              if (range.end != null) {
                data.end = range.end + leadingSpaceLength
              }
            }
            (tip ? tips : errors).push(data)
          }
        }
        // merge custom modules
        if (options.modules) {
          finalOptions.modules =
            (baseOptions.modules || []).concat(options.modules)
        }
        // merge custom directives
        if (options.directives) {
          finalOptions.directives = extend(
            Object.create(baseOptions.directives || null),
            options.directives
          )
        }
        // copy other options
        for (const key in options) {
          if (key !== 'modules' && key !== 'directives') {
            finalOptions[key] = options[key]
          }
        }
      }

      finalOptions.warn = warn

      const compiled = baseCompile(template.trim(), finalOptions)
      if (process.env.NODE_ENV !== 'production') {
        detectErrors(compiled.ast, warn)
      }
      compiled.errors = errors
      compiled.tips = tips
      return compiled
    }

    return {
      compile,
      compileToFunctions: createCompileToFunctionFn(compile)
    }
  }
}
