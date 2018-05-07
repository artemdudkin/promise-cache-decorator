const CircularJSON = require('circular-json');
const cacheValidator = require('./validator');
const nullStorage = require('./storage/null');
const { getSettings } = require('./settings');

const _cached = {}

const _serialize = function (item) {
  return CircularJSON.stringify(item);
}

const _deserialize = function (str) {
  var item;
  try {
    item = JSON.parse(str);
  } catch (e) {
    console.error("ERROR: Can not parse json '" + str + "'");
  }
  if (typeof item == 'object' && typeof item.value != 'undefined') {
    item.value = Promise.resolve(item.value);
  }
  return item;
}

//@returns Promise
function get(opt, id) {
  if (typeof id != 'string') throw new Error('cache key sould be string');

  let item = _cached[id];

  if (item) {
    if (cacheValidator.get(opt).invalid(opt, item, _cached)) {
      item = remove(opt, id)
    }
  } else {
    if (opt && opt.storage && typeof opt.storage.load == 'function') {
      item = opt.storage.load(id)
            .catch(err=>{
              console.error("ERROR: cannot load("+id+") from storage: " + err);
            })
            .then(res => {
              return res ? _deserialize(res) : res
            })
            .then(res => {
              if (typeof res != 'object'){
                return
              } else 
              if (cacheValidator.get(opt).invalid(opt, res, _cached)) {
                return remove(opt, id);
              } else {
                _cached[id] = res;
                return res;
              }
            })
    } else {
      console.warn("WARNING: there is no storage.load at", opt);
      item = undefined;
    }
  }
  
  if (!item || typeof item.then != 'function') {
    item = Promise.resolve(item);
  }
  return item.then(res => {
    //res is undefined OR res cache item like {ts:..., value:...}
    return res ? res.value : res
  })
}

//@returns Promise
function put(opt, id, value) {
  if (typeof id != 'string') throw new Error('cache key sould be string');

  if (typeof value.then != 'function') {
    value = Promise.resolve(value);
  }

  _cached[id] = { value, ts: Date.now() }

  return value
         .then(res => {
            _cached[id].ts = Date.now();

            if (opt && opt.storage && typeof opt.storage.save == 'function') {
              //cannot use _cached[i] because here is "value" property is data object, 
              //while _cached[i].value is Promise
              const value = { value: res, ts: Date.now() } 
              
              return opt.storage.save(id, _serialize(value))
                    .catch(err=>{
                      console.error("ERROR: cannot save("+id+") to storage: " + err);
                    })
                    .then(res=>{
                      //will not return result of storage.save
                      return undefined;
                    });
            } else {
              console.warn("WARNING: there is no storage.save at", opt);
            }
         })
}


//@returns Promise
function remove(opt, id) {
  delete _cached[id];

  if (opt && opt.storage && typeof opt.storage.remove == 'function') {
    return opt.storage.remove(id)
          .catch(err=>{
            console.error("ERROR: cannot remove("+id+") from storage: " + err);
          })
          .then(res=> {
            //will not return result of storage.remove
            return undefined
          });
  } else {
    console.warn("WARNING: there is no storage.remove at", opt);
    return Promise.resolve();
  }
}

function clear() {
  for (var i in _cached) remove(getSettings(), i)
}

module.exports = {
  validator : { 
    register: cacheValidator.register,
    unregister: cacheValidator.unregister,
  },

  clear,
  get,
  put,
  remove,
}
