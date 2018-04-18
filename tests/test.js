const assert = require("assert");
const {cache, invalidate_all, register_validator} = require("../index");

var deferred = (func, delay) => {
    return (...rest) => {
        return new Promise((resolve, reject) => {
            setTimeout(function () {
                resolve( func.apply(this, rest) );
            }, delay);
        })
    }
}
var p_func = (data) => {
    if (data.a && data.b) data.sum=data.a + data.b;
    return data;
}
var p = deferred(p_func, 2000);


describe('vanilla js decorator', function(){
    this.timeout(300 * 1000);

    beforeEach(function(){
        invalidate_all();
    });

    it('should miss and miss on uncached (promise)', (done)=> {
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
        }).catch(done)
    })    


    it('should miss and hit on cached forever', (done)=> {
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
        }).catch(done)
    })


    it('should miss and hit on cached forever @ Promise.all', (done)=> {
        var p2 = deferred(()=>1, 4000);

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
        }).catch(done)
    })    

    it('should miss and miss with cache ttl 1s (on 2s pause)', (done)=> {
        var pp = cache({type:"forever", id:"1sTTL"})(p);
        var ppp = cache({type:"age", maxAge:1000, id:"1sTTL"})(p);

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
        }).catch(done)
    })

    
    it('should miss and hit with cache ttl 5s (on 2s pause)', (done)=> {
        var pp = cache({type:"forever", id:"5sTTL"})(p);
        var ppp = cache({type:"age", maxAge:5000, id:"5sTTL"})(p);

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
        }).catch(done)
    })

    it('should miss and miss on always-miss-validator', (done)=>{
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
        }).catch(done)
    })

    it('should miss and hit and miss on once-a-day validator', (done) => {
        var dt = new Date( (new Date()).getTime() + 3000);
        var dayUpdateTime = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds(); //cache will inavidate in 3 seconds
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
            }).catch(done)
    })

    it("should fire 'tardy' on slow promises", (done)=> {
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
        }).catch(done)
    })

    it("should not throw error if promise is slow while there is no 'tardy' at option object", (done)=> {
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
        var fired = false;
        var p = deferred(p_func, 500);
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
        }).catch(done)
    })

    it('do not cache rejected promise', (done) => {
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
        .catch(done);
    })

    it('should return same promise for two almost simultaneous function calls', (done)=>{
        var count = 0;
        var p1 = () => {return ++count}
        var dp1 = deferred(p1, 2000);
        var pp = cache("forever")(dp1);

        var start = Date.now();
        dp1()
        .then(res=>{
            let delta = Date.now() - start;
            assert.ok( delta > 1900 && delta < 2100, "deferred(p1, 2000) should fire in 2 seconds ["+delta+"]");
            assert.equal(1, res);
        })
        .then(res=>{
            return dp1();
        })
        .then(res=>{
            assert.equal(2, res);
        })
        .then(res=>{
            var dpp = deferred(pp, 200);
            return Promise.all([pp(), dpp()]);
        })
        .then(res=>{
            assert.equal(3, res[0]);
            assert.equal(3, res[1]);
            done()
        }).catch(done)
    })

    it('should return different data from cache for different functions even if it have the same input data', (done)=>{
        var count = 0;
        var p1_func = () => {return ++count}
        var p1 = deferred(p1_func, 2000);
        var pp1 = cache("forever")(p1);

        var pp = cache("forever")(p);

        var start = Date.now();
        pp({a:10, b:1})
        .then(res=>{
            assert.equal(11, res.sum);
            return pp1({a:10, b:1})
        })
        .then(res=>{
            assert.equal(1, res);
            done()
        }).catch(done)
    })

    it('should catch error within original func', (done)=>{
        var p1 = (...rest) => {
            throw new Error("this is a error");
        }
        var pp1 = cache("forever")(p1);

        pp1({a:10, b:1})
        .then(res=>{
            assert.fail("should reject first time");
        })
        .catch(err=>{
            assert.ok( err instanceof Error, "err should be Error");
            assert.equal( err.toString(), "Error: this is a error");
            done();
        })
        .catch(done);
    });

    it('should return err from original func', (done)=>{
        var p1 = () => {
            return Promise.reject("123");
        }
        var pp1 = cache("forever")(p1);

        pp1({a:10, b:1})
        .then(res=>{
            assert.fail("should reject first time");
        })
        .catch(err=>{
            assert.equal( err, "123");
            done();
        })
        .catch(done);
    });


    it('should re-run original func after forceUpdate() on rejected Promise', (done)=>{
        var result={};
        var counter=0;
        var p1 = (...rest) => {
            result = {
                fired:true,
                args :rest
            }
            if (counter++ == 0) {
                return Promise.reject();
            } else {
                return Promise.resolve();
            }
        }
        var pp1 = cache("forever")(p1);

        pp1({a:10, b:1})
        .then(res=>{
            assert.fail("should reject first time");
        })
        .catch(err =>{
            assert.ok(result.fired, "original func should be fired");
            res = {}
            return pp1.forceUpdate({a:10, b:1});
//            return pp1({a:10, b:1});
        })
        .then(res=>{
            assert.ok(result.fired, "original func should be fired second time");
            assert.deepEqual([{a:10, b:1}], result.args);
            done()
        }).catch(done)
    })

})