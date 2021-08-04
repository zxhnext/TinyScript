/**
 * 词法类
 */
const TokenType = require('./TokenType') // 词法类型
const AlphabetHelper = require("./AlphabetHelper")
const LexicalException = require("./LexicalException")

const Keywords = new Set([
    "var",
    "if",
    "else",
    "for",
    "while",
    "break",
    "func",
    "return",
    "int",
    "float",
    "bool",
    "void",
    "string"
]);

class Token {
    constructor(type, value) {
        this._type = type
        this._value = value
    }

    getType() {
        return this._type
    }

    getValue() {
        return this._value
    }

    isVariable() { // 是否是变量
        return this._type === TokenType.VARIABLE
    }

    isValue() {
        return this.isScalar() || this.isVariable();
    }

    isScalar() { // 是否是值类型
        return (
            this._type == TokenType.INTEGER ||
            this._type == TokenType.FLOAT ||
            this._type == TokenType.STRING ||
            this._type == TokenType.BOOLEAN
        )
    }

    toString() {
        return `type ${this._type.type}, value ${this._value}`
    }

    /**
     * 提取关键字和变量名
     * @param {*} it 
     * @returns 
     */
    static makeVarOrKeyword(it) {
        let s = "";

        while (it.hasNext()) {
            // 这里使用peek不使用next是因为符合条件猜进行下一个
            const c = it.peek();
            // 如果是英文文本
            if (AlphabetHelper.isLiteral(c)) {
                s += c;
            } else {
                break;
            }
            it.next();
        }

        // 关键词
        if (Keywords.has(s)) {
            return new Token(TokenType.KEYWORD, s);
        }
        // Boolean
        if (s == "true" || s == "false") {
            return new Token(TokenType.BOOLEAN, s);
        }
        // 变量名
        return new Token(TokenType.VARIABLE, s);
    }

    /**
     * 提取字符串
     * @param {*} it 
     * @returns 
     */
    static makeString(it) {
        let s = "";

        let state = 0;

        while (it.hasNext()) {
            // 这里不存在不符合条件的判断，直接用next即可
            let c = it.next();

            switch (state) {
                case 0:
                    if (c == '"') { // 双引号，走状态1
                        state = 1;
                    } else { // 单引号，走状态2
                        state = 2;
                    }
                    s += c;
                    break;
                case 1:
                    if (c == '"') { // 是双引号，结束
                        return new Token(TokenType.STRING, s + c);
                    } else {
                        s += c;
                    }
                    break;
                case 2:
                    if (c == "'") { // 是单引号，结束
                        return new Token(TokenType.STRING, s + c);
                    } else {
                        s += c;
                    }
                    break;
            }
        }
        throw new LexicalException("Unexpected error");
    }

    /**
     * 提取操作符
     * @param {*} it 
     * @returns 
     */
    static makeOp(it) {
        let state = 0;
        while (it.hasNext()) {
            let lookahead = it.next();

            switch (state) {
                case 0: // 初始走状态0
                    switch (lookahead) {
                        case "+": // +号，state = 1
                            state = 1;
                            break;
                        case "-":
                            state = 2;
                            break;
                        case "*":
                            state = 3;
                            break;
                        case "/":
                            state = 4;
                            break;
                        case ">":
                            state = 5;
                            break;
                        case "<":
                            state = 6;
                            break;
                        case "=":
                            state = 7;
                            break;
                        case "!":
                            state = 8;
                            break;
                        case "&":
                            state = 9;
                            break;
                        case "|":
                            state = 10;
                            break;
                        case "^":
                            state = 11;
                            break;
                        case "%":
                            state = 12;
                            break;
                        case ",":
                            return new Token(TokenType.OPERATOR, ",");
                        case ";":
                            return new Token(TokenType.OPERATOR, ";");
                    }
                    break;
                case 1: // 第二次循环时，
                    {
                        if (lookahead == "+") { // 还是+号，++
                            return new Token(TokenType.OPERATOR, "++");
                        } else if (lookahead == "=") { // =号，+=
                            return new Token(TokenType.OPERATOR, "+=");
                        } else { // 说明第二个不是操作符了，把当前的吐回去
                            it.putBack();
                            return new Token(TokenType.OPERATOR, "+");
                        }
                    }
                case 2:
                    if (lookahead == "-") {
                        return new Token(TokenType.OPERATOR, "--");
                    } else if (lookahead == "=") {
                        return new Token(TokenType.OPERATOR, "-=");
                    } else {
                        it.putBack();
                        return new Token(TokenType.OPERATOR, "-");
                    }
                case 3:
                    if (lookahead == "=") {
                        return new Token(TokenType.OPERATOR, "*=");
                    } else {
                        it.putBack();
                        return new Token(TokenType.OPERATOR, "*");
                    }
                case 4:
                    if (lookahead == "=") {
                        return new Token(TokenType.OPERATOR, "/=");
                    } else {
                        it.putBack();
                        return new Token(TokenType.OPERATOR, "/");
                    }
                case 5:
                    if (lookahead == "=") {
                        return new Token(TokenType.OPERATOR, ">=");
                    } else if (lookahead == ">") {
                        return new Token(TokenType.OPERATOR, ">>");
                    } else {
                        it.putBack();
                        return new Token(TokenType.OPERATOR, ">");
                    }
                case 6:
                    if (lookahead == "=") {
                        return new Token(TokenType.OPERATOR, "<=");
                    } else if (lookahead == "<") {
                        return new Token(TokenType.OPERATOR, "<<");
                    } else {
                        it.putBack();
                        return new Token(TokenType.OPERATOR, "<");
                    }
                case 7:
                    if (lookahead == "=") {
                        return new Token(TokenType.OPERATOR, "==");
                    } else {
                        it.putBack();
                        return new Token(TokenType.OPERATOR, "=");
                    }
                case 8:
                    if (lookahead == "=") {
                        return new Token(TokenType.OPERATOR, "!=");
                    } else {
                        it.putBack();
                        return new Token(TokenType.OPERATOR, "!");
                    }
                case 9:
                    if (lookahead == "&") {
                        return new Token(TokenType.OPERATOR, "&&");
                    } else if (lookahead == "=") {
                        return new Token(TokenType.OPERATOR, "&=");
                    } else {
                        it.putBack();
                        return new Token(TokenType.OPERATOR, "&");
                    }
                case 10:
                    if (lookahead == "|") {
                        return new Token(TokenType.OPERATOR, "||");
                    } else if (lookahead == "=") {
                        return new Token(TokenType.OPERATOR, "|=");
                    } else {
                        it.putBack();
                        return new Token(TokenType.OPERATOR, "|");
                    }
                case 11:
                    if (lookahead == "^") {
                        return new Token(TokenType.OPERATOR, "^^");
                    } else if (lookahead == "=") {
                        return new Token(TokenType.OPERATOR, "^=");
                    } else {
                        it.putBack();
                        return new Token(TokenType.OPERATOR, "^");
                    }
                case 12:
                    if (lookahead == "=") {
                        return new Token(TokenType.OPERATOR, "%=");
                    } else {
                        it.putBack();
                        return new Token(TokenType.OPERATOR, "%");
                    }
            }
        } // end while

        throw new LexicalException("Unexpected error");
    }

    /**
     * 提取数字
     * @param {*} it 
     * @returns 
     */
    static makeNumber(it) {
        let state = 0;
        let s = "";

        while (it.hasNext()) {
            let lookahead = it.peek();

            switch (state) {
                case 0:
                    if (lookahead == "0") { // 0
                        state = 1;
                    } else if (AlphabetHelper.isNumber(lookahead)) { // 1～9
                        state = 2;
                    } else if (lookahead == "+" || lookahead == "-") { // + -号
                        state = 3;
                    } else if (lookahead == ".") { // 小数点
                        state = 5;
                    }
                    break;
                case 1:
                    if (lookahead == "0") { // 00
                        state = 1;
                    } else if (lookahead == ".") { // 0. 1.
                        state = 4;
                    } else if (AlphabetHelper.isNumber(lookahead)) { // 132
                        state = 2;
                    } else {
                        return new Token(TokenType.INTEGER, s); // 数字部分结束
                    }
                    break;
                case 2:
                    if (AlphabetHelper.isNumber(lookahead)) { // 1234
                        state = 2;
                    } else if (lookahead == ".") { // 12.
                        state = 4;
                    } else {
                        return new Token(TokenType.INTEGER, s);
                    }
                    break;
                case 3:
                    if (AlphabetHelper.isNumber(lookahead)) { // +12
                        state = 2;
                    } else if (lookahead == ".") { // +.
                        state = 5;
                    } else {
                        throw LexicalException.fromChar(lookahead);
                    }
                    break;
                case 4:
                    if (lookahead == ".") { // 1..
                        throw LexicalException.fromChar(lookahead);
                    } else if (AlphabetHelper.isNumber(lookahead)) { // 1.3
                        state = 20;
                    } else {
                        return new Token(TokenType.FLOAT, s);
                    }
                    break;
                case 5:
                    if (AlphabetHelper.isNumber(lookahead)) {
                        state = 20;
                    } else {
                        throw LexicalException.fromChar(lookahead);
                    }
                    break;
                case 20:
                    if (AlphabetHelper.isNumber(lookahead)) {
                        state = 20;
                    } else if (lookahead == ".") {
                        throw LexicalException.fromChar(lookahead);
                    } else {
                        return new Token(TokenType.FLOAT, s);
                    }
            }
            s += lookahead;
            it.next();
        } // end while
        throw new LexicalException("Unexpected error");
    }
}

module.exports = Token