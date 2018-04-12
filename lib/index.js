const cacheObj = require('./cache');

//option.tardy
function cache(opt) {
  return function (func, key, descriptor) {
    if (key) func = func[key];

    if (typeof opt == 'undefined') opt = {};

    const f = function (...rest) {
      var res = cacheObj.get(opt, rest);
      if (typeof res == 'undefined') {
        res = func.apply(this, rest);
        cacheObj.put(opt, rest, res);

        if (res instanceof Promise && typeof opt.tardy == 'function') {
          res.timer = setTimeout( opt.tardy, 1000);
          res.then(() => {
            clearTimeout(res.timer);
          })
        }
      }
      return res;
    }

    if (key) {
      //ES6 notation
      descriptor.value = f;
    } else {
      //vanilla js notation
      return f;
    }
  }
}

module.exports = {
  cache,

  invalidate_all : cacheObj.invalidate_all,
  register_validator : cacheObj.register_validator,
  set_load_all : cacheObj.set_load_all,
  set_save : cacheObj.set_save,

  init : cacheObj.init,
  invalidate_all : cacheObj.invalidate_all,
}