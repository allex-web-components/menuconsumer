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