const assert = require("assert");
const {invalid, parse} = require("../lib/validator/once");

describe('validator', function(){

    it('once-a-day parse() should throw Error on undefined config', ()=> {
        assert.throws( 
            ()=>{parse()}, 
            /^Error: dayUpdateTime does not exists or not a string$/);
    })    

    it('once-a-day parse() should throw Error on empty-object config', ()=> {
        assert.throws( 
            ()=>{parse({})}, 
            /^Error: dayUpdateTime does not exists or not a string$/);
    })    

    it('once-a-day parse() should throw Error on h=24', ()=> {
        assert.throws( 
            ()=>{parse({time:'24:0:0'})}, 
            /^Error: wrong dayUpdateTime hours \[24\]$/);
    })

    it('once-a-day parse() should throw Error on h=-2', ()=> {
        assert.throws( 
            ()=>{parse({time:'-2:0:0'})}, 
            /^Error: wrong dayUpdateTime hours \[-2\]$/);
        
//        var x = invalid({}, {time:'24:59:59'});
//        console.log( "x", x);
    })    

    it('once-a-day parse() should throw Error on m=62', ()=> {
        assert.throws( 
            ()=>{parse({time:'23:62:0'})}, 
            /^Error: wrong dayUpdateTime minutes \[62\]$/);
    })

    it('once-a-day parse() should throw Error on m=-2', ()=> {
        assert.throws( 
            ()=>{parse({time:'23:-2:0'})}, 
            /^Error: wrong dayUpdateTime minutes \[-2\]$/);
    })

    it('once-a-day parse() should throw Error on s=62', ()=> {
        assert.throws( 
            ()=>{parse({time:'23:59:62'})}, 
            /^Error: wrong dayUpdateTime seconds \[62\]$/);
    })

    it('once-a-day parse() should throw Error on s=-2', ()=> {
        assert.throws( 
            ()=>{parse({time:'23:59:-2'})}, 
            /^Error: wrong dayUpdateTime seconds \[-2\]$/);
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
            /^Error: wrong dayUpdateTime hours \[NaN\]$/);

/*        var expected = new Date();
        expected.setHours(23, 1, 0, 0);

        var actual = parse({time:'abc'});

        console.log(actual);
        assert.equal(actual.getTime(), expected.getTime());*/
    })    

    it('once-a-day parse() should throw Error on m=abc', ()=> {
        assert.throws( 
            ()=>{parse({time:'23:abc'})}, 
            /^Error: wrong dayUpdateTime minutes \[NaN\]$/);
    })

    it('once-a-day parse() should throw Error on s=abc', ()=> {
        assert.throws( 
            ()=>{parse({time:'23:59:abc'})}, 
            /^Error: wrong dayUpdateTime seconds \[NaN\]$/);
    })
/*
    it('once-a-day parse() should throw Error on wrong pattern', ()=> {
        assert.throws( 
            ()=>{parse({time:'23-59:abc'})}, 
            /^Error: dayUpdateTime does not match pattern \[23-59:abc\]$/);
    })
*/
})