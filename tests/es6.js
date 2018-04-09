const assert = require("assert");
const {cache, init, set_load_all, set_save, invalidate_all, register_validator} = require("../index");


class A {
    @cache("forever")
    cf(data){
        return new Promise((resolve, reject)=>{
            setTimeout(function(){
                if (data.a && data.b) data.sum=data.a + data.b;
                resolve(data);
            }, 2000);
        })
    }
}

describe('es6', function(){
    this.timeout(300 * 1000);

    it('should miss and hit on cached forever (promise)', (done)=> {
        invalidate_all();

        var start = Date.now();

        const a = new A();

        a.cf({a:1,b:2})
        .then(res=>{
            let delta = Date.now() - start;
            assert.ok( delta > 1900 && delta < 3000, "cache miss should be greater 2000 while it is " + delta);
        }).then(res=>{
            start = Date.now();
            return a.cf({a:1,b:2})
        }).then(res=>{
            let delta = Date.now() - start;
            assert.ok( delta < 100, "cache hit should be less then 100 while it is " + delta);
            done();
        }).catch(err=>{
            done(new Error(err));
        })
    })    
})