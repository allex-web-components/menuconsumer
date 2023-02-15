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