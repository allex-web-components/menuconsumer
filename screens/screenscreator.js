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
  }
  lib.inherit(ScreensElement, WebElement);
  ScreensElement.prototype.__cleanUp = function () {
    WebElement.prototype.__cleanUp.call(this);
  };

  ScreensElement.prototype.handleActiveMenuItem = function (mitem) {
    var mitemname, screendesc;
    if (!this.__children) {
      return;
    }
    mitemname = mitem ? mitem.id : null;
    screendesc = arryops.findElementWithProperty(this.getConfigVal('screens'), 'menuitem', mitemname);
    if (!screendesc) {
      console.error('No screendesc for activemenuitem', mitemname, mitem);
      return;
    }
    if (this.__children.length > 0) {
      this.__children.traverse(function (chld) {chld.destroy();});
    }
    screendesc.screen.name = (screendesc.menuitem || mitemname || 'Default')+'_Screen';
    screendesc.screen.options = screendesc.screen.options || {};
    screendesc.screen.options.actual = false;
    screendesc.screen.options.self_selector = 'attrib:activescreen';
    this.createElement(screendesc.screen);
    this.getElement(screendesc.screen.name).set('actual', true);
  };

  applib.registerElementType('Screens', ScreensElement);
}
module.exports = createScreens;
