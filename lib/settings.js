const promisify = require('promisify-func');
const nullStorage = require('./storage/null');
const validator = require('./validator');

const _default_settings = {
    type : "forever",
    storage : nullStorage,
    tardy_timeout : 1000
}

let _settings = Object.assign({}, _default_settings);

const restoreDefaultSettings = () => {
    _settings = Object.assign({}, _default_settings);
}

const getSettings = () => {
    //return copy of settings to prevent change of settings by reference
    return Object.assign({}, _settings);
}

const setSettings = (obj) => {
    if (typeof obj != 'object') throw new Error('argument of setSettings should be object');
    for (var i in obj) {
        checkSetting(i, obj[i], true);
        _settings[i] = obj[i];
    }
}  

const checkSetting = (name, value, isGlobal) => {
    switch (name) {
        case "type" :
            if (typeof value != 'string') throw new Error('type should be string');
            if (!require('./validator').isExists({type:value})) throw new Error('default type should be registered type');
            return true; 
        case "storage" : 
            if (typeof value != 'object') throw new Error('storage should be object');
            if (typeof value.save != 'function') throw new Error('storage "save" method should be function');
            if (typeof value.load != 'function') throw new Error('storage "load" method should be function');
            if (typeof value.remove != 'function') throw new Error('storage "remove" method should be function');

            //storage.save/load/remove SHOULD return Promise but CAN return anything
            value.save = promisify(value.save);
            value.load = promisify(value.load);
            value.remove = promisify(value.remove);
            return true; 
        case "tardy" :
            //tardy can be string at cached instance method
            //which means that it should call method of instance with this name, i.e. instance[tardy]();
            //while trady at global settings should be always function
            if (isGlobal && typeof value != 'function') throw new Error('tardy should be function');
            return true;
        case "tardy_timeout" :
            if (typeof value != 'number' || !Number.isInteger(value)) throw new Error('tardy_timeout should be integer');
            if (value < 0) throw new Error('tardy_timeout should be greater then zero');
            return true; 
        default : 
            return true;
    } 
}

module.exports = {
    getSettings,
    setSettings,
    checkSetting,
    restoreDefaultSettings,
}