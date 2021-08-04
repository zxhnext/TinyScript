/**
 * 处理字符串
 */
class AlphabetHelper {

    static ptnLetter = /^[a-zA-Z]$/ // 字母字符
    static ptnNumber = /^[0-9]$/ // 数字字符
    static ptnLiteral = /^[_a-zA-Z0-9]$/ // 英文文本
    static ptnOperator = /^[+\-*/><=!&|^%,]$/ // 符号

    static isLetter(c) {
        return AlphabetHelper.ptnLetter.test(c)
    }
    static isNumber(c) {
        return AlphabetHelper.ptnNumber.test(c)
    }
    static isLiteral(c) {
        return AlphabetHelper.ptnLiteral.test(c)
    }
    static isOperator(c) {
        return AlphabetHelper.ptnOperator.test(c)
    }
}

module.exports = AlphabetHelper