/**
 * Item becomes invalid after opt.time of day (like "14:00:00") if it was created before this time of day
 */
const validator = {
  /** 
   * Converts "14" or "14:00" or "14:00:00" to Date object
   */
  parse: function (opt) {
    var startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    if (typeof opt != 'object' || typeof opt.time != 'string') {
      console.error('ERROR: opt.time @ "once-a-day" validator does not exists or not a string ['+(opt ? opt.time : undefined)+']');      
      return startOfDay;
    } else {
      const t = opt.time.split(':');

      const h = t[0] ? parseInt(t[0]) : 0;
      const m = t[1] ? parseInt(t[1]) : 0;
      const s = t[2] ? parseInt(t[2]) : 0;
      if (h < 0 || h > 23 || isNaN(h)) {
        console.error('ERROR: wrong hours @ opt.time @ \"once-a-day\" validator [' + h + ']');
        return startOfDay;
      }
      if (m < 0 || m > 59 || isNaN(m)) {
        console.error('ERROR: wrong minutes @ opt.time @ \"once-a-day\" validator [' + m + ']');
        return startOfDay;
      }
      if (s < 0 || s > 59 || isNaN(s)) {
        console.error('ERROR: wrong seconds @ opt.time @ "once-a-day" validator [' + s + ']');
        return startOfDay;
      }
      var dayUpdate = new Date();
      dayUpdate.setHours(h, m, s, 0);
      return dayUpdate;
    }
  },

  invalid: (opt, item, cache) => {
    const dayUpdate = validator.parse(opt);
    return (typeof item.ts != 'number' || (dayUpdate.getTime() > item.ts && dayUpdate.getTime() < Date.now()));
  }
}

module.exports = validator;
