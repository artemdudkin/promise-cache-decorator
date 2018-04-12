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

const _serialize = function (item) {
  return CircularJSON.stringify(item);
}

const _deserialize = function (str) {
  var item;
  try {
    item = JSON.parse(str);
  } catch (e) {
    console.error("Can not parse json '" + str + "'");
  }
  item.value = Promise.resolve(item.value);
  return item;
}

//@returns Promise
const _load = (id) => {
  return _load_func(id)
         .then(res => {
           return res ? _deserialize(res) : res
         });
}

//@returns Promise
const _save = (id, value) => {
  return _save_func(id, _serialize(value));
}


//@returns Promise
function get(opt, id) {
  if (typeof id != 'string') throw new Error('cache key sould be string');

  let item = _cached[id];

  if (item) {
    if (cacheValidator.get(opt).invalid(item, opt)) {
      item = undefined;
      delete _cached[id];
    }
  } else {
    item = _load(id)
           .then(res => {
             if (!res || !cacheValidator.get(opt).invalid(res, opt)) {
               return res;
             }
           });
  }

  if (!(item instanceof Promise)) {
    item = Promise.resolve(item);
  }
  return item.then(res => {
    return res ? res.value : res
  })
}

//@returns Promise
function put(opt, id, value) {
  if (typeof id != 'string') throw new Error('cache key sould be string');

  if (!(value instanceof Promise)) {
    value = Promise.resolve(value);
  }

  _cached[id] = { value, ts: Date.now() }

  return value
         .then(res => {
           _cached[id].ts = Date.now();
           return _save(id, { value: res, ts: Date.now() });
         });
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
