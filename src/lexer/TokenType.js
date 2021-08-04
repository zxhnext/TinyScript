/**
 * 词法类型枚举
 */
const Enum = require('../common/Enum')

module.exports = {
    KEYWORD: new Enum("KEYWORD", 1), // 关键字
    VARIABLE: new Enum("VARIABLE", 2), // 变量
    OPERATOR: new Enum("OPERATOR", 3), // 操作符
    BRACKET: new Enum("BRACKET", 4), // 括号
    INTEGER: new Enum("INTEGER", 5), // 整数
    FLOAT: new Enum("FLOAT", 6), // 浮点数
    BOOLEAN: new Enum("BOOLEAN", 7), // 布尔
    STRING: new Enum("STRING", 8) // 字符串
}