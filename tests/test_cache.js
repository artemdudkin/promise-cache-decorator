const assert = require("assert");
const {put, get, remove, invalidate_all} = require("../lib/cache");
const {getSettings} = require("../lib/settings");



describe('cache', function(){
    this.timeout(300 * 1000);

    afterEach(function(){
        invalidate_all();
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
        const opt = Object.assign({}, getSettings());

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
})