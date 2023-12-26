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

function resolvePromise (p2, x, resolve, reject) {
    if (x === p2) {
        throw new TypeError('重复引用了');
    }
    if (x instanceof MyPromise) {
        x.then(res => resolve(res), err => reject(err));
    } else {
        resolve(x);
    }
}


/**
 * 静态方法-reject
 *  1. 返回拒绝状态Promise
 *
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

        // 2. 处理异常
        try {
            func(resolve, reject);
        } catch (e) {
            reject(e);
        }
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
                        resolvePromise(p2, x, resolve, reject);
                    } catch (e) {
                        reject(e);
                    }
                });
            } else if (this.state === REJECTED) {
                runAsynctask(() => {
                    try {
                        const x = onRejected(this.result);
                        resolvePromise(p2, x, resolve, reject);
                    } catch (e) {
                        reject(e);
                    }
                });
            } else if (this.state === PENDING) {
                this.#handlers.push({
                    onFulfilled: () => {
                        runAsynctask(() => {
                            // 1. 处理异常
                            try {
                                // 2. 获取返回值
                                const x = onFulfilled(this.result);
                                // 3. 抽取函数
                                resolvePromise(p2, x, resolve, reject);
                            } catch (e) {
                                reject(e);
                            }
                        });
                    }, onRejected: () => {
                        runAsynctask(() => {
                            // 1. 处理异常
                            try {
                                // 2. 获取返回值
                                const x = onRejected(this.result);
                                // 3. 抽取函数
                                resolvePromise(p2, x, resolve, reject);
                            } catch (e) {
                                reject(e);
                            }
                        });
                    }
                });
            }
        });
        return p2;
    }

    catch (onRejected) {
        // 1. 内部调用then方法
        return this.then(undefined, onRejected);
    }

    finally (onFinally) {
        // 1. 内部调用then方法
        return this.then(onFinally, onFinally);
    }

    static resolve (val) {
        if (val instanceof MyPromise) {
            return val;
        }
        return new MyPromise((resolve, reject) => {
            resolve(val);
        });
    }

    static reject (val) {
        // 1. 返回拒绝状态Promise
        return new MyPromise((undefined, reject) => {
            reject(val);
        });
    }
}


/* 测试代码 */
MyPromise.reject('error').catch(err => {
    console.log(err);
});