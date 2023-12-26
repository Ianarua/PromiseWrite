/**
 * 成功和失败回调
 *  1. 添加实例方法
 *  2. 参数判断
 *    2.1 执行成功回调
 *    2.2 执行失败回调
 */
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class MyPromise {
    state = PENDING;
    result = undefined;

    constructor (func) {
        const resolve = (result) => {
            // 改状态： pending -> fulfilled
            if (this.state === PENDING) {
                this.state = FULFILLED;
                this.result = result;
            }
        };
        const reject = (result) => {
            // 改状态： pending -> rejected
            if (this.state === PENDING) {
                this.state = REJECTED;
                this.result = result;
            }
        };

        func(resolve, reject);
    }

    then (onFulfilled, onRejected) {
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : x => x;
        onRejected = typeof onRejected === 'function' ? onRejected : x => {
            throw x;
        };

        if (this.state === FULFILLED) {
            onFulfilled(this.result);
        } else if (this.state === REJECTED) {
            onRejected(this.result);
        }
    }
}

/* 测试代码 */
const p = new MyPromise((resolve, reject) => {
    resolve('success');
    // reject('error');
});

p.then(res => {
    console.log('成功回调', res);
}, err => {
    console.log('失败回调', err);
});
// p.then(res => {
//     console.log('成功回调', res);
// });