const assert = require("assert");
const {invalid} = require("../lib/validator/forever");

describe('validator:forever', function(){

    it('should return false', ()=> {
        assert.equal( false, invalid());
        assert.equal( false, invalid({}));
        assert.equal( false, invalid({}, 123));
        assert.equal( false, invalid({}, '123'));
        assert.equal( false, invalid({}, {}));
    })
})