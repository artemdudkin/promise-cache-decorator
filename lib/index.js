const CircularJSON = require('circular-json');
const cacheObj = require('./cache');

function _tardy_call(tardy){
  if (typeof tardy == 'function') {
    tardy(); 
  } else if (typeof tardy == 'string' && typeof this[tardy] == 'function') {
    this[tardy](); //if it was string name of object method
  }
}

const _hash = (obj) => {
  return (typeof obj == 'string' ? obj : CircularJSON.stringify(obj));
}

//opt.tardy
function cache(opt) {
  return function (func, key, descriptor) {
    if (key) func = func[key]; //for ES6 notation

    if (typeof opt == 'undefined') opt = {};
    if (typeof opt == 'string') opt = {type:opt};

    const f = function (...rest) {
      const _key = _hash(rest);
      return cacheObj.get(opt, _key)
            .then(res => {
              if (typeof res == 'undefined') {
                res = func.apply(this, rest);

                res.then( res => {
                  cacheObj.put(opt, _key, res);
                  return res;
                })

                if (typeof opt.tardy != 'undefined') {
                  res.timer = setTimeout(_tardy_call.bind(this, opt.tardy), 1000);
                  res.then(() => {
                    clearTimeout(res.timer);
                  })
                }
              }
              return res;
          });
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
  set_load : cacheObj.set_load,
  set_save : cacheObj.set_save,
}