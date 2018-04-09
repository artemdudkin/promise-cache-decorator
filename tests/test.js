const assert = require("assert");
const {cache, init, set_load_all, set_save, invalidate_all, register_validator} = require("../index");


var p = (data) => {
    return new Promise((resolve, reject)=>{
      setTimeout(function(){
        if (data.a && data.b) data.sum=data.a + data.b;
        resolve(data);
    }, 2000);
    })
}

describe('vanilla js', function(){
    this.timeout(300 * 1000);

    it('should miss and miss on uncached (promise)', (done)=> {
        invalidate_all();

        var start = Date.now();

        p({a:1,b:2})
        .then(res=>{
            let delta = Date.now() - start;
            assert.ok( delta > 1900 && delta < 3000, "cache miss should be greater 2000 while it is " + delta);
        }).then(res=>{
            start = Date.now();
            return p({a:1,b:2})
        }).then(res=>{
            let delta = Date.now() - start;
            assert.ok( delta > 1900 && delta < 3000, "cache miss should be greater 2000 while it is " + delta);
            done();
        }).catch(err=>{
            done(new Error(err));
        })
    })    

    it('should miss and hit on cached forever (function)', ()=> {
        invalidate_all();

        var fired=false;
        var f = function(a, b){
            fired=true;
            return a+b
        }
        var ff = cache("forever")(f);

        var actual;
        actual = ff(1, 2);
        assert.equal( 3, actual, "result of the function is 3");
        assert.equal( true, fired, "function should be fired");

        fired=false;
        actual = ff(1, 2);
        assert.equal( 3, actual, "result of the function is 3");
        assert.equal( false, fired, "function should NOT be fired");
    })
    

    it('should miss and hit on cached forever (promise)', (done)=> {
        invalidate_all();
        var pp = cache("forever")(p);

        var start = Date.now();

        pp({a:1,b:2})
        .then(res=>{
            let delta = Date.now() - start;
            assert.ok( delta > 1900 && delta < 3000, "cache miss should be greater 2000 while it is " + delta);
        }).then(res=>{
            start = Date.now();
            return pp({a:1,b:2})
        }).then(res=>{
            let delta = Date.now() - start;
            assert.ok( delta < 100, "cache hit should <100 while it is " + delta);
            done();
        }).catch(err=>{
            done(new Error(err));
        })
    })

    it('should miss and miss with cache ttl 1s (on 2s pause)', (done)=> {
        invalidate_all();
        var pp = cache("forever")(p);
        var ppp = cache({type:"time", ms:1000})(p);

        var start = Date.now();        
        pp({a:1,b:2})
        .then(res=>{
            let delta = Date.now() - start;
            assert.ok( delta > 1900 && delta < 3000, "cache miss should be greater 2000 while it is " + delta);
        }).then(res=>{
            start = Date.now();
            return ppp({a:1,b:2})
        }).then(res=>{
            let delta = Date.now() - start;
            assert.ok( delta < 100, "cache hit should <100 while it is " + delta);
            done();
        }).catch(err=>{
            done(new Error(err));
        })
    })

    
    it('should miss and hit with cache ttl 5s (on 2s pause)', (done)=> {
        invalidate_all();
        var pp = cache()(p);
        var ppp = cache({type:"time", ms:5000})(p);

        var start = Date.now();
        pp({a:1,b:2})
        .then(res=>{
            let delta = Date.now() - start;
            assert.ok( delta > 1900 && delta < 3000, "cache miss should be greater 2000 while it is " + delta);
        }).then(res=>{
            start = Date.now();
            return ppp({a:1,b:2})
        }).then(res=>{
            let delta = Date.now() - start;
            assert.ok( delta < 100, "cache hit should <100 while it is " + delta);
            done();
        }).catch(err=>{
            done(new Error(err));
        })
    })

    it('should miss and miss on always-miss-validator', (done)=>{
        invalidate_all();
        register_validator("always-miss", function invalid(item, opt){
            return true;
        });

        var pp = cache("always-miss")(p);

        var start = Date.now();

        pp({a:1,b:2})
        .then(res=>{
            let delta = Date.now() - start;
            assert.ok( delta > 1900 && delta < 3000, "cache miss should be greater 2000 while it is " + delta);
        }).then(res=>{
            start = Date.now();
            return pp({a:1,b:2})
        }).then(res=>{
            let delta = Date.now() - start;
            assert.ok( delta > 1900 && delta < 3000, "cache miss should be greater 2000 while it is " + delta);
            done();
        }).catch(err=>{
            done(new Error(err));
        })
    })

    it("should fire 'tardy' on slow promises", (done)=> {
        invalidate_all();

        var fired = false;
        var pp = cache("forever", {
            tardy:()=>{
                let delta = Date.now() - start;
                assert.ok( delta > 900 && delta < 1500, "'tardy' should be fired in 1s while it is " + delta);
                fired=true;
            }}
        )(p);

        var start = Date.now();

        pp({a:1,b:2})
        .then(res=>{
            let delta = Date.now() - start;
            assert.ok(fired, "'tardy' should be fired");
        }).then(res=>{
            fired=false;
            return pp({a:1,b:2})
        }).then(res=>{
            assert.ok(!fired, "'tardy' should not be fired second time");
        }).then(res=>{
            invalidate_all();

            start = Date.now();
            fired=false;
            return pp({a:1,b:2})
        }).then(res=>{
            assert.ok(fired, "'tardy' should be fired after cache invalidation");
            done();
        }).catch(err=>{
            done(new Error(err));
        })
    })
    

    it("should not fire 'tardy' on fast promises", (done)=> {
        invalidate_all();

        var fired = false;
        var p = (data) => {
            return new Promise((resolve, reject)=>{
              setTimeout(function(){
                if (data.a && data.b) data.sum=data.a + data.b;
                resolve(data);
            }, 500);
            })
        }
        var pp = cache({
            tardy:()=>{
                fired=true;
            }}
        )(p);

        var start = Date.now();

        pp({a:1,b:2})
        .then(res=>{
            let delta = Date.now() - start;
            assert.ok(!fired, "'tardy' should not be fired");
            done();
        }).catch(err=>{
            done(new Error(err));
        })
    })

    it('should hit after cache load (promise)', (done)=>{
        set_load_all(()=>{
            var o = {}
            o[JSON.stringify([{a:1, b:2}])] = JSON.stringify({vtype:"promise", value:{a:1, b:2, sum:3}, ts:Date.now()})
            return Promise.resolve(o);
        });

        var pp = cache("forever")(p);
        
        init().then(()=>{
            var start = Date.now();

            pp({a:1,b:2})
            .then(res=>{
                let delta = Date.now() - start;
                assert.ok( delta < 100, "cache hit should <100 while it is " + delta);
                assert.equal( 3, res.sum);
                assert.equal( 1, res.a);
                assert.equal( 2, res.b);
                done();
            }).catch(err=>{
                done(new Error(err));
            })
        })
    })

    it('should hit after cache load with old data (promise)', (done)=>{
        set_load_all(()=>{
            var o = {}
            o[JSON.stringify([{a:1, b:2}])] = JSON.stringify({vtype:"promise", value:{a:1, b:2, sum:3}, ts:Date.now()-10000})
            return Promise.resolve(o);
        });

        var pp = cache({type:"time", ms:1000})(p);

        init().then(()=>{
            var start = Date.now();

            pp({a:1,b:2})
            .then(res=>{
                let delta = Date.now() - start;
                assert.ok( delta > 1900 && delta < 3000, "cache miss should be greater 2000 while it is " + delta);
                assert.equal( 3, res.sum);
                assert.equal( 1, res.a);
                assert.equal( 2, res.b);
                done();
            }).catch(err=>{
                done(new Error(err));
            })
        })
    })    

    it('should hit after cache load (function)', ()=>{
        set_load_all(()=>{
            var o = {}
            o['[1,2]'] = JSON.stringify({value:3, ts:Date.now()})
            return Promise.resolve(o);
        });
        init().then(()=>{
            var fired = false;
            var f = function(a, b){
                fired = true;
                return a+b
            }
            var ff = cache({type:"time", ms:1000})(f);

            var actual = ff(1,2);

            assert.ok( !fired, "function should not be fired");
            assert.equal( 3, actual);
        })
    })

    it('should miss after cache load with old data (function)', ()=>{
        set_load_all(()=>{
            var o = {}
            o['[1,2]'] = JSON.stringify({value:3, ts:Date.now()-10000})
            return Promise.resolve(o);
        });
        init().then(()=>{
            var fired = false;
            var f = function(a, b){
                fired = true;
                return a+b
            }
            var ff = cache({type:"time", ms:1000})(f);

            var actual = ff(1,2);

            assert.ok( fired, "function should be fired");
            assert.equal( 3, actual);
        })
    })    

    it('should save after cache put (promise)', (done)=>{
        var _id;
        var _value;
        var _fired = false;
        set_save((id, value)=>{
            _id = id;
            _value = value;
            _fired = true;
        });

        var pp = cache("forever")(p);

        init().then(()=>{
            var start = Date.now();

            pp({a:11,b:22})
            .then(res=>{
                setTimeout(function(){
                    assert.ok( _fired, "save found be fired");
                    assert.equal( _id, '[{"a":11,"b":22}]');
                    assert.deepEqual( {a:11, b:22, sum:33}, JSON.parse(_value).value);
                    done();
                }, 500)
            }).catch(err=>{
                done(new Error(err));
            })
        })
    })


    it('should save after cache put (function)', ()=>{
        var f = function(a, b){
            return a+b
        }
        var ff = cache("forever")(f);

        var _id;
        var _value;
        var _fired = false;
        set_save((id, value)=>{
            _id = id;
            _value = value;
            _fired = true;
        });

        init().then(()=>{

            var start = Date.now();

            ff(11, 22);

            assert.ok( _fired, "save found be fired");
            assert.equal( _id, '[11,22]');
            assert.deepEqual( 33, JSON.parse(_value).value);
        })
    })

})