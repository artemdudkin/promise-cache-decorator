const assert = require("assert");
const sinon = require("sinon");
const validator = require("../lib/validator");

describe('validator', function(){

    it('opt should be object', ()=> {
        sinon.spy(console, "warn");

        var v = validator.get();
        var invalid = v.invalid();

        assert.ok(!invalid, "validator.get().invalid() should be false");
        assert.ok(console.warn.calledOnce);
        assert.equal("WARNING: no such validator type \"undefined\", will use \"forever\"", console.warn.getCall(0).args[0]);

        console.warn.restore();
    })    

})