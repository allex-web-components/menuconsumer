(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (execlib) {
  'use strict';

  require('./prepreprocessors')(execlib);
  require('./screens')(execlib);


})(ALLEX);

},{"./prepreprocessors":2,"./screens":4}],2:[function(require,module,exports){
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
    desc.logic = desc.logic || [];
    if (this.config.screentitleselector) {
      var sts = this.config.screentitleselector;
      desc.logic.push({
        triggers: 'element.'+this.config.appmenuname+':activeElement',
        handler: this.onAppMenuActiveElementForScreenTitleSelector.bind(this)
      });
    }
  };
  MenuConsumerPrePreprocessor.prototype.onAppMenuActiveElementForScreenTitleSelector = function (actel) {
    if (!actel) {
      return;
    }
    if (!this.config.screentitleselector) {
      return;
    }
    jQuery(this.config.screentitleselector).text(actel.get('title'));
  };

  require('./screenfunctionalitycreator')(execlib, MenuConsumerPrePreprocessor);

  applib.registerPrePreprocessor('MenuConsumer', MenuConsumerPrePreprocessor);
}
module.exports = createPrePreprocessors;

},{"./screenfunctionalitycreator":3}],3:[function(require,module,exports){
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
        screens: this.config.screens
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

},{}],4:[function(require,module,exports){
function createScreenFunctionality (execlib) {
  'use strict';

  require('./screenscreator')(execlib);
}
module.exports = createScreenFunctionality;

},{"./screenscreator":5}],5:[function(require,module,exports){
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

},{}]},{},[1]);
