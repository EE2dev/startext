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
  options.backgroundImage = "https://ee2dev.github.io/startext/lib/backgroundImage.js";
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
    if (!arguments.length) return options.backgroundColor;
    options.backgroundColor = _;
    return chartAPI;
  };

  chartAPI.backgroundImage = function(_) {
    if (!arguments.length) return options.backgroundImage;
    options.backgroundImage = _;
    return chartAPI;
  };

  chartAPI.explosionStrength = function(_) {
    if (!arguments.length) return options.explosionStrength;
    if (_ < 0) { _ = 0; }
    else if (_ > 1) { _ = 1; }
    let s = d3.scalePow().domain([0,1]).range([1,0]);
    options.explosionStrength = options.explosionStrength + s(_);
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
    if (_ < 0) { _ = 0; }
    else if (_ > 1) { _ = 1; }
    let s = d3.scaleLinear().domain([0,1]).range([20,1]);
    options.transitionSpeed = s(_);
    return chartAPI;
  };

  return chartAPI;
}