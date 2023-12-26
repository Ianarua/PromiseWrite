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
 * 链式编程-处理重复引用(fulfilled状态)
 *  1. 处理重复引用
 *  2. 抛出错误
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

        const p2 = new MyPromise((resolve, reject) => {
            if (this.state === FULFILLED) {
                runAsynctask(() => {
                    try {
                        const x = onFulfilled(this.result);
                        // 1. 处理重复引用
                        if (x === p2) {
                            // 2. 抛出错误
                            throw new TypeError('重复引用了');
                        }
                        if (x instanceof MyPromise) {
                            // 2. 调用then方法
                            x.then(res => resolve(res), err => reject(err));
                        } else {
                            resolve(x);
                        }
                    } catch (e) {
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

        return p2;
    }
}

/* 测试代码 */
const p = new MyPromise((resolve, reject) => {
    resolve(1);
});
const p2 = p.then(res => {
    return p2;
});

p2.then(res => {
    console.log(res);
}, err => {
    console.error(err);
});