const CircularJSON = require('circular-json');

const _cached = {}

let _cache_load_all_func = () => {}

//@returns Promise
let _cache_save_func = () => { 
  return Promise.resolve();
}

const cache_load_all = () => {
  return _cache_load_all_func();
}

const cache_save = (id, item) => {
  _cache_save_func(id, cache_serialize(item));
}

const cache_get = (type, id) => {
    let item = _cached[id];
    if (typeof item == 'undefined' || cacheValidator.get(type).invalid(item, type)) {
      item = undefined;
      delete _cached[id];
    }
    return ( item ? item.value : undefined);
}

const cache_put = (type, id, value) => {
    _cached[id] = {value, ts:Date.now()}

    if (value instanceof Promise) {
      value.then(res => {
        _cached[id].ts = Date.now();
        cache_save(id, {value:res, ts:Date.now()});
      });
    } else {
      cache_save(id, _cached[id]);
    }
}

const cacheValidator = {
  get: function(opt){
    let type = (typeof opt == 'object' ? opt.type : opt);

    if (typeof this[type] == 'object') {
      return this[type]
    } else {
      console.warn("no such validator type '"+type+"', will use 'forever'")
      return this["forever"]
    }
  }
}
cacheValidator.get = cacheValidator.get.bind(cacheValidator);

cacheValidator.forever = {
  invalid : (item, opt) => {
    return false;
  }
}

cacheValidator.time = {
  invalid : (item, opt) => {
    return (item && (Date.now() - item.ts > opt.ms))
  }
}

const cache_serialize = function(cache_item){
    if (cache_item.value instanceof Promise) cache_item.vtype = "promise";
    return CircularJSON.stringify(cache_item);
}

const cache_deserialize = function(str){
  var item = {}
  try {
    item = JSON.parse(str);
  } catch (e) {
    console.warn("Can not parse json '"+str+"'");
  }
  if (item.vtype === 'promise') item.value = Promise.resolve(item.value);
  return item;
}

const _getHash = (obj) => {
  return JSON.stringify(obj);
}



//option.tardy
function cache(type, options) {
  return function (func) {
  
    if (typeof type == 'string' || (typeof type == 'object' && typeof type.type == 'string')) {
      //nop
    } else {
      options = type;
      type = undefined;
    }
    if (typeof options == 'undefined') options = {};

    return function (...rest) {
      var id = _getHash(rest);
      var res = cache_get(type, id);
      if (typeof res == 'undefined') {
        res = func.apply(this, rest);
        cache_put(type, id, res);

        if (res instanceof Promise && typeof options.tardy == 'function') {
          res.timer = setTimeout(function () {
            if (typeof options == 'object') options.tardy();
          }, 1000);
          res.then(() => {
            clearTimeout(res.timer);
          })
        }
      }
      return res;
    }
  }
}

function invalidate_all() {
  for (var i in _cached) {
    if (typeof _cached[i] != 'function') delete _cached[i];
  }
}

function register_validator(type, func){
  cacheValidator[type] = {invalid : func};
}

function set_save(value) {
  _cache_save_func = value;
}

function set_load_all(value){
  _cache_load_all_func = value;
}

//@returns Promise
function init(){
  invalidate_all();

  return cache_load_all().then(value => {
    for (var i in value) {
      _cached[i] = cache_deserialize(value[i]);
    }
  })
}

module.exports = {
  cache,
  invalidate_all,

  register_validator,
  set_load_all,
  set_save,
  init,
}