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
 * 链式编程-(reject状态)
 *  1. 处理异常
 *  2. 获取返回值
 *  3. 抽取函数
 *  4. 调用函数
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
                        resolvePromise(p2, x, resolve, reject);
                    } catch (e) {
                        reject(e);
                    }
                });
            } else if (this.state === REJECTED) {
                runAsynctask(() => {
                    // 1. 处理异常
                    try {
                        // 2. 获取返回值
                        const x = onRejected(this.result);
                        // 4. 调用函数
                        resolvePromise(p2, x, resolve, reject);
                    } catch (e) {
                        reject(e);
                    }
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

// 3. 抽取函数
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

/* 测试代码 */
const p = new MyPromise((resolve, reject) => {
    reject(1);
});
const p2 = p.then(undefined, err => {
    // throw 'error';
    // return p2;
    // return 2;
    return new MyPromise((resolve, reject) => {
        // resolve('MyPromise2');
        reject('MyPromise-error');
    });
});

p2.then(res => {
    console.log('p2-res', res);
}, err => {
    console.log('p2-err', err);
});