const validator = {
  parse: function (opt) {
    if (typeof opt != 'object' || typeof opt.time != 'string') {
      throw new Error('dayUpdateTime does not exists or not a string');
    } else {
      const t = opt.time.split(':');

      const h = t[0] ? parseInt(t[0]) : 0;
      const m = t[1] ? parseInt(t[1]) : 0;
      const s = t[2] ? parseInt(t[2]) : 0;
      if (h < 0 || h > 23 || isNaN(h)) {
        throw new Error('wrong dayUpdateTime hours [' + h + ']');
      }
      if (m < 0 || m > 59 || isNaN(m)) {
        throw new Error('wrong dayUpdateTime minutes [' + m + ']');
      }
      if (s < 0 || s > 59 || isNaN(s)) {
        throw new Error('wrong dayUpdateTime seconds [' + s + ']');
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