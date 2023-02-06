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
    this.neededMenuItemName = null;
    this.mitemname = null;
    this.screendesc = null;
  }
  lib.inherit(ScreensElement, WebElement);
  ScreensElement.prototype.__cleanUp = function () {
    this.screendesc = null;
    this.mitemname = null;
    this.neededMenuItemName = null;
    if (this.screenReadyToShow) {
      this.screenReadyToShow.destroy();
    }
    this.screenReadyToShow = null;
    this.screenLoading = null;
    WebElement.prototype.__cleanUp.call(this);
  };

  ScreensElement.prototype.staticEnvironmentDescriptor = function (myname) {
    return {
      links: [{
        source: 'environment.'+this.getConfigVal('environmentname')+':state',
        target: 'element.'+myname+':actual',
        filter: function (state) {
          return state=='established'
        }
      }]
    }
  };
  ScreensElement.prototype.actualEnvironmentDescriptor = function (myname) {
    var mitemname = this.mitemname;
    var screendesc = this.screendesc;
    var miname;
    var screen;
    this.mitemname = null;
    this.screendesc = null;
    if (!screendesc) {
      return;
    }
    miname = (screendesc.menuitem || mitemname || 'Default');
    screen = screendesc.screen;
    screen.name = (screendesc.menuitem || mitemname || 'Default')+'_Screen';
    screen.options = screen.options || {};
    applib.descriptorApi.pushToArraySafe('onInitiallyLoaded', screen.options, screenReadyToShowHandler.bind(this));
    screen.options.actual = true;
    screen.options.self_selector = 'attrib:activescreen';
    screen.options.miname = miname;
    return {
      elements: [{
        name: myname+'.'+screen.name,
        type: screen.type,
        options: screen.options
      }]
    };
  };

  ScreensElement.prototype.handleActiveMenuItem = function (mitem) {
    var mitemname, screendesc, dfltcaption;
    if (!this.__children) {
      return;
    }
    mitemname = mitem ? mitem.id : null;
    screendesc = arryops.findElementWithProperty(this.getConfigVal('screens'), 'menuitem', mitemname);
    if (!screendesc) {
      if (!mitemname) {
        screendesc = arryops.findElementWithProperty(this.getConfigVal('screens'), 'default', true);
      }
      if (!screendesc) {
        //console.error('No screendesc for activemenuitem', mitemname, mitem);
        return;
      }
    }
    dfltcaption = this.getConfigVal('defaultCaption') || 'Default';
    this.set('screenLoading', mitem ? mitem.getConfigVal('title') : dfltcaption);
    this.mitemname = mitemname;
    this.screendesc = screendesc;
    mitemname = mitem ? mitem.id : null;
    if (this.__children.length > 0) {
      this.__children.traverse(function (chld) {chld.destroy();});
      lib.runNext(onChildrenDeadActivate.bind(this));
      return;
    }
    onChildrenDeadActivate.call(this);
  };
  
  //static, this is ScreensElement
  function onChildrenDeadActivate () {
    this.set('actual', false);
    this.set('actual', true);
  }
  function screenReadyToShowHandler (el) {
    this.set('screenLoading', null);
    this.screenReadyToShow.fire(el);
  }

  applib.registerElementType('Screens', ScreensElement);
}
module.exports = createScreens;
