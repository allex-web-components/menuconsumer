function createScreens (execlib) {
  'use strict';

  var lib = execlib.lib,
    lR = execlib.execSuite.libRegistry,
    browserlib = lR.get('allex_browserwebcomponent'),
    applib = lR.get('allex_applib'),
    ScreensBaseElement = applib.getElementType('ScreensBase'),
    arryops = lR.get('allex_arrayoperationslib'),
    jobcores = require('./jobcores')(execlib, applib, arryops);

  function ScreensElement (id, options) {
    ScreensBaseElement.call(this, id, options);
  }
  lib.inherit(ScreensElement, ScreensBaseElement);
  ScreensElement.prototype.__cleanUp = function () {    
    ScreensBaseElement.prototype.__cleanUp.call(this);
  };

  ScreensElement.prototype.environmentDescriptor_for_CentralScreen = function (myname, config) {
    var mitemname = config.mitemname;
    var screendesc = config.screendesc;
    if (!screendesc) {
      return;
    }
    return {
      elements: [this.elementDescriptorFromScreenDescriptor(myname, mitemname, screendesc)]
    };
  };

  ScreensElement.prototype.handleActiveMenuItem = function (mitem) {
    this.jobs.run('.', lib.qlib.newSteppedJobOnSteppedInstance(
      new jobcores.ActiveMenuItemHandler(this, mitem)
    ));
  };

  applib.registerElementType('Screens', ScreensElement);
}
module.exports = createScreens;
