import assert from "assert";
import {cache, init, set_load_all, set_save, invalidate_all, register_validator} from "../index";

var loader_called = false;

class A {
    constructor() {
        this.test = "test";
    }
    @cache({
        type:"forever",
        tardy:"show_loader"
    })
    get(data){
        var me = this;
        return new Promise((resolve, reject)=>{
            setTimeout(function(){
                data.test = me.test;
                if (data.a && data.b) data.sum=data.a + data.b;
                resolve(data);
            }, 2000);
        })
    }

    show_loader(){
        loader_called = true;
    }
}

describe('es6 decorator', function(){
    this.timeout(300 * 1000);

    it('should miss and hit on cached forever (promise)', (done)=> {
        invalidate_all();

        var start = Date.now();

        const a = new A();

        a.get({a:1,b:2})
        .then(res=>{
            let delta = Date.now() - start;
            assert.ok( delta > 1900 && delta < 3000, "cache miss should be greater 2000 while it is " + delta);
            assert.equal("test", res.test, "class instance context is lost");
            assert.ok( loader_called, "should start 'tardy' on first call");
        }).then(res=>{
            start = Date.now();
            loader_called = false;
            return a.get({a:1,b:2})
        }).then(res=>{
            let delta = Date.now() - start;
            assert.ok( delta < 100, "cache hit should be less then 100 while it is " + delta);
            assert.ok( !loader_called, "should not start 'tardy' on second call");
            done();
        }).catch(done);
    })    
})