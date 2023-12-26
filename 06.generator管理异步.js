function* cityGenerator () {
    yield axios('http://hmajax.itheima.net/api/city?pname=北京');
    yield axios('http://hmajax.itheima.net/api/city?pname=广东省');
}

const gen = cityGenerator();
gen.next().value.then(res => {
    console.log(res);
    return gen.next().value;
}).then(res => {
    console.log(res);
});