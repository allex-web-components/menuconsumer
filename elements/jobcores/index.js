function createJobCores (execlib, applib, arryops) {
  'use strict';

  var lR = execlib.execSuite.libRegistry;
  var browserlib = lR.get('allex_browserwebcomponent');

  var mylib = {};

  require('./basecreator')(execlib.lib, mylib);
  require('./activemenuitemhandlercreator')(execlib.lib, browserlib, applib, arryops, mylib);

  return mylib;
}
module.exports = createJobCores;