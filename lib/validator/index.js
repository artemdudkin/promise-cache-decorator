const validator_forever = require('./forever');
const validator_age = require('./age');
const validator_once_a_day = require('./once_a_day');
const {getSettings} = require('../settings');

const cacheValidator = {

  isExists: function(opt){
    let type = (typeof opt == 'object' ? opt.type : opt);
    return (typeof this[type] == 'object');
  },

  get: function(opt){
    let type = (typeof opt == 'object' ? opt.type : opt);

    if (typeof this[type] == 'object') {
      return this[type]
    } else {
      const defaultType = getSettings().type;
      console.warn("WARNING: no such validator type \""+type+"\", will use \""+defaultType+"\"");
      return this[defaultType];
    }
  },

  register: function(type, func){
    this[type] = {invalid : func};
  },
  
  unregister: function(type, func){
    delete this[type];
  }
}
cacheValidator.get = cacheValidator.get.bind(cacheValidator);
cacheValidator.register = cacheValidator.register.bind(cacheValidator);

cacheValidator['forever'] = validator_forever;
cacheValidator['age'] = validator_age;
cacheValidator['once-a-day'] = validator_once_a_day;

module.exports = cacheValidator;