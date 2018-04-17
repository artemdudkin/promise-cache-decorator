const CircularJSON = require('circular-json');
const cacheObj = require('./cache');

function _tardy_call(tardy){
  if (typeof tardy == 'function') {
    tardy(); 
  } else if (typeof tardy == 'string' && typeof this[tardy] == 'function') {
    this[tardy](); //if it was string name of object method
  }
}

const _hash = (obj, id) => {
  return (typeof id == 'string' ? id : CircularJSON.stringify(id)) + 
    ":" + 
    (typeof obj == 'string' ? obj : CircularJSON.stringify(obj));
}

//from https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
const _random_string = len => {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < len; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

function _update(func, rest, opt) {
  const _key = _hash(rest, opt.id);

  var res = func.apply(this, rest);

  res.catch( err => {
    cacheObj.remove(opt, _key);
  });

//  res.update = update;
  cacheObj.put(opt, _key, res);

  if (typeof opt.tardy != 'undefined') {
    res.timer = setTimeout(_tardy_call.bind(this, opt.tardy), opt.tardy_timeout);
    res.then(() => {
      clearTimeout(res.timer);
    })
  }
  return res;
}

//opt.type
//opt.id
//opt.tardy
//opt.tardy_timeout
function cache(opt) {
  return function (func, key, descriptor) {
    if (key) func = func[key]; //for ES6 notation

    if (typeof opt == 'undefined') opt = {};
    if (typeof opt == 'string') opt = {type:opt};
    if (typeof opt.id != 'string') opt.id = _random_string(8);
    if (typeof opt.tardy_timeout != "number") opt.tardy_timeout = 1000;

    const f = function (...rest) {
      const _key = _hash(rest, opt.id);
      return cacheObj.get(opt, _key)
            .then(res => {
              if (typeof res == 'undefined') {  
                res = _update.bind(this)(func, rest, opt);
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
  setStorage : cacheObj.setStorage,
}