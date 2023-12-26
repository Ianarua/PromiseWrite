/* 1. 定义生成器函数*/
function* itheimaGenerator () {
    console.log('itheimaGenerator');
    yield 'it';
    yield 'heima';
    yield '666';
}

/* 2. 获取 Generator对象 */
const itheima = itheimaGenerator();

/* 3. 调用next方法 */
/*
console.log(itheima.next().value);
console.log(itheima.next().value);
console.log(itheima.next().value);
console.log(itheima.next().value);
*/

/* 4. 或者调用for of*/
for (const iterator of itheima) {
    console.log(iterator);
}