import * as d3 from "d3";
import { animate } from "./animateStars";
import { COLOR } from "./constants";

export default function (_myIntro) {
  "use strict";

  let options = {};
  options.replay = true;
  options.explosionStrength = (checkForIE()) ? 0.01 : 0.002;
  options.pause = 5000; // pause in milliseconds in between the pages 
  options.transitionSpeed = 7;
  options.background = COLOR;
  options.backgroundColor = "#111111";
  options.myIntro = _myIntro;

  function checkForIE(){
    const msie = window.navigator.userAgent.indexOf("MSIE ");
    return (msie !== -1);
  }

  // API for external access
  function chartAPI(selection) {
    selection.each(function () {
      options.containerDiv = d3.select(this);
      animate(options);
    });
    return chartAPI;
  }

  chartAPI.background = function(_) {
    if (!arguments.length) return options.background;
    options.background = _;
    return chartAPI;
  };

  chartAPI.backgroundColor = function(_) {
    if (!arguments.length) return options.background;
    options.background = _;
    return chartAPI;
  };

  chartAPI.explosionStrength = function(_) {
    if (!arguments.length) return options.explosionStrength;
    options.explosionStrength = _;
    return chartAPI;
  }; 

  chartAPI.pause = function(_) {
    if (!arguments.length) return options.pause;
    options.pause = _;
    return chartAPI;
  };
    
  chartAPI.replay = function(_) {
    if (!arguments.length) return options.replay;
    options.replay = _;
    return chartAPI;
  }; 

  chartAPI.transitionSpeed = function(_) {
    if (!arguments.length) return options.transitionSpeed;
    options.transitionSpeed = _;
    return chartAPI;
  };

  return chartAPI;
}