const assert = require("assert");
const sinon = require("sinon");
const {invalid} = require("../lib/validator/age");

assertConsoleErrorWithFalseFunc = (func, message) => {
    var actual = func();
    assert.equal(true, actual);
    assert.ok(console.error.calledOnce);
    assert.equal(message, console.error.getCall(0).args[0]);
    console.error.resetHistory();
}

describe('validator:age', function(){
    it('opt.maxAge should be number', ()=> {
        sinon.spy(console, "error");

        assertConsoleErrorWithFalseFunc(
            () => invalid({}, { maxAge: '123' }),
            "ERROR: opt.maxAge @ \"age\" validator does not exists or not a number [123]");

        assertConsoleErrorWithFalseFunc(
            () => invalid({}, { maxAge: {} }),
            "ERROR: opt.maxAge @ \"age\" validator does not exists or not a number [[object Object]]");

        assertConsoleErrorWithFalseFunc(
            () => invalid({}, {}),
            "ERROR: opt.maxAge @ \"age\" validator does not exists or not a number [undefined]");

        assertConsoleErrorWithFalseFunc(
            () => invalid({}),
            "ERROR: opt.maxAge @ \"age\" validator does not exists or not a number [undefined]");

        assertConsoleErrorWithFalseFunc(
            () => invalid({}, 123),
            "ERROR: opt.maxAge @ \"age\" validator does not exists or not a number [undefined]");

        assertConsoleErrorWithFalseFunc(
            () => invalid({}, '123'),
            "ERROR: opt.maxAge @ \"age\" validator does not exists or not a number [undefined]");

        console.error.restore();
    })    

    it('NOT invalid() @ item.ts + maxAge is greater then current time', ()=> {
        var ts = Date.now() - 3000; // item.ts is 3 seconds ago

        const missed = invalid({ts}, {maxAge:5000});
        assert.ok( !missed);
    })

    it('invalid() @ item.ts + maxAge is less then current time', ()=> {
        var ts = Date.now() - 3000; // item.ts is 3 seconds ago

        const missed = invalid({ts}, {maxAge:1000});
        assert.ok( missed);
    })

    it('NOT invalid() @ item.ts + maxAge is equal current time', ()=> {
        var ts = Date.now() - 3000; // item.ts is 3 seconds ago

        const missed = invalid({ts}, {maxAge:3000});
        assert.ok( !missed);
    })

})