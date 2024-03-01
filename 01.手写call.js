Function.prototype.myCall = function (thisArg, ...args) {
    // console.log('----', this);       // func
    const key = Symbol('key');
    thisArg[key] = this;        // 相当于在person里面加了一个属性function func (numA, numB)
    const res = thisArg[key](...args);  // 执行function func (numA, numB)
    delete thisArg[key];
    return res;
};


/* 测试代码 */
const person = {
    name: 'writeMyCall'
};

function func (numA, numB) {
    // console.log(this);          // person(因为myCall)
    return numA + numB;
}

const res = func.myCall(person, 6, 4);
console.log('返回值为：', res);