const runAsynctask = (callback) => {
    if (typeof queueMicrotask === 'function') {
        queueMicrotask(callback);
    } else if (typeof MutationObserver === 'function') {
        const obs = new MutationObserver(callback);
        const divNode = document.createElement('div');
        obs.observe(divNode, {childList: true});
    }
};

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

const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class MyPromise {
    state = PENDING;
    result = undefined;
    private handlers = [];

    constructor (func) {
        const resolve = (result) => {
            this.state = FULFILLED;
            this.result = result;
            this.handlers.forEach(({onFulfilled}) => {
                onFulfilled(this.result);
            });
        };

        const reject = (result) => {
            this.state = REJECTED;
            this.result = result;
            this.handlers.forEach(({onRejected}) => {
                onRejected(this.result);
            });
        };

        func(resolve, reject);
    }

    then (onFulfilled, onRejected) {
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : x => x;
        onRejected = typeof onRejected === 'function' ? onRejected : x => {
            throw x;
        };

        const p2 = MyPromise((resolve, reject) => {
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
                    const x = onRejected(this.result);
                    resolvePromise(p2, x, resolve, reject);
                });
            } else if (this.state === PENDING) {
                this.handlers.push({
                    onFulfilled: () => {
                        runAsynctask(() => {
                            try {
                                const x = onFulfilled(this.result);
                                resolvePromise(p2, x, resolve, reject);
                            } catch (e) {
                                reject(e);
                            }
                        });
                    }, onRejected: () => {
                        runAsynctask(() => {
                            try {
                                const x = onRejected(this.result);
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
        return this.then(undefined, onRejected);
    }

    finally (onFinally) {
        return this.then(onFinally, onFinally);
    }
}