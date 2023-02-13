(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
function createScreenFunctionality (execlib) {
  'use strict';

  require('./screenscreator')(execlib);
}
module.exports = createScreenFunctionality;

},{"./screenscreator":5}],2:[function(require,module,exports){
function createActiveMenuItemHandlerJobCore (lib, applib, arryops, mylib) {
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
    lib.qlib.promise2console(applib.queryAppProperties({
      'options.account': 'datasource.ActualComposite:data'
    }), 'datasource.ActualComposite:data');

    var mitem, mitemname, screendesc, screendescovl, dfltcaption;
    if (!this.screens.__children) {
      return;
    }
    mitem = this.item;
    mitemname = mitem ? mitem.id : null;
    screendesc = arryops.findElementWithProperty(this.screens.getConfigVal('screens'), 'menuitem', mitemname);
    if (!screendesc) {
      if (!mitemname) {
        screendesc = arryops.findElementWithProperty(this.screens.getConfigVal('screens'), 'default', true);
      }
      if (!screendesc) {
        //console.error('No screendesc for activemenuitem', mitemname, mitem);
        return;
      }
    }
    screendescovl = mitem ? mitem.getConfigVal('screenoverlay') : null;
    if (screendescovl) {
      screendesc = lib.extend({}, screendesc, {screen: screendescovl});
    }
    dfltcaption = this.screens.getConfigVal('defaultCaption') || 'Default';
    this.screens.set('screenLoading', mitem ? mitem.getConfigVal('title') : dfltcaption);
    this.screens.mitemname = mitemname;
    this.screens.screendesc = screendesc;
    mitemname = mitem ? mitem.id : null;
    if (this.screens.__children.length > 0) {
      this.screens.__children.traverse(function (chld) {chld.destroy();});
      lib.runNext(onChildrenDeadActivate.bind(this.screens));
      return;
    }
    onChildrenDeadActivate.call(this.screens);
  };

  ActiveMenuItemHandlerJobCore.prototype.steps = [
    'activate'
  ];

  //static, this is ScreensElement
  function onChildrenDeadActivate () {
    this.set('actual', false);
    this.set('actual', true);
  }
  //endof static

  mylib.ActiveMenuItemHandler = ActiveMenuItemHandlerJobCore;
}
module.exports = createActiveMenuItemHandlerJobCore;
},{}],3:[function(require,module,exports){
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
},{}],4:[function(require,module,exports){
function createJobCores (lib, applib, arryops) {
  'use strict';

  var mylib = {};

  require('./basecreator')(lib, mylib);
  require('./activemenuitemhandlercreator')(lib, applib, arryops, mylib);

  return mylib;
}
module.exports = createJobCores;
},{"./activemenuitemhandlercreator":2,"./basecreator":3}],5:[function(require,module,exports){
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

},{"./jobcores":4}],6:[function(require,module,exports){
(function (execlib) {
  'use strict';

  require('./prepreprocessors')(execlib);
  require('./elements')(execlib);


})(ALLEX);

},{"./elements":1,"./prepreprocessors":7}],7:[function(require,module,exports){
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

},{"./screenfunctionalitycreator":8}],8:[function(require,module,exports){
function createScreenFunctionalityOnMenuConsumerPrePreprocessor (execlib, MenuConsumerPrePreprocessor) {
  'use strict';

  var lib = execlib.lib,
    lR = execlib.execSuite.libRegistry;

  MenuConsumerPrePreprocessor.prototype.processScreens = function (desc) {
    desc.elements = desc.elements||[];
    desc.elements.push({
      type: 'Screens',
      name: this.config.screenselement.name,
      options: {
        actual: true,
        self_selector: this.config.screenselement.self_selector,
        environmentname: this.config.screenselement.environment,
        screens: this.config.screens
      }
    });

    desc.links = desc.links || [];
    desc.links.push({
      source: 'element.'+this.config.screenselement.name+':neededMenuItemName',
      target: 'element.'+this.config.appmenuname+':activeElementName',
    },{
      source: 'element.'+this.config.screenselement.name+'!screenReadyToShow',
      target: 'element.'+this.config.appmenuname+':activeElementName',
      filter: function (el) {
        return el.getConfigVal('miname');
      }
    });

    desc.logic = desc.logic || [];
    desc.logic.push({
      triggers: 'element.'+this.config.appmenuname+':activeElement',
      references: 'element.'+this.config.screenselement.name,
      handler: function (screens, activeel) {
        screens.handleActiveMenuItem(activeel);
      }
    });
  };
}
module.exports = createScreenFunctionalityOnMenuConsumerPrePreprocessor;

},{}]},{},[6]);
