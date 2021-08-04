/**
 * 流
 * 
 */
const LinkedList = require('linkedlist')
const CACHE_SIZE = 10 // 缓存大小(相当于滑动窗口的窗口大小)

class PeekIterator {
    constructor(it, endToken = null) {
        this.it = it // 迭代器(流)
        this.stackPutBacks = new LinkedList() // 需要putBack的元素，栈
        this.queueCache = new LinkedList() // 缓存，这是个队列
        this.endToken = endToken // 结束符
    }

    peek() {
        if (this.stackPutBacks.length > 0) {
            return this.stackPutBacks.tail
        }

        const val = this.next()
        this.putBack()
        return val
    }

    // 放回操作
    // 缓存 A -> B -> C -> D
    // 放回 D -> C -> B -> A
    putBack() {
        if (this.queueCache.length > 0) {
            this.stackPutBacks.push(this.queueCache.pop())
        }
    }

    hasNext() {
        return this.endToken || !!this.peek()
    }

    // 获取下一个数据的接口
    next() {
        let val = null
        if (this.stackPutBacks.length > 0) {
            val = this.stackPutBacks.pop()
        } else {
            val = this.it.next().value // 迭代器的next
            if (val === undefined) {
                const tmp = this.endToken
                this.endToken = null
                val = tmp
            }
        }

        // 缓存大于窗口长度时，最前面一个出队，将当前值入队
        while (this.queueCache.length > CACHE_SIZE - 1) {
            this.queueCache.shift()
        }
        this.queueCache.push(val)
        return val
    }
}

module.exports = PeekIterator