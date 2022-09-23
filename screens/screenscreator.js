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
    this.screenReadyToShow = this.createBufferableHookCollection();
  }
  lib.inherit(ScreensElement, WebElement);
  ScreensElement.prototype.__cleanUp = function () {
    if (this.screenReadyToShow) {
      this.screenReadyToShow.destroy();
    }
    this.screenReadyToShow = null;
    WebElement.prototype.__cleanUp.call(this);
  };

  ScreensElement.prototype.handleActiveMenuItem = function (mitem) {
    var mitemname, screendesc, screenel;
    if (!this.__children) {
      return;
    }
    mitemname = mitem ? mitem.id : null;
    screendesc = arryops.findElementWithProperty(this.getConfigVal('screens'), 'menuitem', mitemname);
    if (!screendesc) {
      //console.error('No screendesc for activemenuitem', mitemname, mitem);
      return;
    }
    if (this.__children.length > 0) {
      this.__children.traverse(function (chld) {chld.destroy();});
    }
    screendesc.screen.name = (screendesc.menuitem || mitemname || 'Default')+'_Screen';
    screendesc.screen.options = screendesc.screen.options || {};
    screendesc.screen.options.actual = true;
    screendesc.screen.options.self_selector = 'attrib:activescreen';
    try {
      this.createElement(screendesc.screen);
      screenel = this.getElement(screendesc.screen.name);
      this.screenReadyToShow.fire(screenel);
    } catch (e) {
      console.error('Could not create and find', screendesc.screen.name, e);
    }
  };

  applib.registerElementType('Screens', ScreensElement);
}
module.exports = createScreens;
