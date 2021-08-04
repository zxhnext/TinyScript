/**
 * 词法分析器
 */
const PeekIterator = require("../common/PeekIterator") // 流
const Token = require("./Token") // 词法类
const TokenType = require("./TokenType") // 词法类型枚举
const AlphabetHelper = require("./AlphabetHelper") // 处理字符串
const LexicalException = require("./LexicalException")
const arrayToGenerator = require("../common/arrayToGenerator")
const fs = require("fs")

class Lexer {
    analyse(source) { // 传入一个字符流
        const tokens = [];
        const it = new PeekIterator(source, "\0");

        while (it.hasNext()) {
            let c = it.next();
            if (c == "\0") { // 结尾符
                break;
            }
            let lookahead = it.peek();

            if (c == " " || c == "\n" || c == "\r") { // 空格或者换行符，跳过
                continue;
            }

            // 提取注释的程序
            if (c == "/") {
                if (lookahead == "/") { // //的注释符
                    while (it.hasNext() && (c = it.next()) != "\n"); // 不遇到换行，一直删
                    continue;
                } else if (lookahead == "*") { // /*的注释，删到 */
                    let valid = false;
                    while (it.hasNext()) {
                        const p = it.next();
                        if (p == "*" && it.peek() == "/") {
                            valid = true;
                            it.next();
                            break;
                        }
                    }

                    if (!valid) {
                        throw new LexicalException("comment not matched");
                    }
                    continue;
                }
            }

            if (c == "{" || c == "}" || c == "(" || c == ")") { // 括号
                tokens.push(new Token(TokenType.BRACKET, c));
                continue;
            }

            if (c == '"' || c == "'") { // 如果是引号，提取字符串
                it.putBack();
                tokens.push(Token.makeString(it));
                continue;
            }

            if (AlphabetHelper.isLetter(c)) { // 字母字符，关键字或变量
                it.putBack();
                tokens.push(Token.makeVarOrKeyword(it));
                continue;
            }

            if (AlphabetHelper.isNumber(c)) { // 数字
                it.putBack();
                tokens.push(Token.makeNumber(it));
                continue;
            }

            // 如果是+ -且下一个字符为数字，
            if ((c == "+" || c == "-") && AlphabetHelper.isNumber(lookahead)) {
                // 跳过:a+1, 1+1
                const lastToken = tokens[tokens.length - 1] || null;
                // 如果+ -号左边不是值类型，说明它是正负号，不是加减操作
                if (lastToken == null || !lastToken.isValue()) {
                    it.putBack();
                    tokens.push(Token.makeNumber(it));
                    continue;
                }
            }

            if (AlphabetHelper.isOperator(c)) { // 符号
                it.putBack();
                tokens.push(Token.makeOp(it));
                continue;
            }

            throw LexicalException.fromChar(c);
        }
        return tokens;
    }

    static fromFile(src) {
        const content = fs.readFileSync(src, "utf-8")
        const lexer = new Lexer()
        return arrayToGenerator(lexer.analyse(arrayToGenerator(content)))
    }
}

module.exports = Lexer;