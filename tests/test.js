const assert = require("assert");
const {cache, init, set_load, set_save, invalidate_all, register_validator} = require("../index");


var p = (data) => {
    return new Promise((resolve, reject)=>{
      setTimeout(function(){
        if (data.a && data.b) data.sum=data.a + data.b;
        resolve(data);
    }, 2000);
    })
}

describe('vanilla js decorator', function(){
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


    it('should miss and hit on cached forever', (done)=> {
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


    it('should miss and hit on cached forever (promise) @ Promise.all', (done)=> {
        invalidate_all();

        var p2 = () => {
            return new Promise((resolve, reject)=>{
              setTimeout(()=>{resolve(1)}, 4000);
            })
        }
        var p3 = (data) => {
            return Promise.all([p(data), p2()]);
        }
        var pp3 = cache("forever")(p3); //[{sum:...}, 1] after 4 seconds

        var start = Date.now();

        pp3({a:1,b:2})
        .then(res=>{
            let delta = Date.now() - start;
            assert.ok( delta > 3900 && delta < 4100, "cache miss should be greater 4000 while it is " + delta);
            assert.equal(3, res[0].sum);
            assert.equal(1, res[1]);
        }).then(res=>{
            start = Date.now();
            return pp3({a:1,b:2})
        }).then(res=>{
            let delta = Date.now() - start;
            assert.ok( delta < 100, "cache hit should <100 while it is " + delta);
            assert.equal(3, res[0].sum);
            assert.equal(1, res[1]);
            done();
        }).catch(err=>{
            done(new Error(err));
        })
    })    

    it('should miss and miss with cache ttl 1s (on 2s pause)', (done)=> {
        invalidate_all();
        var pp = cache("forever")(p);
        var ppp = cache({type:"age", maxAge:1000})(p);

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
        var ppp = cache({type:"age", maxAge:5000})(p);

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

    it('do not cache rejected promise', (done) => {
      invalidate_all();

      var fired = false;
      var p = (data) => {
        return new Promise((resolve, reject)=>{
          setTimeout(function(){
            fired = true;
            reject("ohh");
          }, 500);
        })
      }
      var pp = cache({type: "forever"})(p);

      pp({a:10, b:11})
      .catch(err => {
        assert.ok( fired, "should call original promise 1st time");
      })
      .then(() => {
        fired = false;
        return pp({a:10, b:11})
      })
      .catch(err => {
        assert.ok( fired, "should call original promise 2nd time");
        done();
      })
      
    })

    it('should miss and hit and miss on once-a-day validator', (done) => {
        invalidate_all();

        var dt = new Date();
        var dayUpdateTime = dt.getHours() + ":" + dt.getMinutes() + ":" + (dt.getSeconds() + 3); //cache will inavidate in 3 seconds
        var pp = cache({ type: "once-a-day", time: dayUpdateTime })(p);

        var start = Date.now();

        pp({ a: 1, b: 2 })
            .then(res => {
                let delta = Date.now() - start;
                assert.ok(delta > 1900 && delta < 3000, "cache miss should be greater 2000 while it is " + delta);
            }).then(res => {
                start = Date.now();
                return pp({ a: 1, b: 2 })
            }).then(res => {
                let delta = Date.now() - start;
                assert.ok(delta < 100, "cache hit should be less then 100 while it is " + delta);
                assert.equal(3, res.sum);
            }).then(res => {
                //wait 3 seconds to cross dayUpdateTime
                return new Promise(function (resolve) {
                    setTimeout(function () { resolve() }, 3000);
                })
            }).then(res => {
                start = Date.now();
                return pp({ a: 1, b: 2 })
            })
            .then(res => {
                let delta = Date.now() - start;
                assert.ok(delta > 1900 && delta < 3000, "cache miss (after dayUpdateTime) should be greater 2000 while it is " + delta);
                done();
            }).catch(err => {
                done(new Error(err));
            })
    })

    it("should fire 'tardy' on slow promises", (done)=> {
        invalidate_all();

        var fired = false;
        var pp = cache({
            type : "forever",
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

    it("should not throw error if promise is slow while there is no 'tardy' at option object", (done)=> {
        invalidate_all();

        var fired = false;
        var p2 = cache({type : "forever"})(p);
        var p3 = cache("forever")(p);

        var start = Date.now();

        p2({a:1,b:2})
        .then(res=>{
            return p3({a:1,b:2})
        })
        .then(()=>{
            done();
        })
        .catch(done);
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

    it('should hit after cache load', (done)=>{
        invalidate_all();

        set_load((id)=>{
            let value;
            if (id === JSON.stringify([{a:1, b:2}])) {
              value = JSON.stringify({value:{a:1, b:2, sum:3}, ts:Date.now()})
            }
            return Promise.resolve(value);
        });

        var pp = cache("forever")(p);
        
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

    it('should miss after cache load with old data', (done)=>{
        invalidate_all();

        set_load((id)=>{
            let value;
            if (id === JSON.stringify([{a:1, b:2}])) {
              value = JSON.stringify({value:{a:1, b:2, sum:3}, ts:Date.now() - 10000})
            }
            return Promise.resolve(value);
        });

        var pp = cache({type:"age", maxAge:1000})(p);

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

    it('should save after cache put', (done)=>{
        var _id;
        var _value;
        var _fired = false;
        set_save((id, value)=>{
            _id = id;
            _value = value;
            _fired = true;
        });

        var pp = cache("forever")(p);

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