const CircularJSON = require('circular-json');
const cacheValidator = require('./validator');

const _cached = {}

//@returns Promise
let _load_func = () => {
  return Promise.resolve();
}

//@returns Promise
let _save_func = () => {
  return Promise.resolve();
}

const _serialize = function (cache_item) {
  if (cache_item.value instanceof Promise) cache_item.vtype = "promise";
  return CircularJSON.stringify(cache_item);
}

const _deserialize = function (str) {
  var item = {}
  try {
    item = JSON.parse(str);
  } catch (e) {
    console.warn("Can not parse json '" + str + "'");
  }
  if (item.vtype === 'promise') item.value = Promise.resolve(item.value);
  return item;
}

const _hash = (obj) => {
  return (typeof obj == 'string' ? obj : CircularJSON.stringify(obj));
}


//@returns Promise
const _load = (id) => {
  return _load_func(id)
         .then(res => {
           return res ? _deserialize(res) : res
         });
}

const _save = (id, item) => {
  _save_func(id, _serialize(item));
}


//@returns Promise
function get(opt, id) {
  id = _hash(id);
  let item = _cached[id];

  if (typeof item != 'undefined') {
    if (cacheValidator.get(opt).invalid(item, opt)) {
      item = undefined;
      delete _cached[id];
    }
  } else {
    item = _load(id);
  }

  if (!(item instanceof Promise)) {
    item = Promise.resolve(item);
  }
  return item.then(res => {
    return res ? res.value : res
  })
}

function put(opt, id, value) {
  id = _hash(id);
  _cached[id] = { value, ts: Date.now() }

  if (value instanceof Promise) {
    value.then(res => {
      _cached[id].ts = Date.now();
      _save(id, { value: res, ts: Date.now() });
    });
  } else {
    _save(id, _cached[id]);
  }
}

function invalidate_all() {
  for (var i in _cached) {
    if (typeof _cached[i] != 'function') delete _cached[i];
  }
}

function set_save(value) {
  _save_func = value;
}

function set_load(value) {
  _load_func = value;
}


module.exports = {
  register_validator: cacheValidator.register,
  set_load,
  set_save,

  invalidate_all,
  get,
  put,
}
