import * as d3 from "d3";
import WebFont from "webfontloader";
import { createFrames, App } from "./stars";
import { backgroundImage } from "./backgroundImage";
import { STARS, ROTATION, SCALE } from "./constants";

export {animate};

let pathDurations = []; // path durations are computed based on the number of letters per line
let app; // the main class in stars.js to create the particles
let index = 0; // counter for each page of the intro 

// options
let containerDiv; // the selection containing the animation
let myIntro = []; // array of array of strings. Each array of strings is displayed on one page. Each string is animated on one line.
let transitionSpeed;
let explosionStrength;
let pause;
let replay; 

let starOptions = {
  mouseListener: false,
  frames: createFrames(5, 80, 80),
  maxParticles: 2000,
  blendMode: "lighter",
  filterBlur: 50,
  filterContrast: 300,
  useBlurFilter: true,
  useContrastFilter: true
};

function setOptions(_options){
  containerDiv = _options.containerDiv.classed("introchart", true);
  myIntro = _options.myIntro;
  transitionSpeed = _options.transitionSpeed;
  explosionStrength = _options.explosionStrength;
  pause = _options.pause;
  replay = _options.replay;
  starOptions.background = _options.background;
  starOptions.backgroundColor = _options.backgroundColor;
}

function animate(_options){
  setOptions(_options);
  // the following ensures the fonts have arrived at the client before the animation starts 
  WebFont.load({
    google: { families: ["Indie Flower"]},
    fontactive: function(){ //This is called once font has been rendered in browser
      display(myIntro[0]);
    },
  });
}

function display(introPage) {
  displayText(introPage);
  createPaths();
  animateStars(introPage.defaultLine, introPage.punchLine);
}

function displayText(_textArray) {
  let sel = containerDiv;
  
  // add headers for all strings by wrapping each letter around a span
  // which can be styled individually
  for (let ta = 0; ta < _textArray.length; ta++) {
    let sel2 = sel.append("div")
        .attr("class", "widthForIE h" + ta)
      .append("div")
        .attr("class", "header h" + ta)
      .append("h1")
        .attr("class", "trans");
  
    let myString = _textArray[ta];
    for (let i = 0; i < myString.length; i++) {
      sel2.append("span")
        .attr("class", (ta < _textArray.length -1) ? "rotate" : "burst " + "color-" + (i % 5))
        .text(myString[i]); 
    }
  }
}

function createPaths() {
  var w = window.innerWidth
  || document.documentElement.clientWidth
  || document.body.clientWidth;
  
  var h = window.innerHeight
  || document.documentElement.clientHeight
  || document.body.clientHeight;

  let sel = containerDiv
    .append("div")
    .attr("class", "paths")
    .append("svg")
    .attr("width", w)
    .attr("height", h);
  
  const container = containerDiv.node().getBoundingClientRect();
  
  containerDiv.selectAll("h1")
    .each(function(d,i) {
      let bBox = d3.select(this).node().getBoundingClientRect();
      // get width from all spans for IE
      let textWidth = 0;
      d3.select(this).selectAll("span")
        .each(function(d) {
          let w = d3.select(this).node().getBoundingClientRect().width;
          textWidth = textWidth + w;
        });

      let pos = {};
      pos.width = textWidth;
      pos.xStart = (container.width - textWidth) / 2;
      pos.yStart = bBox.top + (bBox.height / 2) - container.top;

      let p = sel.append("path")
        .attr("class", "header hidden trans " + "h" + i)
        .attr("d", () => {
          let str =  "M" + pos.xStart + " " + pos.yStart
        + " L" + (pos.width + pos.xStart) + " " + pos.yStart;
          return str;
        });
    
      let duration = p.node().getTotalLength() * transitionSpeed;
      pathDurations.push(duration);
    });
}

function intializeStars() {
  let bBox = containerDiv.node().getBoundingClientRect();
  containerDiv.insert("div", ".widthForIE.h0")
    .attr("class", "stars")
    .append("canvas")
    .attr("id", "view")
    .attr("width", bBox.width)
    .attr("height", bBox.height);

  starOptions.texture = document.querySelector("#star-texture-white");
  starOptions.view = document.querySelector("#view");
  let background = new Image();
  background.src = backgroundImage;
  starOptions.backgroundImage = background;
  
  app = new App(starOptions);
  window.addEventListener("load", app.start());
  window.focus();
}

function starsAlongPath(path) {
  let l = path.getTotalLength();
  return function(d, i, a) {
    return function(t) {
      let p = path.getPointAtLength(t * l);
      app.spawn(p.x , p.y);
      return "translate(0,0)";
    };
  };
}

function animateStars(defaultLine, punchLine) {
  intializeStars();
  if (typeof defaultLine === "undefined") { defaultLine = STARS; }
  if (typeof punchLine === "undefined") { punchLine = STARS; }
  let durations = pathDurations.concat(pathDurations);
  let chainedSel = d3.selectAll(".trans").data(durations);
  chainedTransition(chainedSel);

  function chainedTransition(_chainedSel, _index = 0) {
    const num_headers = _chainedSel.size() / 2;
    let nextSel = _chainedSel.filter((d,i) => (i % num_headers) === _index);
    switch (defaultLine) {
    case STARS: 
      transitionDefault(nextSel);
      break;
    case ROTATION:
      transitionDefaultRotate(nextSel);
      break;
    case SCALE:
      transitionDefaultScale(nextSel);
      break;
    default:
      transitionDefault(nextSel);
    }

    function transitionDefault(_selection){
      if (_index === num_headers - 1) { transitionLast(_selection); }
      else {
        // the header
        let thisSel = _selection.filter((d,i) => i === 0);
        let duration = thisSel.node().__data__;
        let letters = thisSel.selectAll("span");
        let numLetters = letters.size();
        letters
          .transition()
          .duration(1000)
          .delay((d,i) => 1000 + i / numLetters * duration)
          .ease(d3.easeLinear)
          .style("opacity", 1);
        // the path
        let sel = _selection.filter((d,i) => i === 1);
        sel.transition()
          .duration(d => d)
          .delay(1000)
          .ease(d3.easeLinear)
          .attrTween("transform", starsAlongPath(sel.node()))
          .on ("end", function() {
            _index = _index + 1;
            if (num_headers > _index) { 
              nextSel = _chainedSel.filter((d,i) => (i % num_headers) === _index);
              transitionDefault(nextSel);
            } 
          });
      }
    }
    
    function transitionDefaultRotate(_selection){
      if (_index === num_headers - 1) { transitionLast(_selection); }
      else {
        let letters = _selection.filter((d,i) => i === 0).selectAll("span");
        letters
          .style("-webkit-transform", "rotate(-0deg) scale(.001)")
          .transition()
          .duration(2000)
          .delay((d,i) => i * 200)
          .style("opacity", 1)
          .style("-webkit-transform", "rotate(-720deg) scale(1)")
          .on ("end", function(d,i) {
            if (i === letters.size()-1) {
              _index = _index + 1;
              if (num_headers > _index) { 
                nextSel = _chainedSel.filter((d,i) => (i % num_headers) === _index);
                transitionDefaultRotate(nextSel);
              } 
            }
          });
      }
    }

    function transitionDefaultScale(_selection){
      if (_index === num_headers - 1) { transitionLast(_selection); }
      else {
        let letters = _selection.filter((d,i) => i === 0).selectAll("span");
        const fs = letters.style("font-size");
        letters
          .style("font-size", "0px")
          .transition()
          .duration(2000)
          .delay((d,i) => i * 200)
          .style("opacity", 1)
          .style("font-size", fs)
          .on ("end", function(d,i) {
            if (i === letters.size()-1) {
              _index = _index + 1;
              if (num_headers > _index) { 
                nextSel = _chainedSel.filter((d,i) => (i % num_headers) === _index);
                transitionDefaultScale(nextSel);
              } 
            }
          });
      }
    }

    function transitionLast(_selection){
      setTimeout( function() { 
        app.setActivate(false);
        switch (punchLine) {
        default:
          transitionPunch(_selection);
        }
      }, 1000);
    }

    function transitionPunch(_selection){
      starOptions.texture = document.querySelector("#star-texture");
      let app2 = new App(starOptions);
      window.addEventListener("load", app2.start());
      window.focus();
      // the header
      let letters = _selection.filter((d,i) => i === 0).selectAll("span");
      letters.transition()
        .duration(0)
        .style("opacity", 1);

      // the path
      let path = _selection.filter((d,i) => i === 1).node();
      let l = path.getTotalLength();
      
      for (let t = 0; t < 1; t = t + explosionStrength) { 
        let p = path.getPointAtLength(t * l);
        app2.spawn(p.x , p.y);        
      }

      setTimeout( function() {
        app2.setActivate(false); 
        pathDurations = [];
        containerDiv.selectAll("*").remove();
        index = index + 1;
        if (index >= myIntro.length) {
          index = 0;
          if (!replay)
            return;
        } 
        display(myIntro[index]);
      }, pause);
    }
  }
}