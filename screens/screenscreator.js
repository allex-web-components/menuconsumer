function createScreens (execlib) {
  'use strict';

  var lib = execlib.lib,
    lR = execlib.execSuite.libRegistry,
    applib = lR.get('allex_applib'),
    BasicElement = applib.BasicElement,
    WebElement = applib.getElementType('WebElement'),
    arryops = lR.get('allex_arrayoperationslib');

  function ScreensElement (id, options) {
    WebElement.call(this, id, options);
    this.screenLoading = false;
    this.screenReadyToShow = this.createBufferableHookCollection();
  }
  lib.inherit(ScreensElement, WebElement);
  ScreensElement.prototype.__cleanUp = function () {
    if (this.screenReadyToShow) {
      this.screenReadyToShow.destroy();
    }
    this.screenReadyToShow = null;
    this.screenLoading = null;
    WebElement.prototype.__cleanUp.call(this);
  };

  ScreensElement.prototype.handleActiveMenuItem = function (mitem) {
    var mitemname, screendesc, dfltcaption;
    if (!this.__children) {
      return;
    }
    mitemname = mitem ? mitem.id : null;
    screendesc = arryops.findElementWithProperty(this.getConfigVal('screens'), 'menuitem', mitemname);
    if (!screendesc) {
      //console.error('No screendesc for activemenuitem', mitemname, mitem);
      return;
    }
    dfltcaption = this.getConfigVal('defaultCaption') || 'Default';
    this.set('screenLoading', mitem ? mitem.getConfigVal('title') : dfltcaption);
    if (this.__children.length > 0) {
      this.__children.traverse(function (chld) {chld.destroy();});
    }
    screendesc.screen.name = (screendesc.menuitem || mitemname || 'Default')+'_Screen';
    screendesc.screen.options = screendesc.screen.options || {};
    applib.descriptorApi.pushToArraySafe('onInitiallyLoaded', screendesc.screen.options, screenReadyToShowHandler.bind(this));
    screendesc.screen.options.actual = true;
    screendesc.screen.options.self_selector = 'attrib:activescreen';
    try {
      this.createElement(screendesc.screen);
    } catch (e) {
      console.error('Could not create', screendesc.screen.name, e);
    }
  };
  
  //static, this is ScreensElement
  function screenReadyToShowHandler (el) {
    this.set('screenLoading', null);
    this.screenReadyToShow.fire(el);
  }

  applib.registerElementType('Screens', ScreensElement);
}
module.exports = createScreens;
