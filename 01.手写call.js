Function.prototype.myCall = function (thisArg, ...args) {
    console.log('----', this);       // func
    const key = Symbol('key');
    thisArg[key] = this;
    const res = thisArg[key](...args);
    delete thisArg[key];
    return res;
};


/* 测试代码 */
const person = {
    name: 'writeMyCall'
};

function func (numA, numB) {
    console.log(this);          // person(因为myCall)
    console.log(numA, numB);
    return numA + numB;
}

const res = func.myCall(person, 6, 4);
console.log('返回值为：', res);