const CircularJSON = require('circular-json');
const cacheValidator = require('./validator');

const _cached = {}

//@returns Promise
let _load_all_func = () => {
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

const _load_all = () => {
  return _load_all_func();
}

const _save = (id, item) => {
  _save_func(id, _serialize(item));
}



function get(type, id) {
  id = _hash(id);
  let item = _cached[id];
  if (typeof item == 'undefined' || cacheValidator.get(type).invalid(item, type)) {
    item = undefined;
    delete _cached[id];
  }
  return (item ? item.value : undefined);
}

function put(type, id, value) {
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

function set_load_all(value) {
  _load_all_func = value;
}

//@returns Promise
function init() {
  invalidate_all();

  return _load_all().then(value => {
    for (var i in value) {
      _cached[i] = _deserialize(value[i]);
    }
  })
}

module.exports = {
  register_validator: cacheValidator.register,
  set_load_all,
  set_save,

  invalidate_all,
  init,
  get,
  put,
}