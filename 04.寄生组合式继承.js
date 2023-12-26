/* 通过构造函数来继承属性，通过原型链继承方法 */


/* 父类 */
function Person (name) {
    this.name = name;
}

Person.prototype.sayHi = function () {
    console.log(`你好，我叫${ this.name }`);
};

/* ------------寄生组合式继承 核心代码------------ */

/* 通过构造函数继承属性 */
function Student (name) {
    Person.call(this, name);
}

/* 通过原型链继承方法 */
const prototype = Object.create(Person.prototype, {
    constructor: {
        value: Student
    }
});
Student.prototype = prototype;

const s = new Student('itheima');
const p = new Person('itheima2');