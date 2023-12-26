Function.prototype.myBind = function (thisArg, ...args) {
    // console.log('myBind调用了');
    return (...reArgs) => {
        // this:原函数(原函数.myBind)
        return this.call(thisArg, ...args, ...reArgs);
    };
};


/* 测试代码 */
const person = {
    name: 'writeMyBind'
};

function func (numA, numB, numC, numD) {
    console.log(this);
    console.log(numA, numB, numC, numD);
    return numA + numB + numC + numD;
}

const bindFunc = func.myBind(person, 1, 2);

const res = bindFunc(3, 4);
console.log('返回值：', res);