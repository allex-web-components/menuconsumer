function createScreens (execlib) {
  'use strict';

  var lib = execlib.lib,
    lR = execlib.execSuite.libRegistry,
    browserlib = lR.get('allex_browserwebcomponent'),
    applib = lR.get('allex_applib'),
    WebElement = applib.getElementType('WebElement'),
    arryops = lR.get('allex_arrayoperationslib'),
    jobcores = require('./jobcores')(execlib, applib, arryops);

  function ScreensElement (id, options) {
    WebElement.call(this, id, options);
    this.screenLoading = false;
    this.screenReadyToShow = this.createBufferableHookCollection();
    this.elementToActivate = null;
    this.needMenuItemListener = null;
  }
  lib.inherit(ScreensElement, WebElement);
  ScreensElement.prototype.__cleanUp = function () {    
    purgeNeedMenuItemListener.call(this);
    this.elementToActivate = null;
    if (this.screenReadyToShow) {
      this.screenReadyToShow.destroy();
    }
    this.screenReadyToShow = null;
    this.screenLoading = null;
    WebElement.prototype.__cleanUp.call(this);
  };

  ScreensElement.prototype.staticEnvironmentDescriptor = function (myname) {
    var ret = {
      logic: []
    };
    var environmentname = this.getConfigVal('environmentname');
    if (environmentname) {
      ret.logic.push({
        triggers: 'environment.'+environmentname+':state',
        handler: this.onEnvironmentState.bind(this)
      });
    }
    return ret;
  };
  ScreensElement.prototype.actualEnvironmentDescriptor = function (myname) {
    return {
      logic: [{
        triggers: 'element.'+myname+':elementToActivate',
        handler: this.handleActiveMenuItem.bind(this)
      }]
    }
  };

  ScreensElement.prototype.environmentDescriptor_for_CentralScreen = function (myname, config) {
    var mitemname = config.mitemname;
    var screendesc = config.screendesc;
    var miname;
    var screen;
    var elementname;
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

  ScreensElement.prototype.set_elementToActivate = function (el) {
    this.elementToActivate = el;
    return true;
  };
  ScreensElement.prototype.handleActiveMenuItem = function (mitem) {
    this.jobs.run('.', lib.qlib.newSteppedJobOnSteppedInstance(
      new jobcores.ActiveMenuItemHandler(this, mitem)
    ));
  };

  ScreensElement.prototype.onMenuItemNeeded = function (menuitemneeded, screenoverlay) {
    if (!lib.isString(menuitemneeded)) {
      return;
    }
    applib.safeRunMethodOnAppElement(this.getConfigVal('appmenuname'), 'setActiveElementNameWithExtras', menuitemneeded, screenoverlay);
  };

  ScreensElement.prototype.onEnvironmentState = function (state) {
    var actual = this.get('actual');
    if (!lib.isVal(state)) {
      this.set('actual', false);
      return;
    }
    if (actual) {
      return;
    }
    if (state=='established') {
      this.set('actual', true);
    }
  };

  //static, this is ScreensElement
  function screenReadyToShowHandler (el) {
    browserlib.viewTransition.end();
    this.set('screenLoading', null);
    purgeNeedMenuItemListener.call(this);
    if (el && el.needMenuItem && lib.isFunction(el.needMenuItem.fire)) {
      this.needMenuItemListener = el.needMenuItem.attach(this.onMenuItemNeeded.bind(this));
    }
    this.screenReadyToShow.fire(el);
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
