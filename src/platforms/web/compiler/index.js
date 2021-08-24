/* @flow */

import { baseOptions } from './options'
import { createCompiler } from 'compiler/index'

// baseOptions 是跟web平台相关的选项
const { compile, compileToFunctions } = createCompiler(baseOptions)

export { compile, compileToFunctions }
