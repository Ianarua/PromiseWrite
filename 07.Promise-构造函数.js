/**
 * 构造函数
 *  1. 定义类
 *  2. 添加构造函数
 *  3. 定义resolve/reject
 *  4. 执行回调函数
 */
class MyPromise {
    constructor (func) {
        const resolve = (result) => {
            console.log('resolve执行--', result);
        };
        const reject = (result) => {
            console.log('reject执行--', result);
        };

        func(resolve, reject);
    }
}

/* 测试代码 */
const p = new MyPromise((resolve, reject) => {
    console.log('执行');
    resolve('success');
    reject('failed');
});