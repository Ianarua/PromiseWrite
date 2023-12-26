Function.prototype.myApply = function (thisArg, args) {
    const key = Symbol('key');
    thisArg[key] = this;
    const res = thisArg[key](...args);
    delete thisArg[key];
    return res;
};


/* 测试代码 */
const person = {
    name: 'writeMyApply'
};

function func (numA, numB) {
    console.log(this);
    console.log(numA, numB);
    return numA + numB;
}

const res = func.myApply(person, [2, 8]);
console.log('返回值为：', res);