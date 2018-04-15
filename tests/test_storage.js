const assert = require("assert");
const sinon = require("sinon");
const {cache, invalidate_all, setStorage} = require("../index");

var p = (data) => {
    if (data.a && data.b) data.sum=data.a + data.b;
    return Promise.resolve(data);
}


describe('storage', function(){
    this.timeout(300 * 1000);

    it('should have "save", "load", "delete"', ()=>{
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
            /^Error: cache storage "delete" method should be function$/);

        assert.throws(
            () => { setStorage({ save: () => { }, load: () => { }, delete: {} }) },
            /^Error: cache storage "delete" method should be function$/);
    });

    it('should hit after cache load', (done)=>{
        invalidate_all();

        setStorage({
            load : (id) => {
                let value;
                if (id === '123:'+JSON.stringify([{a:1, b:2}])) {
                    value = JSON.stringify({value:{a:11, b:22, sum:33}, ts:Date.now()})
                }
                return Promise.resolve(value);
            },
            save : () => { return Promise.resolve()},
            delete : () => {   return Promise.resolve()},
        });

        var pp = cache({type:"forever", id:"123"})(p);
        
        pp({a:1,b:2})
        .then(res=>{
            assert.equal( 33, res.sum);
            assert.equal( 11, res.a);
            assert.equal( 22, res.b);
            done();
        }).catch(done)
    })

    it('should miss after cache load with old data', (done)=>{
        invalidate_all();

        setStorage({
            load : (id) => {
                let value;
                if (id === 'abc:'+JSON.stringify([{a:1, b:2}])) {
                  value = JSON.stringify({value:{a:1, b:2, sum:3}, ts:Date.now() - 10000})
                }
                return Promise.resolve(value);
            },
            save : () => {return Promise.resolve()},
            delete : () => {return Promise.resolve()},
        });

        var pp = cache({type:"age", maxAge:1000, id:"abc"})(p);

        pp({a:1,b:2})
        .then(res=>{
            assert.equal( 3, res.sum);
            assert.equal( 1, res.a);
            assert.equal( 2, res.b);
            done();
        }).catch(done)
    })    

    it('should save after cache put', (done)=>{
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
            delete : () => {return Promise.resolve()},
        });

        var pp = cache({type:"forever", id:"qaz"})(p);

        pp({a:3,b:4})
        .then(res=>{
            assert.ok( _fired, "save found be fired");
            assert.equal( _id, 'qaz:[{"a":3,"b":4}]');
            assert.deepEqual( {a:3, b:4, sum:7}, JSON.parse(_value).value);
            done();
        }).catch(done)
    })

    it('should console.error if cannot parse item from storage', (done)=>{
        sinon.spy(console, "error");

        setStorage({
            save : ()=>{return Promise.resolve()},
            load : () => {return Promise.resolve("{123")},
            delete : () => {return Promise.resolve()},
        });

        var pp = cache({type:"forever"})(p);

        pp({a:3,b:4})
        .then(res=>{
            assert.equal(7, res.sum);
            assert.ok(console.error.calledOnce);
            assert.equal("Can not parse json '{123'", console.error.getCall(0).args[0]);

            console.error.restore();
            done();
        }).catch(err => {
            console.error.restore();
            done(err);
        })
    })

})