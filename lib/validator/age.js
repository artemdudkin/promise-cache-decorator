//
// item becomes invalid after opt.maxAge milliseconds passed 
//
module.exports = {
  invalid : (item, opt) => {
    if (typeof opt != 'object' || typeof opt.maxAge != 'number') {
      throw new Error('opt.maxAge @ "age" validator does not exists or not a number ['+(opt ? opt.maxAge : undefined)+']');
    }

    return (item && (Date.now() - item.ts > opt.maxAge))
  }
}