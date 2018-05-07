const assert = require("assert");
const sinon = require("sinon");
const validator = require("../lib/validator");
const {setSettings} = require("../lib/settings");

describe('validator', function(){

    afterEach(function(){
        if (console.warn.isSinonProxy) console.warn.restore();
    })

    it('opt should be object', ()=> {
        sinon.spy(console, "warn");

        var v = validator.get();
        var invalid = v.invalid();

        assert.ok(!invalid, "validator.get().invalid() should be false");
        assert.ok(console.warn.calledOnce);
        assert.equal("WARNING: no such validator type \"undefined\", will use \"forever\"", console.warn.getCall(0).args[0]);
    })

    it('opt should use type from settings', ()=> {
        sinon.spy(console, "warn");

        setSettings({type:"age"});

        var v = validator.get();
        var invalid = v.invalid();

        assert.ok(console.warn.calledOnce);
        assert.equal("WARNING: no such validator type \"undefined\", will use \"age\"", console.warn.getCall(0).args[0]);
    })    

    it('should return true after isExists call, for "forever" etc. and false otherwise', ()=> {
        assert.ok( validator.isExists("forever"), "forever really exists");
        assert.ok( validator.isExists("age"), "age really exists");
        assert.ok( validator.isExists("once-a-day"), "once-a-day really exists");

        assert.ok( !validator.isExists("xxx"), "xxx does not exists");
        validator.register("xxx", ()=>true);
        assert.ok( validator.isExists("xxx"), "xxx now exists");
        validator.unregister("xxx");
        assert.ok( !validator.isExists("xxx"), "xxx not exists again");
    })

})