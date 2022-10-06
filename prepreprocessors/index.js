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
