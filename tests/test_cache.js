const assert = require("assert");
const {put, get, remove, invalidate_all} = require("../lib/cache");



describe('cache', function(){
    this.timeout(300 * 1000);

    beforeEach(function(){
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
        return put("forever", "a", 1)
        .then(()=>{
          return get("forever", "a");
        }).then(res => {
            assert.equal( 1, res);
        }).then(res => {
            return remove("forever", "a");
        }).then(()=>{
            return get("forever", "a");
        }).then(res => {
            assert.equal( undefined, res);
        })
    })
})