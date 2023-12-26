/**
 * 状态及原因
 *  1. 添加状态(pending / fulfilled / rejected)
 *  2. 添加原因
 *  3. 调整resolve / reject
 *  4. 状态不可逆
 */
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class MyPromise {
    // 1. 添加状态
    state = PENDING;
    // 2. 添加原因
    result = undefined;

    constructor (func) {
        // 3. 调整resolve / reject
        // 4. 状态不可逆
        const resolve = (result) => {
            // 改状态： pending -> fulfilled
            // 记录原因
            if (this.state === PENDING) {
                this.state = FULFILLED;
                this.result = result;
            }
        };
        const reject = (result) => {
            // 改状态： pending -> rejected
            // 记录原因
            if (this.state === PENDING) {
                this.state = REJECTED;
                this.result = result;
            }
        };

        func(resolve, reject);
    }
}

/* 测试代码 */
const p = new MyPromise((resolve, reject) => {
    resolve('success');
    reject('error');
});

// p.state
// p.result