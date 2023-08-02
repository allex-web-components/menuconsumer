function createPreloadedScreens (execlib) {
  'use strict';

  var lib = execlib.lib,
    lR = execlib.execSuite.libRegistry,
    browserlib = lR.get('allex_browserwebcomponent'),
    applib = lR.get('allex_applib'),
    ScreensBaseElement = applib.getElementType('ScreensBase'),
    arryops = lR.get('allex_arrayoperationslib');/*,
    jobcores = require('./jobcores')(execlib, applib, arryops);*/

  function PreloadedScreensElement (id, options) {
    ScreensBaseElement.call(this, id, options);
    this.currentlyActual = null;
  }
  lib.inherit(PreloadedScreensElement, ScreensBaseElement);
  PreloadedScreensElement.prototype.__cleanUp = function () {    
    this.currentlyActual = null;
    ScreensBaseElement.prototype.__cleanUp.call(this);
  };

  PreloadedScreensElement.prototype.staticEnvironmentDescriptor = function (myname) {
    var screens = this.getConfigVal('screens'), ret;
    ret = ScreensBaseElement.prototype.staticEnvironmentDescriptor.call(this, myname);
    if (!lib.isArray(screens)) {
      screens = [];
    }
    ret.elements = ret.elements || [];
    Array.prototype.push.apply(ret.elements, screens.map(elementer.bind(this, myname)));
    myname = null;
    return ret;
  };

  PreloadedScreensElement.prototype.handleActiveMenuItem = function (mitem) {
    var config = this.configForMenuItem(mitem), target;
    var screens = this.getConfigVal('screens');
    if (!config) { //onMenuItemNeeded already done
      return;
    }
    try {
      target = this.getElement(config.mitemname+'_Screen');
      if (!target) {
        return;
      }
      if (this.currentlyActual) {
        this.currentlyActual.set('actual', false);
      }
      this.currentlyActual = target;
      this.currentlyActual.set('actual', true);
    } catch (e) {
      console.warn(this.constructor.name, 'could not find', config.mitemname);
    }
  };

  //statics
  function elementer (myname, screendesc) {
    var ret = this.elementDescriptorFromScreenDescriptor(myname, '', screendesc);
    ret.options.actual = false;
    return ret;
  }
  //endof statics


  applib.registerElementType('PreloadedScreens', PreloadedScreensElement);
}
module.exports = createPreloadedScreens;