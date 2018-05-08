const CircularJSON = require('circular-json');
const cacheObj = require('./cache');
const { getSettings, setSettings, checkSetting, restoreDefaultSettings } = require('./settings');

function _tardy_call(tardy){
  if (typeof tardy == 'function') {
    tardy(); 
  } else if (typeof tardy == 'string' && typeof this[tardy] == 'function') {
    this[tardy](); //if it was string name of object method
  } else {
    console.error("ERROR: cannot find tardy handler ["+tardy+"]");
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

function _update(opt, func, rest) {
  const _key = _hash(rest, opt.id);

  var res = func.apply(this, rest);

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
function cached(opt) {
  if (typeof opt == 'undefined') opt = {};
  if (typeof opt == 'string') opt = {type:opt};
  if (typeof opt.id != 'string') opt.id = _random_string(8);
  opt = Object.assign({}, getSettings(), opt);
  for (var i in opt) checkSetting(i, opt[i]);

  return function (func, key, descriptor) {
    if (key) func = func[key]; //for ES6 notation

    const f = function (...rest) {
      const _key = _hash(rest, opt.id);
      return cacheObj.get(opt, _key)
              .then(res => {
                if (res == null || typeof res == 'undefined') {  
                  res = _update.bind(this)(opt, func, rest);
                }
                return res;
              });
    }
    f.forceUpdate = function(...rest){
      _update.bind(this, opt, func)(rest)
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

cached.validator = {
  register : cacheObj.validator.register,
  unregister : cacheObj.validator.unregister,
}

cached.clear = cacheObj.clear;
cached.setSettings = setSettings;
cached.restoreDefaultSettings=restoreDefaultSettings;

module.exports = cached;
