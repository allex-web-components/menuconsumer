function createScreen (execlib) {
  'use strict';

  var lib = execlib.lib,
    lR = execlib.execSuite.libRegistry,
    applib = lR.get('allex_applib'),
    WebElement = applib.getElementType('WebElement');

  function ScreenElement (id, options) {
    WebElement.call(this, id, options);
    this.environment = null;
  }
  lib.inherit(ScreenElement, WebElement);
  ScreenElement.prototype.__cleanUp = function () {
    if (this.environment) {
      this.environment.destroy();
    }
    WebElement.prototype.__cleanUp.call(this);
  };
  ScreenElement.prototype.onLoaded = function () {
    var envdesc;
    envdesc = this.getConfigVal('environment');
    if (envdesc) {
      this.environment = new applib.DescriptorHandler(envdesc);
      this.environment.load().then(
        this.onEnvironment.bind(this),
        this.destroy.bind(this)
      );
    }
  };
  ScreenElement.prototype.onEnvironment = function () {
    if (lib.isArray(this.environment.environmentNames)) {
      this.environment.environmentNames.forEach(this.establishLocalEnvironment.bind(this));
    }
    WebElement.prototype.onLoaded.call(this);
  };
  ScreenElement.prototype.establishLocalEnvironment = function (envname) {
    this.environment.app.environments.get(envname).set('state', 'established');
  };

  applib.registerElementType('Screen', ScreenElement);
}
module.exports = createScreen;

