const assert = require("assert");
const {invalid, parse} = require("../lib/validator/once_a_day");

describe('validator:once-a-day', function(){

    it('once-a-day parse() should throw Error on h=24', ()=> {
        assert.throws( 
            ()=>{parse({time:'24:0:0'})}, 
            /^Error: wrong hours @ opt.time @ \"once-a-day\" validator \[24\]$/);
    })

    it('once-a-day parse() should throw Error on h=-2', ()=> {
        assert.throws( 
            ()=>{parse({time:'-2:0:0'})}, 
            /^Error: wrong hours @ opt.time @ \"once-a-day\" validator \[-2\]$/);
        
//        var x = invalid({}, {time:'24:59:59'});
//        console.log( "x", x);
    })    

    it('once-a-day parse() should throw Error on m=62', ()=> {
        assert.throws( 
            ()=>{parse({time:'23:62:0'})}, 
            /^Error: wrong minutes @ opt.time @ \"once-a-day\" validator \[62\]$/);
    })

    it('once-a-day parse() should throw Error on m=-2', ()=> {
        assert.throws( 
            ()=>{parse({time:'23:-2:0'})}, 
            /^Error: wrong minutes @ opt.time @ \"once-a-day\" validator \[-2\]$/);
    })

    it('once-a-day parse() should throw Error on s=62', ()=> {
        assert.throws( 
            ()=>{parse({time:'23:59:62'})}, 
            /^Error: wrong seconds @ opt.time @ \"once-a-day\" validator \[62\]$/);
    })

    it('once-a-day parse() should throw Error on s=-2', ()=> {
        assert.throws( 
            ()=>{parse({time:'23:59:-2'})}, 
            /^Error: wrong seconds @ opt.time @ \"once-a-day\" validator \[-2\]$/);
    })

    it('once-a-day parse("23") should return 23:00:00', ()=> {
        var expected = new Date();
        expected.setHours(23, 0, 0, 0);

        var actual = parse({time:'23'});

        assert.equal(actual.getTime(), expected.getTime());
    })    

    it('once-a-day parse("23:01") should return 23:01:00', ()=> {
        var expected = new Date();
        expected.setHours(23, 1, 0, 0);

        var actual = parse({time:'23:01'});

        assert.equal(actual.getTime(), expected.getTime());
    })    

    it('once-a-day parse() should throw Error on h=abc', ()=> {
        assert.throws( 
            ()=>{parse({time:'abc'})}, 
            /^Error: wrong hours @ opt.time @ \"once-a-day\" validator \[NaN\]$/);
    })    

    it('once-a-day parse() should throw Error on m=abc', ()=> {
        assert.throws( 
            ()=>{parse({time:'23:abc'})}, 
            /^Error: wrong minutes @ opt.time @ \"once-a-day\" validator \[NaN\]$/);
    })

    it('once-a-day parse() should throw Error on s=abc', ()=> {
        assert.throws( 
            ()=>{parse({time:'23:59:abc'})}, 
            /^Error: wrong seconds @ opt.time @ \"once-a-day\" validator \[NaN\]$/);
    })

    it('opt.time should be string @ parse()', ()=> {
        assert.throws( 
            ()=>{parse()}, 
            /^Error: opt.time @ \"once-a-day\" validator does not exists or not a string \[undefined\]$/);

        assert.throws( 
            ()=>{parse({})}, 
            /^Error: opt.time @ \"once-a-day\" validator does not exists or not a string \[undefined\]$/);

        assert.throws(
            () => { parse({ time: 123 }) },
            /^Error: opt.time @ \"once-a-day\" validator does not exists or not a string \[123\]$/);

        assert.throws(
            () => { parse({ time: {} }) },
            /^Error: opt.time @ \"once-a-day\" validator does not exists or not a string \[\[object Object\]\]$/);

        const actial = parse({time:""});
        var expected = new Date();
        expected.setHours(0, 0, 0, 0);
        assert.equal( expected.getTime(), actial.getTime());
    })

    it('once-a-day NOT invalid() @ item.ts before updateTime & current time before updateTime', ()=> {
        var ts = Date.now() - 3000; // item.ts is 3 seconds ago

        var dt = new Date( (new Date()).getTime() + 3000);  //update time is in 3 seconds
        var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();

        const missed = invalid({ts}, {time});
        assert.ok( !missed);
    })

    it('once-a-day invalid() @ item.ts before updateTime & current time after updateTime', ()=> {
        var ts = Date.now() - 5000; // item.ts is 5 seconds ago

        var dt = new Date( (new Date()).getTime() - 3000);  //update time is 3 seconds ago
        var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();

        const missed = invalid({ts}, {time});
        assert.ok( missed);
    })

    it('once-a-day NOT invalid() @ item.ts after updateTime & current time after updateTime', ()=> {
        var ts = Date.now() - 3000; // item.ts is 3 seconds ago

        var dt = new Date( (new Date()).getTime() - 5000);  //update time is 5 seconds ago
        var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();

        const missed = invalid({ts}, {time});
        assert.ok( !missed);
    })

    it('(weird) once-a-day invalid() @ item.ts after updateTime & current time before updateTime', ()=> {
        var ts = Date.now() - 3000; // item.ts is 3 seconds ago

        var dt = new Date( (new Date()).getTime() - 5000);  //update time is 5 seconds ago
        var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();

        const missed = invalid({ts}, {time});
        assert.ok( !missed);
    })


/*
    it('once-a-day parse() should throw Error on wrong pattern', ()=> {
        assert.throws( 
            ()=>{parse({time:'23-59:abc'})}, 
            /^Error: dayUpdateTime does not match pattern \[23-59:abc\]$/);
    })
*/
})