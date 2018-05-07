const assert = require("assert");
const sinon = require("sinon");
var delayed = require("delay-promise-func");
const cache = require("../index");

var p = (data) => {
    if (data.a && data.b) data.sum=data.a + data.b;
    return Promise.resolve(data);
}

var wait1s = (data) => {
    return new Promise((resolve, reject) => {
        setTimeout(function () {
            resolve(data);
        }, 1000);
    })
}

describe('storage', function(){
    this.timeout(300 * 1000);

    afterEach(function(){
        cache.restoreDefaultSettings();
        cache.clear();
        if (console.error.isSinonProxy) console.error.restore();
        if (console.warn.isSinonProxy) console.warn.restore();
    })

    it('should hit after cache load', ()=>{
        cache.setSettings({storage:{
            load : (id) => {
                return delayed(()=>{
                    let value;
                    if (id === '123:'+JSON.stringify([{a:1, b:2}])) {
                        value = JSON.stringify({value:{a:11, b:22, sum:55}, ts:Date.now()})
                    }
                    return Promise.resolve(value);
                }, 500)();
            },
            save : () => { return Promise.resolve()},
            remove : () => {   return Promise.resolve()},
        }});

        var pp = cache({type:"forever", id:"123"})(p);

        var start = Date.now();

        return pp({a:1,b:2})
        .then(res=>{
            let delta = Date.now() - start;
            assert.ok(delta > 400 && delta < 600, "delay should be 500ms of load while it is " + delta);

            assert.equal( 55, res.sum);
            assert.equal( 11, res.a);
            assert.equal( 22, res.b);
        })
        .then(res=>{
            start = Date.now();
            return pp({a:1,b:2});
        })
        .then(res=>{
            //it will remains at cache after load
            let delta = Date.now() - start;
            assert.ok(delta < 100, "chache hit should cause 0ms delay while it is " + delta);

            assert.equal( 55, res.sum);
            assert.equal( 11, res.a);
            assert.equal( 22, res.b);
        })
    })

    it('should miss after cache load with old data', ()=>{
        cache.setSettings({storage:{
            load : (id) => {
                let value;
                if (id === 'abc:'+JSON.stringify([{a:1, b:2}])) {
                  value = JSON.stringify({value:{a:1, b:2, sum:3}, ts:Date.now() - 10000})
                }
                return Promise.resolve(value);
            },
            save : () => {return Promise.resolve()},
            remove : () => {return Promise.resolve()},
        }});

        var pp = cache({type:"age", maxAge:1000, id:"abc"})(p);

        return pp({a:1,b:2})
        .then(res=>{
            assert.equal( 3, res.sum);
            assert.equal( 1, res.a);
            assert.equal( 2, res.b);
        })
    })    

    it('should save after cache put', ()=>{
        var _id;
        var _value;
        var _fired = false;
        cache.setSettings({storage:{
            save : (id, value)=>{
                _id = id;
                _value = value;
                _fired = true;
            },
            load : () => {return Promise.resolve()},
            remove : () => {return Promise.resolve()},
        }});

        var pp = cache({type:"forever", id:"qaz"})(p);

        return pp({a:3,b:4})
        .then(res=>{
            assert.ok( _fired, "save found be fired");
            assert.equal( _id, 'qaz:[{"a":3,"b":4}]');
            assert.deepEqual( {a:3, b:4, sum:7}, JSON.parse(_value).value);
        })
    })

    it('should "remove" after load invalid cache item', ()=>{
        var _remove_fired=false;
        var _load_fired=false;
        var _load_result=false;
        cache.setSettings({storage:{
            load : (id) => {
                _load_fired = true;
                let value;
                if (id === 'abc:'+JSON.stringify([{a:1, b:2}])) {
                  value = JSON.stringify({value:{a:1, b:2, sum:3}, ts:Date.now() - 10000})
                }
                _load_result = value;
                return Promise.resolve(value);
            },
            save : () => {return Promise.resolve()},
            remove : () => {
                _remove_fired=true;
                return Promise.resolve()
            },
        }});

        var _promise_fired = false;
        var p = () => {
            _promise_fired = true;
            return Promise.resolve("123")
        }
        var pp = cache({type:"age", maxAge:1000, id:"abc"})(p);

        return pp({a:1,b:2})
        .then(res=>{
            assert.ok(_load_fired, "storage 'load' should be fired");
            assert.deepEqual({a:1, b:2, sum:3}, JSON.parse(_load_result).value);

            assert.ok(_remove_fired, "storage 'remove' should be fired");
            assert.equal("123", res);
        })
    })

    it('should "remove" after cache item invalidated', ()=>{
        var _removed_id;
        var _saved_id;
        cache.setSettings({storage:{
            load : (id) => Promise.resolve(),
            save : (id) => {
                _saved_id = id;
                return Promise.resolve()
            },
            remove : (id) => {
                _removed_id=id;
                return Promise.resolve()
            },
        }});

        var pp = cache({type:"age", maxAge:500, id:"abc"})(p);
        var pp_id = 'abc:'+JSON.stringify([{a:1, b:2}]);

        return pp({a:1,b:2})
        .then(res=>{
            assert.equal(pp_id, _saved_id);
            assert.equal("undefined", typeof _removed_id);

            //wait 1s to invalidate cache
            return new Promise((resolve, reject) => {
                setTimeout(function () {
                    resolve();
                }, 1000);
            })
        })
        .then(res=>{
            _removed_id = undefined;
            _saved_id = undefined;
    
            return pp({a:1,b:2})
        })
        .then(res=>{
            assert.equal(pp_id, _saved_id);
            assert.equal(pp_id, _removed_id);
        })
    })

    it('should console.error if cannot parse item from storage', ()=>{
        sinon.spy(console, "error");

        cache.setSettings({storage:{
            save : () => Promise.resolve(),
            load : () => Promise.resolve("{123"),
            remove : () => Promise.resolve(),
        }});

        var pp = cache({type:"forever"})(p);

        return pp({a:3,b:4})
        .then(res=>{
            assert.equal(7, res.sum);
            assert.ok(console.error.calledOnce);
            assert.equal("ERROR: Can not parse json '{123'", console.error.getCall(0).args[0]);
        })
    })

    it('should start original func if "load" Promise is rejected (+console.error)', ()=>{
        sinon.spy(console, "error");

        cache.setSettings({storage:{
            save : () => Promise.resolve(),
            load : (id) => Promise.reject("err"),
            remove : () => Promise.resolve(),
        }});

        var _fired = false;
        var _p = () =>{
            _fired = true;
            return Promise.resolve(7);
        }
        var pp = cache({type:"forever", id:"qwe"})(_p);

        return pp({a:3,b:4})
        .then(res=>{
            assert.equal("ERROR: cannot load(qwe:[{\"a\":3,\"b\":4}]) from storage: err", console.error.getCall(0).args[0]);
            assert.ok(_fired);
            assert.equal(7, res);
        })
    })    


    it('should work if "save" Promise is rejected (+console.error)', ()=>{
        sinon.spy(console, "error");

        cache.setSettings({storage:{
            save : () => Promise.reject("err"),
            load : (id) => Promise.resolve(),
            remove : () => Promise.resolve(),
        }});

        var _fired = false;
        var _p = () =>{
            _fired = true;
            return Promise.resolve(8);
        }
        var pp = cache({type:"forever", id:"qwe"})(_p);

        return pp({a:4,b:5})
        .then(res=>{
            assert.ok(_fired);
            assert.equal(8, res);
        })
        .then(res=>{
            //wait 100ms because cache.put (where error will throw) is in different promise
            return new Promise((resolve) => setTimeout(resolve, 100))
        })
        .then(res=>{
            assert.equal("ERROR: cannot save(qwe:[{\"a\":4,\"b\":5}]) to storage: err", console.error.getCall(0).args[0]);
        })
    })    


    it('should work if "remove" Promise is rejected on cache ivalidated (+console.error)', ()=>{
        sinon.spy(console, "error");

        cache.setSettings({storage:{
            save : ()=>Promise.resolve(),
            load : (id) => Promise.resolve(),
            remove : () => Promise.reject("err"),
        }});

        var _fired = false;
        var _p = () =>{
            _fired = true;
            return Promise.resolve(8);
        }
        var pp = cache({type:"age", maxAge:500, id:"qwe"})(_p);

        return pp({a:5,b:6})
        .then(res=>{
            assert.equal( 0, console.error.callCount);
            assert.ok(_fired);
            assert.equal(8, res);            
            return wait1s() //wait 1s to invalidate cache            
        })
        .then(res=>{
            _fired=false;
            return pp({a:5, b:6});
        })
        .then(res=>{
            assert.equal( 1, console.error.callCount);
            assert.equal("ERROR: cannot remove(qwe:[{\"a\":5,\"b\":6}]) from storage: err", console.error.getCall(0).args[0]);
            assert.ok(_fired);
            assert.equal(8, res);
        })
    })    

    it('should load if storage.load is not Promise', ()=>{
        let fired = false;
        cache.setSettings({storage:{
            load : (id) => {fired=true; return JSON.stringify({value:id, ts:Date.now()})},
            //load : (id) => {fired=true},
            save : () => Promise.resolve(),
            remove : () => Promise.resolve(),
        }});

        var pp = cache({id:"1"})(p);

        return pp({a:"a",b:"b"})
        .then(res=>{
            assert.ok(fired);
            assert.equal('1:[{"a":"a","b":"b"}]', res);
        })
    })    

    it('should work if storage.save is not Promise', ()=>{
        sinon.spy(console, "error");
        sinon.spy(console, "warn");

        let fired = false;
        cache.setSettings({storage:{
            load : (id) => Promise.resolve(),
            save : () => {fired=true;},
            remove : () => Promise.resolve(),
        }});

        var pp = cache({id:"1"})(p);

        return pp({a:"a",b:"b"})
        .then(res=>{
            assert.ok(fired);
            assert.equal( 0, console.error.callCount);
            assert.equal( 0, console.warn.callCount);
        })
    })    


    it('should work if storage.remove is not Promise', ()=>{
        sinon.spy(console, "error");
        sinon.spy(console, "warn");

        let fired = false;
        cache.setSettings({storage:{
            load : (id) => Promise.resolve(),
            save : () => Promise.resolve(),
            remove : () => {fired=true;},
        }});

        var pp = cache({type:"age", maxAge:500})(p);

        return pp({a:234})
        .then(res=>{
            assert.ok(!fired);
            assert.equal( 0, console.error.callCount);
            assert.equal( 0, console.warn.callCount);
        })
        .then(res=>{
            fired = false;
            return delayed(pp, 600)({a:234});
        })
        .then(res=>{
            assert.ok(fired);
            assert.equal( 0, console.error.callCount);
            assert.equal( 0, console.warn.callCount);
        })
    })    

})