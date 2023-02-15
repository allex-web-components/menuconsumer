function createMixins (lib, mylib) {
  var mixins = {};
  require('./needmenuitemcreator')(lib, mixins);
  mylib.mixins = mixins;
}
module.exports = createMixins;