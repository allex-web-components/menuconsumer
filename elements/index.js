function createScreenFunctionality (execlib) {
  'use strict';

  require('./basecreator')(execlib);
  require('./screens')(execlib);
  require('./preloadedscreens')(execlib);
}
module.exports = createScreenFunctionality;
