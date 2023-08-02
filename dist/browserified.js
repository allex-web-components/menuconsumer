(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
},{}],2:[function(require,module,exports){
function createScreenFunctionality (execlib) {
  'use strict';

  require('./basecreator')(execlib);
  require('./screens')(execlib);
  require('./preloadedscreens')(execlib);
}
module.exports = createScreenFunctionality;

},{"./basecreator":1,"./preloadedscreens":3,"./screens":4}],3:[function(require,module,exports){
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
      this.screenReadyToShow.fire(this.currentlyActual);
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
},{}],4:[function(require,module,exports){
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

},{"./jobcores":7}],5:[function(require,module,exports){
function createActiveMenuItemHandlerJobCore (lib, browserlib, applib, arryops, mylib) {
  'use strict';

  var Base = mylib.Base;

  function ActiveMenuItemHandlerJobCore (screens, item) {
    Base.call(this, screens);
    this.item = item;
  }
  lib.inherit(ActiveMenuItemHandlerJobCore, Base);
  ActiveMenuItemHandlerJobCore.prototype.destroy = function () {
    this.item = null;
    Base.prototype.destroy.call(this);
  };

  ActiveMenuItemHandlerJobCore.prototype.activate = function () {
    /*
    lib.qlib.promise2console(applib.queryAppProperties({
      'options.account': 'datasource.ActualComposite:data'
    }), 'datasource.ActualComposite:data');
    */
    var mitem, mitemname, screendesc, screendescovl, dfltcaption, d, ret, config;
    if (!this.screens.__children) {
      return;
    }
    mitem = this.item;
    config = this.screens.configForMenuItem(mitem);
    if (!config) {
      return;
    }
    d = lib.q.defer();
    ret = d.promise;
    browserlib.viewTransition.start(screensDestroyer.bind(this, d, config));
    config = null;
    d = null;
    return ret;
    /*
    */
  };
  function screensDestroyer (defer, config) {
    if (this.screens.__children.length > 0) {
      this.screens.__children.traverse(function (chld) {chld.destroy();});
      lib.runNext(defer.resolve.bind(defer, config));
      defer = null;
      config = null;
      return;
    }
    defer.resolve(config);
    defer = null;
    config = null;
  }
  ActiveMenuItemHandlerJobCore.prototype.onChildrenDeadActivate = function (config) {
    return config ? this.screens.loadAdHocEnvironmentJob('CentralScreen', config).go() : null;
  };
  

  ActiveMenuItemHandlerJobCore.prototype.steps = [
    'activate',
    'onChildrenDeadActivate'
  ];

  mylib.ActiveMenuItemHandler = ActiveMenuItemHandlerJobCore;
}
module.exports = createActiveMenuItemHandlerJobCore;
},{}],6:[function(require,module,exports){
function createBaseJobCore (lib, mylib) {
  'use strict';

  function BaseJobCore (screens) {
    this.screens = screens;
    this.finalResult = void 0;
  }
  BaseJobCore.prototype.destroy = function () {
    this.finalResult = null;
    this.screens = null;
  };
  BaseJobCore.prototype.shouldContinue = function () {
    if (lib.defined(this.finalResult)) {
      return this.finalResult;
    }
    if(!this.screens) {
      throw new lib.Error('NO_SCREENS', this.constructor.name+' needs to have screens');
    }
    if (!this.screens.destroyed) {
      throw new lib.Error('NO_SCREENS.DESTROYED', this.constructor.name+' holds a destroyed screens instance');
    }
  };

  mylib.Base = BaseJobCore;
}
module.exports = createBaseJobCore;
},{}],7:[function(require,module,exports){
function createJobCores (execlib, applib, arryops) {
  'use strict';

  var lR = execlib.execSuite.libRegistry;
  var browserlib = lR.get('allex_browserwebcomponent');

  var mylib = {};

  require('./basecreator')(execlib.lib, mylib);
  require('./activemenuitemhandlercreator')(execlib.lib, browserlib, applib, arryops, mylib);

  return mylib;
}
module.exports = createJobCores;
},{"./activemenuitemhandlercreator":5,"./basecreator":6}],8:[function(require,module,exports){
(function (execlib) {
  'use strict';

  var lR = execlib.execSuite.libRegistry,
    mylib = {};

  require('./prepreprocessors')(execlib);
  require('./elements')(execlib);

  require('./mixins')(execlib, mylib);

  lR.register('allex_menuconsumerwebcomponent', mylib);
})(ALLEX);

},{"./elements":2,"./mixins":9,"./prepreprocessors":11}],9:[function(require,module,exports){
function createMixins (lib, mylib) {
  var mixins = {};
  require('./needmenuitemcreator')(lib, mixins);
  mylib.mixins = mixins;
}
module.exports = createMixins;
},{"./needmenuitemcreator":10}],10:[function(require,module,exports){
function createNeedMenuItemMixin (lib, mylib) {
  'use strict';

  function NeedMenuItemMixin () {
    this.needMenuItem = this.createBufferableHookCollection();
  }
  NeedMenuItemMixin.prototype.destroy = function () {
    if(this.needMenuItem) {
       this.needMenuItem.destroy();
    }
    this.needMenuItem = null;
  };
  NeedMenuItemMixin.addMethods = function (klass) {

  };

  mylib.NeedMenuItem = NeedMenuItemMixin;
}
module.exports = createNeedMenuItemMixin;
},{}],11:[function(require,module,exports){
function createPrePreprocessors (execlib) {
  'use strict';

  var lib = execlib.lib,
    lR = execlib.execSuite.libRegistry,
    applib = lR.get('allex_applib'),
    BasicProcessor = applib.BasicProcessor;

  function MenuConsumerPrePreprocessor () {
    BasicProcessor.call(this);
  }
  lib.inherit(MenuConsumerPrePreprocessor, BasicProcessor);
  MenuConsumerPrePreprocessor.prototype.process = function (desc) {
    var screentitleselector;
    if (!this.config) {
      throw new lib.Error('NO_CONFIG', 'I have no config');
    }
    if (!this.config.appmenuname) {
      throw new lib.Error('NO_CONFIG_APPMENUNAME', 'The config has no appmenuname');
    }
    if (!this.config.screenselement) {
      throw new lib.Error('NO_CONFIG_SCREENSELEMENTSUBCONFIG', 'The config has no screenselement subconfig object');
    }
    if (!this.config.screenselement.name) {
      throw new lib.Error('NO_CONFIG_SCREENSELEMENTSUBCONFIG_NAME', 'The config.creenselement subconfig object must have a name');
    }
    this.processScreens(desc);
    screentitleselector = this.config.screentitleselector;
    if (screentitleselector) {
      desc.logic = desc.logic || [];
      if (this.config.screentitleselector) {
        desc.logic.push({
          triggers: 'element.'+this.config.appmenuname+':activeElement',
          handler: onAppMenuActiveElementForScreenTitleSelector.bind(null, screentitleselector)
        });
      }
    }
    screentitleselector = null;
  };
  function onAppMenuActiveElementForScreenTitleSelector (screentitleselector, actel) {
    if (!actel) {
      return;
    }
    if (!screentitleselector) {
      return;
    }
    jQuery(screentitleselector).text(actel.get('title'));
  };

  require('./screenfunctionalitycreator')(execlib, MenuConsumerPrePreprocessor);

  applib.registerPrePreprocessor('MenuConsumer', MenuConsumerPrePreprocessor);
}
module.exports = createPrePreprocessors;

},{"./screenfunctionalitycreator":12}],12:[function(require,module,exports){
function createScreenFunctionalityOnMenuConsumerPrePreprocessor (execlib, MenuConsumerPrePreprocessor) {
  'use strict';

  var lib = execlib.lib,
    lR = execlib.execSuite.libRegistry;

  MenuConsumerPrePreprocessor.prototype.processScreens = function (desc) {
    desc.elements = desc.elements||[];
    desc.elements.push({
      type: this.config.preload ? 'PreloadedScreens' : 'Screens',
      name: this.config.screenselement.name,
      options: {
        actual: this.config.actual,
        self_selector: this.config.screenselement.self_selector,
        environmentname: this.config.screenselement.environment,
        screens: this.config.screens,
        appmenuname: this.config.appmenuname
      }
    });

    desc.links = desc.links || [];
    desc.links.push({
      source: 'element.'+this.config.appmenuname+':activeElement',
      target: 'element.'+this.config.screenselement.name+':elementToActivate',
      filter: function (el) {
        console.log('activeElement link', el);
        return el;
      }
    },{
      source: 'element.'+this.config.screenselement.name+'!screenReadyToShow',
      target: 'element.'+this.config.appmenuname+':activeElementName',
      filter: function (el) {
        return el.getConfigVal('miname');
      }
    });

    desc.logic = desc.logic || [];
    /*
    desc.logic.push({
      triggers: 'element.'+this.config.appmenuname+':activeElement',
      references: 'element.'+this.config.screenselement.name,
      handler: function (screens, activeel) {
        console.log('activeElement in logic', activeel);
        //screens.handleActiveMenuItem(activeel);
      }
    });
    */
  };
}
module.exports = createScreenFunctionalityOnMenuConsumerPrePreprocessor;

},{}]},{},[8]);
