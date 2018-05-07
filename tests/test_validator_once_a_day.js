const assert = require("assert");
const sinon = require("sinon");
const {invalid, parse} = require("../lib/validator/once_a_day");

var startOfDay = new Date();
startOfDay.setHours(0, 0, 0, 0);

assertConsoleErrorWithStartOfDay = (func, message) => {
    var actual = func();
    assert.equal( startOfDay.getTime(), actual.getTime());
    assert.ok(console.error.calledOnce);
    assert.equal(message, console.error.getCall(0).args[0]);
    console.error.resetHistory();
}

describe('validator:once-a-day', function(){

    beforeEach(function(){
        sinon.spy(console, "error");
    })

    afterEach(function(){
        console.error.restore();
    });

    it('once-a-day parse() should throw Error on h=24', ()=> {
        assertConsoleErrorWithStartOfDay( 
            () => parse({time:'24:0:0'}), 
            "ERROR: wrong hours @ opt.time @ \"once-a-day\" validator [24]");
    })

    it('once-a-day parse() should throw Error on h=-2', ()=> {
        assertConsoleErrorWithStartOfDay( 
            () => parse({time:'-2:0:0'}), 
            "ERROR: wrong hours @ opt.time @ \"once-a-day\" validator [-2]");
    })    

    it('once-a-day parse() should throw Error on m=62', ()=> {
        assertConsoleErrorWithStartOfDay( 
            () => parse({time:'23:62:0'}), 
            "ERROR: wrong minutes @ opt.time @ \"once-a-day\" validator [62]");
    })

    it('once-a-day parse() should throw Error on m=-2', ()=> {
        assertConsoleErrorWithStartOfDay( 
            () => parse({time:'23:-2:0'}), 
            "ERROR: wrong minutes @ opt.time @ \"once-a-day\" validator [-2]");
    })

    it('once-a-day parse() should throw Error on s=62', ()=> {
        assertConsoleErrorWithStartOfDay( 
            () => parse({time:'23:59:62'}), 
            "ERROR: wrong seconds @ opt.time @ \"once-a-day\" validator [62]");
    })

    it('once-a-day parse() should throw Error on s=-2', ()=> {
        assertConsoleErrorWithStartOfDay( 
            () => parse({time:'23:59:-2'}), 
            "ERROR: wrong seconds @ opt.time @ \"once-a-day\" validator [-2]");
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
        assertConsoleErrorWithStartOfDay( 
            () => parse({time:'abc'}), 
            "ERROR: wrong hours @ opt.time @ \"once-a-day\" validator [NaN]");
    })    

    it('once-a-day parse() should throw Error on m=abc', ()=> {
        assertConsoleErrorWithStartOfDay( 
            () => parse({time:'23:abc'}), 
            "ERROR: wrong minutes @ opt.time @ \"once-a-day\" validator [NaN]");
    })

    it('once-a-day parse() should throw Error on s=abc', ()=> {
        assertConsoleErrorWithStartOfDay( 
            () => parse({time:'23:59:abc'}), 
            "ERROR: wrong seconds @ opt.time @ \"once-a-day\" validator [NaN]");
    })

    it('opt.time should be string @ parse()', ()=> {
        assertConsoleErrorWithStartOfDay( 
            () => parse(), 
            "ERROR: opt.time @ \"once-a-day\" validator does not exists or not a string [undefined]");

        assertConsoleErrorWithStartOfDay( 
            () => parse({}), 
            "ERROR: opt.time @ \"once-a-day\" validator does not exists or not a string [undefined]");

        assertConsoleErrorWithStartOfDay( 
            () => parse({ time: 123 }),
            "ERROR: opt.time @ \"once-a-day\" validator does not exists or not a string [123]");

        assertConsoleErrorWithStartOfDay( 
            () => parse({ time: {} }),
            "ERROR: opt.time @ \"once-a-day\" validator does not exists or not a string [[object Object]]");

        const actial = parse({time:""});
        var expected = new Date();
        expected.setHours(0, 0, 0, 0);
        assert.equal( expected.getTime(), actial.getTime());
    })    

    it('once-a-day NOT invalid() @ item.ts before updateTime & current time before updateTime', ()=> {
        var ts = Date.now() - 3000; // item.ts is 3 seconds ago

        var dt = new Date( (new Date()).getTime() + 3000);  //update time is in 3 seconds
        var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();

        const missed = invalid({time}, {ts});
        assert.ok( !missed);
    })

    it('once-a-day invalid() @ item.ts == undefined', ()=> {
        var dt = new Date( (new Date()).getTime() + 3000);  //update time is in 3 seconds
        var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();

        const missed = invalid({time}, {});
        assert.ok( missed);
    })

    it('once-a-day invalid() @ item.ts before updateTime & current time after updateTime', ()=> {
        var ts = Date.now() - 5000; // item.ts is 5 seconds ago

        var dt = new Date( (new Date()).getTime() - 3000);  //update time is 3 seconds ago
        var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();

        const missed = invalid({time}, {ts});
        assert.ok( missed);
    })

    it('once-a-day NOT invalid() @ item.ts after updateTime & current time after updateTime', ()=> {
        var ts = Date.now() - 3000; // item.ts is 3 seconds ago

        var dt = new Date( (new Date()).getTime() - 5000);  //update time is 5 seconds ago
        var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();

        const missed = invalid({time}, {ts});
        assert.ok( !missed);
    })

    it('(weird) once-a-day invalid() @ item.ts after updateTime & current time before updateTime', ()=> {
        var ts = Date.now() - 3000; // item.ts is 3 seconds ago

        var dt = new Date( (new Date()).getTime() - 5000);  //update time is 5 seconds ago
        var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();

        const missed = invalid({time}, {ts});
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