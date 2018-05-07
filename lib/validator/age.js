//
// item becomes invalid after opt.maxAge milliseconds passed 
//
module.exports = {
  invalid : (opt, item, cache) => {
    if (typeof opt != 'object' || typeof opt.maxAge != 'number') {
      console.error('ERROR: opt.maxAge @ "age" validator does not exists or not a number ['+(opt ? opt.maxAge : undefined)+']');
      return true; //cache item is invalid
    }

    return (typeof item.ts != 'number' || item && (Date.now() - item.ts > opt.maxAge))
  }
}