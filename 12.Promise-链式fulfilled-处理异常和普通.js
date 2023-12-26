// 异步
function runAsynctask (callback) {
    // 2. 调用核心api
    if (typeof queueMicrotask === 'function') {
        queueMicrotask(callback);
    } else if (typeof MutationObserver === 'function') {
        const obs = new MutationObserver(callback);
        const divNode = document.createElement('div');
        obs.observe(divNode, {childList: true});
    } else {
        setTimeout(callback, 0);
    }
}

/**
 * 链式编程-处理异常和普通内容(fulfilled状态)
 *  1. 返回新Promise实例
 *  2. 获取返回值
 *    2.1 处理返回值
 *    2.2 处理异常
 */

const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class MyPromise {
    state = PENDING;
    result = undefined;
    #handlers = []; // [{onFulfilled, onRejected}...]
    constructor (func) {
        const resolve = (result) => {
            if (this.state === PENDING) {
                this.state = FULFILLED;
                this.result = result;
                this.#handlers.forEach(({onFulfilled}) => {
                    onFulfilled(this.result);
                });
            }
        };
        const reject = (result) => {
            if (this.state === PENDING) {
                this.state = REJECTED;
                this.result = result;
                this.#handlers.forEach(({onRejected}) => {
                    onRejected(this.result);
                });
            }
        };

        func(resolve, reject);
    }

    then (onFulfilled, onRejected) {
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : x => x;
        onRejected = typeof onRejected === 'function' ? onRejected : x => {
            throw x;
        };

        // 1. 返回新Promise实例
        return new MyPromise((resolve, reject) => {
            if (this.state === FULFILLED) {
                runAsynctask(() => {
                    // 2. 获取返回值
                    try {
                        const x = onFulfilled(this.result);
                        // 2.1 处理返回值
                        resolve(x);
                    } catch (e) {
                        // 2.2 处理异常
                        reject(e);
                    }

                });
            } else if (this.state === REJECTED) {
                runAsynctask(() => {
                    onRejected(this.result);
                });
            } else if (this.state === PENDING) {
                this.#handlers.push({
                    onFulfilled: () => {
                        runAsynctask(() => {
                            onFulfilled(this.result);
                        });
                    }, onRejected: () => {
                        runAsynctask(() => {
                            onRejected(this.result);
                        });
                    }
                });
            }
        });
    }
}

/* 测试代码 */
const p = new MyPromise((resolve, reject) => {
    resolve(1);
});
p.then(res => {
    console.log('p1', res);
    throw 'error1';
    return 2;
}).then(res => {
    console.log('p2', res);
}, err => {
    console.error('p2', err);
});