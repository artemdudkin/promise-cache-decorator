const assert = require("assert");
const { setSettings, restoreDefaultSettings } = require("../lib/settings");

describe('settings', function(){

    afterEach(function(){
        restoreDefaultSettings();
    });


    it('should be object', ()=>{
        assert.throws(
            () => { setSettings() },
            /^Error: argument of setSettings should be object$/);
    })

    it('storage should have "save", "load", "remove"', ()=>{
        assert.throws(
            () => { setSettings({storage:undefined}) },
            /^Error: storage should be object$/);

        assert.throws(
            () => { setSettings({storage:1}) },
            /^Error: storage should be object$/);
    
        assert.throws(
            () => { setSettings({storage:{}}) },
            /^Error: storage "save" method should be function$/);

        assert.throws(
            () => { setSettings({storage:{ save: {} }}) },
            /^Error: storage "save" method should be function$/);

        assert.throws(
            () => { setSettings({storage:{ save: () => { } }}) },
            /^Error: storage "load" method should be function$/);

        assert.throws(
            () => { setSettings({storage:{ save: () => { }, load: {} }}) },
            /^Error: storage "load" method should be function$/);

        assert.throws(
            () => { setSettings({storage:{ save: () => { }, load: () => { } }}) },
            /^Error: storage "remove" method should be function$/);

        assert.throws(
            () => { setSettings({storage:{ save: () => { }, load: () => { }, remove: {} }}) },
            /^Error: storage "remove" method should be function$/);
    });

    it('type should be string', ()=>{
        assert.throws(
            () => { setSettings({type:undefined}) },
            /^Error: type should be string$/);

        assert.throws(
            () => { setSettings({type:{}}) },
            /^Error: type should be string$/);

            
        assert.throws(
            () => { setSettings({type:"xxx"}) },
            /^Error: default type should be registered type$/);
    
        setSettings({type:"forever"})
    })

    it('tardy should be function', ()=>{
        assert.throws(
            () => { setSettings({tardy:undefined}) },
            /^Error: tardy should be function$/);

        assert.throws(
            () => { setSettings({tardy:{}}) },
            /^Error: tardy should be function$/);

        setSettings({tardy:()=>{}})            
    })

    it('tardy_timeout should be function', ()=>{
        assert.throws(
            () => { setSettings({tardy_timeout:undefined}) },
            /^Error: tardy_timeout should be integer$/);

        assert.throws(
            () => { setSettings({tardy_timeout:1.1}) },
            /^Error: tardy_timeout should be integer$/);
    
        assert.throws(
            () => { setSettings({tardy_timeout:-100}) },
            /^Error: tardy_timeout should be greater then zero$/);
    })
})
