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
 * 静态方法-all
 *  1. 返回Promise实例
 *  2. 判断是否为数组 错误信息'Argument is not iterable'
 *  3. 等空数组直接兑现
 *  4. 处理全部兑现
 *  5. 处理第一个拒绝
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
        return new MyPromise((undefined, reject) => {
            reject(val);
        });
    }

    static race (promises) {
        // 1. 返回Promise
        return new MyPromise((resolve, reject) => {
            // 2. 判断是否为数组 错误信息'Argument is not iterable'
            if (!Array.isArray(promises)) {
                return reject(new TypeError('Argument is not iterable'));
            }
            // 3. 等待第一个敲定
            promises.forEach(item => {
                MyPromise.resolve(item).then(res => {
                    resolve(res);
                }, err => {
                    reject(err);
                });
            });
        });
    }

    static all (promises) {
        return new MyPromise((resolve, reject) => {
            // 2. 判断是否为数组
            if (!Array.isArray(promises)) {
                reject(new TypeError('Argument is not iterable'));
            }
            // 3. 空数组直接兑现
            promises.length === 0 && resolve(promises);
            // 4. 处理全部兑现
            const result = [];
            let count = 0;
            promises.forEach((item, index) => {
                MyPromise.resolve(item).then(res => {
                    result[index] = res;
                    count++;
                    count === promises.length && resolve(result);
                }, err => {
                    // 5. 处理第一个拒绝
                    reject(err);
                });
            });
        });
    }
}


/* 测试代码 */
const p1 = MyPromise.resolve(1);

const p2 = new MyPromise((resolve, reject) => {
    setTimeout(() => {
        reject(2);
        // resolves(2);
    }, 1000);
});

const p3 = 3;

MyPromise.all([p1, p2, p3]).then(res => {
    console.log('res:', res);
}, err => {
    console.error('err:', err);
});