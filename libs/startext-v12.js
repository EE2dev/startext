(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3'), require('webfontloader')) :
  typeof define === 'function' && define.amd ? define(['exports', 'd3', 'webfontloader'], factory) :
  (factory((global.startext = global.startext || {}),global.d3,global.WebFont));
}(this, function (exports,d3,WebFont) { 'use strict';

  WebFont = 'default' in WebFont ? WebFont['default'] : WebFont;

  // options for background
  var COLOR = 1;
  var IMAGE = 2;

  // options for animation 
  var STARS = 0;
  var ROTATION = 1;
  var SCALE = 2;

  // polyfill for IE (Object.assign is not supported)
  if (typeof Object.assign != "function") {
    // Must be writable: true, enumerable: false, configurable: true
    Object.defineProperty(Object, "assign", {
      value: function assign(target, varArgs) {
        // .length of function is 2
        "use strict";

        if (target == null) {
          // TypeError if undefined or null
          throw new TypeError("Cannot convert undefined or null to object");
        }

        var to = Object(target);

        for (var index = 1; index < arguments.length; index++) {
          var nextSource = arguments[index];

          if (nextSource != null) {
            // Skip over if undefined or null
            for (var nextKey in nextSource) {
              // Avoid bugs when hasOwnProperty is shadowed
              if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                to[nextKey] = nextSource[nextKey];
              }
            }
          }
        }
        return to;
      },
      writable: true,
      configurable: true
    });
  }

  console.clear();
  // var log = console.log.bind(console);
  var TAU = Math.PI * 2;
  //
  // PARTICLE
  // ===========================================================================
  var Particle = /** @class */function () {
    function Particle(texture, frame) {
      this.texture = texture;
      this.frame = frame;
      this.alive = false;
      this.width = frame.width;
      this.height = frame.height;
      this.originX = frame.width / 2;
      this.originY = frame.height / 2;
    }
    Particle.prototype.init = function (x, y) {
      if (x === void 0) {
        x = 0;
      }
      if (y === void 0) {
        y = 0;
      }
      var angle = random(TAU);
      var force = random(2, 6);
      this.x = x;
      this.y = y;
      this.alpha = 1;
      this.alive = true;
      this.theta = angle;
      this.vx = Math.sin(angle) * force;
      this.vy = Math.cos(angle) * force;
      this.rotation = Math.atan2(this.vy, this.vx);
      this.drag = random(0.82, 0.97);
      this.scale = random(0.1, 1);
      this.wander = random(0.5, 1.0);
      this.matrix = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
      return this;
    };
    Particle.prototype.update = function () {
      var matrix = this.matrix;
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= this.drag;
      this.vy *= this.drag;
      this.theta += random(-0.5, 0.5) * this.wander;
      this.vx += Math.sin(this.theta) * 0.1;
      this.vy += Math.cos(this.theta) * 0.1;
      this.rotation = Math.atan2(this.vy, this.vx);
      this.alpha *= 0.98;
      this.scale *= 0.985;
      this.alive = this.scale > 0.06 && this.alpha > 0.06;
      var cos = Math.cos(this.rotation) * this.scale;
      var sin = Math.sin(this.rotation) * this.scale;
      matrix.a = cos;
      matrix.b = sin;
      matrix.c = -sin;
      matrix.d = cos;
      matrix.tx = this.x - (this.originX * matrix.a + this.originY * matrix.c);
      matrix.ty = this.y - (this.originX * matrix.b + this.originY * matrix.d);
      return this;
    };
    Particle.prototype.draw = function (context) {
      var m = this.matrix;
      var f = this.frame;
      context.globalAlpha = this.alpha;
      context.setTransform(m.a, m.b, m.c, m.d, m.tx, m.ty);
      context.drawImage(this.texture, f.x, f.y, f.width, f.height, 0, 0, this.width, this.height);
      return this;
    };
    return Particle;
  }();
  //
  // APP
  // ===========================================================================
  var App = /** @class */function () {
    function App(options) {
      var _this = this;
      this.pool = [];
      this.particles = [];
      this.pointer = {
        x: -9999,
        y: -9999
      };
      this.buffer = document.createElement("canvas");
      this.bufferContext = this.buffer.getContext("2d");
      this.supportsFilters = typeof this.bufferContext.filter !== "undefined";
      _this.activate = true;
      this.setActivate = function (b) {
        _this.activate = b;
      }; // setter for activate
      // this.setTexture = function(t) {_this.texture = t;}
      this.AnimationId;
      this.pointerMove = function (event) {
        event.preventDefault();
        var pointer = event.targetTouches ? event.targetTouches[0] : event;
        _this.pointer.x = pointer.clientX;
        _this.pointer.y = pointer.clientY;

        for (var i = 0; i < random(2, 7); i++) {
          _this.spawn(_this.pointer.x, _this.pointer.y);
        }
      };
      this.resize = function (event) {
        _this.width = _this.buffer.width = _this.view.width; // = window.innerWidth;
        _this.height = _this.buffer.height = _this.view.height; // = window.innerHeight;
      };
      this.render = function (time) {
        var context = _this.context;
        var particles = _this.particles;
        var bufferContext = _this.bufferContext;
        if (_this.background === COLOR) {
          context.fillStyle = _this.backgroundColor;
          context.fillRect(0, 0, _this.view.width, _this.view.height);
        } else if (_this.background === IMAGE) {
          var ptrn = context.createPattern(_this.backgroundImage, "repeat"); // Create a pattern with this image, and set it to "repeat".
          context.fillStyle = ptrn;
          context.fillRect(0, 0, _this.width, _this.height);
        }

        bufferContext.globalAlpha = 1;
        bufferContext.setTransform(1, 0, 0, 1, 0, 0);
        bufferContext.clearRect(0, 0, _this.view.width, _this.view.height);
        bufferContext.globalCompositeOperation = _this.blendMode;
        for (var i = 0; i < particles.length; i++) {
          var particle = particles[i];
          if (particle.alive) {
            particle.update();
          } else {
            _this.pool.push(particle);
            removeItems(particles, i, 1);
          }
        }
        for (var _i = 0, particles_1 = particles; _i < particles_1.length; _i++) {
          particle = particles_1[_i];
          particle.draw(bufferContext);
        }
        if (_this.supportsFilters) {
          if (_this.useBlurFilter) {
            context.filter = "blur(" + _this.filterBlur + "px)";
          }
          context.drawImage(_this.buffer, 0, 0);
          if (_this.useContrastFilter) {
            context.filter = "drop-shadow(4px 4px 4px rgba(0,0,0,1)) contrast(" + _this.filterContrast + "%)";
          }
        }
        context.drawImage(_this.buffer, 0, 0);
        context.filter = "none";

        if (_this.activate) {
          //  call requestAnimateFrame just if flag is true
          _this.AnimationId = requestAnimationFrame(_this.render);
        } else {
          cancelAnimationFrame(_this.AnimationId);
        }
      };
      Object.assign(this, options);
      this.context = this.view.getContext("2d", { alpha: false });
    }
    App.prototype.spawn = function (x, y) {
      var particle;
      if (this.particles.length > this.maxParticles) {
        particle = this.particles.shift();
      } else if (this.pool.length) {
        particle = this.pool.pop();
      } else {
        particle = new Particle(this.texture, sample(this.frames));
      }
      particle.init(x, y);
      this.particles.push(particle);
      return this;
    };
    App.prototype.start = function () {
      this.resize();
      this.render();
      this.view.style.visibility = "visible";

      requestAnimationFrame(this.render);
      return this;
    };
    return App;
  }();
  //
  // CREATE FRAMES
  // ===========================================================================
  function createFrames(numFrames, width, height) {
    var frames = [];
    for (var i = 0; i < numFrames; i++) {
      frames.push({
        x: width * i,
        y: 0,
        width: width,
        height: height
      });
    }
    return frames;
  }
  //
  // REMOVE ITEMS
  // ===========================================================================
  function removeItems(array, startIndex, removeCount) {
    var length = array.length;
    if (startIndex >= length || removeCount === 0) {
      return;
    }
    removeCount = startIndex + removeCount > length ? length - startIndex : removeCount;
    var len = length - removeCount;
    for (var i = startIndex; i < len; ++i) {
      array[i] = array[i + removeCount];
    }
    array.length = len;
  }
  //
  // RANDOM
  // ===========================================================================
  function random(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    if (min > max) {
      var tmp = min;
      min = max;
      max = tmp;
    }
    return min + (max - min) * Math.random();
  }
  function sample(array) {
    return array[Math.random() * array.length | 0];
  }

  var pathDurations = []; // path durations are computed based on the number of letters per line
  var app = void 0; // the main class in stars.js to create the particles
  var index = 0; // counter for each page of the intro 

  // options
  var containerDiv = void 0; // the selection containing the animation
  var myIntro = []; // array of array of strings. Each array of strings is displayed on one page. Each string is animated on one line.
  var transitionSpeed = void 0;
  var explosionStrength = void 0;
  var pause = void 0;
  var replay = void 0;
  var fontFamily = void 0;

  var starOptions = {
    mouseListener: false,
    frames: createFrames(5, 80, 80),
    maxParticles: 2000,
    blendMode: "lighter",
    filterBlur: 50,
    filterContrast: 300,
    useBlurFilter: true,
    useContrastFilter: true
  };

  function setOptions(_options) {
    containerDiv = _options.containerDiv.classed("introchart", true);
    myIntro = _options.myIntro;
    transitionSpeed = _options.transitionSpeed;
    explosionStrength = _options.explosionStrength;
    pause = _options.pause;
    replay = _options.replay;
    fontFamily = _options.fontFamily;
    starOptions.background = _options.background;
    starOptions.backgroundColor = _options.backgroundColor;
    starOptions.srcBackgroundImage = _options.backgroundImage;
    var background = new Image();
    background.src = starOptions.srcBackgroundImage;
    starOptions.backgroundImage = background;
  }

  function animate(_options) {
    setOptions(_options);
    // the following ensures the fonts have arrived at the client before the animation starts 
    WebFont.load({
      google: { families: [fontFamily] },
      fontactive: function fontactive() {
        //This is called once font has been rendered in browser
        display(myIntro[0]);
      }
    });
  }

  function display(introPage) {
    displayText(introPage);
    createPaths();
    animateStars(introPage.defaultLine, introPage.punchLine);
  }

  function displayText(_textArray) {
    var sel = containerDiv.append("div").attr("class", "textbox");

    // add headers for all strings by wrapping each span around a letter
    // which can be styled individually
    for (var ta = 0; ta < _textArray.length; ta++) {
      var sel2 = sel.append("div").attr("class", "widthForIE h" + ta).append("div").attr("class", "header h" + ta).append("h1").style("font-family", fontFamily).attr("class", "trans");

      var myString = _textArray[ta];
      for (var i = 0; i < myString.length; i++) {
        sel2.append("span").attr("class", ta < _textArray.length - 1 ? "rotate" : "burst " + "color-" + i % 5).text(myString[i]);
      }
    }
    centerTextVertically();
  }

  function centerTextVertically() {
    var h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

    var textHeight = containerDiv.select("div.textbox").node().getBoundingClientRect().height;
    var firstLineHeight = d3.select("div.textbox div.widthForIE").node().getBoundingClientRect().height;
    var pad = (h - textHeight) / 2 > firstLineHeight ? (h - textHeight) / 2 - firstLineHeight : (h - textHeight) / 2;
    d3.select("div.textbox").style("padding-top", pad + "px");
  }

  function createPaths() {
    var w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

    var h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

    var sel = containerDiv.append("div").attr("class", "paths").append("svg").attr("width", w).attr("height", h);

    var container = containerDiv.node().getBoundingClientRect();

    containerDiv.selectAll("h1").each(function (d, i) {
      var bBox = d3.select(this).node().getBoundingClientRect();
      // get width from all spans (for IE)
      var textWidth = 0;
      d3.select(this).selectAll("span").each(function (d) {
        var rect = d3.select(this).node().getBoundingClientRect();
        textWidth = textWidth + rect.width;
      });

      var pos = {};
      pos.width = textWidth;
      pos.xStart = (container.width - textWidth) / 2;
      pos.yStart = bBox.top + bBox.height / 2 - container.top;

      var p = sel.append("path").attr("class", "header hidden trans " + "h" + i).attr("d", function () {
        var str = "M" + pos.xStart + " " + pos.yStart + " L" + (pos.width + pos.xStart) + " " + pos.yStart;
        return str;
      });

      var duration = p.node().getTotalLength() * transitionSpeed;
      pathDurations.push(duration);
    });
  }

  function intializeStars() {
    var bBox = containerDiv.node().getBoundingClientRect();

    containerDiv.insert("div", ".textbox").attr("class", "stars").append("canvas").attr("id", "view").attr("width", bBox.width).attr("height", bBox.height);

    starOptions.texture = document.querySelector("#star-texture-white");
    starOptions.view = document.querySelector("#view");

    app = new App(starOptions);
    window.addEventListener("load", app.start());
    window.focus();
  }

  function starsAlongPath(path) {
    var l = path.getTotalLength();
    return function (d, i, a) {
      return function (t) {
        var p = path.getPointAtLength(t * l);
        app.spawn(p.x, p.y);
        return "translate(0,0)";
      };
    };
  }

  function animateStars(defaultLine, punchLine) {
    intializeStars();
    if (typeof defaultLine === "undefined") {
      defaultLine = STARS;
    }
    if (typeof punchLine === "undefined") {
      punchLine = STARS;
    }
    var durations = pathDurations.concat(pathDurations);
    var chainedSel = d3.selectAll(".trans").data(durations);
    chainedTransition(chainedSel);

    function chainedTransition(_chainedSel) {
      var _index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      var num_headers = _chainedSel.size() / 2;
      var nextSel = _chainedSel.filter(function (d, i) {
        return i % num_headers === _index;
      });
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

      function transitionDefault(_selection) {
        if (_index === num_headers - 1) {
          transitionLast(_selection);
        } else {
          // the header
          var thisSel = _selection.filter(function (d, i) {
            return i === 0;
          });
          var duration = thisSel.node().__data__;
          var letters = thisSel.selectAll("span");
          var numLetters = letters.size();
          letters.transition().duration(1000).delay(function (d, i) {
            return 1000 + i / numLetters * duration;
          }).ease(d3.easeLinear).style("opacity", 1);
          // the path
          var sel = _selection.filter(function (d, i) {
            return i === 1;
          });
          sel.transition().duration(function (d) {
            return d;
          }).delay(1000).ease(d3.easeLinear).attrTween("transform", starsAlongPath(sel.node())).on("end", function () {
            _index = _index + 1;
            if (num_headers > _index) {
              nextSel = _chainedSel.filter(function (d, i) {
                return i % num_headers === _index;
              });
              transitionDefault(nextSel);
            }
          });
        }
      }

      function transitionDefaultRotate(_selection) {
        if (_index === num_headers - 1) {
          transitionLast(_selection);
        } else {
          var letters = _selection.filter(function (d, i) {
            return i === 0;
          }).selectAll("span");
          letters.style("transform", "rotate(-0deg) scale(.001)").transition().duration(2000).delay(function (d, i) {
            return i * 200;
          }).style("opacity", 1)
          //.style("transform", "rotate(-720deg) scale(1)")
          .tween("transform", function () {
            var node = d3.select(this),
                s = d3.interpolateNumber(0.001, 1),
                r = d3.interpolateNumber(-0, -720);
            return function (t) {
              node.style("transform", "rotate(" + r(t) + "deg)scale(" + s(t) + ")");
            };
          }).on("end", function (d, i) {
            if (i === letters.size() - 1) {
              _index = _index + 1;
              if (num_headers > _index) {
                nextSel = _chainedSel.filter(function (d, i) {
                  return i % num_headers === _index;
                });
                transitionDefaultRotate(nextSel);
              }
            }
          });
        }
      }

      function transitionDefaultScale(_selection) {
        if (_index === num_headers - 1) {
          transitionLast(_selection);
        } else {
          var letters = _selection.filter(function (d, i) {
            return i === 0;
          }).selectAll("span");
          var fs = letters.style("font-size");
          letters.style("font-size", "0px").transition().duration(2000).delay(function (d, i) {
            return i * 200;
          }).style("opacity", 1).style("font-size", fs).on("end", function (d, i) {
            if (i === letters.size() - 1) {
              _index = _index + 1;
              if (num_headers > _index) {
                nextSel = _chainedSel.filter(function (d, i) {
                  return i % num_headers === _index;
                });
                transitionDefaultScale(nextSel);
              }
            }
          });
        }
      }

      function transitionLast(_selection) {
        setTimeout(function () {
          app.setActivate(false);
          switch (punchLine) {
            default:
              transitionPunch(_selection);
          }
        }, 1000);
      }

      function transitionPunch(_selection) {
        starOptions.texture = document.querySelector("#star-texture");
        var app2 = new App(starOptions);
        window.addEventListener("load", app2.start());
        window.focus();
        // the header
        var letters = _selection.filter(function (d, i) {
          return i === 0;
        }).selectAll("span");
        letters.transition().duration(0).style("opacity", 1);

        // the path
        var path = _selection.filter(function (d, i) {
          return i === 1;
        }).node();
        var l = path.getTotalLength();

        for (var t = 0; t < 1; t = t + explosionStrength) {
          var p = path.getPointAtLength(t * l);
          app2.spawn(p.x, p.y);
        }

        setTimeout(function () {
          app2.setActivate(false);
          index = index + 1;
          if (index >= myIntro.length) {
            index = 0;
            if (!replay) return;
          }
          pathDurations = [];
          containerDiv.selectAll("*").remove();
          display(myIntro[index]);
        }, pause);
      }
    }
  }

  function _interface (_myIntro, bulkLoad) {
    "use strict";

    var options = {};
    options.replay = true;
    options.explosionStrength = checkForIE() ? 0.01 : 0.002;
    options.pause = 5000; // pause in milliseconds in between the pages 
    options.transitionSpeed = 7;
    options.fontFamily = "Indie Flower";
    options.background = IMAGE;
    options.backgroundColor = "#111111";
    options.backgroundImage = "https://ee2dev.github.io/startext/lib/nightSky.jpg";
    options.myIntro = _myIntro;

    function bulkSetOptions() {
      // no validation with if (_myIntro.hasOwnProperties(..))
      chartAPI.background(_myIntro.background === "COLOR" ? COLOR : IMAGE).backgroundColor(_myIntro.backgroundColor).backgroundImage(_myIntro.backgroundImage).fontFamily(_myIntro.fontFamily).explosionStrength(_myIntro.explosionStrength).transitionSpeed(_myIntro.transitionSpeed).pause(_myIntro.pause).replay(_myIntro.replay);
    }

    function checkForIE() {
      var msie = window.navigator.userAgent.indexOf("MSIE ");
      return msie !== -1;
    }

    // API for external access
    function chartAPI(selection) {
      selection.each(function () {
        options.containerDiv = d3.select(this);
        animate(options);
      });
      return chartAPI;
    }

    chartAPI.background = function (_) {
      if (!arguments.length) return options.background;
      options.background = _;
      return chartAPI;
    };

    chartAPI.backgroundColor = function (_) {
      if (!arguments.length) return options.backgroundColor;
      options.backgroundColor = _;
      return chartAPI;
    };

    chartAPI.backgroundImage = function (_) {
      if (!arguments.length) return options.backgroundImage;
      options.backgroundImage = _;
      return chartAPI;
    };

    chartAPI.fontFamily = function (_) {
      if (!arguments.length) return options.fontFamily;
      options.fontFamily = _;
      return chartAPI;
    };

    chartAPI.explosionStrength = function (_) {
      if (!arguments.length) return options.explosionStrength;
      if (_ < 0) {
        _ = 0;
      } else if (_ > 1) {
        _ = 1;
      }
      var s = d3.scalePow().domain([0, 1]).range([1, 0]);
      options.explosionStrength = options.explosionStrength + s(_);
      return chartAPI;
    };

    chartAPI.pause = function (_) {
      if (!arguments.length) return options.pause;
      options.pause = _;
      return chartAPI;
    };

    chartAPI.replay = function (_) {
      if (!arguments.length) return options.replay;
      options.replay = _;
      return chartAPI;
    };

    chartAPI.transitionSpeed = function (_) {
      if (!arguments.length) return options.transitionSpeed;
      if (_ < 0) {
        _ = 0;
      } else if (_ > 1) {
        _ = 1;
      }
      var s = d3.scaleLinear().domain([0, 1]).range([20, 1]);
      options.transitionSpeed = s(_);
      return chartAPI;
    };

    if (bulkLoad) {
      bulkSetOptions();
    }

    return chartAPI;
  }

  exports.chart = _interface;
  exports.COLOR = COLOR;
  exports.IMAGE = IMAGE;
  exports.STARS = STARS;
  exports.ROTATION = ROTATION;
  exports.SCALE = SCALE;

  Object.defineProperty(exports, '__esModule', { value: true });

}));