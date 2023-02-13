function createJobCores (lib, applib, arryops) {
  'use strict';

  var mylib = {};

  require('./basecreator')(lib, mylib);
  require('./activemenuitemhandlercreator')(lib, applib, arryops, mylib);

  return mylib;
}
module.exports = createJobCores;