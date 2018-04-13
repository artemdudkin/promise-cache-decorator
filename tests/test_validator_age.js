const assert = require("assert");
const {invalid, parse} = require("../lib/validator/age");

describe('age validator', function(){

    it('opt.maxAge should be number', ()=> {
        assert.throws(
            () => { invalid({}, { maxAge: '123' }) },
            /^Error: opt.maxAge @ \"age\" validator does not exists or not a number \[123\]$/);

        assert.throws(
            () => { invalid({}, { maxAge: {} }) },
            /^Error: opt.maxAge @ \"age\" validator does not exists or not a number \[\[object Object\]\]$/);

        assert.throws(
            () => { invalid({}, {}) },
            /^Error: opt.maxAge @ \"age\" validator does not exists or not a number \[undefined\]$/);
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