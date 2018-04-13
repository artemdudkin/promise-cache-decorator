//
// item becomes invalid after opt.time of day (like "14:00:00") if it was created before this time of day
//
const validator = {
  parse: function (opt) {
    if (typeof opt != 'object' || typeof opt.time != 'string') {
      throw new Error('opt.time @ "once-a-day" validator does not exists or not a string ['+(opt ? opt.time : undefined)+']');      
    } else {
      const t = opt.time.split(':');

      const h = t[0] ? parseInt(t[0]) : 0;
      const m = t[1] ? parseInt(t[1]) : 0;
      const s = t[2] ? parseInt(t[2]) : 0;
      if (h < 0 || h > 23 || isNaN(h)) {
        throw new Error('wrong hours @ opt.time @ \"once-a-day\" validator [' + h + ']');
      }
      if (m < 0 || m > 59 || isNaN(m)) {
        throw new Error('wrong minutes @ opt.time @ \"once-a-day\" validator [' + m + ']');
      }
      if (s < 0 || s > 59 || isNaN(s)) {
        throw new Error('wrong seconds @ opt.time @ "once-a-day" validator [' + s + ']');
      }
      var dayUpdate = new Date();
      dayUpdate.setHours(h, m, s, 0);
      return dayUpdate;
    }
  },

  invalid: (item, opt) => {
    const dayUpdate = validator.parse(opt);
    return (dayUpdate.getTime() > item.ts && dayUpdate.getTime() < Date.now());
  }
}

module.exports = validator;