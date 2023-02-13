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