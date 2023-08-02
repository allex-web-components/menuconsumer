function createScreensBase (execlib) {
  'use strict';

  var lib = execlib.lib,
    lR = execlib.execSuite.libRegistry,
    browserlib = lR.get('allex_browserwebcomponent'),
    applib = lR.get('allex_applib'),
    arryops = lR.get('allex_arrayoperationslib'),
    WebElement = applib.getElementType('WebElement');

  function ScreensBaseElement (id, options) {
    WebElement.call(this, id, options);
    this.screenReadyToShow = this.createBufferableHookCollection();
    this.elementToActivate = null;
    this.screenLoading = false;
    this.needMenuItemListener = null;
  }
  lib.inherit(ScreensBaseElement, WebElement);
  ScreensBaseElement.prototype.__cleanUp = function () {
    purgeNeedMenuItemListener.call(this);
    this.screenLoading = null;
    this.elementToActivate = null;
    if (this.screenReadyToShow) {
      this.screenReadyToShow.destroy();
    }
    this.screenReadyToShow = null;
    WebElement.prototype.__cleanUp.call(this);
  };

  ScreensBaseElement.prototype.staticEnvironmentDescriptor = function (myname) {
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
  ScreensBaseElement.prototype.actualEnvironmentDescriptor = function (myname) {
    return {
      logic: [{
        triggers: 'element.'+myname+':elementToActivate',
        handler: this.handleActiveMenuItem.bind(this)
      }]
    }
  };

  ScreensBaseElement.prototype.set_elementToActivate = function (el) {
    this.elementToActivate = el;
    return true;
  };
  ScreensBaseElement.prototype.onMenuItemNeeded = function (menuitemneeded, screenoverlay) {
    if (!lib.isString(menuitemneeded)) {
      return;
    }
    applib.safeRunMethodOnAppElement(this.getConfigVal('appmenuname'), 'setActiveElementNameWithExtras', menuitemneeded, screenoverlay);
  };
  ScreensBaseElement.prototype.onEnvironmentState = function (state) {
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

  ScreensBaseElement.prototype.handleActiveMenuItem = function (mitem) {
    throw new lib.Error('NOT_IMPLEMENTED', this.constructor.name+' has to implement handleActiveMenuItem');
  };


  ScreensBaseElement.prototype.configForMenuItem = function (mitem) {
    var mitem, mitemname, screendesc, screendescovl, dfltcaption;
    mitemname = mitem ? mitem.id : null;
    screendesc = arryops.findElementWithProperty(this.getConfigVal('screens'), 'menuitem', mitemname);
    if (!screendesc) {
      if (!mitemname) {
        screendesc = arryops.findElementWithProperty(this.getConfigVal('screens'), 'default', true);
      }
      if (!screendesc) {
        //console.error('No screendesc for activemenuitem', mitemname, mitem);
        return null;
      }
      this.onMenuItemNeeded(screendesc.menuitem);
      return null;
    }
    screendescovl = mitem ? mitem.getConfigVal('screenoverlay') : null;
    if (screendescovl) {
      screendesc = lib.extend({}, screendesc, {screen: screendescovl});
    }
    dfltcaption = this.getConfigVal('defaultCaption') || 'Default';
    this.set('screenLoading', mitem ? mitem.getConfigVal('title') : dfltcaption);
    return {
      mitemname: mitemname,
      screendesc: screendesc
    };
  };
  ScreensBaseElement.prototype.elementDescriptorFromScreenDescriptor = function (myname, menuitemname, screendesc) {
    var mitemname = menuitemname;
    var miname;
    var screen;
    var elementname;
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
      name: elementname,
      type: screen.type,
      options: screen.options
    };
  };

    //static, this is ScreensBaseElement
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

  applib.registerElementType('ScreensBase', ScreensBaseElement);  
}
module.exports = createScreensBase;