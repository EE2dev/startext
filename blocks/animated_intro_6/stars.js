// from https://codepen.io/osublake/pen/RLOzxo by Blake Bowen
// adjusted by some lines 
// - to optionally switch off requestAnimationFrame calls after animation is finished
// - to remove options panel
// - to remove mouse listener
// - to add background image

console.clear();
var log = console.log.bind(console);
var TAU = Math.PI * 2;
//
// PARTICLE
// ===========================================================================
var Particle = /** @class */ (function () {
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
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
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
        matrix.tx = this.x - ((this.originX * matrix.a) + (this.originY * matrix.c));
        matrix.ty = this.y - ((this.originX * matrix.b) + (this.originY * matrix.d));
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
}());
//
// APP
// ===========================================================================
var App = /** @class */ (function () {
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
        this.supportsFilters = (typeof this.bufferContext.filter !== "undefined");
        _this.activate = true;
        this.setActivate = function(b) {_this.activate = b;} // setter for activate
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
            // context.fillStyle = _this.backgroundColor;
            // context.fillRect(0, 0, _this.width, _this.height);
            // new: draw background image
            var ptrn = context.createPattern(_this.backgroundImage, 'repeat'); // Create a pattern with this image, and set it to "repeat".
            context.fillStyle = ptrn;
            context.fillRect(0, 0, _this.width, _this.height); 

            bufferContext.globalAlpha = 1;
            bufferContext.setTransform(1, 0, 0, 1, 0, 0);
            bufferContext.clearRect(0, 0, _this.width, _this.height);
            bufferContext.globalCompositeOperation = _this.blendMode;
            for (var i = 0; i < particles.length; i++) {
                var particle = particles[i];
                if (particle.alive) {
                    particle.update();
                }
                else {
                    _this.pool.push(particle);
                    removeItems(particles, i, 1);
                }
            }
            for (var _i = 0, particles_1 = particles; _i < particles_1.length; _i++) {
                var particle = particles_1[_i];
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
            
            if (_this.activate) { //  call requestAnimateFrame just if flag is true
                this.AnimationId = requestAnimationFrame(_this.render); 
            } 
            else { 
                cancelAnimationFrame(this.AnimationId);
            }
        };
        Object.assign(this, options);
        this.context = this.view.getContext("2d", { alpha: false });
    }
    App.prototype.spawn = function (x, y) {
        var particle;
        if (this.particles.length > this.maxParticles) {
            particle = this.particles.shift();
        }
        else if (this.pool.length) {
            particle = this.pool.pop();
        }
        else {
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
        if (this.mouseListener) {
            if (window.PointerEvent) {
                window.addEventListener("pointermove", this.pointerMove);
            }
            else {
                window.addEventListener("mousemove", this.pointerMove);
                window.addEventListener("touchmove", this.pointerMove);
            }
        }
        window.addEventListener("resize", this.resize);
        requestAnimationFrame(this.render);
        return this;
    };
    return App;
}());
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
    removeCount = (startIndex + removeCount > length ? length - startIndex : removeCount);
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
    return array[(Math.random() * array.length) | 0];
}
