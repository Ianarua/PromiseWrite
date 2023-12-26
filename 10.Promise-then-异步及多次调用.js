/**
 * then方法-异步及多次调用
 *  1. 定义实例属性
 *  2. 保存回调函数
 *  3. 调用成功回调
 *  4. 调用失败回调
 */
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class MyPromise {
    state = PENDING;
    result = undefined;
    // 1. 定义实例属性
    #handlers = []; // [{onFulfilled, onRejected}...]
    constructor (func) {
        const resolve = (result) => {
            // 改状态： pending -> fulfilled
            if (this.state === PENDING) {
                this.state = FULFILLED;
                this.result = result;
                // 3. 调用成功回调
                this.#handlers.forEach(({onFulfilled}) => {
                    onFulfilled(this.result);
                });
            }
        };
        const reject = (result) => {
            // 改状态： pending -> rejected
            if (this.state === PENDING) {
                this.state = REJECTED;
                this.result = result;
                // 4. 调用失败回调
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

        if (this.state === FULFILLED) {
            onFulfilled(this.result);
        } else if (this.state === REJECTED) {
            onRejected(this.result);
        } else if (this.state === PENDING) {
            // 2. 保存回调函数
            this.#handlers.push({
                onFulfilled, onRejected
            });
        }
    }
}

/* 测试代码 */
const p = new MyPromise((resolve, reject) => {
    setTimeout(() => {
        resolve('success');
        // reject('error');
    }, 2000);
});

p.then(res => {
    console.log('then1', res);
}, err => {
    console.log('then1', err);
});

p.then(res => {
    console.log('then2', res);
}, err => {
    console.log('then2', err);
});
