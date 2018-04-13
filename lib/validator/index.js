const validator_forever = require('./forever');
const validator_age = require('./age');
const validator_once_a_day = require('./once_a_day');

const cacheValidator = {
  get: function(opt){
    let type = (typeof opt == 'object' ? opt.type : opt);

    if (typeof this[type] == 'object') {
      return this[type]
    } else {
      console.warn("no such validator type '"+type+"', will use 'forever'")
      return this["forever"];
    }
  },
  register: function(type, func){
    this[type] = {invalid : func};
  }
}
cacheValidator.get = cacheValidator.get.bind(cacheValidator);
cacheValidator.register = cacheValidator.register.bind(cacheValidator);

cacheValidator['forever'] = validator_forever;
cacheValidator['age'] = validator_age;
cacheValidator['once-a-day'] = validator_once_a_day;

module.exports = cacheValidator;