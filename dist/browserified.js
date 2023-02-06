(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
function createScreenFunctionality (execlib) {
  'use strict';

  require('./screenscreator')(execlib);
}
module.exports = createScreenFunctionality;

},{"./screenscreator":2}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
(function (execlib) {
  'use strict';

  require('./prepreprocessors')(execlib);
  require('./elements')(execlib);


})(ALLEX);

},{"./elements":1,"./prepreprocessors":4}],4:[function(require,module,exports){
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

},{"./screenfunctionalitycreator":5}],5:[function(require,module,exports){
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

},{}]},{},[3]);
