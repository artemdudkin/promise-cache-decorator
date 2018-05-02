const assert = require("assert");
const sinon = require("sinon");
var deferred = require("delay-promise-func");
const {cache, invalidate_all, setStorage} = require("../index");

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

    beforeEach(function(){
        invalidate_all();
    });

    afterEach(function(){
        if (console.error.isSinonProxy) console.error.restore();
    })

    it('should have "save", "load", "remove"', ()=>{
        assert.throws(
            () => { setStorage() },
            /^Error: cache storage should be object$/);

        assert.throws(
            () => { setStorage(1) },
            /^Error: cache storage should be object$/);
    
        assert.throws(
            () => { setStorage({}) },
            /^Error: cache storage "save" method should be function$/);

        assert.throws(
            () => { setStorage({ save: {} }) },
            /^Error: cache storage "save" method should be function$/);

        assert.throws(
            () => { setStorage({ save: () => { } }) },
            /^Error: cache storage "load" method should be function$/);

        assert.throws(
            () => { setStorage({ save: () => { }, load: {} }) },
            /^Error: cache storage "load" method should be function$/);

        assert.throws(
            () => { setStorage({ save: () => { }, load: () => { } }) },
            /^Error: cache storage "remove" method should be function$/);

        assert.throws(
            () => { setStorage({ save: () => { }, load: () => { }, remove: {} }) },
            /^Error: cache storage "remove" method should be function$/);
    });

    it('should hit after cache load', ()=>{
        setStorage({
            load : (id) => {
                return deferred(()=>{
                    let value;
                    if (id === '123:'+JSON.stringify([{a:1, b:2}])) {
                        value = JSON.stringify({value:{a:11, b:22, sum:33}, ts:Date.now()})
                    }
                    return Promise.resolve(value);
                }, 1000)();
            },
            save : () => { return Promise.resolve()},
            remove : () => {   return Promise.resolve()},
        });

        var pp = cache({type:"forever", id:"123"})(p);
        
        return pp({a:1,b:2})
        .then(res=>{
            assert.equal( 33, res.sum);
            assert.equal( 11, res.a);
            assert.equal( 22, res.b);
        })
    })

    it('should miss after cache load with old data', ()=>{
        setStorage({
            load : (id) => {
                let value;
                if (id === 'abc:'+JSON.stringify([{a:1, b:2}])) {
                  value = JSON.stringify({value:{a:1, b:2, sum:3}, ts:Date.now() - 10000})
                }
                return Promise.resolve(value);
            },
            save : () => {return Promise.resolve()},
            remove : () => {return Promise.resolve()},
        });

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
        setStorage({
            save : (id, value)=>{
                _id = id;
                _value = value;
                _fired = true;
            },
            load : () => {return Promise.resolve()},
            remove : () => {return Promise.resolve()},
        });

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
        setStorage({
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
        });

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
        setStorage({
            load : (id) => {return Promise.resolve()},
            save : (id) => {
                _saved_id = id;
                return Promise.resolve()
            },
            remove : (id) => {
                _removed_id=id;
                return Promise.resolve()
            },
        });

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

        setStorage({
            save : ()=>{return Promise.resolve()},
            load : () => {return Promise.resolve("{123")},
            remove : () => {return Promise.resolve()},
        });

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

        setStorage({
            save : ()=>{return Promise.resolve()},
            load : (id) => {return Promise.reject("err")},
            remove : () => {return Promise.resolve()},
        });

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

        setStorage({
            save : ()=>{return Promise.reject("err")},
            load : (id) => {return Promise.resolve()},
            remove : () => {return Promise.resolve()},
        });

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

        setStorage({
            save : ()=>{return Promise.resolve()},
            load : (id) => {return Promise.resolve()},
            remove : () => {return Promise.reject("err")},
        });

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
    
})