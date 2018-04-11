module.exports = {
  invalid : (item, opt) => {
    return (item && (Date.now() - item.ts > opt.ms))
  }
}