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