const CircularJSON = require('circular-json');
const cacheValidator = require('./validator');
const nullStorage = require('./storage/null');

const _cached = {}

let _storage = nullStorage;
const setStorage = (storage) => {
  if (typeof storage != 'object') throw new Error('cache storage should be object');
  if (typeof storage.save != 'function') throw new Error('cache storage "save" method should be function');
  if (typeof storage.load != 'function') throw new Error('cache storage "load" method should be function');
  if (typeof storage.delete != 'function') throw new Error('cache storage "delete" method should be function');

  _storage = storage;
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
function get(opt, id) {
  if (typeof id != 'string') throw new Error('cache key sould be string');

  let item = _cached[id];

  if (item) {
    if (cacheValidator.get(opt).invalid(item, opt)) {
      item = remove(opt, id);
    }
  } else {
    item = _storage.load(id)
            .then(res => {
              return res ? _deserialize(res) : res
            })
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

           const value = { value: res, ts: Date.now() } //it is not _cached[i] as value is data, not Promise
           return _storage.save(id, _serialize(value));
         })
}

//@returns Promise
function remove(opt, id) {
  delete _cached[id];
  return _storage.delete(opt, id)
          .then(res=> {
            return undefined
          });
}

function invalidate_all() {
  for (var i in _cached) {
    if (typeof _cached[i] != 'function') remove(undefined, i)
  }
}

module.exports = {
  register_validator: cacheValidator.register,
  setStorage,

  invalidate_all,
  get,
  put,
  remove,
}