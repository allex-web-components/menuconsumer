function createScreenFunctionality (execlib) {
  'use strict';

  require('./screenscreator')(execlib);
  require('./screencreator')(execlib);
}
module.exports = createScreenFunctionality;
