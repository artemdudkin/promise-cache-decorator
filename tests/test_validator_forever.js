const assert = require("assert");
const {invalid, parse} = require("../lib/validator/forever");

describe('forever validator', function(){

    it('should return false', ()=> {
        assert.equal( false, invalid());
        assert.equal( false, invalid({}));
        assert.equal( false, invalid({}, 123));
        assert.equal( false, invalid({}, '123'));
        assert.equal( false, invalid({}, {}));
    })
})