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
