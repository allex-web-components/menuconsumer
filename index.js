(function (execlib) {
  'use strict';

  var lR = execlib.execSuite.libRegistry,
    mylib = {};

  require('./prepreprocessors')(execlib);
  require('./elements')(execlib);

  require('./mixins')(execlib, mylib);

  lR.register('allex_menuconsumerwebcomponent', mylib);
})(ALLEX);
