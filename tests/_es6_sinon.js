
var _spy_saved = {};
export function spy(obj, methodName){
    const key = methodName;
    _spy_saved[key] = {
        obj : obj,
        methodName : methodName,
        func : obj[methodName],
        callCount : 0,
        calls  : []
    };
    obj[methodName] = _call.bind(this, key);
    Object.defineProperty(obj[methodName], "callCount", {
        enumerable: true,
        configurable: true,
        get : () => _spy_saved[key].callCount
    });
    obj[methodName].getCall = _get_call.bind(this, key);
    obj[methodName].restore = _restore.bind(this, key);
}
function _call(key, ...rest) {
    _spy_saved[key].callCount++;
    _spy_saved[key].calls.push({
        args:rest
    });
    _spy_saved[key].func.apply(this, rest);
}
function _restore(key){
    var x = _spy_saved[key];
    x.obj[x.methodName] = x.func;
    delete _spy_saved[key];
}
function _count(key) {
    return _spy_saved[key].callCount;
}
function _get_call(key, number) {
    return _spy_saved[key].calls[number];
}
