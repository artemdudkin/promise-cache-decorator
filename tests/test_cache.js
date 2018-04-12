const assert = require("assert");
const {put, get, invalidate_all} = require("../lib/cache");



describe('cache', function(){
    this.timeout(300 * 1000);

    it('cache key sould be string @ put', ()=> {
        invalidate_all();

        assert.throws( 
            ()=>{put()}, 
            /^Error: cache key sould be string$/);
    })

    it('cache key sould be string @ get', ()=> {
        invalidate_all();

        assert.throws( 
            ()=>{get()}, 
            /^Error: cache key sould be string$/);
    })


    it('put + get', (done)=> {
        invalidate_all();

        put("forever", "a", 1)
        .then(()=>{
          get("forever", "a").then(res => {
            assert.equal( 1, res);
            done();
          })
        })
    })

// add tests for   
//if (typeof id != 'string') throw new Error('cache key sould be string');

})