/**
 * 异步任务-函数封装
 *  1. 定义函数
 *  2. 调用核心api（queueMicrotask,MutationObserver,setTimeout）
 *  3. 使用封装函数
 */

// 1. 定义函数
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

        // 3. 使用封装函数
        if (this.state === FULFILLED) {
            runAsynctask(() => {
                onFulfilled(this.result);
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
    }
}

/* 测试代码 */
console.log('top');
const p = new MyPromise((resolve, reject) => {
    // resolve('success');
    reject('error');
});
p.then(res => {
    console.log(res);
}, err => {
    console.error(err);
});
console.log('bottom');