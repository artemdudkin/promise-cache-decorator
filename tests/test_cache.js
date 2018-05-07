const assert = require("assert");
const sinon = require("sinon");
const {put, get, remove, clear} = require("../lib/cache");
const {getSettings} = require("../lib/settings");



describe('cache', function(){
    this.timeout(300 * 1000);

    afterEach(function(){
        clear();
        if (console.warn.isSinonProxy) console.warn.restore();
    });

    it('cache key sould be string @ put', ()=> {
        assert.throws( 
            ()=>{put()}, 
            /^Error: cache key sould be string$/);
    })

    it('cache key sould be string @ get', ()=> {
        assert.throws( 
            ()=>{get()}, 
            /^Error: cache key sould be string$/);
    })


    it('put + get + delete + get', ()=> {
        const opt = getSettings();

        return put(opt, "a", 1)
        .then(()=>{
          return get(opt, "a");
        }).then(res => {
            assert.equal( 1, res);
        }).then(res => {
            return remove(opt, "a");
        }).then(()=>{
            return get(opt, "a");
        }).then(res => {
            assert.equal( undefined, res);
        })
    })

    it('warning if there is no load method at opt', ()=> {
        sinon.spy(console, "warn");

        const opt = getSettings();
        opt.storage.load = 1;

        return get(opt, "a")
        .then(res => {
            assert.ok(console.warn.calledOnce);
            assert.equal("WARNING: there is no storage.load at", console.warn.getCall(0).args[0]);
        })
    })    

    it('warning if there is no save method at opt', ()=> {
        sinon.spy(console, "warn");

        const opt = getSettings();
        opt.storage.save = 1;

        return put(opt, "a", 1)
        .then(res => {
            assert.ok(console.warn.calledOnce);
            assert.equal("WARNING: there is no storage.save at", console.warn.getCall(0).args[0]);
        })
    })    

    it('warning if there is no remove method at opt', ()=> {
        sinon.spy(console, "warn");

        const opt = getSettings();
        opt.storage.remove = 1;

        return remove(opt, "a")
        .then(res => {
            assert.ok(console.warn.calledOnce);
            assert.equal("WARNING: there is no storage.remove at", console.warn.getCall(0).args[0]);
        })
    })    

})