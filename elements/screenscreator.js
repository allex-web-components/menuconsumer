function createScreens (execlib) {
  'use strict';

  var lib = execlib.lib,
    lR = execlib.execSuite.libRegistry,
    applib = lR.get('allex_applib'),
    BasicElement = applib.BasicElement,
    WebElement = applib.getElementType('WebElement'),
    arryops = lR.get('allex_arrayoperationslib'),
    jobcores = require('./jobcores')(lib, applib, arryops);

  function ScreensElement (id, options) {
    WebElement.call(this, id, options);
    this.screenLoading = false;
    this.screenReadyToShow = this.createBufferableHookCollection();
    this.neededMenuItemName = null;
    this.mitemname = null;
    this.screendesc = null;
    this.needMenuItemListener = null;
  }
  lib.inherit(ScreensElement, WebElement);
  ScreensElement.prototype.__cleanUp = function () {
    purgeNeedMenuItemListener.call(this);
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
    var elementname;
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
    elementname = myname+'.'+screen.name;
    return {
      elements: [{
        name: elementname,
        type: screen.type,
        options: screen.options
      }]
    };
  };

  ScreensElement.prototype.handleActiveMenuItem = function (mitem) {
    return lib.qlib.promise2console(this.jobs.run('.', lib.qlib.newSteppedJobOnSteppedInstance(
      new jobcores.ActiveMenuItemHandler(this, mitem)
    )), 'handleActiveMenuItem');
  };

  ScreensElement.prototype.onMenuItemNeeded = function (menuitemneeded) {
    if (!menuitemneeded) {
      return;
    }
    if (!menuitemneeded.name) {
      return;
    }
  };

  //static, this is ScreensElement
  function screenReadyToShowHandler (el) {
    this.set('screenLoading', null);
    this.screenReadyToShow.fire(el);
    purgeNeedMenuItemListener.call(this);
    if (el && el.needMenuItem && lib.isFunction(el.needMenuItem.fire)) {
      this.needMenuItemListener = el.needMenuItem.attach(this.onMenuItemNeeded.bind(this));
    }
  }
  function purgeNeedMenuItemListener () {
    if (this.needMenuItemListener) {
      this.needMenuItemListener.destroy();
    }
    this.needMenuItemListener = null;
  }
  //endof static

  applib.registerElementType('Screens', ScreensElement);
}
module.exports = createScreens;
