(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.ROT = {}));
})(this, (function (exports) { 'use strict';

  function _arrayLikeToArray(r, a) {
    (null == a || a > r.length) && (a = r.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
    return n;
  }
  function _createForOfIteratorHelperLoose(r, e) {
    var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (t) return (t = t.call(r)).next.bind(t);
    if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e) {
      t && (r = t);
      var o = 0;
      return function () {
        return o >= r.length ? {
          done: true
        } : {
          done: false,
          value: r[o++]
        };
      };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _inheritsLoose(t, o) {
    t.prototype = Object.create(o.prototype), t.prototype.constructor = t, _setPrototypeOf(t, o);
  }
  function _setPrototypeOf(t, e) {
    return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) {
      return t.__proto__ = e, t;
    }, _setPrototypeOf(t, e);
  }
  function _unsupportedIterableToArray(r, a) {
    if (r) {
      if ("string" == typeof r) return _arrayLikeToArray(r, a);
      var t = {}.toString.call(r).slice(8, -1);
      return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
    }
  }

  /**
   * This code is an implementation of Alea algorithm; (C) 2010 Johannes Baagøe.
   * Alea is licensed according to the http://en.wikipedia.org/wiki/MIT_License.
   */
  var FRAC = 2.3283064365386963e-10; // 2^-32
  var RandomNumberGenerator = /*#__PURE__*/function () {
    function RandomNumberGenerator() {
      this.seed = 0;
      this.state0 = 0;
      this.state1 = 0;
      this.state2 = 0;
      this.carry = 0;
    }
    var _proto = RandomNumberGenerator.prototype;
    _proto.getSeed = function getSeed() {
      return this.seed;
    }
    /**
     * Seed the number generator
     */;
    _proto.setSeed = function setSeed(seed) {
      seed = seed < 1 ? 1 / seed : seed;
      this.seed = seed;
      this.state0 = (seed >>> 0) * FRAC;
      seed = seed * 69069 + 1 >>> 0;
      this.state1 = seed * FRAC;
      seed = seed * 69069 + 1 >>> 0;
      this.state2 = seed * FRAC;
      this.carry = 1;
      return this;
    }
    /**
     * @returns Pseudorandom value [0,1), uniformly distributed
     */;
    _proto.getUniform = function getUniform() {
      var t = 2091639 * this.state0 + this.carry * FRAC;
      this.state0 = this.state1;
      this.state1 = this.state2;
      this.carry = t | 0;
      this.state2 = t - this.carry;
      return this.state2;
    }
    /**
     * @param lowerBound The lower end of the range to return a value from, inclusive
     * @param upperBound The upper end of the range to return a value from, inclusive
     * @returns Pseudorandom value [lowerBound, upperBound], using ROT.RNG.getUniform() to distribute the value
     */;
    _proto.getUniformInt = function getUniformInt(lowerBound, upperBound) {
      var max = Math.max(lowerBound, upperBound);
      var min = Math.min(lowerBound, upperBound);
      return Math.floor(this.getUniform() * (max - min + 1)) + min;
    }
    /**
     * @param mean Mean value
     * @param stddev Standard deviation. ~95% of the absolute values will be lower than 2*stddev.
     * @returns A normally distributed pseudorandom value
     */;
    _proto.getNormal = function getNormal(mean, stddev) {
      if (mean === void 0) {
        mean = 0;
      }
      if (stddev === void 0) {
        stddev = 1;
      }
      var u;
      var v;
      var r;
      do {
        u = 2 * this.getUniform() - 1;
        v = 2 * this.getUniform() - 1;
        r = u * u + v * v;
      } while (r > 1 || r === 0);
      var gauss = u * Math.sqrt(-2 * Math.log(r) / r);
      return mean + gauss * stddev;
    }
    /**
     * @returns Pseudorandom value [1,100] inclusive, uniformly distributed
     */;
    _proto.getPercentage = function getPercentage() {
      return 1 + Math.floor(this.getUniform() * 100);
    }
    /**
     * @returns Randomly picked item, null when length=0
     */;
    _proto.getItem = function getItem(array) {
      if (!array.length) {
        return null;
      }
      return array[Math.floor(this.getUniform() * array.length)];
    }
    /**
     * @returns New array with randomized items
     */;
    _proto.shuffle = function shuffle(array) {
      var result = array.slice();
      for (var i = result.length - 1; i > 0; i--) {
        var j = Math.floor(this.getUniform() * (i + 1));
        var _ref = [result[j], result[i]];
        result[i] = _ref[0];
        result[j] = _ref[1];
      }
      return result;
    }
    /**
     * @param data key=whatever, value=weight (relative probability)
     * @returns whatever
     */;
    _proto.getWeightedValue = function getWeightedValue(data) {
      var total = 0;
      var ids = Object.keys(data);
      for (var _i = 0, _ids = ids; _i < _ids.length; _i++) {
        var id = _ids[_i];
        total += data[id];
      }
      var random = this.getUniform() * total;
      var part = 0;
      for (var _i2 = 0, _ids2 = ids; _i2 < _ids2.length; _i2++) {
        var _id = _ids2[_i2];
        part += data[_id];
        if (random < part) {
          return _id;
        }
      }
      // If by some floating-point annoyance we have
      // random >= total, just return the last id.
      return ids[ids.length - 1];
    }
    /**
     * Get RNG state. Useful for storing the state and re-setting it via setState.
     * @returns Internal state
     */;
    _proto.getState = function getState() {
      return [this.state0, this.state1, this.state2, this.carry];
    }
    /**
     * Set a previously retrieved state.
     */;
    _proto.setState = function setState(state) {
      this.state0 = state[0];
      this.state1 = state[1];
      this.state2 = state[2];
      this.carry = state[3];
      return this;
    }
    /**
     * Returns a cloned RNG
     */;
    _proto.clone = function clone() {
      var clone = new RandomNumberGenerator();
      return clone.setState(this.getState());
    };
    return RandomNumberGenerator;
  }();
  var RNG = new RandomNumberGenerator().setSeed(Date.now());

  /**
   * @class Abstract display backend module
   * @private
   */
  var Backend = /*#__PURE__*/function () {
    function Backend() {}
    var _proto = Backend.prototype;
    _proto.getContainer = function getContainer() {
      return null;
    };
    _proto.setOptions = function setOptions(options) {
      this.options = options;
    };
    return Backend;
  }();

  var Canvas = /*#__PURE__*/function (_Backend) {
    function Canvas() {
      var _this;
      _this = _Backend.call(this) || this;
      _this.animationFrame = null;
      var context = document.createElement("canvas").getContext("2d");
      if (!context) {
        throw new Error("2D canvas context is unavailable");
      }
      _this.ctx = context;
      return _this;
    }
    _inheritsLoose(Canvas, _Backend);
    var _proto = Canvas.prototype;
    _proto.schedule = function schedule(cb) {
      this.animationFrame = requestAnimationFrame(cb);
    };
    _proto.cancelSchedule = function cancelSchedule() {
      if (this.animationFrame === null) {
        return;
      }
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    };
    _proto.getContainer = function getContainer() {
      return this.ctx.canvas;
    };
    _proto.setOptions = function setOptions(opts) {
      _Backend.prototype.setOptions.call(this, opts);
      var style = opts.fontStyle ? opts.fontStyle + " " : "";
      var font = style + " " + opts.fontSize + "px " + opts.fontFamily;
      this.ctx.font = font;
      this.updateSize();
      this.ctx.font = font;
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
    };
    _proto.clear = function clear() {
      var oldComposite = this.ctx.globalCompositeOperation;
      this.ctx.globalCompositeOperation = "copy";
      this.ctx.fillStyle = this.options.bg;
      this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
      this.ctx.globalCompositeOperation = oldComposite;
    };
    _proto.eventToPosition = function eventToPosition(x, y) {
      var canvas = this.ctx.canvas;
      var rect = canvas.getBoundingClientRect();
      x -= rect.left;
      y -= rect.top;
      x *= canvas.width / rect.width;
      y *= canvas.height / rect.height;
      if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) {
        return [-1, -1];
      }
      return this.normalizedEventToPosition(x, y);
    };
    return Canvas;
  }(Backend);

  /**
   * Always positive modulus
   * @param x Operand
   * @param n Modulus
   * @returns x modulo n
   */
  function mod(x, n) {
    return (x % n + n) % n;
  }
  function clamp(val, min, max) {
    if (min === void 0) {
      min = 0;
    }
    if (max === void 0) {
      max = 1;
    }
    if (val < min) return min;
    if (val > max) return max;
    return val;
  }
  function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.substring(1);
  }
  /**
   * Format a string in a flexible way. Scans for %s strings and replaces them with arguments. List of patterns is modifiable via String.format.map.
   * @param {string} template
   * @param {any} [argv]
   */
  function format(template) {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }
    // The function property is public formatting configuration.
    var map = format.map;
    var replacer = function replacer(match, group1, group2, index) {
      if (template.charAt(index - 1) === "%") {
        return match.substring(1);
      }
      if (!args.length) {
        return match;
      }
      var obj = args[0];
      var group = group1 || group2;
      var parts = group.split(",");
      var name = parts.shift() || "";
      var method = map[name.toLowerCase()];
      if (!method) {
        return match;
      }
      obj = args.shift();
      var target = Object(obj);
      var methodValue = Reflect.get(target, method);
      if (typeof methodValue !== "function") {
        return match;
      }
      var replaced = Reflect.apply(methodValue, target, parts);
      replaced = typeof replaced === "string" ? replaced : String(replaced);
      var first = name.charAt(0);
      var replacedText = typeof replaced === "string" ? replaced : String(replaced);
      return first !== first.toLowerCase() ? capitalize(replacedText) : replacedText;
    };
    return template.replace(/%(?:([a-z]+)|(?:{([^}]+)}))/gi, replacer);
  }
  format.map = {
    "s": "toString"
  };

  var util = /*#__PURE__*/Object.freeze({
    __proto__: null,
    capitalize: capitalize,
    clamp: clamp,
    format: format,
    mod: mod
  });

  /**
   * @class Hexagonal backend
   * @private
   */
  var Hex = /*#__PURE__*/function (_Canvas) {
    function Hex() {
      var _this;
      _this = _Canvas.call(this) || this;
      _this.spacingX = 0;
      _this.spacingY = 0;
      _this.hexSize = 0;
      return _this;
    }
    _inheritsLoose(Hex, _Canvas);
    var _proto = Hex.prototype;
    _proto.draw = function draw(data, clearBefore) {
      var x = data[0],
        y = data[1],
        ch = data[2],
        fg = data[3],
        bg = data[4];
      var px = [(x + 1) * this.spacingX, y * this.spacingY + this.hexSize];
      if (this.options.transpose) {
        px.reverse();
      }
      if (clearBefore) {
        this.ctx.fillStyle = bg;
        this.fill(px[0], px[1]);
      }
      if (!ch) {
        return;
      }
      this.ctx.fillStyle = fg;
      var chars = [].concat(ch);
      for (var _iterator = _createForOfIteratorHelperLoose(chars), _step; !(_step = _iterator()).done;) {
        var character = _step.value;
        this.ctx.fillText(character, px[0], Math.ceil(px[1]));
      }
    };
    _proto.computeSize = function computeSize(availWidth, availHeight) {
      if (this.options.transpose) {
        availWidth += availHeight;
        availHeight = availWidth - availHeight;
        availWidth -= availHeight;
      }
      var width = Math.floor(availWidth / this.spacingX) - 1;
      var height = Math.floor((availHeight - 2 * this.hexSize) / this.spacingY + 1);
      return [width, height];
    };
    _proto.computeFontSize = function computeFontSize(availWidth, availHeight) {
      if (this.options.transpose) {
        availWidth += availHeight;
        availHeight = availWidth - availHeight;
        availWidth -= availHeight;
      }
      var hexSizeWidth = 2 * availWidth / ((this.options.width + 1) * Math.sqrt(3)) - 1;
      var hexSizeHeight = availHeight / (2 + 1.5 * (this.options.height - 1));
      var hexSize = Math.min(hexSizeWidth, hexSizeHeight);
      // compute char ratio
      var oldFont = this.ctx.font;
      this.ctx.font = "100px " + this.options.fontFamily;
      var width = Math.ceil(this.ctx.measureText("W").width);
      this.ctx.font = oldFont;
      var ratio = width / 100;
      hexSize = Math.floor(hexSize) + 1; // closest larger hexSize
      // FIXME char size computation does not respect transposed hexes
      var fontSize = 2 * hexSize / (this.options.spacing * (1 + ratio / Math.sqrt(3)));
      // closest smaller fontSize
      return Math.ceil(fontSize) - 1;
    };
    _proto.normalizedEventToPosition = function normalizedEventToPosition(x, y) {
      var nodeSize;
      if (this.options.transpose) {
        x += y;
        y = x - y;
        x -= y;
        nodeSize = this.ctx.canvas.width;
      } else {
        nodeSize = this.ctx.canvas.height;
      }
      var size = nodeSize / this.options.height;
      y = Math.floor(y / size);
      if (mod(y, 2)) {
        /* odd row */
        x -= this.spacingX;
        x = 1 + 2 * Math.floor(x / (2 * this.spacingX));
      } else {
        x = 2 * Math.floor(x / (2 * this.spacingX));
      }
      return [x, y];
    }
    /**
     * Arguments are pixel values. If "transposed" mode is enabled, then these two are already swapped.
     */;
    _proto.fill = function fill(cx, cy) {
      var a = this.hexSize;
      var b = this.options.border;
      var ctx = this.ctx;
      ctx.beginPath();
      if (this.options.transpose) {
        ctx.moveTo(cx - a + b, cy);
        ctx.lineTo(cx - a / 2 + b, cy + this.spacingX - b);
        ctx.lineTo(cx + a / 2 - b, cy + this.spacingX - b);
        ctx.lineTo(cx + a - b, cy);
        ctx.lineTo(cx + a / 2 - b, cy - this.spacingX + b);
        ctx.lineTo(cx - a / 2 + b, cy - this.spacingX + b);
        ctx.lineTo(cx - a + b, cy);
      } else {
        ctx.moveTo(cx, cy - a + b);
        ctx.lineTo(cx + this.spacingX - b, cy - a / 2 + b);
        ctx.lineTo(cx + this.spacingX - b, cy + a / 2 - b);
        ctx.lineTo(cx, cy + a - b);
        ctx.lineTo(cx - this.spacingX + b, cy + a / 2 - b);
        ctx.lineTo(cx - this.spacingX + b, cy - a / 2 + b);
        ctx.lineTo(cx, cy - a + b);
      }
      ctx.fill();
    };
    _proto.updateSize = function updateSize() {
      var opts = this.options;
      var charWidth = Math.ceil(this.ctx.measureText("W").width);
      this.hexSize = Math.floor(opts.spacing * (opts.fontSize + charWidth / Math.sqrt(3)) / 2);
      this.spacingX = this.hexSize * Math.sqrt(3) / 2;
      this.spacingY = this.hexSize * 1.5;
      var xprop;
      var yprop;
      if (opts.transpose) {
        xprop = "height";
        yprop = "width";
      } else {
        xprop = "width";
        yprop = "height";
      }
      this.ctx.canvas[xprop] = Math.ceil((opts.width + 1) * this.spacingX);
      this.ctx.canvas[yprop] = Math.ceil((opts.height - 1) * this.spacingY + 2 * this.hexSize);
    };
    return Hex;
  }(Canvas);

  /**
   * @class Rectangular backend
   * @private
   */
  var Rect = /*#__PURE__*/function (_Canvas) {
    function Rect() {
      var _this;
      _this = _Canvas.call(this) || this;
      _this.spacingX = 0;
      _this.spacingY = 0;
      _this.canvasCache = {};
      return _this;
    }
    _inheritsLoose(Rect, _Canvas);
    var _proto = Rect.prototype;
    _proto.setOptions = function setOptions(options) {
      _Canvas.prototype.setOptions.call(this, options);
      this.canvasCache = {};
    };
    _proto.draw = function draw(data, clearBefore) {
      if (Rect.cache) {
        this.drawWithCache(data);
      } else {
        this.drawNoCache(data, clearBefore);
      }
    };
    _proto.drawWithCache = function drawWithCache(data) {
      var x = data[0],
        y = data[1],
        ch = data[2],
        fg = data[3],
        bg = data[4];
      var hash = "" + ch + fg + bg;
      var canvas;
      if (hash in this.canvasCache) {
        canvas = this.canvasCache[hash];
      } else {
        var b = this.options.border;
        canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error("2D canvas context is unavailable");
        }
        canvas.width = this.spacingX;
        canvas.height = this.spacingY;
        ctx.fillStyle = bg;
        ctx.fillRect(b, b, canvas.width - b, canvas.height - b);
        if (ch) {
          ctx.fillStyle = fg;
          ctx.font = this.ctx.font;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          var chars = [].concat(ch);
          for (var _iterator = _createForOfIteratorHelperLoose(chars), _step; !(_step = _iterator()).done;) {
            var character = _step.value;
            ctx.fillText(character, this.spacingX / 2, Math.ceil(this.spacingY / 2));
          }
        }
        this.canvasCache[hash] = canvas;
      }
      this.ctx.drawImage(canvas, x * this.spacingX, y * this.spacingY);
    };
    _proto.drawNoCache = function drawNoCache(data, clearBefore) {
      var x = data[0],
        y = data[1],
        ch = data[2],
        fg = data[3],
        bg = data[4];
      if (clearBefore) {
        var b = this.options.border;
        this.ctx.fillStyle = bg;
        this.ctx.fillRect(x * this.spacingX + b, y * this.spacingY + b, this.spacingX - b, this.spacingY - b);
      }
      if (!ch) {
        return;
      }
      this.ctx.fillStyle = fg;
      var chars = [].concat(ch);
      for (var _iterator2 = _createForOfIteratorHelperLoose(chars), _step2; !(_step2 = _iterator2()).done;) {
        var character = _step2.value;
        this.ctx.fillText(character, (x + 0.5) * this.spacingX, Math.ceil((y + 0.5) * this.spacingY));
      }
    };
    _proto.computeSize = function computeSize(availWidth, availHeight) {
      var width = Math.floor(availWidth / this.spacingX);
      var height = Math.floor(availHeight / this.spacingY);
      return [width, height];
    };
    _proto.computeFontSize = function computeFontSize(availWidth, availHeight) {
      var boxWidth = Math.floor(availWidth / this.options.width);
      var boxHeight = Math.floor(availHeight / this.options.height);
      /* compute char ratio */
      var oldFont = this.ctx.font;
      this.ctx.font = "100px " + this.options.fontFamily;
      var width = Math.ceil(this.ctx.measureText("W").width);
      this.ctx.font = oldFont;
      var ratio = width / 100;
      var widthFraction = ratio * boxHeight / boxWidth;
      if (widthFraction > 1) {
        /* too wide with current aspect ratio */
        boxHeight = Math.floor(boxHeight / widthFraction);
      }
      return Math.floor(boxHeight / this.options.spacing);
    };
    _proto.normalizedEventToPosition = function normalizedEventToPosition(x, y) {
      return [Math.floor(x / this.spacingX), Math.floor(y / this.spacingY)];
    };
    _proto.updateSize = function updateSize() {
      var opts = this.options;
      var charWidth = Math.ceil(this.ctx.measureText("W").width);
      this.spacingX = Math.ceil(opts.spacing * charWidth);
      this.spacingY = Math.ceil(opts.spacing * opts.fontSize);
      if (opts.forceSquareRatio) {
        this.spacingX = this.spacingY = Math.max(this.spacingX, this.spacingY);
      }
      this.ctx.canvas.width = opts.width * this.spacingX;
      this.ctx.canvas.height = opts.height * this.spacingY;
    };
    return Rect;
  }(Canvas);
  Rect.cache = false;

  /**
   * @class Tile backend
   * @private
   */
  var Tile = /*#__PURE__*/function (_Canvas) {
    function Tile() {
      var _this;
      _this = _Canvas.call(this) || this;
      _this.colorCanvas = document.createElement("canvas");
      return _this;
    }
    _inheritsLoose(Tile, _Canvas);
    var _proto = Tile.prototype;
    _proto.draw = function draw(data, clearBefore) {
      var x = data[0],
        y = data[1],
        ch = data[2],
        fg = data[3],
        bg = data[4];
      var tileWidth = this.options.tileWidth;
      var tileHeight = this.options.tileHeight;
      if (clearBefore) {
        if (this.options.tileColorize) {
          this.ctx.clearRect(x * tileWidth, y * tileHeight, tileWidth, tileHeight);
        } else {
          this.ctx.fillStyle = bg;
          this.ctx.fillRect(x * tileWidth, y * tileHeight, tileWidth, tileHeight);
        }
      }
      if (!ch) {
        return;
      }
      var chars = [].concat(ch);
      var fgs = [].concat(fg);
      var bgs = [].concat(bg);
      for (var _iterator = _createForOfIteratorHelperLoose(chars.entries()), _step; !(_step = _iterator()).done;) {
        var _step$value = _step.value,
          i = _step$value[0],
          character = _step$value[1];
        var tile = this.options.tileMap[character];
        if (!tile) {
          throw new Error("Char \"" + character + "\" not found in tileMap");
        }
        if (this.options.tileColorize) {
          // apply colorization
          var canvas = this.colorCanvas;
          var context = canvas.getContext("2d");
          if (!context) {
            throw new Error("2D canvas context is unavailable");
          }
          context.globalCompositeOperation = "source-over";
          context.clearRect(0, 0, tileWidth, tileHeight);
          var _fg = fgs[i] || fgs[0];
          var _bg = bgs[i] || bgs[0];
          context.drawImage(this.options.tileSet, tile[0], tile[1], tileWidth, tileHeight, 0, 0, tileWidth, tileHeight);
          if (_fg !== "transparent") {
            context.fillStyle = _fg;
            context.globalCompositeOperation = "source-atop";
            context.fillRect(0, 0, tileWidth, tileHeight);
          }
          if (_bg !== "transparent") {
            context.fillStyle = _bg;
            context.globalCompositeOperation = "destination-over";
            context.fillRect(0, 0, tileWidth, tileHeight);
          }
          this.ctx.drawImage(canvas, x * tileWidth, y * tileHeight, tileWidth, tileHeight);
        } else {
          // no colorizing, easy
          this.ctx.drawImage(this.options.tileSet, tile[0], tile[1], tileWidth, tileHeight, x * tileWidth, y * tileHeight, tileWidth, tileHeight);
        }
      }
    };
    _proto.computeSize = function computeSize(availWidth, availHeight) {
      var width = Math.floor(availWidth / this.options.tileWidth);
      var height = Math.floor(availHeight / this.options.tileHeight);
      return [width, height];
    };
    _proto.computeFontSize = function computeFontSize() {
      throw new Error("Tile backend does not understand font size");
    };
    _proto.normalizedEventToPosition = function normalizedEventToPosition(x, y) {
      return [Math.floor(x / this.options.tileWidth), Math.floor(y / this.options.tileHeight)];
    };
    _proto.updateSize = function updateSize() {
      var opts = this.options;
      this.ctx.canvas.width = opts.width * opts.tileWidth;
      this.ctx.canvas.height = opts.height * opts.tileHeight;
      this.colorCanvas.width = opts.tileWidth;
      this.colorCanvas.height = opts.tileHeight;
    };
    return Tile;
  }(Canvas);

  function fromString(str) {
    var normalized = str.toLowerCase();
    var cached;
    var match;
    if (Object.prototype.hasOwnProperty.call(CACHE, normalized)) {
      cached = CACHE[normalized];
    } else {
      if (/^#[0-9a-f]{3}$/i.test(str)) {
        var _str$slice$split$map = str.slice(1).split("").map(function (x) {
            return parseInt(x, 16) * 17;
          }),
          red = _str$slice$split$map[0],
          green = _str$slice$split$map[1],
          blue = _str$slice$split$map[2];
        cached = [red, green, blue];
      } else if (/^#[0-9a-f]{6}$/i.test(str)) {
        cached = [parseInt(str.slice(1, 3), 16), parseInt(str.slice(3, 5), 16), parseInt(str.slice(5, 7), 16)];
      } else if (match = str.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i)) {
        var _match$slice$map = match.slice(1, 4).map(Number),
          _red = _match$slice$map[0],
          _green = _match$slice$map[1],
          _blue = _match$slice$map[2];
        cached = [_red, _green, _blue];
      } else if (match = str.match(/^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(?:\d+(?:\.\d*)?|\.\d+)\s*\)$/i)) {
        var _match$slice$map2 = match.slice(1, 4).map(Number),
          _red2 = _match$slice$map2[0],
          _green2 = _match$slice$map2[1],
          _blue2 = _match$slice$map2[2];
        cached = [_red2, _green2, _blue2];
      } else {
        // html name
        cached = [0, 0, 0];
      }
    }
    return [cached[0], cached[1], cached[2]];
  }
  /**
   * Add two or more colors
   */
  function add(color1) {
    var result = [color1[0], color1[1], color1[2]];
    for (var _len = arguments.length, colors = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      colors[_key - 1] = arguments[_key];
    }
    for (var i = 0; i < 3; i++) {
      for (var j = 0; j < colors.length; j++) {
        result[i] += colors[j][i];
      }
    }
    return result;
  }
  /**
   * Add two or more colors, MODIFIES FIRST ARGUMENT
   */
  function add_(color1) {
    for (var _len2 = arguments.length, colors = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      colors[_key2 - 1] = arguments[_key2];
    }
    for (var i = 0; i < 3; i++) {
      for (var j = 0; j < colors.length; j++) {
        color1[i] += colors[j][i];
      }
    }
    return color1;
  }
  /**
   * Multiply (mix) two or more colors
   */
  function multiply(color1) {
    var result = [color1[0], color1[1], color1[2]];
    for (var _len3 = arguments.length, colors = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
      colors[_key3 - 1] = arguments[_key3];
    }
    for (var i = 0; i < 3; i++) {
      for (var j = 0; j < colors.length; j++) {
        result[i] *= colors[j][i] / 255;
      }
      result[i] = Math.round(result[i]);
    }
    return result;
  }
  /**
   * Multiply (mix) two or more colors, MODIFIES FIRST ARGUMENT
   */
  function multiply_(color1) {
    for (var _len4 = arguments.length, colors = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
      colors[_key4 - 1] = arguments[_key4];
    }
    for (var i = 0; i < 3; i++) {
      for (var j = 0; j < colors.length; j++) {
        color1[i] *= colors[j][i] / 255;
      }
      color1[i] = Math.round(color1[i]);
    }
    return color1;
  }
  /**
   * Interpolate (blend) two colors with a given factor
   */
  function interpolate(color1, color2, factor) {
    if (factor === void 0) {
      factor = 0.5;
    }
    var result = color1.slice();
    for (var i = 0; i < 3; i++) {
      result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
    }
    return result;
  }
  var lerp = interpolate;
  /**
   * Interpolate (blend) two colors with a given factor in HSL mode
   */
  function interpolateHSL(color1, color2, factor) {
    if (factor === void 0) {
      factor = 0.5;
    }
    var hsl1 = rgb2hsl(color1);
    var hsl2 = rgb2hsl(color2);
    for (var i = 0; i < 3; i++) {
      hsl1[i] += factor * (hsl2[i] - hsl1[i]);
    }
    return hsl2rgb(hsl1);
  }
  var lerpHSL = interpolateHSL;
  /**
   * Create a new random color based on this one
   * @param color
   * @param diff Set of standard deviations
   */
  function randomize(color, diff) {
    if (!(diff instanceof Array)) {
      diff = Math.round(RNG.getNormal(0, diff));
    }
    var result = [color[0], color[1], color[2]];
    for (var i = 0; i < 3; i++) {
      result[i] += diff instanceof Array ? Math.round(RNG.getNormal(0, diff[i])) : diff;
    }
    return result;
  }
  /**
   * Converts an RGB color value to HSL. Expects 0..255 inputs, produces 0..1 outputs.
   */
  function rgb2hsl(color) {
    var r = color[0] / 255;
    var g = color[1] / 255;
    var b = color[2] / 255;
    var max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    var h = 0,
      s;
    var l = (max + min) / 2;
    if (max === min) {
      s = 0; // achromatic
    } else {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }
    return [h, s, l];
  }
  function hue2rgb(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }
  /**
   * Converts an HSL color value to RGB. Expects 0..1 inputs, produces 0..255 outputs.
   */
  function hsl2rgb(color) {
    var l = color[2];
    if (color[1] === 0) {
      l = Math.round(l * 255);
      return [l, l, l];
    } else {
      var s = color[1];
      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
      var r = hue2rgb(p, q, color[0] + 1 / 3);
      var g = hue2rgb(p, q, color[0]);
      var b = hue2rgb(p, q, color[0] - 1 / 3);
      return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }
  }
  function toRGB(color) {
    var clamped = color.map(function (x) {
      return clamp(x, 0, 255);
    });
    return "rgb(" + clamped.join(",") + ")";
  }
  function toHex(color) {
    var clamped = color.map(function (x) {
      return Math.round(clamp(x, 0, 255)).toString(16).padStart(2, "0");
    });
    return "#" + clamped.join("");
  }
  var CACHE = {
    "black": [0, 0, 0],
    "navy": [0, 0, 128],
    "darkblue": [0, 0, 139],
    "mediumblue": [0, 0, 205],
    "blue": [0, 0, 255],
    "darkgreen": [0, 100, 0],
    "green": [0, 128, 0],
    "teal": [0, 128, 128],
    "darkcyan": [0, 139, 139],
    "deepskyblue": [0, 191, 255],
    "darkturquoise": [0, 206, 209],
    "mediumspringgreen": [0, 250, 154],
    "lime": [0, 255, 0],
    "springgreen": [0, 255, 127],
    "aqua": [0, 255, 255],
    "cyan": [0, 255, 255],
    "midnightblue": [25, 25, 112],
    "dodgerblue": [30, 144, 255],
    "forestgreen": [34, 139, 34],
    "seagreen": [46, 139, 87],
    "darkslategray": [47, 79, 79],
    "darkslategrey": [47, 79, 79],
    "limegreen": [50, 205, 50],
    "mediumseagreen": [60, 179, 113],
    "turquoise": [64, 224, 208],
    "royalblue": [65, 105, 225],
    "steelblue": [70, 130, 180],
    "darkslateblue": [72, 61, 139],
    "mediumturquoise": [72, 209, 204],
    "indigo": [75, 0, 130],
    "darkolivegreen": [85, 107, 47],
    "cadetblue": [95, 158, 160],
    "cornflowerblue": [100, 149, 237],
    "mediumaquamarine": [102, 205, 170],
    "dimgray": [105, 105, 105],
    "dimgrey": [105, 105, 105],
    "slateblue": [106, 90, 205],
    "olivedrab": [107, 142, 35],
    "slategray": [112, 128, 144],
    "slategrey": [112, 128, 144],
    "lightslategray": [119, 136, 153],
    "lightslategrey": [119, 136, 153],
    "mediumslateblue": [123, 104, 238],
    "lawngreen": [124, 252, 0],
    "chartreuse": [127, 255, 0],
    "aquamarine": [127, 255, 212],
    "maroon": [128, 0, 0],
    "purple": [128, 0, 128],
    "olive": [128, 128, 0],
    "gray": [128, 128, 128],
    "grey": [128, 128, 128],
    "skyblue": [135, 206, 235],
    "lightskyblue": [135, 206, 250],
    "blueviolet": [138, 43, 226],
    "darkred": [139, 0, 0],
    "darkmagenta": [139, 0, 139],
    "saddlebrown": [139, 69, 19],
    "darkseagreen": [143, 188, 143],
    "lightgreen": [144, 238, 144],
    "mediumpurple": [147, 112, 216],
    "darkviolet": [148, 0, 211],
    "palegreen": [152, 251, 152],
    "darkorchid": [153, 50, 204],
    "yellowgreen": [154, 205, 50],
    "sienna": [160, 82, 45],
    "brown": [165, 42, 42],
    "darkgray": [169, 169, 169],
    "darkgrey": [169, 169, 169],
    "lightblue": [173, 216, 230],
    "greenyellow": [173, 255, 47],
    "paleturquoise": [175, 238, 238],
    "lightsteelblue": [176, 196, 222],
    "powderblue": [176, 224, 230],
    "firebrick": [178, 34, 34],
    "darkgoldenrod": [184, 134, 11],
    "mediumorchid": [186, 85, 211],
    "rosybrown": [188, 143, 143],
    "darkkhaki": [189, 183, 107],
    "silver": [192, 192, 192],
    "mediumvioletred": [199, 21, 133],
    "indianred": [205, 92, 92],
    "peru": [205, 133, 63],
    "chocolate": [210, 105, 30],
    "tan": [210, 180, 140],
    "lightgray": [211, 211, 211],
    "lightgrey": [211, 211, 211],
    "palevioletred": [216, 112, 147],
    "thistle": [216, 191, 216],
    "orchid": [218, 112, 214],
    "goldenrod": [218, 165, 32],
    "crimson": [220, 20, 60],
    "gainsboro": [220, 220, 220],
    "plum": [221, 160, 221],
    "burlywood": [222, 184, 135],
    "lightcyan": [224, 255, 255],
    "lavender": [230, 230, 250],
    "darksalmon": [233, 150, 122],
    "violet": [238, 130, 238],
    "palegoldenrod": [238, 232, 170],
    "lightcoral": [240, 128, 128],
    "khaki": [240, 230, 140],
    "aliceblue": [240, 248, 255],
    "honeydew": [240, 255, 240],
    "azure": [240, 255, 255],
    "sandybrown": [244, 164, 96],
    "wheat": [245, 222, 179],
    "beige": [245, 245, 220],
    "whitesmoke": [245, 245, 245],
    "mintcream": [245, 255, 250],
    "ghostwhite": [248, 248, 255],
    "salmon": [250, 128, 114],
    "antiquewhite": [250, 235, 215],
    "linen": [250, 240, 230],
    "lightgoldenrodyellow": [250, 250, 210],
    "oldlace": [253, 245, 230],
    "red": [255, 0, 0],
    "fuchsia": [255, 0, 255],
    "magenta": [255, 0, 255],
    "deeppink": [255, 20, 147],
    "orangered": [255, 69, 0],
    "tomato": [255, 99, 71],
    "hotpink": [255, 105, 180],
    "coral": [255, 127, 80],
    "darkorange": [255, 140, 0],
    "lightsalmon": [255, 160, 122],
    "orange": [255, 165, 0],
    "lightpink": [255, 182, 193],
    "pink": [255, 192, 203],
    "gold": [255, 215, 0],
    "peachpuff": [255, 218, 185],
    "navajowhite": [255, 222, 173],
    "moccasin": [255, 228, 181],
    "bisque": [255, 228, 196],
    "mistyrose": [255, 228, 225],
    "blanchedalmond": [255, 235, 205],
    "papayawhip": [255, 239, 213],
    "lavenderblush": [255, 240, 245],
    "seashell": [255, 245, 238],
    "cornsilk": [255, 248, 220],
    "lemonchiffon": [255, 250, 205],
    "floralwhite": [255, 250, 240],
    "snow": [255, 250, 250],
    "yellow": [255, 255, 0],
    "lightyellow": [255, 255, 224],
    "ivory": [255, 255, 240],
    "white": [255, 255, 255]
  };

  var color = /*#__PURE__*/Object.freeze({
    __proto__: null,
    add: add,
    add_: add_,
    fromString: fromString,
    hsl2rgb: hsl2rgb,
    interpolate: interpolate,
    interpolateHSL: interpolateHSL,
    lerp: lerp,
    lerpHSL: lerpHSL,
    multiply: multiply,
    multiply_: multiply_,
    randomize: randomize,
    rgb2hsl: rgb2hsl,
    toHex: toHex,
    toRGB: toRGB
  });

  /**
   * @class Tile backend
   * @private
   */
  var TileGL = /*#__PURE__*/function (_Backend) {
    function TileGL() {
      var _this;
      _this = _Backend.call(this) || this;
      _this.texture = null;
      _this.tileSetLoadListener = null;
      _this.animationFrame = null;
      _this.uniforms = {};
      _this.gl = _this.initWebGL();
      return _this;
    }
    _inheritsLoose(TileGL, _Backend);
    TileGL.isSupported = function isSupported() {
      return !!document.createElement("canvas").getContext("webgl2", {
        preserveDrawingBuffer: true
      });
    };
    var _proto = TileGL.prototype;
    _proto.schedule = function schedule(cb) {
      this.animationFrame = requestAnimationFrame(cb);
    };
    _proto.cancelSchedule = function cancelSchedule() {
      if (this.animationFrame === null) {
        return;
      }
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    };
    _proto.getContainer = function getContainer() {
      if (!(this.gl.canvas instanceof HTMLCanvasElement)) {
        throw new Error("WebGL canvas is unavailable");
      }
      return this.gl.canvas;
    };
    _proto.setOptions = function setOptions(opts) {
      _Backend.prototype.setOptions.call(this, opts);
      this.updateSize();
      this.setTileSet(opts.tileSet);
    };
    _proto.draw = function draw(data, clearBefore) {
      var gl = this.gl;
      var opts = this.options;
      var x = data[0],
        y = data[1],
        ch = data[2],
        fg = data[3],
        bg = data[4];
      var scissorY = gl.canvas.height - (y + 1) * opts.tileHeight;
      gl.scissor(x * opts.tileWidth, scissorY, opts.tileWidth, opts.tileHeight);
      if (clearBefore) {
        if (opts.tileColorize) {
          gl.clearColor(0, 0, 0, 0);
        } else {
          gl.clearColor.apply(gl, parseColor(bg));
        }
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
      if (!ch) {
        return;
      }
      var chars = [].concat(ch);
      var bgs = [].concat(bg);
      var fgs = [].concat(fg);
      gl.uniform2fv(this.uniforms["targetPosRel"], [x, y]);
      for (var _iterator = _createForOfIteratorHelperLoose(chars.entries()), _step; !(_step = _iterator()).done;) {
        var _step$value = _step.value,
          i = _step$value[0],
          character = _step$value[1];
        var tile = this.options.tileMap[character];
        if (!tile) {
          throw new Error("Char \"" + character + "\" not found in tileMap");
        }
        gl.uniform1f(this.uniforms["colorize"], opts.tileColorize ? 1 : 0);
        gl.uniform2fv(this.uniforms["tilesetPosAbs"], tile);
        if (opts.tileColorize) {
          gl.uniform4fv(this.uniforms["tint"], parseColor(fgs[i] || fgs[0]));
          gl.uniform4fv(this.uniforms["bg"], parseColor(bgs[i] || bgs[0]));
        }
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
    };
    _proto.clear = function clear() {
      var gl = this.gl;
      gl.clearColor.apply(gl, parseColor(this.options.bg));
      gl.scissor(0, 0, gl.canvas.width, gl.canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);
    };
    _proto.computeSize = function computeSize(availWidth, availHeight) {
      var width = Math.floor(availWidth / this.options.tileWidth);
      var height = Math.floor(availHeight / this.options.tileHeight);
      return [width, height];
    };
    _proto.computeFontSize = function computeFontSize() {
      throw new Error("Tile backend does not understand font size");
    };
    _proto.eventToPosition = function eventToPosition(x, y) {
      var canvas = this.gl.canvas;
      if (!(canvas instanceof HTMLCanvasElement)) {
        throw new Error("WebGL canvas is unavailable");
      }
      var rect = canvas.getBoundingClientRect();
      x -= rect.left;
      y -= rect.top;
      x *= canvas.width / rect.width;
      y *= canvas.height / rect.height;
      if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) {
        return [-1, -1];
      }
      return this.normalizedEventToPosition(x, y);
    };
    _proto.initWebGL = function initWebGL() {
      var _this2 = this;
      var gl = document.createElement("canvas").getContext("webgl2", {
        preserveDrawingBuffer: true
      });
      if (!gl) {
        throw new Error("WebGL2 is not supported");
      }
      var program = createProgram(gl, VS, FS);
      gl.useProgram(program);
      createQuad(gl);
      UNIFORMS.forEach(function (name) {
        // side-effect
        _this2.uniforms[name] = gl.getUniformLocation(program, name);
      });
      this.program = program;
      gl.enable(gl.BLEND);
      gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.enable(gl.SCISSOR_TEST);
      return gl;
    };
    _proto.normalizedEventToPosition = function normalizedEventToPosition(x, y) {
      return [Math.floor(x / this.options.tileWidth), Math.floor(y / this.options.tileHeight)];
    };
    _proto.updateSize = function updateSize() {
      var gl = this.gl;
      var opts = this.options;
      var canvasSize = [opts.width * opts.tileWidth, opts.height * opts.tileHeight];
      gl.canvas.width = canvasSize[0];
      gl.canvas.height = canvasSize[1];
      gl.viewport(0, 0, canvasSize[0], canvasSize[1]);
      gl.uniform2fv(this.uniforms["tileSize"], [opts.tileWidth, opts.tileHeight]);
      gl.uniform2fv(this.uniforms["targetSize"], canvasSize);
    };
    _proto.setTileSet = function setTileSet(tileSet) {
      var _this3 = this;
      if (tileSet === this.tileSet) {
        return;
      }
      this.removeTileSetLoadListener();
      this.tileSet = tileSet;
      if (!tileSet) {
        this.clearTexture();
        return;
      }
      if ("complete" in tileSet && !tileSet.complete) {
        var image = tileSet;
        if (!("addEventListener" in image) || typeof image.addEventListener !== "function") {
          throw new Error("Pending tile set cannot receive load events");
        }
        var listener = function listener() {
          if (_this3.tileSet !== image) {
            return;
          }
          _this3.tileSetLoadListener = null;
          _this3.updateTexture(image);
        };
        this.tileSetLoadListener = {
          tileSet: image,
          listener: listener
        };
        image.addEventListener("load", listener, {
          once: true
        });
        return;
      }
      this.updateTexture(tileSet);
    };
    _proto.removeTileSetLoadListener = function removeTileSetLoadListener() {
      if (!this.tileSetLoadListener) {
        return;
      }
      var _this$tileSetLoadList = this.tileSetLoadListener,
        tileSet = _this$tileSetLoadList.tileSet,
        listener = _this$tileSetLoadList.listener;
      tileSet.removeEventListener("load", listener);
      this.tileSetLoadListener = null;
    };
    _proto.updateTexture = function updateTexture(tileSet) {
      var texture = createTexture(this.gl, tileSet);
      if (this.texture) {
        this.gl.deleteTexture(this.texture);
      }
      this.texture = texture;
    };
    _proto.clearTexture = function clearTexture() {
      if (!this.texture) {
        return;
      }
      this.gl.deleteTexture(this.texture);
      this.texture = null;
    };
    return TileGL;
  }(Backend);
  var UNIFORMS = ["targetPosRel", "tilesetPosAbs", "tileSize", "targetSize", "colorize", "bg", "tint"];
  var VS = "\n#version 300 es\n\nin vec2 tilePosRel;\nout vec2 tilesetPosPx;\n\nuniform vec2 tilesetPosAbs;\nuniform vec2 tileSize;\nuniform vec2 targetSize;\nuniform vec2 targetPosRel;\n\nvoid main() {\n\tvec2 targetPosPx = (targetPosRel + tilePosRel) * tileSize;\n\tvec2 targetPosNdc = ((targetPosPx / targetSize)-0.5)*2.0;\n\ttargetPosNdc.y *= -1.0;\n\n\tgl_Position = vec4(targetPosNdc, 0.0, 1.0);\n\ttilesetPosPx = tilesetPosAbs + tilePosRel * tileSize;\n}".trim();
  var FS = "\n#version 300 es\nprecision highp float;\n\nin vec2 tilesetPosPx;\nout vec4 fragColor;\nuniform sampler2D image;\nuniform bool colorize;\nuniform vec4 bg;\nuniform vec4 tint;\n\nvoid main() {\n\tfragColor = vec4(0, 0, 0, 1);\n\n\tvec4 texel = texelFetch(image, ivec2(tilesetPosPx), 0);\n\n\tif (colorize) {\n\t\ttexel.rgb = tint.a * tint.rgb + (1.0-tint.a) * texel.rgb;\n\t\tfragColor.rgb = texel.a*texel.rgb + (1.0-texel.a)*bg.rgb;\n\t\tfragColor.a = texel.a + (1.0-texel.a)*bg.a;\n\t} else {\n\t\tfragColor = texel;\n\t}\n}".trim();
  function createProgram(gl, vss, fss) {
    var vs = gl.createShader(gl.VERTEX_SHADER);
    if (!vs) {
      throw new Error("Unable to create WebGL vertex shader");
    }
    gl.shaderSource(vs, vss);
    gl.compileShader(vs);
    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(vs) || "");
    }
    var fs = gl.createShader(gl.FRAGMENT_SHADER);
    if (!fs) {
      throw new Error("Unable to create WebGL fragment shader");
    }
    gl.shaderSource(fs, fss);
    gl.compileShader(fs);
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(fs) || "");
    }
    var p = gl.createProgram();
    if (!p) {
      throw new Error("Unable to create WebGL program");
    }
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(p) || "");
    }
    return p;
  }
  function createQuad(gl) {
    var pos = new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]);
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, pos, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  }
  function createTexture(gl, data) {
    var t = gl.createTexture();
    if (!t) {
      throw new Error("Unable to create WebGL texture");
    }
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data);
    return t;
  }
  var colorCache = {};
  function parseColor(color$1) {
    var _a;
    if (!(color$1 in colorCache)) {
      var parsed;
      if (color$1 === "transparent") {
        parsed = [0, 0, 0, 0];
      } else if (color$1.indexOf("rgba") > -1) {
        var matches = color$1.match(/[\d.]+/g);
        if (!matches || matches.length < 3) {
          throw new Error("Invalid RGBA color: " + color$1);
        }
        var channels = matches.slice(0, 4).map(Number);
        parsed = [channels[0] / 255, channels[1] / 255, channels[2] / 255, ((_a = channels[3]) !== null && _a !== void 0 ? _a : 255) / 255];
        for (var i = 0; i < 3; i++) {
          parsed[i] = parsed[i] / 255;
        }
      } else {
        var _Color$fromString = fromString(color$1),
          red = _Color$fromString[0],
          green = _Color$fromString[1],
          blue = _Color$fromString[2];
        parsed = [red / 255, green / 255, blue / 255, 1];
      }
      colorCache[color$1] = parsed;
    }
    return colorCache[color$1];
  }

  function clearToAnsi(bg) {
    return "\x1B[0;48;5;" + termcolor(bg) + "m\x1B[2J";
  }
  function colorToAnsi(fg, bg) {
    return "\x1B[0;38;5;" + termcolor(fg) + ";48;5;" + termcolor(bg) + "m";
  }
  function positionToAnsi(x, y) {
    return "\x1B[" + (y + 1) + ";" + (x + 1) + "H";
  }
  function termcolor(color$1) {
    var SRC_COLORS = 256.0;
    var DST_COLORS = 6.0;
    var COLOR_RATIO = DST_COLORS / SRC_COLORS;
    var rgb = fromString(color$1);
    var r = Math.floor(rgb[0] * COLOR_RATIO);
    var g = Math.floor(rgb[1] * COLOR_RATIO);
    var b = Math.floor(rgb[2] * COLOR_RATIO);
    return r * 36 + g * 6 + b * 1 + 16;
  }
  var Term = /*#__PURE__*/function (_Backend) {
    function Term() {
      var _this;
      _this = _Backend.call(this) || this;
      _this.timeout = null;
      _this.offset = [0, 0];
      _this.cursor = [-1, -1];
      _this.lastColor = "";
      return _this;
    }
    _inheritsLoose(Term, _Backend);
    var _proto = Term.prototype;
    _proto.schedule = function schedule(cb) {
      this.timeout = setTimeout(cb, 1000 / 60);
    };
    _proto.cancelSchedule = function cancelSchedule() {
      if (this.timeout === null) {
        return;
      }
      clearTimeout(this.timeout);
      this.timeout = null;
    };
    _proto.setOptions = function setOptions(options) {
      _Backend.prototype.setOptions.call(this, options);
      var size = [options.width, options.height];
      var avail = this.computeSize();
      this.offset = [Math.floor((avail[0] - size[0]) / 2), Math.floor((avail[1] - size[1]) / 2)];
    };
    _proto.clear = function clear() {
      process.stdout.write(clearToAnsi(this.options.bg));
    };
    _proto.draw = function draw(data, clearBefore) {
      // determine where to draw what with what colors
      var x = data[0],
        y = data[1],
        fg = data[3],
        bg = data[4];
      var ch = data[2];
      // determine if we need to move the terminal cursor
      var dx = this.offset[0] + x;
      var dy = this.offset[1] + y;
      var size = this.computeSize();
      if (dx < 0 || dx >= size[0]) {
        return;
      }
      if (dy < 0 || dy >= size[1]) {
        return;
      }
      if (dx !== this.cursor[0] || dy !== this.cursor[1]) {
        process.stdout.write(positionToAnsi(dx, dy));
        this.cursor[0] = dx;
        this.cursor[1] = dy;
      }
      // terminals automatically clear, but if we're clearing when we're
      // not otherwise provided with a character, just use a space instead
      if (clearBefore) {
        if (!ch) {
          ch = " ";
        }
      }
      // if we're not clearing and not provided with a character, do nothing
      if (!ch) {
        return;
      }
      // determine if we need to change colors
      var newColor = colorToAnsi(fg, bg);
      if (newColor !== this.lastColor) {
        process.stdout.write(newColor);
        this.lastColor = newColor;
      }
      if (ch !== '\t') {
        // write the provided symbol to the display
        var chars = [].concat(ch);
        process.stdout.write(chars[0]);
      }
      // update our position, given that we wrote a character
      this.cursor[0]++;
      if (this.cursor[0] >= size[0]) {
        this.cursor[0] = 0;
        this.cursor[1]++;
      }
    };
    _proto.computeFontSize = function computeFontSize() {
      throw new Error("Terminal backend has no notion of font size");
    };
    _proto.eventToPosition = function eventToPosition(x, y) {
      return [x, y];
    };
    _proto.computeSize = function computeSize() {
      var _a, _b;
      return [(_a = process.stdout.columns) !== null && _a !== void 0 ? _a : 80, (_b = process.stdout.rows) !== null && _b !== void 0 ? _b : 24];
    };
    return Term;
  }(Backend);

  /**
   * @namespace
   * Contains text tokenization and breaking routines
   */
  var RE_COLORS = /%([bc]){([^}]*)}/g;
  // token types
  var TYPE_TEXT = 0;
  var TYPE_NEWLINE = 1;
  var TYPE_FG = 2;
  var TYPE_BG = 3;
  /**
   * Measure size of a resulting text block
   */
  function measure(str, maxWidth) {
    var _a, _b;
    var result = {
      width: 0,
      height: 1
    };
    var tokens = tokenize(str, maxWidth);
    var lineWidth = 0;
    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];
      switch (token.type) {
        case TYPE_TEXT:
          lineWidth += (_b = (_a = token.value) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0;
          break;
        case TYPE_NEWLINE:
          result.height++;
          result.width = Math.max(result.width, lineWidth);
          lineWidth = 0;
          break;
      }
    }
    result.width = Math.max(result.width, lineWidth);
    return result;
  }
  /**
   * Convert string to a series of a formatting commands
   */
  function tokenize(str, maxWidth) {
    var result = [];
    /* first tokenization pass - split texts and color formatting commands */
    var offset = 0;
    str.replace(RE_COLORS, function (match, type, name, index) {
      /* string before */
      var part = str.substring(offset, index);
      if (part.length) {
        result.push({
          type: TYPE_TEXT,
          value: part
        });
      }
      /* color command */
      result.push({
        type: type === "c" ? TYPE_FG : TYPE_BG,
        value: name.trim()
      });
      offset = index + match.length;
      return "";
    });
    /* last remaining part */
    var part = str.substring(offset);
    if (part.length) {
      result.push({
        type: TYPE_TEXT,
        value: part
      });
    }
    return breakLines(result, maxWidth);
  }
  /* insert line breaks into first-pass tokenized data */
  function breakLines(tokens, maxWidth) {
    if (!maxWidth) {
      maxWidth = Infinity;
    }
    if (maxWidth < 0) {
      maxWidth = 1;
    }
    var i = 0;
    var lineLength = 0;
    var lastTokenWithSpace = -1;
    while (i < tokens.length) {
      /* take all text tokens, remove space, apply linebreaks */
      var token = tokens[i];
      if (token.type === TYPE_NEWLINE) {
        /* reset */
        lineLength = 0;
        lastTokenWithSpace = -1;
      }
      if (token.type !== TYPE_TEXT) {
        /* skip non-text tokens */
        i++;
        continue;
      }
      if (token.value === undefined) {
        i++;
        continue;
      }
      /* remove spaces at the beginning of line */
      while (lineLength === 0 && token.value.charAt(0) === " ") {
        token.value = token.value.substring(1);
      }
      /* forced newline? insert two new tokens after this one */
      var index = token.value.indexOf("\n");
      if (index !== -1) {
        token.value = breakInsideToken(tokens, i, index, true);
        /* if there are spaces at the end, we must remove them (we do not want the line too long) */
        var arr = token.value.split("");
        while (arr.length && arr[arr.length - 1] === " ") {
          arr.pop();
        }
        token.value = arr.join("");
      }
      /* token degenerated? */
      if (!token.value.length) {
        tokens.splice(i, 1);
        continue;
      }
      if (lineLength + token.value.length > maxWidth) {
        /* line too long, find a suitable breaking spot */
        /* is it possible to break within this token? */
        var _index = -1;
        while (1) {
          var nextIndex = token.value.indexOf(" ", _index + 1);
          if (nextIndex === -1) {
            break;
          }
          if (lineLength + nextIndex > maxWidth) {
            break;
          }
          _index = nextIndex;
        }
        if (_index !== -1) {
          /* break at space within this one */
          token.value = breakInsideToken(tokens, i, _index, true);
        } else if (lastTokenWithSpace !== -1) {
          /* is there a previous token where a break can occur? */
          var _token = tokens[lastTokenWithSpace];
          if (_token.value === undefined) {
            i++;
            continue;
          }
          var breakIndex = _token.value.lastIndexOf(" ");
          _token.value = breakInsideToken(tokens, lastTokenWithSpace, breakIndex, true);
          i = lastTokenWithSpace;
        } else {
          /* force break in this token */
          token.value = breakInsideToken(tokens, i, maxWidth - lineLength, false);
        }
      } else {
        /* line not long, continue */
        var value = token.value;
        lineLength += value.length;
        if (value.indexOf(" ") !== -1) {
          lastTokenWithSpace = i;
        }
      }
      i++; /* advance to next token */
    }
    tokens.push({
      type: TYPE_NEWLINE
    }); /* insert fake newline to fix the last text line */
    /* remove trailing space from text tokens before newlines */
    var lastTextToken = null;
    for (var _i = 0; _i < tokens.length; _i++) {
      var _token2 = tokens[_i];
      switch (_token2.type) {
        case TYPE_TEXT:
          lastTextToken = _token2;
          break;
        case TYPE_NEWLINE:
          if (lastTextToken) {
            /* remove trailing space */
            if (lastTextToken.value === undefined) {
              break;
            }
            var _arr = lastTextToken.value.split("");
            while (_arr.length && _arr[_arr.length - 1] === " ") {
              _arr.pop();
            }
            lastTextToken.value = _arr.join("");
          }
          lastTextToken = null;
          break;
      }
    }
    tokens.pop(); /* remove fake token */
    return tokens;
  }
  /**
   * Create new tokens and insert them into the stream
   * @param {object[]} tokens
   * @param {int} tokenIndex Token being processed
   * @param {int} breakIndex Index within current token's value
   * @param {bool} removeBreakChar Do we want to remove the breaking character?
   * @returns {string} remaining unbroken token value
   */
  function breakInsideToken(tokens, tokenIndex, breakIndex, removeBreakChar) {
    var currentValue = tokens[tokenIndex].value;
    if (currentValue === undefined) {
      return "";
    }
    var newBreakToken = {
      type: TYPE_NEWLINE
    };
    var newTextToken = {
      type: TYPE_TEXT,
      value: currentValue.substring(breakIndex + (removeBreakChar ? 1 : 0))
    };
    tokens.splice(tokenIndex + 1, 0, newBreakToken, newTextToken);
    return currentValue.substring(0, breakIndex);
  }

  var text = /*#__PURE__*/Object.freeze({
    __proto__: null,
    TYPE_BG: TYPE_BG,
    TYPE_FG: TYPE_FG,
    TYPE_NEWLINE: TYPE_NEWLINE,
    TYPE_TEXT: TYPE_TEXT,
    measure: measure,
    tokenize: tokenize
  });

  /** Default width for display and map generators */
  var DEFAULT_WIDTH = 80;
  /** Default height for display and map generators */
  var DEFAULT_HEIGHT = 25;
  var DIRS = {
    4: [[0, -1], [1, 0], [0, 1], [-1, 0]],
    8: [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]],
    6: [[-1, -1], [1, -1], [2, 0], [1, 1], [-1, 1], [-2, 0]]
  };
  var KEYS = {
    /** Cancel key. */
    VK_CANCEL: 3,
    /** Help key. */
    VK_HELP: 6,
    /** Backspace key. */
    VK_BACK_SPACE: 8,
    /** Tab key. */
    VK_TAB: 9,
    /** 5 key on Numpad when NumLock is unlocked. Or on Mac, clear key which is positioned at NumLock key. */
    VK_CLEAR: 12,
    /** Return/enter key on the main keyboard. */
    VK_RETURN: 13,
    /** Reserved, but not used. */
    VK_ENTER: 14,
    /** Shift key. */
    VK_SHIFT: 16,
    /** Control key. */
    VK_CONTROL: 17,
    /** Alt (Option on Mac) key. */
    VK_ALT: 18,
    /** Pause key. */
    VK_PAUSE: 19,
    /** Caps lock. */
    VK_CAPS_LOCK: 20,
    /** Escape key. */
    VK_ESCAPE: 27,
    /** Space bar. */
    VK_SPACE: 32,
    /** Page Up key. */
    VK_PAGE_UP: 33,
    /** Page Down key. */
    VK_PAGE_DOWN: 34,
    /** End key. */
    VK_END: 35,
    /** Home key. */
    VK_HOME: 36,
    /** Left arrow. */
    VK_LEFT: 37,
    /** Up arrow. */
    VK_UP: 38,
    /** Right arrow. */
    VK_RIGHT: 39,
    /** Down arrow. */
    VK_DOWN: 40,
    /** Print Screen key. */
    VK_PRINTSCREEN: 44,
    /** Ins(ert) key. */
    VK_INSERT: 45,
    /** Del(ete) key. */
    VK_DELETE: 46,
    /***/
    VK_0: 48,
    /***/
    VK_1: 49,
    /***/
    VK_2: 50,
    /***/
    VK_3: 51,
    /***/
    VK_4: 52,
    /***/
    VK_5: 53,
    /***/
    VK_6: 54,
    /***/
    VK_7: 55,
    /***/
    VK_8: 56,
    /***/
    VK_9: 57,
    /** Colon (:) key. Requires Gecko 15.0 */
    VK_COLON: 58,
    /** Semicolon (;) key. */
    VK_SEMICOLON: 59,
    /** Less-than (<) key. Requires Gecko 15.0 */
    VK_LESS_THAN: 60,
    /** Equals (=) key. */
    VK_EQUALS: 61,
    /** Greater-than (>) key. Requires Gecko 15.0 */
    VK_GREATER_THAN: 62,
    /** Question mark (?) key. Requires Gecko 15.0 */
    VK_QUESTION_MARK: 63,
    /** Atmark (@) key. Requires Gecko 15.0 */
    VK_AT: 64,
    /***/
    VK_A: 65,
    /***/
    VK_B: 66,
    /***/
    VK_C: 67,
    /***/
    VK_D: 68,
    /***/
    VK_E: 69,
    /***/
    VK_F: 70,
    /***/
    VK_G: 71,
    /***/
    VK_H: 72,
    /***/
    VK_I: 73,
    /***/
    VK_J: 74,
    /***/
    VK_K: 75,
    /***/
    VK_L: 76,
    /***/
    VK_M: 77,
    /***/
    VK_N: 78,
    /***/
    VK_O: 79,
    /***/
    VK_P: 80,
    /***/
    VK_Q: 81,
    /***/
    VK_R: 82,
    /***/
    VK_S: 83,
    /***/
    VK_T: 84,
    /***/
    VK_U: 85,
    /***/
    VK_V: 86,
    /***/
    VK_W: 87,
    /***/
    VK_X: 88,
    /***/
    VK_Y: 89,
    /***/
    VK_Z: 90,
    /***/
    VK_CONTEXT_MENU: 93,
    /** 0 on the numeric keypad. */
    VK_NUMPAD0: 96,
    /** 1 on the numeric keypad. */
    VK_NUMPAD1: 97,
    /** 2 on the numeric keypad. */
    VK_NUMPAD2: 98,
    /** 3 on the numeric keypad. */
    VK_NUMPAD3: 99,
    /** 4 on the numeric keypad. */
    VK_NUMPAD4: 100,
    /** 5 on the numeric keypad. */
    VK_NUMPAD5: 101,
    /** 6 on the numeric keypad. */
    VK_NUMPAD6: 102,
    /** 7 on the numeric keypad. */
    VK_NUMPAD7: 103,
    /** 8 on the numeric keypad. */
    VK_NUMPAD8: 104,
    /** 9 on the numeric keypad. */
    VK_NUMPAD9: 105,
    /** * on the numeric keypad. */
    VK_MULTIPLY: 106,
    /** + on the numeric keypad. */
    VK_ADD: 107,
    /***/
    VK_SEPARATOR: 108,
    /** - on the numeric keypad. */
    VK_SUBTRACT: 109,
    /** Decimal point on the numeric keypad. */
    VK_DECIMAL: 110,
    /** / on the numeric keypad. */
    VK_DIVIDE: 111,
    /** F1 key. */
    VK_F1: 112,
    /** F2 key. */
    VK_F2: 113,
    /** F3 key. */
    VK_F3: 114,
    /** F4 key. */
    VK_F4: 115,
    /** F5 key. */
    VK_F5: 116,
    /** F6 key. */
    VK_F6: 117,
    /** F7 key. */
    VK_F7: 118,
    /** F8 key. */
    VK_F8: 119,
    /** F9 key. */
    VK_F9: 120,
    /** F10 key. */
    VK_F10: 121,
    /** F11 key. */
    VK_F11: 122,
    /** F12 key. */
    VK_F12: 123,
    /** F13 key. */
    VK_F13: 124,
    /** F14 key. */
    VK_F14: 125,
    /** F15 key. */
    VK_F15: 126,
    /** F16 key. */
    VK_F16: 127,
    /** F17 key. */
    VK_F17: 128,
    /** F18 key. */
    VK_F18: 129,
    /** F19 key. */
    VK_F19: 130,
    /** F20 key. */
    VK_F20: 131,
    /** F21 key. */
    VK_F21: 132,
    /** F22 key. */
    VK_F22: 133,
    /** F23 key. */
    VK_F23: 134,
    /** F24 key. */
    VK_F24: 135,
    /** Num Lock key. */
    VK_NUM_LOCK: 144,
    /** Scroll Lock key. */
    VK_SCROLL_LOCK: 145,
    /** Circumflex (^) key. Requires Gecko 15.0 */
    VK_CIRCUMFLEX: 160,
    /** Exclamation (!) key. Requires Gecko 15.0 */
    VK_EXCLAMATION: 161,
    /** Double quote () key. Requires Gecko 15.0 */
    VK_DOUBLE_QUOTE: 162,
    /** Hash (#) key. Requires Gecko 15.0 */
    VK_HASH: 163,
    /** Dollar sign ($) key. Requires Gecko 15.0 */
    VK_DOLLAR: 164,
    /** Percent (%) key. Requires Gecko 15.0 */
    VK_PERCENT: 165,
    /** Ampersand (&) key. Requires Gecko 15.0 */
    VK_AMPERSAND: 166,
    /** Underscore (_) key. Requires Gecko 15.0 */
    VK_UNDERSCORE: 167,
    /** Open parenthesis (() key. Requires Gecko 15.0 */
    VK_OPEN_PAREN: 168,
    /** Close parenthesis ()) key. Requires Gecko 15.0 */
    VK_CLOSE_PAREN: 169,
    /* Asterisk (*) key. Requires Gecko 15.0 */
    VK_ASTERISK: 170,
    /** Plus (+) key. Requires Gecko 15.0 */
    VK_PLUS: 171,
    /** Pipe (|) key. Requires Gecko 15.0 */
    VK_PIPE: 172,
    /** Hyphen-US/docs/Minus (-) key. Requires Gecko 15.0 */
    VK_HYPHEN_MINUS: 173,
    /** Open curly bracket ({) key. Requires Gecko 15.0 */
    VK_OPEN_CURLY_BRACKET: 174,
    /** Close curly bracket (}) key. Requires Gecko 15.0 */
    VK_CLOSE_CURLY_BRACKET: 175,
    /** Tilde (~) key. Requires Gecko 15.0 */
    VK_TILDE: 176,
    /** Comma (,) key. */
    VK_COMMA: 188,
    /** Period (.) key. */
    VK_PERIOD: 190,
    /** Slash (/) key. */
    VK_SLASH: 191,
    /** Back tick (`) key. */
    VK_BACK_QUOTE: 192,
    /** Open square bracket ([) key. */
    VK_OPEN_BRACKET: 219,
    /** Back slash (\) key. */
    VK_BACK_SLASH: 220,
    /** Close square bracket (]) key. */
    VK_CLOSE_BRACKET: 221,
    /** Quote (''') key. */
    VK_QUOTE: 222,
    /** Meta key on Linux, Command key on Mac. */
    VK_META: 224,
    /** AltGr key on Linux. Requires Gecko 15.0 */
    VK_ALTGR: 225,
    /** Windows logo key on Windows. Or Super or Hyper key on Linux. Requires Gecko 15.0 */
    VK_WIN: 91,
    /** Linux support for this keycode was added in Gecko 4.0. */
    VK_KANA: 21,
    /** Linux support for this keycode was added in Gecko 4.0. */
    VK_HANGUL: 21,
    /** 英数 key on Japanese Mac keyboard. Requires Gecko 15.0 */
    VK_EISU: 22,
    /** Linux support for this keycode was added in Gecko 4.0. */
    VK_JUNJA: 23,
    /** Linux support for this keycode was added in Gecko 4.0. */
    VK_FINAL: 24,
    /** Linux support for this keycode was added in Gecko 4.0. */
    VK_HANJA: 25,
    /** Linux support for this keycode was added in Gecko 4.0. */
    VK_KANJI: 25,
    /** Linux support for this keycode was added in Gecko 4.0. */
    VK_CONVERT: 28,
    /** Linux support for this keycode was added in Gecko 4.0. */
    VK_NONCONVERT: 29,
    /** Linux support for this keycode was added in Gecko 4.0. */
    VK_ACCEPT: 30,
    /** Linux support for this keycode was added in Gecko 4.0. */
    VK_MODECHANGE: 31,
    /** Linux support for this keycode was added in Gecko 4.0. */
    VK_SELECT: 41,
    /** Linux support for this keycode was added in Gecko 4.0. */
    VK_PRINT: 42,
    /** Linux support for this keycode was added in Gecko 4.0. */
    VK_EXECUTE: 43,
    /** Linux support for this keycode was added in Gecko 4.0.	 */
    VK_SLEEP: 95
  };

  var BACKENDS = {
    hex: Hex,
    rect: Rect,
    tile: Tile,
    "tile-gl": TileGL,
    term: Term
  };
  var DEFAULT_OPTIONS = {
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    transpose: false,
    layout: "rect",
    fontSize: 15,
    spacing: 1,
    border: 0,
    forceSquareRatio: false,
    fontFamily: "monospace",
    fontStyle: "",
    fg: "#ccc",
    bg: "#000",
    tileWidth: 32,
    tileHeight: 32,
    tileMap: {},
    tileSet: null,
    tileColorize: false
  };
  /**
   * @class Visual map display
   */
  var Display = /*#__PURE__*/function () {
    function Display(options) {
      if (options === void 0) {
        options = {};
      }
      this.data = {};
      this.dirty = false;
      this.options = Object.assign({}, DEFAULT_OPTIONS);
      this.destroyed = false;
      this.options = Object.assign(Object.assign({}, DEFAULT_OPTIONS), options);
      var BackendCtor = BACKENDS[this.options.layout];
      this.backend = new BackendCtor();
      this.scheduledBackend = this.backend;
      this.backend.setOptions(this.options);
      this.dirty = true;
      this.DEBUG = this.DEBUG.bind(this);
      this.tick = this.tick.bind(this);
      this.scheduleTick();
    }
    /**
     * Debug helper, ideal as a map generator callback. Always bound to this.
     * @param {int} x
     * @param {int} y
     * @param {int} what
     */
    var _proto = Display.prototype;
    _proto.DEBUG = function DEBUG(x, y, what) {
      var colors = [this.options.bg, this.options.fg];
      this.draw(x, y, null, null, colors[what % colors.length]);
    }
    /**
     * Clear the whole display (cover it with background color)
     */;
    _proto.clear = function clear() {
      this.data = {};
      this.dirty = true;
    }
    /**
     * @see ROT.Display
     */;
    _proto.setOptions = function setOptions(options) {
      var definedOptions = Object.fromEntries(Object.entries(options).filter(function (_ref) {
        var value = _ref[1];
        return value !== undefined;
      }));
      if (Object.keys(definedOptions).length === 0) {
        return this;
      }
      var previousLayout = this.options.layout;
      Object.assign(this.options, definedOptions);
      var layoutChanged = this.options.layout !== previousLayout;
      if (layoutChanged) {
        this.backend.cancelSchedule();
        var ctor = BACKENDS[this.options.layout];
        this.backend = new ctor();
      }
      this.backend.setOptions(this.options);
      this.dirty = true;
      if (layoutChanged) {
        this.scheduleTick();
      }
      return this;
    }
    /**
     * Returns currently set options
     */;
    _proto.getOptions = function getOptions() {
      return this.options;
    }
    /**
     * Returns the DOM node of this display
     */;
    _proto.getContainer = function getContainer() {
      return this.backend.getContainer();
    }
    /**
     * Stop the display update loop and cancel its pending callback.
     */;
    _proto.destroy = function destroy() {
      if (this.destroyed) {
        return;
      }
      this.destroyed = true;
      this.scheduledBackend.cancelSchedule();
    }
    /**
     * Compute the maximum width/height to fit into a set of given constraints
     * @param {int} availWidth Maximum allowed pixel width
     * @param {int} availHeight Maximum allowed pixel height
     * @returns {int[2]} cellWidth,cellHeight
     */;
    _proto.computeSize = function computeSize(availWidth, availHeight) {
      return this.backend.computeSize(availWidth, availHeight);
    }
    /**
     * Compute the maximum font size to fit into a set of given constraints
     * @param {int} availWidth Maximum allowed pixel width
     * @param {int} availHeight Maximum allowed pixel height
     * @returns {int} fontSize
     */;
    _proto.computeFontSize = function computeFontSize(availWidth, availHeight) {
      return this.backend.computeFontSize(availWidth, availHeight);
    };
    _proto.computeTileSize = function computeTileSize(availWidth, availHeight) {
      var width = Math.floor(availWidth / this.options.width);
      var height = Math.floor(availHeight / this.options.height);
      return [width, height];
    }
    /**
     * Convert a DOM event (mouse or touch) to map coordinates. Uses first touch for multi-touch.
     * @param {Event} e event
     * @returns {int[2]} -1 for values outside of the canvas
     */;
    _proto.eventToPosition = function eventToPosition(e) {
      var _a;
      if ("touches" in e) {
        var touch = (_a = e.touches[0]) !== null && _a !== void 0 ? _a : e.changedTouches[0];
        if (!touch) {
          return [-1, -1];
        }
        return this.backend.eventToPosition(touch.clientX, touch.clientY);
      }
      return this.backend.eventToPosition(e.clientX, e.clientY);
    }
    /**
     * @param {int} x
     * @param {int} y
     * @param {string || string[]} ch One or more chars (will be overlapping themselves)
     * @param {string} [fg] foreground color
     * @param {string} [bg] background color
     */;
    _proto.draw = function draw(x, y, ch, fg, bg) {
      if (!fg) {
        fg = this.options.fg;
      }
      if (!bg) {
        bg = this.options.bg;
      }
      var key = x + "," + y;
      this.data[key] = [x, y, ch, fg, bg];
      if (this.dirty === true) {
        return;
      }
      if (!this.dirty) {
        this.dirty = {};
      }
      this.dirty[key] = true;
    }
    /**
     * @param {int} x
     * @param {int} y
     * @param {string || string[]} ch One or more chars (will be overlapping themselves)
     * @param {string || null} [fg] foreground color
     * @param {string || null} [bg] background color
     */;
    _proto.drawOver = function drawOver(x, y, ch, fg, bg) {
      var key = x + "," + y;
      var existing = this.data[key];
      if (existing) {
        this.draw(x, y, ch || existing[2], fg || existing[3], bg || existing[4]);
      } else {
        this.draw(x, y, ch, fg, bg);
      }
    }
    /**
     * Draws a text at given position. Optionally wraps at a maximum length. Currently does not work with hex layout.
     * @param {int} x
     * @param {int} y
     * @param {string} text May contain color/background format specifiers, %c{name}/%b{name}, both optional. %c{}/%b{} resets to default.
     * @param {int} [maxWidth] wrap at what width?
     * @returns {int} lines drawn
     */;
    _proto.drawText = function drawText(x, y, text$1, maxWidth) {
      var _this = this;
      if (!maxWidth && x >= this.options.width) {
        return 0;
      }
      if (!maxWidth) {
        maxWidth = this.options.width - x;
      }
      var tokens = tokenize(text$1, maxWidth);
      var initialState = {
        cx: x,
        cy: y,
        fg: null,
        bg: null,
        lines: 1,
        isPrevSpace: false,
        isPrevFullWidth: false
      };
      var finalState = tokens.reduce(function (state, token) {
        var _a;
        switch (token.type) {
          case TYPE_TEXT:
            {
              return Array.from((_a = token.value) !== null && _a !== void 0 ? _a : '').reduce(function (characterState, c) {
                var cc = c.charCodeAt(0);
                if (_this.options.layout === "term") {
                  var cch = cc >> 8;
                  var isCJK = cch === 0x11 || cch >= 0x2e && cch <= 0x9f || cch >= 0xac && cch <= 0xd7 || cc >= 0xA960 && cc <= 0xA97F;
                  if (isCJK) {
                    // side-effect
                    _this.draw(characterState.cx, characterState.cy, c, characterState.fg, characterState.bg);
                    _this.draw(characterState.cx + 1, characterState.cy, "\t", characterState.fg, characterState.bg);
                    return Object.assign(Object.assign({}, characterState), {
                      cx: characterState.cx + 2
                    });
                  }
                }
                var isFullWidth = cc > 0xff00 && cc < 0xff61 || cc > 0xffdc && cc < 0xffe8 || cc > 0xffee;
                var isSpace = c.charCodeAt(0) === 0x20 || c.charCodeAt(0) === 0x3000;
                var cx = characterState.cx;
                if (characterState.isPrevFullWidth && !isFullWidth && !isSpace) {
                  cx++;
                }
                if (isFullWidth && !characterState.isPrevSpace) {
                  cx++;
                }
                // side-effect
                _this.draw(cx, characterState.cy, c, characterState.fg, characterState.bg);
                return Object.assign(Object.assign({}, characterState), {
                  cx: cx + 1,
                  isPrevSpace: isSpace,
                  isPrevFullWidth: isFullWidth
                });
              }, state);
            }
          case TYPE_FG:
            return Object.assign(Object.assign({}, state), {
              fg: token.value || null
            });
          case TYPE_BG:
            return Object.assign(Object.assign({}, state), {
              bg: token.value || null
            });
          case TYPE_NEWLINE:
            return Object.assign(Object.assign({}, state), {
              cx: x,
              cy: state.cy + 1,
              lines: state.lines + 1
            });
          default:
            return state;
        }
      }, initialState);
      return finalState.lines;
    }
    /**
     * Timer tick: update dirty parts
     */;
    _proto.tick = function tick() {
      var _this2 = this;
      if (this.destroyed) {
        return;
      }
      this.scheduleTick();
      if (!this.dirty) {
        return;
      }
      if (this.dirty === true) {
        this.backend.clear();
        // side-effect
        Object.keys(this.data).forEach(function (id) {
          _this2.drawCell(id, false);
        });
      } else {
        // side-effect
        Object.keys(this.dirty).forEach(function (key) {
          _this2.drawCell(key, true);
        });
      }
      this.dirty = false;
    };
    _proto.scheduleTick = function scheduleTick() {
      this.scheduledBackend = this.backend;
      this.backend.schedule(this.tick);
    }
    /**
     * @param {string} key What to draw
     * @param {boolean} clearBefore Is it necessary to clean before?
     */;
    _proto.drawCell = function drawCell(key, clearBefore) {
      var data = this.data[key];
      if (data[4] !== this.options.bg) {
        clearBefore = true;
      }
      this.backend.draw(data, clearBefore);
    };
    return Display;
  }();
  Display.Rect = Rect;
  Display.Hex = Hex;
  Display.Tile = Tile;
  Display.TileGL = TileGL;
  Display.Term = Term;

  /**
   * @class (Markov process)-based string generator.
   * Copied from a <a href="http://roguebasin.com/index.php/Names_from_a_high_order_Markov_Process_and_a_simplified_Katz_back-off_scheme">RogueBasin article</a>.
   * Offers configurable order and prior.
   */
  var StringGenerator = /*#__PURE__*/function () {
    function StringGenerator(options) {
      this.options = {
        words: false,
        order: 3,
        prior: 0.001
      };
      Object.assign(this.options, options);
      this.boundary = String.fromCharCode(0);
      this.suffix = this.boundary;
      this.prefix = [];
      for (var i = 0; i < this.options.order; i++) {
        this.prefix.push(this.boundary);
      }
      this.priorValues = {};
      this.priorValues[this.boundary] = this.options.prior;
      this.data = {};
    }
    /**
     * Remove all learning data
     */
    var _proto = StringGenerator.prototype;
    _proto.clear = function clear() {
      this.data = {};
      this.priorValues = {};
      this.priorValues[this.boundary] = this.options.prior;
    }
    /**
     * @returns {string} Generated string
     */;
    _proto.generate = function generate() {
      if (Object.keys(this.data).length === 0) {
        return "";
      }
      var result = [];
      var first = this.sample(this.prefix);
      if (first === undefined) {
        return "";
      }
      result.push(first);
      while (true) {
        var last = result[result.length - 1];
        if (last === undefined || last === this.boundary) {
          break;
        }
        var next = this.sample(result);
        if (next === undefined) {
          break;
        }
        result.push(next);
      }
      return this.join(result.slice(0, -1));
    }
    /**
     * Observe (learn) a string from a training set
     */;
    _proto.observe = function observe(string) {
      var tokens = this.split(string);
      for (var i = 0; i < tokens.length; i++) {
        this.priorValues[tokens[i]] = this.options.prior;
      }
      tokens = this.prefix.concat(tokens).concat(this.suffix); /* add boundary symbols */
      for (var _i = this.options.order; _i < tokens.length; _i++) {
        var context = tokens.slice(_i - this.options.order, _i);
        var event = tokens[_i];
        for (var j = 0; j < context.length; j++) {
          var subcontext = context.slice(j);
          this.observeEvent(subcontext, event);
        }
      }
    };
    _proto.getStats = function getStats() {
      var parts = [];
      var priorCount = Object.keys(this.priorValues).length;
      priorCount--; // boundary
      parts.push("distinct samples: " + priorCount);
      var dataCount = Object.keys(this.data).length;
      var eventCount = 0;
      for (var p in this.data) {
        eventCount += Object.keys(this.data[p]).length;
      }
      parts.push("dictionary size (contexts): " + dataCount);
      parts.push("dictionary size (events): " + eventCount);
      return parts.join(", ");
    }
    /**
     * @param {string}
     * @returns {string[]}
     */;
    _proto.split = function split(str) {
      return str.split(this.options.words ? /\s+/ : "");
    }
    /**
     * @param {string[]}
     * @returns {string}
     */;
    _proto.join = function join(arr) {
      return arr.join(this.options.words ? " " : "");
    }
    /**
     * @param {string[]} context
     * @param {string} event
     */;
    _proto.observeEvent = function observeEvent(context, event) {
      var key = this.join(context);
      if (!(key in this.data)) {
        this.data[key] = {};
      }
      var data = this.data[key];
      if (!(event in data)) {
        data[event] = 0;
      }
      data[event]++;
    }
    /**
     * @param {string[]}
     * @returns {string}
     */;
    _proto.sample = function sample(context) {
      context = this.backoff(context);
      var key = this.join(context);
      var data = this.data[key];
      var available = {};
      if (this.options.prior) {
        for (var event in this.priorValues) {
          available[event] = this.priorValues[event];
        }
        for (var _event in data) {
          available[_event] += data[_event];
        }
      } else {
        available = data;
      }
      return RNG.getWeightedValue(available);
    }
    /**
     * @param {string[]}
     * @returns {string[]}
     */;
    _proto.backoff = function backoff(context) {
      if (context.length > this.options.order) {
        context = context.slice(-this.options.order);
      } else if (context.length < this.options.order) {
        context = this.prefix.slice(0, this.options.order - context.length).concat(context);
      }
      while (!(this.join(context) in this.data) && context.length > 0) {
        context = context.slice(1);
      }
      return context;
    };
    return StringGenerator;
  }();

  var MinHeap = /*#__PURE__*/function () {
    function MinHeap() {
      this.heap = [];
      this.timestamp = 0;
      this.offset = 0;
    }
    var _proto = MinHeap.prototype;
    _proto.lessThan = function lessThan(a, b) {
      return a.key === b.key ? a.timestamp < b.timestamp : a.key < b.key;
    };
    _proto.shift = function shift(v) {
      this.offset += v;
    };
    _proto.len = function len() {
      return this.heap.length;
    };
    _proto.push = function push(value, key) {
      this.timestamp += 1;
      var loc = this.len();
      this.heap.push({
        value: value,
        timestamp: this.timestamp,
        key: key - this.offset
      });
      this.updateUp(loc);
    };
    _proto.pop = function pop() {
      if (this.len() === 0) {
        throw new Error("no element to pop");
      }
      var top = this.heap[0];
      if (this.len() > 1) {
        var replacement = this.heap.pop();
        if (!replacement) {
          throw new Error("heap replacement is unavailable");
        }
        this.heap[0] = replacement;
        this.updateDown(0);
      } else {
        this.heap.pop();
      }
      return Object.assign(Object.assign({}, top), {
        key: top.key + this.offset
      });
    };
    _proto.find = function find(v) {
      var index = this.findIndex(v);
      return index === -1 ? null : Object.assign(Object.assign({}, this.heap[index]), {
        key: this.heap[index].key + this.offset
      });
    };
    _proto.remove = function remove(v) {
      var index = this.findIndex(v);
      if (index === -1) {
        return false;
      }
      var lastIndex = this.len() - 1;
      if (index === lastIndex) {
        this.heap.pop();
        return true;
      }
      var last = this.heap.pop();
      if (!last) {
        return false;
      }
      this.heap[index] = last;
      if (index > 0 && this.lessThan(last, this.heap[this.parentNode(index)])) {
        this.updateUp(index);
      } else {
        this.updateDown(index);
      }
      return true;
    };
    _proto.findIndex = function findIndex(v) {
      var index = -1;
      for (var i = 0; i < this.len(); i++) {
        if (v === this.heap[i].value && (index === -1 || this.heap[i].timestamp < this.heap[index].timestamp)) {
          index = i;
        }
      }
      return index;
    };
    _proto.parentNode = function parentNode(x) {
      return Math.floor((x - 1) / 2);
    };
    _proto.leftChildNode = function leftChildNode(x) {
      return 2 * x + 1;
    };
    _proto.rightChildNode = function rightChildNode(x) {
      return 2 * x + 2;
    };
    _proto.existNode = function existNode(x) {
      return x >= 0 && x < this.heap.length;
    };
    _proto.swap = function swap(x, y) {
      var t = this.heap[x];
      this.heap[x] = this.heap[y];
      this.heap[y] = t;
    };
    _proto.minNode = function minNode(numbers) {
      var validnumbers = numbers.filter(this.existNode.bind(this));
      var minimal = validnumbers[0];
      for (var _iterator = _createForOfIteratorHelperLoose(validnumbers), _step; !(_step = _iterator()).done;) {
        var i = _step.value;
        if (this.lessThan(this.heap[i], this.heap[minimal])) {
          minimal = i;
        }
      }
      return minimal;
    };
    _proto.updateUp = function updateUp(x) {
      if (x === 0) {
        return;
      }
      var parent = this.parentNode(x);
      if (this.existNode(parent) && this.lessThan(this.heap[x], this.heap[parent])) {
        this.swap(x, parent);
        this.updateUp(parent);
      }
    };
    _proto.updateDown = function updateDown(x) {
      var leftChild = this.leftChildNode(x);
      var rightChild = this.rightChildNode(x);
      if (!this.existNode(leftChild)) {
        return;
      }
      var m = this.minNode([x, leftChild, rightChild]);
      if (m !== x) {
        this.swap(x, m);
        this.updateDown(m);
      }
    };
    _proto.debugPrint = function debugPrint() {
      var _this = this;
      console.log(this.heap.map(function (_ref) {
        var key = _ref.key,
          value = _ref.value,
          timestamp = _ref.timestamp;
        return {
          key: key + _this.offset,
          value: value,
          timestamp: timestamp
        };
      }));
    };
    return MinHeap;
  }();

  var EventQueue = /*#__PURE__*/function () {
    /**
     * @class Generic event queue: stores events and retrieves them based on their time
     */
    function EventQueue() {
      this.time = 0;
      this.events = new MinHeap();
    }
    /**
     * @returns {number} Elapsed time
     */
    var _proto = EventQueue.prototype;
    _proto.getTime = function getTime() {
      return this.time;
    }
    /**
     * Clear all scheduled events
     */;
    _proto.clear = function clear() {
      this.events = new MinHeap();
      return this;
    }
    /**
     * @param {?} event
     * @param {number} time
     */;
    _proto.add = function add(event, time) {
      this.events.push(event, time);
    }
    /**
     * Locates the nearest event, advances time if necessary. Returns that event and removes it from the queue.
     * @returns {? || null} The event previously added by addEvent, null if no event available
     */;
    _proto.get = function get() {
      if (!this.events.len()) {
        return null;
      }
      var _this$events$pop = this.events.pop(),
        time = _this$events$pop.key,
        event = _this$events$pop.value;
      if (time > 0) {
        /* advance */
        this.time += time;
        this.events.shift(-time);
      }
      return event;
    }
    /**
     * Get the time associated with the given event
     * @param {?} event
     * @returns {number} time
     */;
    _proto.getEventTime = function getEventTime(event) {
      var r = this.events.find(event);
      if (r) {
        var key = r.key;
        return key;
      }
      return undefined;
    }
    /**
     * Remove an event from the queue
     * @param {?} event
     * @returns {bool} success?
     */;
    _proto.remove = function remove(event) {
      return this.events.remove(event);
    };
    return EventQueue;
  }();

  var Scheduler$1 = /*#__PURE__*/function () {
    /**
     * @class Abstract scheduler
     */
    function Scheduler() {
      this.queue = new EventQueue();
      this.repeat = [];
      this.current = null;
    }
    /**
     * @see ROT.EventQueue#getTime
     */
    var _proto = Scheduler.prototype;
    _proto.getTime = function getTime() {
      return this.queue.getTime();
    }
    /**
     * @param {?} item
     * @param {bool} repeat
     */;
    _proto.add = function add(item, repeat) {
      if (repeat) {
        this.repeat.push(item);
      }
      return this;
    }
    /**
     * Get the time the given item is scheduled for
     * @param {?} item
     * @returns {number} time
     */;
    _proto.getTimeOf = function getTimeOf(item) {
      return this.queue.getEventTime(item);
    }
    /**
     * Clear all items
     */;
    _proto.clear = function clear() {
      this.queue.clear();
      this.repeat = [];
      this.current = null;
      return this;
    }
    /**
     * Remove a previously added item
     * @param {?} item
     * @returns {bool} successful?
     */;
    _proto.remove = function remove(item) {
      var result = this.queue.remove(item);
      var index = this.repeat.indexOf(item);
      if (index !== -1) {
        this.repeat.splice(index, 1);
      }
      if (this.current === item) {
        this.current = null;
      }
      return result;
    }
    /**
     * Schedule next item
     * @returns {?}
     */;
    _proto.next = function next() {
      this.current = this.queue.get();
      return this.current;
    };
    return Scheduler;
  }();

  /**
   * @class Simple fair scheduler (round-robin style)
   */
  var Simple = /*#__PURE__*/function (_Scheduler) {
    function Simple() {
      return _Scheduler.apply(this, arguments) || this;
    }
    _inheritsLoose(Simple, _Scheduler);
    var _proto = Simple.prototype;
    _proto.add = function add(item, repeat) {
      this.queue.add(item, 0);
      return _Scheduler.prototype.add.call(this, item, repeat);
    };
    _proto.next = function next() {
      if (this.current !== null && this.repeat.indexOf(this.current) !== -1) {
        this.queue.add(this.current, 0);
      }
      return _Scheduler.prototype.next.call(this);
    };
    return Simple;
  }(Scheduler$1);

  /**
   * @class Speed-based scheduler
   */
  var Speed = /*#__PURE__*/function (_Scheduler) {
    function Speed() {
      return _Scheduler.apply(this, arguments) || this;
    }
    _inheritsLoose(Speed, _Scheduler);
    var _proto = Speed.prototype;
    /**
     * @param {object} item anything with "getSpeed" method
     * @param {bool} repeat
     * @param {number} [time=1/item.getSpeed()]
     * @see ROT.Scheduler#add
     */
    _proto.add = function add(item, repeat, time) {
      this.queue.add(item, time !== undefined ? time : this.getActorTime(item));
      return _Scheduler.prototype.add.call(this, item, repeat);
    }
    /**
     * @see ROT.Scheduler#next
     */;
    _proto.next = function next() {
      if (this.current && this.repeat.indexOf(this.current) !== -1) {
        this.queue.add(this.current, this.getActorTime(this.current));
      }
      return _Scheduler.prototype.next.call(this);
    };
    _proto.getActorTime = function getActorTime(item) {
      var speed = item.getSpeed();
      if (speed === 0) {
        throw new RangeError("Actor speed must be greater than zero");
      }
      return 1 / speed;
    };
    return Speed;
  }(Scheduler$1);

  /** Action-based scheduler. */
  var Action = /*#__PURE__*/function (_Scheduler) {
    function Action() {
      var _this;
      _this = _Scheduler.apply(this, arguments) || this;
      _this.defaultDuration = 1;
      _this.duration = _this.defaultDuration;
      return _this;
    }
    /**
     * @param item Item to schedule.
     * @param repeat Whether to schedule the item repeatedly.
     * @param time Delay before the item is scheduled.
     * @see ROT.Scheduler#add
     */
    _inheritsLoose(Action, _Scheduler);
    var _proto = Action.prototype;
    _proto.add = function add(item, repeat, time) {
      this.queue.add(item, time !== undefined ? time : this.defaultDuration);
      return _Scheduler.prototype.add.call(this, item, repeat);
    };
    _proto.clear = function clear() {
      this.duration = this.defaultDuration;
      return _Scheduler.prototype.clear.call(this);
    };
    _proto.remove = function remove(item) {
      if (item === this.current) {
        this.duration = this.defaultDuration;
      }
      return _Scheduler.prototype.remove.call(this, item);
    }
    /**
     * @see ROT.Scheduler#next
     */;
    _proto.next = function next() {
      if (this.current !== null && this.repeat.indexOf(this.current) !== -1) {
        this.queue.add(this.current, this.duration);
        this.duration = this.defaultDuration;
      }
      return _Scheduler.prototype.next.call(this);
    }
    /**
     * Set duration for the active item
     */;
    _proto.setDuration = function setDuration(time) {
      if (this.current !== null) {
        this.duration = time;
      }
      return this;
    };
    return Action;
  }(Scheduler$1);

  var scheduler = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Action: Action,
    Simple: Simple,
    Speed: Speed
  });

  var FOV$1 = /*#__PURE__*/function () {
    /**
     * @class Abstract FOV algorithm
     * @param {function} lightPassesCallback Does the light pass through x,y?
     * @param {object} [options]
     * @param {int} [options.topology=8] 4/6/8
     */
    function FOV(lightPassesCallback, options) {
      if (options === void 0) {
        options = {};
      }
      this.lightPasses = lightPassesCallback;
      this.options = Object.assign({
        topology: 8
      }, options);
    }
    /**
     * Return all neighbors in a concentric ring
     * @param {int} cx center-x
     * @param {int} cy center-y
     * @param {int} r range
     */
    var _proto = FOV.prototype;
    _proto.getCircle = function getCircle(cx, cy, r) {
      var result = [];
      var dirs, countFactor, startOffset;
      switch (this.options.topology) {
        case 4:
          countFactor = 1;
          startOffset = [0, 1];
          dirs = [DIRS[8][7], DIRS[8][1], DIRS[8][3], DIRS[8][5]];
          break;
        case 6:
          dirs = DIRS[6];
          countFactor = 1;
          startOffset = [-1, 1];
          break;
        case 8:
          dirs = DIRS[4];
          countFactor = 2;
          startOffset = [-1, 1];
          break;
        default:
          throw new Error("Incorrect topology for FOV computation");
      }
      /* starting neighbor */
      var x = cx + startOffset[0] * r;
      var y = cy + startOffset[1] * r;
      /* circle */
      for (var i = 0; i < dirs.length; i++) {
        for (var j = 0; j < r * countFactor; j++) {
          result.push([x, y]);
          x += dirs[i][0];
          y += dirs[i][1];
        }
      }
      return result;
    };
    return FOV;
  }();

  /**
   * @class Discrete shadowcasting algorithm. Obsoleted by Precise shadowcasting.
   * @augments ROT.FOV
   */
  var DiscreteShadowcasting = /*#__PURE__*/function (_FOV) {
    function DiscreteShadowcasting() {
      return _FOV.apply(this, arguments) || this;
    }
    _inheritsLoose(DiscreteShadowcasting, _FOV);
    var _proto = DiscreteShadowcasting.prototype;
    _proto.compute = function compute(x, y, R, callback) {
      /* this place is always visible */
      callback(x, y, 0, 1);
      /* standing in a dark place. FIXME is this a good idea?  */
      if (!this.lightPasses(x, y)) {
        return;
      }
      /* start and end angles */
      var DATA = [];
      var A, B, cx, cy, blocks;
      /* analyze surrounding cells in concentric rings, starting from the center */
      for (var r = 1; r <= R; r++) {
        var neighbors = this.getCircle(x, y, r);
        var angle = 360 / neighbors.length;
        for (var i = 0; i < neighbors.length; i++) {
          cx = neighbors[i][0];
          cy = neighbors[i][1];
          A = angle * (i - 0.5);
          B = A + angle;
          blocks = !this.lightPasses(cx, cy);
          if (this.visibleCoords(Math.floor(A), Math.ceil(B), blocks, DATA)) {
            callback(cx, cy, r, 1);
          }
          if (DATA.length === 2 && DATA[0] === 0 && DATA[1] === 360) {
            return;
          } /* cutoff? */
        } /* for all cells in this ring */
      } /* for all rings */
    }
    /**
     * @param {int} A start angle
     * @param {int} B end angle
     * @param {bool} blocks Does current cell block visibility?
     * @param {int[][]} DATA shadowed angle pairs
     */;
    _proto.visibleCoords = function visibleCoords(A, B, blocks, DATA) {
      if (A < 0) {
        var v1 = this.visibleCoords(0, B, blocks, DATA);
        var v2 = this.visibleCoords(360 + A, 360, blocks, DATA);
        return v1 || v2;
      }
      var index = 0;
      while (index < DATA.length && DATA[index] < A) {
        index++;
      }
      if (index === DATA.length) {
        /* completely new shadow */
        if (blocks) {
          DATA.push(A, B);
        }
        return true;
      }
      var count = 0;
      if (index % 2) {
        /* this shadow starts in an existing shadow, or within its ending boundary */
        while (index < DATA.length && DATA[index] < B) {
          index++;
          count++;
        }
        if (count === 0) {
          return false;
        }
        if (blocks) {
          if (count % 2) {
            DATA.splice(index - count, count, B);
          } else {
            DATA.splice(index - count, count);
          }
        }
        return true;
      } else {
        /* this shadow starts outside an existing shadow, or within a starting boundary */
        while (index < DATA.length && DATA[index] < B) {
          index++;
          count++;
        }
        /* visible when outside an existing shadow, or when overlapping */
        if (A === DATA[index - count] && count === 1) {
          return false;
        }
        if (blocks) {
          if (count % 2) {
            DATA.splice(index - count, count, A);
          } else {
            DATA.splice(index - count, count, A, B);
          }
        }
        return true;
      }
    };
    return DiscreteShadowcasting;
  }(FOV$1);

  /**
   * @class Precise shadowcasting algorithm
   * @augments ROT.FOV
   */
  var PreciseShadowcasting = /*#__PURE__*/function (_FOV) {
    function PreciseShadowcasting() {
      return _FOV.apply(this, arguments) || this;
    }
    _inheritsLoose(PreciseShadowcasting, _FOV);
    var _proto = PreciseShadowcasting.prototype;
    _proto.compute = function compute(x, y, R, callback) {
      /* this place is always visible */
      callback(x, y, 0, 1);
      /* standing in a dark place. FIXME is this a good idea?  */
      if (!this.lightPasses(x, y)) {
        return;
      }
      /* list of all shadows */
      var SHADOWS = [];
      var cx, cy, blocks, visibility;
      var A1;
      var A2;
      /* analyze surrounding cells in concentric rings, starting from the center */
      for (var r = 1; r <= R; r++) {
        var neighbors = this.getCircle(x, y, r);
        var neighborCount = neighbors.length;
        for (var i = 0; i < neighborCount; i++) {
          cx = neighbors[i][0];
          cy = neighbors[i][1];
          /* shift half-an-angle backwards to maintain consistency of 0-th cells */
          A1 = [i ? 2 * i - 1 : 2 * neighborCount - 1, 2 * neighborCount];
          A2 = [2 * i + 1, 2 * neighborCount];
          blocks = !this.lightPasses(cx, cy);
          visibility = this.checkVisibility(A1, A2, blocks, SHADOWS);
          if (visibility) {
            callback(cx, cy, r, visibility);
          }
          if (SHADOWS.length === 2 && SHADOWS[0][0] === 0 && SHADOWS[1][0] === SHADOWS[1][1]) {
            return;
          } /* cutoff? */
        } /* for all cells in this ring */
      } /* for all rings */
    }
    /**
     * @param {int[2]} A1 arc start
     * @param {int[2]} A2 arc end
     * @param {bool} blocks Does current arc block visibility?
     * @param {int[][]} SHADOWS list of active shadows
     */;
    _proto.checkVisibility = function checkVisibility(A1, A2, blocks, SHADOWS) {
      if (A1[0] > A2[0]) {
        /* split into two sub-arcs */
        var v1 = this.checkVisibility(A1, [A1[1], A1[1]], blocks, SHADOWS);
        var v2 = this.checkVisibility([0, 1], A2, blocks, SHADOWS);
        return (v1 + v2) / 2;
      }
      /* index1: first shadow >= A1 */
      var index1 = 0,
        edge1 = false;
      while (index1 < SHADOWS.length) {
        var old = SHADOWS[index1];
        var diff = old[0] * A1[1] - A1[0] * old[1];
        if (diff >= 0) {
          /* old >= A1 */
          if (diff === 0 && !(index1 % 2)) {
            edge1 = true;
          }
          break;
        }
        index1++;
      }
      /* index2: last shadow <= A2 */
      var index2 = SHADOWS.length,
        edge2 = false;
      while (index2--) {
        var _old = SHADOWS[index2];
        var _diff = A2[0] * _old[1] - _old[0] * A2[1];
        if (_diff >= 0) {
          /* old <= A2 */
          if (_diff === 0 && index2 % 2) {
            edge2 = true;
          }
          break;
        }
      }
      var visible = true;
      if (index1 === index2 && (edge1 || edge2)) {
        /* subset of existing shadow, one of the edges match */
        visible = false;
      } else if (edge1 && edge2 && index1 + 1 === index2 && index2 % 2) {
        /* completely equivalent with existing shadow */
        visible = false;
      } else if (index1 > index2 && index1 % 2) {
        /* subset of existing shadow, not touching */
        visible = false;
      }
      if (!visible) {
        return 0;
      } /* fast case: not visible */
      var visibleLength;
      /* compute the length of visible arc, adjust list of shadows (if blocking) */
      var remove = index2 - index1 + 1;
      if (remove % 2) {
        if (index1 % 2) {
          /* first edge within existing shadow, second outside */
          var P = SHADOWS[index1];
          visibleLength = (A2[0] * P[1] - P[0] * A2[1]) / (P[1] * A2[1]);
          if (blocks) {
            SHADOWS.splice(index1, remove, A2);
          }
        } else {
          /* second edge within existing shadow, first outside */
          var _P = SHADOWS[index2];
          visibleLength = (_P[0] * A1[1] - A1[0] * _P[1]) / (A1[1] * _P[1]);
          if (blocks) {
            SHADOWS.splice(index1, remove, A1);
          }
        }
      } else {
        if (index1 % 2) {
          /* both edges within existing shadows */
          var P1 = SHADOWS[index1];
          var P2 = SHADOWS[index2];
          visibleLength = (P2[0] * P1[1] - P1[0] * P2[1]) / (P1[1] * P2[1]);
          if (blocks) {
            SHADOWS.splice(index1, remove);
          }
        } else {
          /* both edges outside existing shadows */
          if (blocks) {
            SHADOWS.splice(index1, remove, A1, A2);
          }
          return 1; /* whole arc visible! */
        }
      }
      var arcLength = (A2[0] * A1[1] - A1[0] * A2[1]) / (A1[1] * A2[1]);
      return visibleLength / arcLength;
    };
    return PreciseShadowcasting;
  }(FOV$1);

  /** Octants used for translating recursive shadowcasting offsets */
  var OCTANTS = [[-1, 0, 0, 1], [0, -1, 1, 0], [0, -1, -1, 0], [-1, 0, 0, -1], [1, 0, 0, -1], [0, 1, -1, 0], [0, 1, 1, 0], [1, 0, 0, 1]];
  /**
   * @class Recursive shadowcasting algorithm
   * Currently only supports 4/8 topologies, not hexagonal.
   * Based on Peter Harkins' implementation of Björn Bergström's algorithm described here: http://www.roguebasin.com/index.php?title=FOV_using_recursive_shadowcasting
   * @augments ROT.FOV
   */
  var RecursiveShadowcasting = /*#__PURE__*/function (_FOV) {
    function RecursiveShadowcasting() {
      return _FOV.apply(this, arguments) || this;
    }
    _inheritsLoose(RecursiveShadowcasting, _FOV);
    var _proto = RecursiveShadowcasting.prototype;
    /**
     * Compute visibility for a 360-degree circle
     * @param {int} x
     * @param {int} y
     * @param {int} R Maximum visibility radius
     * @param {function} callback
     */
    _proto.compute = function compute(x, y, R, callback) {
      var report = this.getCallback(x, y, R, callback);
      //You can always see your own tile
      report(x, y, 0, 1);
      for (var i = 0; i < OCTANTS.length; i++) {
        this.renderOctant(x, y, OCTANTS[i], R, report);
      }
    }
    /**
     * Compute visibility for a 180-degree arc
     * @param {int} x
     * @param {int} y
     * @param {int} R Maximum visibility radius
     * @param {int} dir Direction to look in (expressed in a ROT.DIRS value);
     * @param {function} callback
     */;
    _proto.compute180 = function compute180(x, y, R, dir, callback) {
      this.validateDirection(dir);
      var report = this.getCallback(x, y, R, callback);
      //You can always see your own tile
      report(x, y, 0, 1);
      var previousOctant = (dir - 1 + 8) % 8; //Need to retrieve the previous octant to render a full 180 degrees
      var nextPreviousOctant = (dir - 2 + 8) % 8; //Need to retrieve the previous two octants to render a full 180 degrees
      var nextOctant = (dir + 1 + 8) % 8; //Need to grab to next octant to render a full 180 degrees
      this.renderOctant(x, y, OCTANTS[nextPreviousOctant], R, report);
      this.renderOctant(x, y, OCTANTS[previousOctant], R, report);
      this.renderOctant(x, y, OCTANTS[dir], R, report);
      this.renderOctant(x, y, OCTANTS[nextOctant], R, report);
    };
    /**
     * Compute visibility for a 90-degree arc
     * @param {int} x
     * @param {int} y
     * @param {int} R Maximum visibility radius
     * @param {int} dir Direction to look in (expressed in a ROT.DIRS value);
     * @param {function} callback
     */
    _proto.compute90 = function compute90(x, y, R, dir, callback) {
      this.validateDirection(dir);
      var report = this.getCallback(x, y, R, callback);
      //You can always see your own tile
      report(x, y, 0, 1);
      var previousOctant = (dir - 1 + 8) % 8; //Need to retrieve the previous octant to render a full 90 degrees
      this.renderOctant(x, y, OCTANTS[dir], R, report);
      this.renderOctant(x, y, OCTANTS[previousOctant], R, report);
    };
    _proto.getCallback = function getCallback(x, y, R, callback) {
      var _this = this;
      var seen = new Set();
      return function (visibleX, visibleY, distance, visibility) {
        var key = visibleX + "," + visibleY;
        if (seen.has(key)) {
          return;
        }
        if (_this.options.topology === 4 && Math.abs(visibleX - x) + Math.abs(visibleY - y) > R) {
          return;
        }
        seen.add(key);
        callback(visibleX, visibleY, distance, visibility);
      };
    };
    _proto.validateDirection = function validateDirection(dir) {
      if (!Number.isInteger(dir) || dir < 0 || dir >= OCTANTS.length) {
        throw new RangeError("Direction must be an integer between 0 and 7");
      }
    }
    /**
     * Render one octant (45-degree arc) of the viewshed
     * @param {int} x
     * @param {int} y
     * @param {int} octant Octant to be rendered
     * @param {int} R Maximum visibility radius
     * @param {function} callback
     */;
    _proto.renderOctant = function renderOctant(x, y, octant, R, callback) {
      //Radius incremented by 1 to provide same coverage area as other shadowcasting radiuses
      this.castVisibility(x, y, 1, 1.0, 0.0, R + 1, octant[0], octant[1], octant[2], octant[3], callback);
    }
    /**
     * Actually calculates the visibility
     * @param {int} startX The starting X coordinate
     * @param {int} startY The starting Y coordinate
     * @param {int} row The row to render
     * @param {float} visSlopeStart The slope to start at
     * @param {float} visSlopeEnd The slope to end at
     * @param {int} radius The radius to reach out to
     * @param {int} xx
     * @param {int} xy
     * @param {int} yx
     * @param {int} yy
     * @param {function} callback The callback to use when we hit a block that is visible
     */;
    _proto.castVisibility = function castVisibility(startX, startY, row, visSlopeStart, visSlopeEnd, radius, xx, xy, yx, yy, callback) {
      if (visSlopeStart < visSlopeEnd) {
        return;
      }
      for (var i = row; i <= radius; i++) {
        var dx = -i - 1;
        var dy = -i;
        var blocked = false;
        var newStart = 0;
        //'Row' could be column, names here assume octant 0 and would be flipped for half the octants
        while (dx <= 0) {
          dx += 1;
          //Translate from relative coordinates to map coordinates
          var mapX = startX + dx * xx + dy * xy;
          var mapY = startY + dx * yx + dy * yy;
          //Range of the row
          var slopeStart = (dx - 0.5) / (dy + 0.5);
          var slopeEnd = (dx + 0.5) / (dy - 0.5);
          //Ignore if not yet at left edge of Octant
          if (slopeEnd > visSlopeStart) {
            continue;
          }
          //Done if past right edge
          if (slopeStart < visSlopeEnd) {
            break;
          }
          //If it's in range, it's visible
          if (dx * dx + dy * dy < radius * radius) {
            callback(mapX, mapY, i, 1);
          }
          if (!blocked) {
            //If tile is a blocking tile, cast around it
            if (!this.lightPasses(mapX, mapY) && i < radius) {
              blocked = true;
              this.castVisibility(startX, startY, i + 1, visSlopeStart, slopeStart, radius, xx, xy, yx, yy, callback);
              newStart = slopeEnd;
            }
          } else {
            //Keep narrowing if scanning across a block
            if (!this.lightPasses(mapX, mapY)) {
              newStart = slopeEnd;
              continue;
            }
            //Block has ended
            blocked = false;
            visSlopeStart = newStart;
          }
        }
        if (blocked) {
          break;
        }
      }
    };
    return RecursiveShadowcasting;
  }(FOV$1);

  var fov = /*#__PURE__*/Object.freeze({
    __proto__: null,
    DiscreteShadowcasting: DiscreteShadowcasting,
    PreciseShadowcasting: PreciseShadowcasting,
    RecursiveShadowcasting: RecursiveShadowcasting
  });

  var Map$1 = /*#__PURE__*/function () {
    /**
     * @class Base map generator
     * @param {int} [width=ROT.DEFAULT_WIDTH]
     * @param {int} [height=ROT.DEFAULT_HEIGHT]
     */
    function Map(width, height) {
      if (width === void 0) {
        width = DEFAULT_WIDTH;
      }
      if (height === void 0) {
        height = DEFAULT_HEIGHT;
      }
      this.width = width;
      this.height = height;
    }
    var _proto = Map.prototype;
    _proto.fillMap = function fillMap(value) {
      var map = [];
      for (var i = 0; i < this.width; i++) {
        map.push([]);
        for (var j = 0; j < this.height; j++) {
          map[i].push(value);
        }
      }
      return map;
    };
    return Map;
  }();

  /**
   * @class Simple empty rectangular room
   * @augments ROT.Map
   */
  var Arena = /*#__PURE__*/function (_Map) {
    function Arena() {
      return _Map.apply(this, arguments) || this;
    }
    _inheritsLoose(Arena, _Map);
    var _proto = Arena.prototype;
    _proto.create = function create(callback) {
      var w = this.width - 1;
      var h = this.height - 1;
      for (var i = 0; i <= w; i++) {
        for (var j = 0; j <= h; j++) {
          var empty = i && j && i < w && j < h;
          if (callback) {
            callback(i, j, empty ? 0 : 1);
          }
        }
      }
      return this;
    };
    return Arena;
  }(Map$1);

  /**
   * @class Dungeon map: has rooms and corridors
   * @augments ROT.Map
   */
  var Dungeon = /*#__PURE__*/function (_Map) {
    function Dungeon(width, height) {
      var _this;
      _this = _Map.call(this, width, height) || this;
      _this.rooms = [];
      _this.corridors = [];
      return _this;
    }
    /**
     * Get all generated rooms
     * @returns {ROT.Map.Feature.Room[]}
     */
    _inheritsLoose(Dungeon, _Map);
    var _proto = Dungeon.prototype;
    _proto.getRooms = function getRooms() {
      return this.rooms;
    }
    /**
     * Get all generated corridors
     * @returns {ROT.Map.Feature.Corridor[]}
     */;
    _proto.getCorridors = function getCorridors() {
      return this.corridors;
    };
    return Dungeon;
  }(Map$1);

  /**
   * @class Dungeon feature; has own .create() method
   */
  var Feature = function Feature() {};
  /**
   * @class Room
   * @augments ROT.Map.Feature
   * @param {int} x1
   * @param {int} y1
   * @param {int} x2
   * @param {int} y2
   * @param {int} [doorX]
   * @param {int} [doorY]
   */
  var Room = /*#__PURE__*/function (_Feature) {
    function Room(x1, y1, x2, y2, doorX, doorY) {
      var _this;
      _this = _Feature.call(this) || this;
      _this.x1 = x1;
      _this.y1 = y1;
      _this.x2 = x2;
      _this.y2 = y2;
      _this.doors = {};
      if (doorX !== undefined && doorY !== undefined) {
        _this.addDoor(doorX, doorY);
      }
      return _this;
    }
    _inheritsLoose(Room, _Feature);
    /**
     * Room of random size, with a given doors and direction
     */
    Room.createRandomAt = function createRandomAt(x, y, dx, dy, options) {
      var min = options.roomWidth[0];
      var max = options.roomWidth[1];
      var width = RNG.getUniformInt(min, max);
      min = options.roomHeight[0];
      max = options.roomHeight[1];
      var height = RNG.getUniformInt(min, max);
      if (dx === 1) {
        /* to the right */
        var y2 = y - Math.floor(RNG.getUniform() * height);
        return new this(x + 1, y2, x + width, y2 + height - 1, x, y);
      }
      if (dx === -1) {
        /* to the left */
        var _y = y - Math.floor(RNG.getUniform() * height);
        return new this(x - width, _y, x - 1, _y + height - 1, x, y);
      }
      if (dy === 1) {
        /* to the bottom */
        var x2 = x - Math.floor(RNG.getUniform() * width);
        return new this(x2, y + 1, x2 + width - 1, y + height, x, y);
      }
      if (dy === -1) {
        /* to the top */
        var _x = x - Math.floor(RNG.getUniform() * width);
        return new this(_x, y - height, _x + width - 1, y - 1, x, y);
      }
      throw new Error("dx or dy must be 1 or -1");
    }
    /**
     * Room of random size, positioned around center coords
     */;
    Room.createRandomCenter = function createRandomCenter(cx, cy, options) {
      var min = options.roomWidth[0];
      var max = options.roomWidth[1];
      var width = RNG.getUniformInt(min, max);
      min = options.roomHeight[0];
      max = options.roomHeight[1];
      var height = RNG.getUniformInt(min, max);
      var x1 = cx - Math.floor(RNG.getUniform() * width);
      var y1 = cy - Math.floor(RNG.getUniform() * height);
      var x2 = x1 + width - 1;
      var y2 = y1 + height - 1;
      return new this(x1, y1, x2, y2);
    }
    /**
     * Room of random size within a given dimensions
     */;
    Room.createRandom = function createRandom(availWidth, availHeight, options) {
      var min = options.roomWidth[0];
      var max = options.roomWidth[1];
      var width = RNG.getUniformInt(min, max);
      min = options.roomHeight[0];
      max = options.roomHeight[1];
      var height = RNG.getUniformInt(min, max);
      var left = availWidth - width - 1;
      var top = availHeight - height - 1;
      var x1 = 1 + Math.floor(RNG.getUniform() * left);
      var y1 = 1 + Math.floor(RNG.getUniform() * top);
      var x2 = x1 + width - 1;
      var y2 = y1 + height - 1;
      return new this(x1, y1, x2, y2);
    };
    var _proto = Room.prototype;
    _proto.addDoor = function addDoor(x, y) {
      this.doors[x + "," + y] = 1;
      return this;
    }
    /**
     * @param {function}
     */;
    _proto.getDoors = function getDoors(cb) {
      for (var key in this.doors) {
        var parts = key.split(",");
        cb(parseInt(parts[0]), parseInt(parts[1]));
      }
      return this;
    };
    _proto.clearDoors = function clearDoors() {
      this.doors = {};
      return this;
    };
    _proto.addDoors = function addDoors(isWallCallback) {
      var left = this.x1 - 1;
      var right = this.x2 + 1;
      var top = this.y1 - 1;
      var bottom = this.y2 + 1;
      for (var x = left; x <= right; x++) {
        for (var y = top; y <= bottom; y++) {
          if (x !== left && x !== right && y !== top && y !== bottom) {
            continue;
          }
          if (isWallCallback(x, y)) {
            continue;
          }
          this.addDoor(x, y);
        }
      }
      return this;
    };
    _proto.debug = function debug() {
      console.log("room", this.x1, this.y1, this.x2, this.y2);
    };
    _proto.isValid = function isValid(isWallCallback, canBeDugCallback) {
      var left = this.x1 - 1;
      var right = this.x2 + 1;
      var top = this.y1 - 1;
      var bottom = this.y2 + 1;
      for (var x = left; x <= right; x++) {
        for (var y = top; y <= bottom; y++) {
          if (x === left || x === right || y === top || y === bottom) {
            if (!isWallCallback(x, y)) {
              return false;
            }
          } else {
            if (!canBeDugCallback(x, y)) {
              return false;
            }
          }
        }
      }
      return true;
    }
    /**
     * @param {function} digCallback Dig callback with a signature (x, y, value). Values: 0 = empty, 1 = wall, 2 = door. Multiple doors are allowed.
     */;
    _proto.create = function create(digCallback) {
      var left = this.x1 - 1;
      var right = this.x2 + 1;
      var top = this.y1 - 1;
      var bottom = this.y2 + 1;
      var value = 0;
      for (var x = left; x <= right; x++) {
        for (var y = top; y <= bottom; y++) {
          if (x + "," + y in this.doors) {
            value = 2;
          } else if (x === left || x === right || y === top || y === bottom) {
            value = 1;
          } else {
            value = 0;
          }
          digCallback(x, y, value);
        }
      }
    };
    _proto.getCenter = function getCenter() {
      return [Math.round((this.x1 + this.x2) / 2), Math.round((this.y1 + this.y2) / 2)];
    };
    _proto.getLeft = function getLeft() {
      return this.x1;
    };
    _proto.getRight = function getRight() {
      return this.x2;
    };
    _proto.getTop = function getTop() {
      return this.y1;
    };
    _proto.getBottom = function getBottom() {
      return this.y2;
    };
    return Room;
  }(Feature);
  /**
   * @class Corridor
   * @augments ROT.Map.Feature
   * @param {int} startX
   * @param {int} startY
   * @param {int} endX
   * @param {int} endY
   */
  var Corridor = /*#__PURE__*/function (_Feature2) {
    function Corridor(startX, startY, endX, endY) {
      var _this2;
      _this2 = _Feature2.call(this) || this;
      _this2.startX = startX;
      _this2.startY = startY;
      _this2.endX = endX;
      _this2.endY = endY;
      _this2.endsWithAWall = true;
      return _this2;
    }
    _inheritsLoose(Corridor, _Feature2);
    Corridor.createRandomAt = function createRandomAt(x, y, dx, dy, options) {
      var min = options.corridorLength[0];
      var max = options.corridorLength[1];
      var length = RNG.getUniformInt(min, max);
      return new this(x, y, x + dx * length, y + dy * length);
    };
    var _proto2 = Corridor.prototype;
    _proto2.debug = function debug() {
      console.log("corridor", this.startX, this.startY, this.endX, this.endY);
    };
    _proto2.isValid = function isValid(isWallCallback, canBeDugCallback) {
      var sx = this.startX;
      var sy = this.startY;
      var dx = this.endX - sx;
      var dy = this.endY - sy;
      var length = 1 + Math.max(Math.abs(dx), Math.abs(dy));
      if (dx) {
        dx = dx / Math.abs(dx);
      }
      if (dy) {
        dy = dy / Math.abs(dy);
      }
      var nx = dy;
      var ny = -dx;
      var ok = true;
      for (var i = 0; i < length; i++) {
        var x = sx + i * dx;
        var y = sy + i * dy;
        if (!canBeDugCallback(x, y)) {
          ok = false;
        }
        if (!isWallCallback(x + nx, y + ny)) {
          ok = false;
        }
        if (!isWallCallback(x - nx, y - ny)) {
          ok = false;
        }
        if (!ok) {
          length = i;
          this.endX = x - dx;
          this.endY = y - dy;
          break;
        }
      }
      /**
       * If the length degenerated, this corridor might be invalid
       */
      /* not supported */
      if (length === 0) {
        return false;
      }
      /* length 1 allowed only if the next space is empty */
      if (length === 1 && isWallCallback(this.endX + dx, this.endY + dy)) {
        return false;
      }
      /**
       * We do not want the corridor to crash into a corner of a room;
       * if any of the ending corners is empty, the N+1th cell of this corridor must be empty too.
       *
       * Situation:
       * #######1
       * .......?
       * #######2
       *
       * The corridor was dug from left to right.
       * 1, 2 - problematic corners, ? = N+1th cell (not dug)
       */
      var firstCornerBad = !isWallCallback(this.endX + dx + nx, this.endY + dy + ny);
      var secondCornerBad = !isWallCallback(this.endX + dx - nx, this.endY + dy - ny);
      this.endsWithAWall = isWallCallback(this.endX + dx, this.endY + dy);
      if ((firstCornerBad || secondCornerBad) && this.endsWithAWall) {
        return false;
      }
      return true;
    }
    /**
     * @param {function} digCallback Dig callback with a signature (x, y, value). Values: 0 = empty.
     */;
    _proto2.create = function create(digCallback) {
      var sx = this.startX;
      var sy = this.startY;
      var dx = this.endX - sx;
      var dy = this.endY - sy;
      var length = 1 + Math.max(Math.abs(dx), Math.abs(dy));
      if (dx) {
        dx = dx / Math.abs(dx);
      }
      if (dy) {
        dy = dy / Math.abs(dy);
      }
      for (var i = 0; i < length; i++) {
        var x = sx + i * dx;
        var y = sy + i * dy;
        digCallback(x, y, 0);
      }
      return true;
    };
    _proto2.createPriorityWalls = function createPriorityWalls(priorityWallCallback) {
      if (!this.endsWithAWall) {
        return;
      }
      var sx = this.startX;
      var sy = this.startY;
      var dx = this.endX - sx;
      var dy = this.endY - sy;
      if (dx) {
        dx = dx / Math.abs(dx);
      }
      if (dy) {
        dy = dy / Math.abs(dy);
      }
      var nx = dy;
      var ny = -dx;
      priorityWallCallback(this.endX + dx, this.endY + dy);
      priorityWallCallback(this.endX + nx, this.endY + ny);
      priorityWallCallback(this.endX - nx, this.endY - ny);
    };
    return Corridor;
  }(Feature);

  /**
   * @class Dungeon generator which tries to fill the space evenly. Generates independent rooms and tries to connect them.
   * @augments ROT.Map.Dungeon
   */
  var Uniform = /*#__PURE__*/function (_Dungeon) {
    function Uniform(width, height, options) {
      var _this;
      if (options === void 0) {
        options = {};
      }
      _this = _Dungeon.call(this, width, height) || this;
      _this.options = {
        roomWidth: [3, 9],
        /* room minimum and maximum width */
        roomHeight: [3, 5],
        /* room minimum and maximum height */
        roomDugPercentage: 0.1,
        /* we stop after this percentage of level area has been dug out by rooms */
        timeLimit: 1000 /* we stop after this much time has passed (msec) */
      };
      Object.assign(_this.options, options);
      _this.map = [];
      _this.dug = 0;
      _this.roomAttempts = 20; /* new room is created N-times until is considered as impossible to generate */
      _this.corridorAttempts = 20; /* corridors are tried N-times until the level is considered as impossible to connect */
      _this.connected = []; /* list of already connected rooms */
      _this.unconnected = []; /* list of remaining unconnected rooms */
      _this.digCallback = _this.digCallback.bind(_this);
      _this.canBeDugCallback = _this.canBeDugCallback.bind(_this);
      _this.isWallCallback = _this.isWallCallback.bind(_this);
      return _this;
    }
    /**
     * Create a map.
     * @returns This generator after success, or null if the time limit is hit.
     * @see ROT.Map#create
     */
    _inheritsLoose(Uniform, _Dungeon);
    var _proto = Uniform.prototype;
    _proto.create = function create(callback) {
      var t1 = Date.now();
      while (1) {
        var t2 = Date.now();
        if (t2 - t1 > this.options.timeLimit) {
          this.resetGeneration();
          return null;
        } /* time limit! */
        this.map = this.fillMap(1);
        this.dug = 0;
        this.rooms = [];
        this.unconnected = [];
        this.generateRooms();
        if (this.rooms.length < 2) {
          continue;
        }
        if (this.generateCorridors()) {
          break;
        }
      }
      if (callback) {
        for (var i = 0; i < this.width; i++) {
          for (var j = 0; j < this.height; j++) {
            callback(i, j, this.map[i][j]);
          }
        }
      }
      return this;
    };
    _proto.resetGeneration = function resetGeneration() {
      this.map = this.fillMap(1);
      this.dug = 0;
      this.rooms = [];
      this.corridors = [];
      this.connected = [];
      this.unconnected = [];
    }
    /**
     * Generates a suitable amount of rooms
     */;
    _proto.generateRooms = function generateRooms() {
      var w = this.width - 2;
      var h = this.height - 2;
      var room;
      do {
        room = this.generateRoom();
        if (this.dug / (w * h) > this.options.roomDugPercentage) {
          break;
        } /* achieved requested amount of free space */
      } while (room);
      /* either enough rooms, or not able to generate more of them :) */
    }
    /**
     * Try to generate one room
     */;
    _proto.generateRoom = function generateRoom() {
      var count = 0;
      while (count < this.roomAttempts) {
        count++;
        var room = Room.createRandom(this.width, this.height, this.options);
        if (!room.isValid(this.isWallCallback, this.canBeDugCallback)) {
          continue;
        }
        room.create(this.digCallback);
        this.rooms.push(room);
        return room;
      }
      /* no room was generated in a given number of attempts */
      return null;
    }
    /**
     * Generates connectors between rooms
     * @returns {bool} success Was this attempt successful?
     */;
    _proto.generateCorridors = function generateCorridors() {
      var cnt = 0;
      while (cnt < this.corridorAttempts) {
        cnt++;
        this.corridors = [];
        /* dig rooms into a clear map */
        this.map = this.fillMap(1);
        for (var i = 0; i < this.rooms.length; i++) {
          var room = this.rooms[i];
          room.clearDoors();
          room.create(this.digCallback);
        }
        this.unconnected = RNG.shuffle(this.rooms.slice());
        this.connected = [];
        if (this.unconnected.length) {
          var firstRoom = this.unconnected.pop();
          if (firstRoom) {
            this.connected.push(firstRoom);
          }
        } /* first one is always connected */
        while (1) {
          /* 1. pick random connected room */
          var connected = RNG.getItem(this.connected);
          if (!connected) {
            break;
          }
          /* 2. find closest unconnected */
          var room1 = this.closestRoom(this.unconnected, connected);
          if (!room1) {
            break;
          }
          /* 3. connect it to closest connected */
          var room2 = this.closestRoom(this.connected, room1);
          if (!room2) {
            break;
          }
          var ok = this.connectRooms(room1, room2);
          if (!ok) {
            break;
          } /* stop connecting, re-shuffle */
          if (!this.unconnected.length) {
            return true;
          } /* done; no rooms remain */
        }
      }
      return false;
    };
    /**
     * For a given room, find the closest one from the list
     */
    _proto.closestRoom = function closestRoom(rooms, room) {
      var dist = Infinity;
      var center = room.getCenter();
      var result = null;
      for (var i = 0; i < rooms.length; i++) {
        var r = rooms[i];
        var c = r.getCenter();
        var dx = c[0] - center[0];
        var dy = c[1] - center[1];
        var d = dx * dx + dy * dy;
        if (d < dist) {
          dist = d;
          result = r;
        }
      }
      return result;
    };
    _proto.connectRooms = function connectRooms(room1, room2) {
      /*
          room1.debug();
          room2.debug();
      */
      var center1 = room1.getCenter();
      var center2 = room2.getCenter();
      var diffX = center2[0] - center1[0];
      var diffY = center2[1] - center1[1];
      var end;
      var dirIndex1, dirIndex2, min, max, index;
      if (Math.abs(diffX) < Math.abs(diffY)) {
        /* first try connecting north-south walls */
        dirIndex1 = diffY > 0 ? 2 : 0;
        dirIndex2 = (dirIndex1 + 2) % 4;
        min = room2.getLeft();
        max = room2.getRight();
        index = 0;
      } else {
        /* first try connecting east-west walls */
        dirIndex1 = diffX > 0 ? 1 : 3;
        dirIndex2 = (dirIndex1 + 2) % 4;
        min = room2.getTop();
        max = room2.getBottom();
        index = 1;
      }
      var start = this.placeInWall(room1, dirIndex1); /* corridor will start here */
      if (!start) {
        return false;
      }
      if (start[index] >= min && start[index] <= max) {
        /* possible to connect with straight line (I-like) */
        end = [start[0], start[1]];
        var value = 0;
        switch (dirIndex2) {
          case 0:
            value = room2.getTop() - 1;
            break;
          case 1:
            value = room2.getRight() + 1;
            break;
          case 2:
            value = room2.getBottom() + 1;
            break;
          case 3:
            value = room2.getLeft() - 1;
            break;
        }
        end[(index + 1) % 2] = value;
        this.digLine([start, end]);
      } else if (start[index] < min - 1 || start[index] > max + 1) {
        /* need to switch target wall (L-like) */
        var diff = start[index] - center2[index];
        var rotation = 0;
        switch (dirIndex2) {
          case 0:
          case 1:
            rotation = diff < 0 ? 3 : 1;
            break;
          case 2:
          case 3:
            rotation = diff < 0 ? 1 : 3;
            break;
        }
        dirIndex2 = (dirIndex2 + rotation) % 4;
        end = this.placeInWall(room2, dirIndex2);
        if (!end) {
          return false;
        }
        var mid = [0, 0];
        mid[index] = start[index];
        var index2 = (index + 1) % 2;
        mid[index2] = end[index2];
        this.digLine([start, mid, end]);
      } else {
        /* use current wall pair, but adjust the line in the middle (S-like) */
        var _index = (index + 1) % 2;
        end = this.placeInWall(room2, dirIndex2);
        if (!end) {
          return false;
        }
        var _mid = Math.round((end[_index] + start[_index]) / 2);
        var mid1 = [0, 0];
        var mid2 = [0, 0];
        mid1[index] = start[index];
        mid1[_index] = _mid;
        mid2[index] = end[index];
        mid2[_index] = _mid;
        this.digLine([start, mid1, mid2, end]);
      }
      room1.addDoor(start[0], start[1]);
      room2.addDoor(end[0], end[1]);
      index = this.unconnected.indexOf(room1);
      if (index !== -1) {
        this.unconnected.splice(index, 1);
        this.connected.push(room1);
      }
      index = this.unconnected.indexOf(room2);
      if (index !== -1) {
        this.unconnected.splice(index, 1);
        this.connected.push(room2);
      }
      return true;
    };
    _proto.placeInWall = function placeInWall(room, dirIndex) {
      var start = [0, 0];
      var dir = [0, 0];
      var length = 0;
      switch (dirIndex) {
        case 0:
          dir = [1, 0];
          start = [room.getLeft(), room.getTop() - 1];
          length = room.getRight() - room.getLeft() + 1;
          break;
        case 1:
          dir = [0, 1];
          start = [room.getRight() + 1, room.getTop()];
          length = room.getBottom() - room.getTop() + 1;
          break;
        case 2:
          dir = [1, 0];
          start = [room.getLeft(), room.getBottom() + 1];
          length = room.getRight() - room.getLeft() + 1;
          break;
        case 3:
          dir = [0, 1];
          start = [room.getLeft() - 1, room.getTop()];
          length = room.getBottom() - room.getTop() + 1;
          break;
      }
      var avail = [];
      var lastBadIndex = -2;
      for (var i = 0; i < length; i++) {
        var x = start[0] + i * dir[0];
        var y = start[1] + i * dir[1];
        avail.push(null);
        var isWall = this.map[x][y] === 1;
        if (isWall) {
          if (lastBadIndex !== i - 1) {
            avail[i] = [x, y];
          }
        } else {
          lastBadIndex = i;
          if (i) {
            avail[i - 1] = null;
          }
        }
      }
      for (var _i = avail.length - 1; _i >= 0; _i--) {
        if (!avail[_i]) {
          avail.splice(_i, 1);
        }
      }
      return avail.length ? RNG.getItem(avail) : null;
    }
    /**
     * Dig a polyline.
     */;
    _proto.digLine = function digLine(points) {
      for (var i = 1; i < points.length; i++) {
        var start = points[i - 1];
        var end = points[i];
        var corridor = new Corridor(start[0], start[1], end[0], end[1]);
        corridor.create(this.digCallback);
        this.corridors.push(corridor);
      }
    };
    _proto.digCallback = function digCallback(x, y, value) {
      this.map[x][y] = value;
      if (value === 0) {
        this.dug++;
      }
    };
    _proto.isWallCallback = function isWallCallback(x, y) {
      if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
        return false;
      }
      return this.map[x][y] === 1;
    };
    _proto.canBeDugCallback = function canBeDugCallback(x, y) {
      if (x < 1 || y < 1 || x + 1 >= this.width || y + 1 >= this.height) {
        return false;
      }
      return this.map[x][y] === 1;
    };
    return Uniform;
  }(Dungeon);

  /**
   * @class Cellular automaton map generator
   * @augments ROT.Map
   * @param {int} [width=ROT.DEFAULT_WIDTH]
   * @param {int} [height=ROT.DEFAULT_HEIGHT]
   * @param {object} [options] Options
   * @param {int[]} [options.born] List of neighbor counts for a new cell to be born in empty space
   * @param {int[]} [options.survive] List of neighbor counts for an existing  cell to survive
   * @param {int} [options.topology] Topology 4 or 6 or 8
   */
  var Cellular = /*#__PURE__*/function (_Map) {
    function Cellular(width, height, options) {
      var _this;
      if (options === void 0) {
        options = {};
      }
      _this = _Map.call(this, width, height) || this;
      _this.options = {
        born: [5, 6, 7, 8],
        survive: [4, 5, 6, 7, 8],
        topology: 8
      };
      _this.setOptions(options);
      _this.directions = DIRS[_this.options.topology];
      _this.cells = _this.fillMap(0);
      return _this;
    }
    /**
     * Fill the map with random values
     * @param {float} probability Probability for a cell to become alive; 0 = all empty, 1 = all full
     */
    _inheritsLoose(Cellular, _Map);
    var _proto = Cellular.prototype;
    _proto.randomize = function randomize(probability) {
      this.cells = this.cells.map(function (column) {
        return column.map(function () {
          return RNG.getUniform() < probability ? 1 : 0;
        });
      });
      return this;
    }
    /**
     * Change options.
     * @see ROT.Map.Cellular
     */;
    _proto.setOptions = function setOptions(options) {
      Object.assign(this.options, options);
      this.directions = DIRS[this.options.topology];
    };
    _proto.set = function set(x, y, value) {
      this.cells[x][y] = value;
    };
    _proto.create = function create(callback) {
      var _this2 = this;
      var born = this.options.born;
      var survive = this.options.survive;
      var isHex = this.options.topology === 6;
      var newMap = this.cells.map(function (column, x) {
        return column.map(function (cur, y) {
          if (isHex && x % 2 !== y % 2) {
            return 0;
          }
          var ncount = _this2.getNeighbors(x, y);
          if (cur && survive.includes(ncount)) {
            return 1;
          }
          if (!cur && born.includes(ncount)) {
            return 1;
          }
          return 0;
        });
      });
      this.cells = newMap;
      callback && this.serviceCallback(callback);
      return this;
    };
    _proto.serviceCallback = function serviceCallback(callback) {
      for (var j = 0; j < this.height; j++) {
        var widthStep = 1;
        var widthStart = 0;
        if (this.options.topology === 6) {
          widthStep = 2;
          widthStart = j % 2;
        }
        for (var i = widthStart; i < this.width; i += widthStep) {
          callback(i, j, this.cells[i][j]);
        }
      }
    }
    /**
     * Get neighbor count at [i,j] in the cell map
     */;
    _proto.getNeighbors = function getNeighbors(cx, cy) {
      var _this3 = this;
      return this.directions.reduce(function (count, _ref) {
        var dx = _ref[0],
          dy = _ref[1];
        var x = cx + dx;
        var y = cy + dy;
        if (x < 0 || x >= _this3.width || y < 0 || y >= _this3.height) {
          return count;
        }
        return count + (_this3.cells[x][y] === 1 ? 1 : 0);
      }, 0);
    }
    /**
     * Make sure every non-wall space is accessible.
     * If no cells have the requested value, the map is unchanged and the callback is still reported.
     * @param {function} callback to call to display map when do
     * @param {int} value to consider empty space - defaults to 0
     * @param {function} callback to call when a new connection is made
     */;
    _proto.connect = function connect(callback, value, connectionCallback) {
      if (!value) value = 0;
      var allFreeSpace = [];
      var notConnected = {};
      // find all free space
      var widthStep = 1;
      var widthStarts = [0, 0];
      if (this.options.topology === 6) {
        widthStep = 2;
        widthStarts = [0, 1];
      }
      for (var y = 0; y < this.height; y++) {
        for (var x = widthStarts[y % 2]; x < this.width; x += widthStep) {
          if (this.freeSpace(x, y, value)) {
            var point = [x, y];
            notConnected[this.pointKey(point)] = point;
            allFreeSpace.push(point);
          }
        }
      }
      if (!allFreeSpace.length) {
        callback && this.serviceCallback(callback);
        return;
      }
      var start = allFreeSpace[RNG.getUniformInt(0, allFreeSpace.length - 1)];
      var key = this.pointKey(start);
      var connected = {};
      connected[key] = start;
      delete notConnected[key];
      // find what's connected to the starting point
      this.findConnected(connected, notConnected, [start], false, value);
      while (Object.keys(notConnected).length > 0) {
        // find two points from notConnected to connected
        var p = this.getFromTo(connected, notConnected);
        var from = p[0]; // notConnected
        var to = p[1]; // connected
        // find everything connected to the starting point
        var local = {};
        local[this.pointKey(from)] = from;
        this.findConnected(local, notConnected, [from], true, value);
        // connect to a connected cell
        var tunnelFn = this.options.topology === 6 ? this.tunnelToConnected6 : this.tunnelToConnected;
        tunnelFn.call(this, to, from, connected, notConnected, value, connectionCallback);
        // now all of local is connected
        for (var _i = 0, _Object$entries = Object.entries(local); _i < _Object$entries.length; _i++) {
          var _Object$entries$_i = _Object$entries[_i],
            _key = _Object$entries$_i[0],
            _point = _Object$entries$_i[1];
          this.cells[_point[0]][_point[1]] = value;
          connected[_key] = _point;
          delete notConnected[_key];
        }
      }
      callback && this.serviceCallback(callback);
    }
    /**
     * Find random points to connect. Search for the closest point in the larger space.
     * This is to minimize the length of the passage while maintaining good performance.
     */;
    _proto.getFromTo = function getFromTo(connected, notConnected) {
      var from = [0, 0];
      var to = [0, 0];
      var distance;
      var connectedKeys = Object.keys(connected);
      var notConnectedKeys = Object.keys(notConnected);
      for (var i = 0; i < 5; i++) {
        if (connectedKeys.length < notConnectedKeys.length) {
          var keys = connectedKeys;
          to = connected[keys[RNG.getUniformInt(0, keys.length - 1)]];
          from = this.getClosest(to, notConnected);
        } else {
          var _keys = notConnectedKeys;
          from = notConnected[_keys[RNG.getUniformInt(0, _keys.length - 1)]];
          to = this.getClosest(from, connected);
        }
        distance = (from[0] - to[0]) * (from[0] - to[0]) + (from[1] - to[1]) * (from[1] - to[1]);
        if (distance < 64) {
          break;
        }
      }
      return [from, to];
    };
    _proto.getClosest = function getClosest(point, space) {
      var closest = Object.values(space).reduce(function (best, candidate) {
        var distance = (candidate[0] - point[0]) * (candidate[0] - point[0]) + (candidate[1] - point[1]) * (candidate[1] - point[1]);
        return best.point === null || distance < best.distance ? {
          point: candidate,
          distance: distance
        } : best;
      }, {
        point: null,
        distance: Infinity
      });
      if (closest.point === null) {
        throw new Error('Cannot find the closest point in an empty space.');
      }
      return closest.point;
    };
    _proto.findConnected = function findConnected(connected, notConnected, stack, keepNotConnected, value) {
      var _this4 = this;
      while (stack.length > 0) {
        var p = stack.splice(0, 1)[0];
        var tests = void 0;
        if (this.options.topology === 6) {
          tests = [[p[0] + 2, p[1]], [p[0] + 1, p[1] - 1], [p[0] - 1, p[1] - 1], [p[0] - 2, p[1]], [p[0] - 1, p[1] + 1], [p[0] + 1, p[1] + 1]];
        } else {
          tests = [[p[0] + 1, p[1]], [p[0] - 1, p[1]], [p[0], p[1] + 1], [p[0], p[1] - 1]];
        }
        tests.forEach(function (test) {
          // side-effect
          var key = _this4.pointKey(test);
          if (!Object.prototype.hasOwnProperty.call(connected, key) && _this4.freeSpace(test[0], test[1], value)) {
            connected[key] = test;
            if (!keepNotConnected) {
              delete notConnected[key];
            }
            stack.push(test);
          }
        });
      }
    };
    _proto.tunnelToConnected = function tunnelToConnected(to, from, connected, notConnected, value, connectionCallback) {
      var a;
      var b;
      if (from[0] < to[0]) {
        a = from;
        b = to;
      } else {
        a = to;
        b = from;
      }
      for (var xx = a[0]; xx <= b[0]; xx++) {
        this.cells[xx][a[1]] = value;
        var point = [xx, a[1]];
        var pointKey = this.pointKey(point);
        connected[pointKey] = point;
        delete notConnected[pointKey];
      }
      if (connectionCallback && a[0] < b[0]) {
        connectionCallback(a, [b[0], a[1]]);
      }
      // x is now fixed
      var x = b[0];
      if (from[1] < to[1]) {
        a = from;
        b = to;
      } else {
        a = to;
        b = from;
      }
      for (var yy = a[1]; yy < b[1]; yy++) {
        this.cells[x][yy] = value;
        var _point2 = [x, yy];
        var _pointKey = this.pointKey(_point2);
        connected[_pointKey] = _point2;
        delete notConnected[_pointKey];
      }
      if (connectionCallback && a[1] < b[1]) {
        connectionCallback([x, a[1]], [x, b[1]]);
      }
    };
    _proto.tunnelToConnected6 = function tunnelToConnected6(to, from, connected, notConnected, value, connectionCallback) {
      var a;
      var b;
      if (from[0] < to[0]) {
        a = from;
        b = to;
      } else {
        a = to;
        b = from;
      }
      // tunnel diagonally until horizontally level
      var xx = a[0];
      var yy = a[1];
      while (xx !== b[0] || yy !== b[1]) {
        var stepWidth = 2;
        if (yy < b[1]) {
          yy++;
          stepWidth = 1;
        } else if (yy > b[1]) {
          yy--;
          stepWidth = 1;
        }
        if (xx < b[0]) {
          xx += stepWidth;
        } else if (xx > b[0]) {
          xx -= stepWidth;
        } else if (b[1] % 2) {
          // Won't step outside map if destination on is map's right edge
          xx -= stepWidth;
        } else {
          // ditto for left edge
          xx += stepWidth;
        }
        this.cells[xx][yy] = value;
        var point = [xx, yy];
        var pointKey = this.pointKey(point);
        connected[pointKey] = point;
        delete notConnected[pointKey];
      }
      if (connectionCallback) {
        connectionCallback(from, to);
      }
    };
    _proto.freeSpace = function freeSpace(x, y, value) {
      return x >= 0 && x < this.width && y >= 0 && y < this.height && this.cells[x][y] === value;
    };
    _proto.pointKey = function pointKey(point) {
      return point[0] + "." + point[1];
    };
    return Cellular;
  }(Map$1);

  var FEATURES = {
    "room": Room,
    "corridor": Corridor
  };
  /**
   * Random dungeon generator using human-like digging patterns.
   * Heavily based on Mike Anderson's ideas from the "Tyrant" algo, mentioned at
   * http://roguebasin.com/index.php/Dungeon-Building_Algorithm
   */
  var Digger = /*#__PURE__*/function (_Dungeon) {
    function Digger(width, height, options) {
      var _this;
      if (options === void 0) {
        options = {};
      }
      _this = _Dungeon.call(this, width, height) || this;
      _this.options = Object.assign({
        roomWidth: [3, 9],
        /* room minimum and maximum width */
        roomHeight: [3, 5],
        /* room minimum and maximum height */
        corridorLength: [3, 10],
        /* corridor minimum and maximum length */
        dugPercentage: 0.2,
        /* we stop after this percentage of level area has been dug out */
        timeLimit: 1000 /* we stop after this much time has passed (msec) */
      }, options);
      _this.features = {
        "room": 4,
        "corridor": 4
      };
      _this.map = [];
      _this.featureAttempts = 20; /* how many times do we try to create a feature on a suitable wall */
      _this.walls = {}; /* these are available for digging */
      _this.dug = 0;
      _this.digCallback = _this.digCallback.bind(_this);
      _this.canBeDugCallback = _this.canBeDugCallback.bind(_this);
      _this.isWallCallback = _this.isWallCallback.bind(_this);
      _this.priorityWallCallback = _this.priorityWallCallback.bind(_this);
      return _this;
    }
    _inheritsLoose(Digger, _Dungeon);
    var _proto = Digger.prototype;
    _proto.create = function create(callback) {
      this.rooms = [];
      this.corridors = [];
      this.map = this.fillMap(1);
      this.walls = {};
      this.dug = 0;
      var area = (this.width - 2) * (this.height - 2);
      this.firstRoom();
      var t1 = Date.now();
      var priorityWalls;
      do {
        priorityWalls = 0;
        var t2 = Date.now();
        if (t2 - t1 > this.options.timeLimit) {
          break;
        }
        /* find a good wall */
        var wall = this.findWall();
        if (!wall) {
          break;
        } /* no more walls */
        var parts = wall.split(",");
        var x = parseInt(parts[0]);
        var y = parseInt(parts[1]);
        var dir = this.getDiggingDirection(x, y);
        if (!dir) {
          continue;
        } /* this wall is not suitable */
        //		console.log("wall", x, y);
        /* try adding a feature */
        var featureAttempts = 0;
        do {
          featureAttempts++;
          if (this.tryFeature(x, y, dir[0], dir[1])) {
            /* feature added */
            //if (this.rooms.length + this.corridors.length === 2) { this.rooms[0].addDoor(x, y); } /* first room officially has doors */
            this.removeSurroundingWalls(x, y);
            this.removeSurroundingWalls(x - dir[0], y - dir[1]);
            break;
          }
        } while (featureAttempts < this.featureAttempts);
        for (var id in this.walls) {
          if (this.walls[id] > 1) {
            priorityWalls++;
          }
        }
      } while (this.dug / area < this.options.dugPercentage || priorityWalls); /* fixme number of priority walls */
      this.addDoors();
      if (callback) {
        for (var i = 0; i < this.width; i++) {
          for (var j = 0; j < this.height; j++) {
            callback(i, j, this.map[i][j]);
          }
        }
      }
      this.walls = {};
      this.map = [];
      return this;
    };
    _proto.digCallback = function digCallback(x, y, value) {
      if (value === 0 || value === 2) {
        /* empty */
        this.map[x][y] = 0;
        this.dug++;
      } else {
        /* wall */
        this.walls[x + "," + y] = 1;
      }
    };
    _proto.isWallCallback = function isWallCallback(x, y) {
      if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
        return false;
      }
      return this.map[x][y] === 1;
    };
    _proto.canBeDugCallback = function canBeDugCallback(x, y) {
      if (x < 1 || y < 1 || x + 1 >= this.width || y + 1 >= this.height) {
        return false;
      }
      return this.map[x][y] === 1;
    };
    _proto.priorityWallCallback = function priorityWallCallback(x, y) {
      this.walls[x + "," + y] = 2;
    };
    _proto.firstRoom = function firstRoom() {
      var cx = Math.floor(this.width / 2);
      var cy = Math.floor(this.height / 2);
      var maxRoomWidth = Math.min(this.options.roomWidth[1], cx, this.width - cx - 1);
      var maxRoomHeight = Math.min(this.options.roomHeight[1], cy, this.height - cy - 1);
      var options = Object.assign(Object.assign({}, this.options), {
        roomWidth: [Math.min(this.options.roomWidth[0], maxRoomWidth), maxRoomWidth],
        roomHeight: [Math.min(this.options.roomHeight[0], maxRoomHeight), maxRoomHeight]
      });
      var room = Room.createRandomCenter(cx, cy, options);
      this.rooms.push(room);
      room.create(this.digCallback);
    }
    /**
     * Get a suitable wall
     */;
    _proto.findWall = function findWall() {
      var prio1 = [];
      var prio2 = [];
      for (var _id in this.walls) {
        var prio = this.walls[_id];
        if (prio === 2) {
          prio2.push(_id);
        } else {
          prio1.push(_id);
        }
      }
      var arr = prio2.length ? prio2 : prio1;
      if (!arr.length) {
        return null;
      } /* no walls :/ */
      var id = RNG.getItem(arr.sort()); // sort to make the order deterministic
      if (id === null) {
        return null;
      }
      delete this.walls[id];
      return id;
    }
    /**
     * Tries adding a feature
     * @returns {bool} was this a successful try?
     */;
    _proto.tryFeature = function tryFeature(x, y, dx, dy) {
      var featureName = RNG.getWeightedValue(this.features);
      if (featureName !== "room" && featureName !== "corridor") {
        return false;
      }
      var ctor = FEATURES[featureName];
      var feature = ctor.createRandomAt(x, y, dx, dy, this.options);
      if (!feature.isValid(this.isWallCallback, this.canBeDugCallback)) {
        //		console.log("not valid");
        //		feature.debug();
        return false;
      }
      feature.create(this.digCallback);
      //	feature.debug();
      if (feature instanceof Room) {
        this.rooms.push(feature);
      }
      if (feature instanceof Corridor) {
        feature.createPriorityWalls(this.priorityWallCallback);
        this.corridors.push(feature);
      }
      return true;
    };
    _proto.removeSurroundingWalls = function removeSurroundingWalls(cx, cy) {
      var deltas = DIRS[4];
      for (var i = 0; i < deltas.length; i++) {
        var delta = deltas[i];
        var x = cx + delta[0];
        var y = cy + delta[1];
        delete this.walls[x + "," + y];
        x = cx + 2 * delta[0];
        y = cy + 2 * delta[1];
        delete this.walls[x + "," + y];
      }
    }
    /**
     * Returns vector in "digging" direction, or false, if this does not exist (or is not unique)
     */;
    _proto.getDiggingDirection = function getDiggingDirection(cx, cy) {
      if (cx <= 0 || cy <= 0 || cx >= this.width - 1 || cy >= this.height - 1) {
        return null;
      }
      var result = null;
      var deltas = DIRS[4];
      for (var i = 0; i < deltas.length; i++) {
        var delta = deltas[i];
        var x = cx + delta[0];
        var y = cy + delta[1];
        if (!this.map[x][y]) {
          /* there already is another empty neighbor! */
          if (result) {
            return null;
          }
          result = delta;
        }
      }
      /* no empty neighbor */
      if (!result) {
        return null;
      }
      return [-result[0], -result[1]];
    }
    /**
     * Find empty spaces surrounding rooms, and apply doors.
     */;
    _proto.addDoors = function addDoors() {
      var data = this.map;
      function isWallCallback(x, y) {
        return data[x][y] === 1;
      }
      for (var i = 0; i < this.rooms.length; i++) {
        var room = this.rooms[i];
        room.clearDoors();
        room.addDoors(isWallCallback);
      }
    };
    return Digger;
  }(Dungeon);

  /**
   * Join lists with "i" and "i+1"
   */
  function addToList(i, L, R) {
    R[L[i + 1]] = R[i];
    L[R[i]] = L[i + 1];
    R[i] = i + 1;
    L[i + 1] = i;
  }
  /**
   * Remove "i" from its list
   */
  function removeFromList(i, L, R) {
    R[L[i]] = R[i];
    L[R[i]] = L[i];
    R[i] = i;
    L[i] = i;
  }
  /**
   * Maze generator - Eller's algorithm
   * See http://homepages.cwi.nl/~tromp/maze.html for explanation
   */
  var EllerMaze = /*#__PURE__*/function (_Map) {
    function EllerMaze() {
      return _Map.apply(this, arguments) || this;
    }
    _inheritsLoose(EllerMaze, _Map);
    var _proto = EllerMaze.prototype;
    _proto.create = function create(callback) {
      var map = this.fillMap(1);
      var w = Math.ceil((this.width - 2) / 2);
      var rand = 9 / 24;
      var L = [];
      var R = [];
      for (var i = 0; i < w; i++) {
        L.push(i);
        R.push(i);
      }
      L.push(w - 1); /* fake stop-block at the right side */
      var j;
      for (j = 1; j + 3 < this.height; j += 2) {
        /* one row */
        for (var _i = 0; _i < w; _i++) {
          /* cell coords (will be always empty) */
          var x = 2 * _i + 1;
          var y = j;
          map[x][y] = 0;
          /* right connection */
          if (_i !== L[_i + 1] && RNG.getUniform() > rand) {
            addToList(_i, L, R);
            map[x + 1][y] = 0;
          }
          /* bottom connection */
          if (_i !== L[_i] && RNG.getUniform() > rand) {
            /* remove connection */
            removeFromList(_i, L, R);
          } else {
            /* create connection */
            map[x][y + 1] = 0;
          }
        }
      }
      /* last row */
      for (var _i2 = 0; _i2 < w; _i2++) {
        /* cell coords (will be always empty) */
        var _x = 2 * _i2 + 1;
        var _y = j;
        map[_x][_y] = 0;
        /* right connection */
        if (_i2 !== L[_i2 + 1] && (_i2 === L[_i2] || RNG.getUniform() > rand)) {
          /* dig right also if the cell is separated, so it gets connected to the rest of maze */
          addToList(_i2, L, R);
          map[_x + 1][_y] = 0;
        }
        removeFromList(_i2, L, R);
      }
      if (callback) {
        for (var _i3 = 0; _i3 < this.width; _i3++) {
          for (var _j = 0; _j < this.height; _j++) {
            callback(_i3, _j, map[_i3][_j]);
          }
        }
      }
      return this;
    };
    return EllerMaze;
  }(Map$1);

  /**
   * @class Recursively divided maze, http://en.wikipedia.org/wiki/Maze_generation_algorithm#Recursive_division_method
   * @augments ROT.Map
   */
  var DividedMaze = /*#__PURE__*/function (_Map) {
    function DividedMaze() {
      var _this;
      _this = _Map.apply(this, arguments) || this;
      _this.stack = [];
      _this.map = [];
      return _this;
    }
    _inheritsLoose(DividedMaze, _Map);
    var _proto = DividedMaze.prototype;
    _proto.create = function create(callback) {
      var w = this.width;
      var h = this.height;
      this.map = [];
      for (var i = 0; i < w; i++) {
        this.map.push([]);
        for (var j = 0; j < h; j++) {
          var border = i === 0 || j === 0 || i + 1 === w || j + 1 === h;
          this.map[i].push(border ? 1 : 0);
        }
      }
      this.stack = [[1, 1, w - 2, h - 2]];
      this.process();
      if (callback) {
        for (var _i = 0; _i < w; _i++) {
          for (var _j = 0; _j < h; _j++) {
            callback(_i, _j, this.map[_i][_j]);
          }
        }
      }
      this.map = [];
      return this;
    };
    _proto.process = function process() {
      while (this.stack.length) {
        var room = this.stack.shift();
        if (!room) {
          break;
        }
        this.partitionRoom(room);
      }
    };
    _proto.partitionRoom = function partitionRoom(room) {
      var availX = [];
      var availY = [];
      for (var i = room[0] + 1; i < room[2]; i++) {
        var top = this.map[i][room[1] - 1];
        var bottom = this.map[i][room[3] + 1];
        if (top && bottom && !(i % 2)) {
          availX.push(i);
        }
      }
      for (var j = room[1] + 1; j < room[3]; j++) {
        var left = this.map[room[0] - 1][j];
        var right = this.map[room[2] + 1][j];
        if (left && right && !(j % 2)) {
          availY.push(j);
        }
      }
      if (!availX.length || !availY.length) {
        return;
      }
      var x = RNG.getItem(availX);
      var y = RNG.getItem(availY);
      if (x === null || y === null) {
        return;
      }
      this.map[x][y] = 1;
      var walls = [];
      var w = [];
      walls.push(w); /* left part */
      for (var _i2 = room[0]; _i2 < x; _i2++) {
        this.map[_i2][y] = 1;
        if (_i2 % 2) w.push([_i2, y]);
      }
      w = [];
      walls.push(w); /* right part */
      for (var _i3 = x + 1; _i3 <= room[2]; _i3++) {
        this.map[_i3][y] = 1;
        if (_i3 % 2) w.push([_i3, y]);
      }
      w = [];
      walls.push(w); /* top part */
      for (var _j2 = room[1]; _j2 < y; _j2++) {
        this.map[x][_j2] = 1;
        if (_j2 % 2) w.push([x, _j2]);
      }
      w = [];
      walls.push(w); /* bottom part */
      for (var _j3 = y + 1; _j3 <= room[3]; _j3++) {
        this.map[x][_j3] = 1;
        if (_j3 % 2) w.push([x, _j3]);
      }
      var solid = RNG.getItem(walls);
      for (var _i4 = 0; _i4 < walls.length; _i4++) {
        var _w = walls[_i4];
        if (_w === solid) {
          continue;
        }
        var hole = RNG.getItem(_w);
        if (!hole) {
          continue;
        }
        this.map[hole[0]][hole[1]] = 0;
      }
      this.stack.push([room[0], room[1], x - 1, y - 1]); /* left top */
      this.stack.push([x + 1, room[1], room[2], y - 1]); /* right top */
      this.stack.push([room[0], y + 1, x - 1, room[3]]); /* left bottom */
      this.stack.push([x + 1, y + 1, room[2], room[3]]); /* right bottom */
    };
    return DividedMaze;
  }(Map$1);

  /**
   * Icey's Maze generator
   * See http://roguebasin.com/index.php/Simple_maze for explanation
   */
  var IceyMaze = /*#__PURE__*/function (_Map) {
    function IceyMaze(width, height, regularity) {
      var _this;
      if (regularity === void 0) {
        regularity = 0;
      }
      _this = _Map.call(this, width, height) || this;
      _this.regularity = regularity;
      _this.map = [];
      return _this;
    }
    _inheritsLoose(IceyMaze, _Map);
    var _proto = IceyMaze.prototype;
    _proto.create = function create(callback) {
      var width = this.width;
      var height = this.height;
      var map = this.fillMap(1);
      width -= width % 2 ? 1 : 2;
      height -= height % 2 ? 1 : 2;
      var cx = 0;
      var cy = 0;
      var nx = 0;
      var ny = 0;
      var done = 0;
      var blocked = false;
      var dirs = [[0, 0], [0, 0], [0, 0], [0, 0]];
      do {
        cx = 1 + 2 * Math.floor(RNG.getUniform() * (width - 1) / 2);
        cy = 1 + 2 * Math.floor(RNG.getUniform() * (height - 1) / 2);
        if (!done) {
          map[cx][cy] = 0;
        }
        if (!map[cx][cy]) {
          this.randomize(dirs);
          do {
            if (Math.floor(RNG.getUniform() * (this.regularity + 1)) === 0) {
              this.randomize(dirs);
            }
            blocked = true;
            for (var i = 0; i < 4; i++) {
              nx = cx + dirs[i][0] * 2;
              ny = cy + dirs[i][1] * 2;
              if (this.isFree(map, nx, ny, width, height)) {
                map[nx][ny] = 0;
                map[cx + dirs[i][0]][cy + dirs[i][1]] = 0;
                cx = nx;
                cy = ny;
                blocked = false;
                done++;
                break;
              }
            }
          } while (!blocked);
        }
      } while (done + 1 < width * height / 4);
      if (callback) {
        for (var _i = 0; _i < this.width; _i++) {
          for (var j = 0; j < this.height; j++) {
            callback(_i, j, map[_i][j]);
          }
        }
      }
      this.map = [];
      return this;
    };
    _proto.randomize = function randomize(dirs) {
      for (var i = 0; i < 4; i++) {
        dirs[i][0] = 0;
        dirs[i][1] = 0;
      }
      switch (Math.floor(RNG.getUniform() * 4)) {
        case 0:
          dirs[0][0] = -1;
          dirs[1][0] = 1;
          dirs[2][1] = -1;
          dirs[3][1] = 1;
          break;
        case 1:
          dirs[3][0] = -1;
          dirs[2][0] = 1;
          dirs[1][1] = -1;
          dirs[0][1] = 1;
          break;
        case 2:
          dirs[2][0] = -1;
          dirs[3][0] = 1;
          dirs[0][1] = -1;
          dirs[1][1] = 1;
          break;
        case 3:
          dirs[1][0] = -1;
          dirs[0][0] = 1;
          dirs[3][1] = -1;
          dirs[2][1] = 1;
          break;
      }
    };
    _proto.isFree = function isFree(map, x, y, width, height) {
      if (x < 1 || y < 1 || x >= width || y >= height) {
        return false;
      }
      return map[x][y];
    };
    return IceyMaze;
  }(Map$1);

  /**
   * Dungeon generator which uses the "original" Rogue dungeon generation algorithm. See https://github.com/Davidslv/rogue-like/blob/master/docs/references/Mark_Damon_Hughes/07_Roguelike_Dungeon_Generation.md
   * @author hyakugei
   */
  var Rogue = /*#__PURE__*/function (_Map) {
    function Rogue(width, height, options) {
      var _this;
      if (options === void 0) {
        options = {};
      }
      var _a, _b;
      _this = _Map.call(this, width, height) || this;
      _this.map = [];
      _this.rooms = [];
      var normalizedOptions = Object.assign({
        cellWidth: 3,
        cellHeight: 3
      }, options);
      /*
      Set the room sizes according to the over-all width of the map,
      and the cell sizes.
      */
      var roomWidth = (_a = normalizedOptions.roomWidth) !== null && _a !== void 0 ? _a : _this.calculateRoomSize(_this.width, normalizedOptions.cellWidth);
      var roomHeight = (_b = normalizedOptions.roomHeight) !== null && _b !== void 0 ? _b : _this.calculateRoomSize(_this.height, normalizedOptions.cellHeight);
      _this.options = {
        cellWidth: normalizedOptions.cellWidth,
        cellHeight: normalizedOptions.cellHeight,
        roomWidth: roomWidth,
        roomHeight: roomHeight
      };
      return _this;
    }
    _inheritsLoose(Rogue, _Map);
    var _proto = Rogue.prototype;
    _proto.create = function create(callback) {
      this.map = this.fillMap(1);
      this.rooms = [];
      this.initRooms();
      this.connectRooms();
      this.connectUnconnectedRooms();
      this.createRandomRoomConnections();
      this.createRooms();
      this.createCorridors();
      if (callback) {
        for (var i = 0; i < this.width; i++) {
          for (var j = 0; j < this.height; j++) {
            callback(i, j, this.map[i][j]);
          }
        }
      }
      return this;
    };
    _proto.calculateRoomSize = function calculateRoomSize(size, cell) {
      var max = Math.floor(size / cell * 0.8);
      var min = Math.floor(size / cell * 0.25);
      if (min < 2) {
        min = 2;
      }
      if (max < 2) {
        max = 2;
      }
      return [min, max];
    };
    _proto.initRooms = function initRooms() {
      // create rooms array. This is the "grid" list from the algo.
      for (var i = 0; i < this.options.cellWidth; i++) {
        this.rooms.push([]);
        for (var j = 0; j < this.options.cellHeight; j++) {
          this.rooms[i].push({
            "x": 0,
            "y": 0,
            "width": 0,
            "height": 0,
            "connections": [],
            "cellx": i,
            "celly": j
          });
        }
      }
    };
    _proto.connectRooms = function connectRooms() {
      //pick random starting grid
      var cgx = RNG.getUniformInt(0, this.options.cellWidth - 1);
      var cgy = RNG.getUniformInt(0, this.options.cellHeight - 1);
      var idx;
      var ncgx;
      var ncgy;
      var found = false;
      var room;
      var otherRoom;
      var dirToCheck;
      // find  unconnected neighbour cells
      do {
        //dirToCheck = [0, 1, 2, 3, 4, 5, 6, 7];
        dirToCheck = [0, 2, 4, 6];
        dirToCheck = RNG.shuffle(dirToCheck);
        do {
          found = false;
          var direction = dirToCheck.pop();
          if (direction === undefined) {
            break;
          }
          idx = direction;
          ncgx = cgx + DIRS[8][idx][0];
          ncgy = cgy + DIRS[8][idx][1];
          if (ncgx < 0 || ncgx >= this.options.cellWidth) {
            continue;
          }
          if (ncgy < 0 || ncgy >= this.options.cellHeight) {
            continue;
          }
          room = this.rooms[cgx][cgy];
          if (room["connections"].length > 0) {
            // as long as this room doesn't already coonect to me, we are ok with it.
            if (room["connections"][0][0] === ncgx && room["connections"][0][1] === ncgy) {
              break;
            }
          }
          otherRoom = this.rooms[ncgx][ncgy];
          if (otherRoom["connections"].length === 0) {
            otherRoom["connections"].push([cgx, cgy]);
            cgx = ncgx;
            cgy = ncgy;
            found = true;
          }
        } while (dirToCheck.length > 0 && found === false);
      } while (dirToCheck.length > 0);
    };
    _proto.connectUnconnectedRooms = function connectUnconnectedRooms() {
      var cw = this.options.cellWidth;
      var ch = this.options.cellHeight;
      var parents = Array.from({
        length: cw * ch
      }, function (_, index) {
        return index;
      });
      var find = function find(cell) {
        while (parents[cell] !== cell) {
          parents[cell] = parents[parents[cell]];
          cell = parents[cell];
        }
        return cell;
      };
      var join = function join(first, second) {
        var firstRoot = find(first);
        var secondRoot = find(second);
        if (firstRoot === secondRoot) {
          return false;
        }
        parents[firstRoot] = secondRoot;
        return true;
      };
      var getIndex = function getIndex(x, y) {
        return x * ch + y;
      };
      for (var x = 0; x < cw; x++) {
        for (var y = 0; y < ch; y++) {
          for (var _iterator = _createForOfIteratorHelperLoose(this.rooms[x][y].connections), _step; !(_step = _iterator()).done;) {
            var _step$value = _step.value,
              otherX = _step$value[0],
              otherY = _step$value[1];
            join(getIndex(x, y), getIndex(otherX, otherY));
          }
        }
      }
      var candidateConnections = [];
      for (var _x = 0; _x < cw; _x++) {
        for (var _y = 0; _y < ch; _y++) {
          if (_x + 1 < cw) {
            candidateConnections.push([[_x, _y], [_x + 1, _y]]);
          }
          if (_y + 1 < ch) {
            candidateConnections.push([[_x, _y], [_x, _y + 1]]);
          }
        }
      }
      for (var _iterator2 = _createForOfIteratorHelperLoose(RNG.shuffle(candidateConnections)), _step2; !(_step2 = _iterator2()).done;) {
        var _step2$value = _step2.value,
          _step2$value$ = _step2$value[0],
          _x2 = _step2$value$[0],
          _y2 = _step2$value$[1],
          _step2$value$2 = _step2$value[1],
          _otherX = _step2$value$2[0],
          _otherY = _step2$value$2[1];
        if (join(getIndex(_x2, _y2), getIndex(_otherX, _otherY))) {
          this.rooms[_x2][_y2].connections.push([_otherX, _otherY]);
        }
      }
    };
    _proto.createRandomRoomConnections = function createRandomRoomConnections() {
      // Empty for now.
    };
    _proto.createRooms = function createRooms() {
      var w = this.width;
      var h = this.height;
      var cw = this.options.cellWidth;
      var ch = this.options.cellHeight;
      var cwp = Math.floor(this.width / cw);
      var chp = Math.floor(this.height / ch);
      var roomWidth = this.options["roomWidth"];
      var roomHeight = this.options["roomHeight"];
      for (var i = 0; i < cw; i++) {
        for (var j = 0; j < ch; j++) {
          var cellX = cwp * i;
          var cellY = chp * j;
          var maxRoomWidth = Math.max(1, Math.min(cwp - 1, w - cellX - 2));
          var maxRoomHeight = Math.max(1, Math.min(chp - 1, h - cellY - 2));
          var roomw = Math.min(RNG.getUniformInt(roomWidth[0], roomWidth[1]), maxRoomWidth);
          var roomh = Math.min(RNG.getUniformInt(roomHeight[0], roomHeight[1]), maxRoomHeight);
          var maxOffsetX = Math.max(0, Math.min(cwp - roomw - 1, w - cellX - roomw - 2));
          var maxOffsetY = Math.max(0, Math.min(chp - roomh - 1, h - cellY - roomh - 2));
          var sx = cellX + 1 + RNG.getUniformInt(0, maxOffsetX);
          var sy = cellY + 1 + RNG.getUniformInt(0, maxOffsetY);
          this.rooms[i][j]["x"] = sx;
          this.rooms[i][j]["y"] = sy;
          this.rooms[i][j]["width"] = roomw;
          this.rooms[i][j]["height"] = roomh;
          for (var ii = sx; ii < sx + roomw; ii++) {
            for (var jj = sy; jj < sy + roomh; jj++) {
              this.map[ii][jj] = 0;
            }
          }
        }
      }
    };
    _proto.getWallPosition = function getWallPosition(aRoom, aDirection) {
      var rx;
      var ry;
      var door;
      if (aDirection === 1 || aDirection === 3) {
        rx = RNG.getUniformInt(aRoom["x"] + 1, aRoom["x"] + aRoom["width"] - 2);
        if (aDirection === 1) {
          ry = aRoom["y"] - 2;
          door = ry + 1;
        } else {
          ry = aRoom["y"] + aRoom["height"] + 1;
          door = ry - 1;
        }
        this.map[rx][door] = 0; // i'm not setting a specific 'door' tile value right now, just empty space.
      } else {
        ry = RNG.getUniformInt(aRoom["y"] + 1, aRoom["y"] + aRoom["height"] - 2);
        if (aDirection === 2) {
          rx = aRoom["x"] + aRoom["width"] + 1;
          door = rx - 1;
        } else {
          rx = aRoom["x"] - 2;
          door = rx + 1;
        }
        this.map[door][ry] = 0; // i'm not setting a specific 'door' tile value right now, just empty space.
      }
      return [rx, ry];
    };
    _proto.drawCorridor = function drawCorridor(startPosition, endPosition) {
      var xOffset = endPosition[0] - startPosition[0];
      var yOffset = endPosition[1] - startPosition[1];
      var xpos = startPosition[0];
      var ypos = startPosition[1];
      var tempDist;
      var move; // 2 element array, element 0 is the direction, element 1 is the total value to move.
      var moves = []; // a list of 2 element arrays
      var xAbs = Math.abs(xOffset);
      var yAbs = Math.abs(yOffset);
      var percent = RNG.getUniform(); // used to split the move at different places along the long axis
      var firstHalf = percent;
      var secondHalf = 1 - percent;
      var xDir = xOffset > 0 ? 2 : 6;
      var yDir = yOffset > 0 ? 4 : 0;
      if (xAbs < yAbs) {
        // move firstHalf of the y offset
        tempDist = Math.ceil(yAbs * firstHalf);
        moves.push([yDir, tempDist]);
        // move all the x offset
        moves.push([xDir, xAbs]);
        // move sendHalf of the  y offset
        tempDist = Math.floor(yAbs * secondHalf);
        moves.push([yDir, tempDist]);
      } else {
        //  move firstHalf of the x offset
        tempDist = Math.ceil(xAbs * firstHalf);
        moves.push([xDir, tempDist]);
        // move all the y offset
        moves.push([yDir, yAbs]);
        // move secondHalf of the x offset.
        tempDist = Math.floor(xAbs * secondHalf);
        moves.push([xDir, tempDist]);
      }
      this.map[xpos][ypos] = 0;
      while (moves.length > 0) {
        var nextMove = moves.pop();
        if (!nextMove) {
          break;
        }
        move = nextMove;
        while (move[1] > 0) {
          xpos += DIRS[8][move[0]][0];
          ypos += DIRS[8][move[0]][1];
          this.map[xpos][ypos] = 0;
          move[1] = move[1] - 1;
        }
      }
    };
    _proto.createCorridors = function createCorridors() {
      // Draw Corridors between connected rooms
      var cw = this.options.cellWidth;
      var ch = this.options.cellHeight;
      var room;
      var connection;
      var otherRoom;
      var wall;
      var otherWall;
      for (var i = 0; i < cw; i++) {
        for (var j = 0; j < ch; j++) {
          room = this.rooms[i][j];
          for (var k = 0; k < room["connections"].length; k++) {
            connection = room["connections"][k];
            otherRoom = this.rooms[connection[0]][connection[1]];
            // figure out what wall our corridor will start one.
            // figure out what wall our corridor will end on.
            if (otherRoom["cellx"] > room["cellx"]) {
              wall = 2;
              otherWall = 4;
            } else if (otherRoom["cellx"] < room["cellx"]) {
              wall = 4;
              otherWall = 2;
            } else if (otherRoom["celly"] > room["celly"]) {
              wall = 3;
              otherWall = 1;
            } else {
              wall = 1;
              otherWall = 3;
            }
            this.drawCorridor(this.getWallPosition(room, wall), this.getWallPosition(otherRoom, otherWall));
          }
        }
      }
    };
    return Rogue;
  }(Map$1);

  var Map = {
    Arena: Arena,
    Uniform: Uniform,
    Cellular: Cellular,
    Digger: Digger,
    EllerMaze: EllerMaze,
    DividedMaze: DividedMaze,
    IceyMaze: IceyMaze,
    Rogue: Rogue
  };

  /**
   * Base noise generator
   */
  var Noise$1 = function Noise() {};

  var F2 = 0.5 * (Math.sqrt(3) - 1);
  var G2 = (3 - Math.sqrt(3)) / 6;
  /**
   * A simple 2d implementation of simplex noise by Ondrej Zara
   *
   * Based on a speed-improved simplex noise algorithm for 2D, 3D and 4D in Java.
   * Which is based on example code by Stefan Gustavson (stegu@itn.liu.se).
   * With Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
   * Better rank ordering method by Stefan Gustavson in 2012.
   */
  var Simplex = /*#__PURE__*/function (_Noise) {
    /**
     * @param gradients Random gradients
     */
    function Simplex(gradients) {
      var _this;
      if (gradients === void 0) {
        gradients = 256;
      }
      _this = _Noise.call(this) || this;
      _this.gradients = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];
      var permutations = [];
      for (var i = 0; i < gradients; i++) {
        permutations.push(i);
      }
      permutations = RNG.shuffle(permutations);
      _this.perms = [];
      _this.indexes = [];
      for (var _i = 0; _i < 2 * gradients; _i++) {
        _this.perms.push(permutations[_i % gradients]);
        _this.indexes.push(_this.perms[_i] % _this.gradients.length);
      }
      return _this;
    }
    _inheritsLoose(Simplex, _Noise);
    var _proto = Simplex.prototype;
    _proto.get = function get(xin, yin) {
      var perms = this.perms;
      var indexes = this.indexes;
      var count = perms.length / 2;
      var n0 = 0,
        n1 = 0,
        n2 = 0,
        gi; // Noise contributions from the three corners
      // Skew the input space to determine which simplex cell we're in
      var s = (xin + yin) * F2; // Hairy factor for 2D
      var i = Math.floor(xin + s);
      var j = Math.floor(yin + s);
      var t = (i + j) * G2;
      var X0 = i - t; // Unskew the cell origin back to (x,y) space
      var Y0 = j - t;
      var x0 = xin - X0; // The x,y distances from the cell origin
      var y0 = yin - Y0;
      // For the 2D case, the simplex shape is an equilateral triangle.
      // Determine which simplex we are in.
      var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
      if (x0 > y0) {
        i1 = 1;
        j1 = 0;
      } else {
        // lower triangle, XY order: (0,0)->(1,0)->(1,1)
        i1 = 0;
        j1 = 1;
      } // upper triangle, YX order: (0,0)->(0,1)->(1,1)
      // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
      // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
      // c = (3-sqrt(3))/6
      var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
      var y1 = y0 - j1 + G2;
      var x2 = x0 - 1 + 2 * G2; // Offsets for last corner in (x,y) unskewed coords
      var y2 = y0 - 1 + 2 * G2;
      // Work out the hashed gradient indices of the three simplex corners
      var ii = mod(i, count);
      var jj = mod(j, count);
      // Calculate the contribution from the three corners
      var t0 = 0.5 - x0 * x0 - y0 * y0;
      if (t0 >= 0) {
        t0 *= t0;
        gi = indexes[ii + perms[jj]];
        var grad = this.gradients[gi];
        n0 = t0 * t0 * (grad[0] * x0 + grad[1] * y0);
      }
      var t1 = 0.5 - x1 * x1 - y1 * y1;
      if (t1 >= 0) {
        t1 *= t1;
        gi = indexes[ii + i1 + perms[jj + j1]];
        var _grad = this.gradients[gi];
        n1 = t1 * t1 * (_grad[0] * x1 + _grad[1] * y1);
      }
      var t2 = 0.5 - x2 * x2 - y2 * y2;
      if (t2 >= 0) {
        t2 *= t2;
        gi = indexes[ii + 1 + perms[jj + 1]];
        var _grad2 = this.gradients[gi];
        n2 = t2 * t2 * (_grad2[0] * x2 + _grad2[1] * y2);
      }
      // Add contributions from each corner to get the final noise value.
      // The result is scaled to return values in the interval [-1,1].
      return 70 * (n0 + n1 + n2);
    };
    return Simplex;
  }(Noise$1);

  var noise = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Simplex: Simplex
  });

  /**
   * @class Abstract pathfinder
   * @param {int} toX Target X coord
   * @param {int} toY Target Y coord
   * @param {function} passableCallback Callback to determine map passability
   * @param {object} [options]
   * @param {int} [options.topology=8]
   */
  var Path$1 = /*#__PURE__*/function () {
    function Path(toX, toY, passableCallback, options) {
      if (options === void 0) {
        options = {};
      }
      this.toX = toX;
      this.toY = toY;
      this.passableCallback = passableCallback;
      this.options = Object.assign({
        topology: 8
      }, options);
      this.dirs = DIRS[this.options.topology];
      if (this.options.topology === 8) {
        /* reorder dirs for more aesthetic result (vertical/horizontal first) */
        this.dirs = [this.dirs[0], this.dirs[2], this.dirs[4], this.dirs[6], this.dirs[1], this.dirs[3], this.dirs[5], this.dirs[7]];
      }
    }
    var _proto = Path.prototype;
    _proto.getNeighbors = function getNeighbors(cx, cy) {
      var result = [];
      for (var i = 0; i < this.dirs.length; i++) {
        var dir = this.dirs[i];
        var x = cx + dir[0];
        var y = cy + dir[1];
        if (!this.passableCallback(x, y)) {
          continue;
        }
        result.push([x, y]);
      }
      return result;
    };
    return Path;
  }();

  /**
   * @class Simplified Dijkstra's algorithm: all edges have a value of 1
   * @augments ROT.Path
   * @see ROT.Path
   */
  var Dijkstra = /*#__PURE__*/function (_Path) {
    function Dijkstra(toX, toY, passableCallback, options) {
      var _this;
      if (options === void 0) {
        options = {};
      }
      _this = _Path.call(this, toX, toY, passableCallback, options) || this;
      _this.computed = {};
      _this.todo = [];
      _this.add(toX, toY, null);
      return _this;
    }
    /**
     * Compute a path from a given point
     * @see ROT.Path#compute
     */
    _inheritsLoose(Dijkstra, _Path);
    var _proto = Dijkstra.prototype;
    _proto.compute = function compute(fromX, fromY, callback) {
      var key = fromX + "," + fromY;
      if (!(key in this.computed)) {
        this.computeUntil(fromX, fromY);
      }
      if (!(key in this.computed)) {
        return;
      }
      var item = this.computed[key];
      while (item) {
        // side-effect
        callback(item.x, item.y);
        item = item.prev;
      }
    }
    /**
     * Compute a non-cached value
     */;
    _proto.computeUntil = function computeUntil(fromX, fromY) {
      var _this2 = this;
      var _loop = function _loop() {
          var item = _this2.todo.shift();
          if (!item) {
            return 0; // break
          }
          var isOrigin = item.x === fromX && item.y === fromY;
          _this2.getNeighbors(item.x, item.y).filter(function (_ref) {
            var x = _ref[0],
              y = _ref[1];
            return !(x + "," + y in _this2.computed);
          }).forEach(function (_ref2) {
            var x = _ref2[0],
              y = _ref2[1];
            // side-effect
            _this2.add(x, y, item);
          });
          if (isOrigin) {
            return {
              v: void 0
            };
          }
        },
        _ret;
      // side-effect
      while (this.todo.length) {
        _ret = _loop();
        if (_ret === 0) break;
        if (_ret) return _ret.v;
      }
    };
    _proto.add = function add(x, y, prev) {
      var item = {
        x: x,
        y: y,
        prev: prev
      };
      this.computed[x + "," + y] = item;
      this.todo.push(item);
    };
    return Dijkstra;
  }(Path$1);

  /**
   * @class Simplified A* algorithm: all edges have a value of 1
   * @augments ROT.Path
   * @see ROT.Path
   */
  var AStar = /*#__PURE__*/function (_Path) {
    function AStar(toX, toY, passableCallback, options) {
      var _this;
      if (options === void 0) {
        options = {};
      }
      _this = _Path.call(this, toX, toY, passableCallback, options) || this;
      _this.todo = [];
      _this.done = {};
      return _this;
    }
    /**
     * Compute a path from a given point
     * @see ROT.Path#compute
     */
    _inheritsLoose(AStar, _Path);
    var _proto = AStar.prototype;
    _proto.compute = function compute(fromX, fromY, callback) {
      this.todo = [];
      this.done = {};
      this.fromX = fromX;
      this.fromY = fromY;
      this.add(this.toX, this.toY, null);
      while (this.todo.length) {
        var _item = this.todo.shift();
        if (!_item) {
          break;
        }
        var id = _item.x + "," + _item.y;
        if (id in this.done) {
          continue;
        }
        this.done[id] = _item;
        if (_item.x === fromX && _item.y === fromY) {
          break;
        }
        var neighbors = this.getNeighbors(_item.x, _item.y);
        for (var i = 0; i < neighbors.length; i++) {
          var neighbor = neighbors[i];
          var x = neighbor[0];
          var y = neighbor[1];
          var _id = x + "," + y;
          if (_id in this.done) {
            continue;
          }
          this.add(x, y, _item);
        }
      }
      var item = this.done[fromX + "," + fromY];
      if (!item) {
        return;
      }
      while (item) {
        callback(item.x, item.y);
        item = item.prev;
      }
    };
    _proto.add = function add(x, y, prev) {
      var h = this.distance(x, y);
      var obj = {
        x: x,
        y: y,
        prev: prev,
        g: prev ? prev.g + 1 : 0,
        h: h
      };
      /* insert into priority queue */
      var f = obj.g + obj.h;
      for (var i = 0; i < this.todo.length; i++) {
        var item = this.todo[i];
        var itemF = item.g + item.h;
        if (f < itemF || f === itemF && h < item.h) {
          this.todo.splice(i, 0, obj);
          return;
        }
      }
      this.todo.push(obj);
    };
    _proto.distance = function distance(x, y) {
      switch (this.options.topology) {
        case 4:
          return Math.abs(x - this.fromX) + Math.abs(y - this.fromY);
        case 6:
          var dx = Math.abs(x - this.fromX);
          var dy = Math.abs(y - this.fromY);
          return dy + Math.max(0, (dx - dy) / 2);
        case 8:
          return Math.max(Math.abs(x - this.fromX), Math.abs(y - this.fromY));
      }
    };
    return AStar;
  }(Path$1);

  var path = /*#__PURE__*/Object.freeze({
    __proto__: null,
    AStar: AStar,
    Dijkstra: Dijkstra
  });

  /**
   * @class Asynchronous main loop
   * @param {ROT.Scheduler} scheduler
   */
  var Engine = /*#__PURE__*/function () {
    function Engine(scheduler) {
      this.scheduler = scheduler;
      this.lockCount = 1;
    }
    /**
     * Start the main loop. When this call returns, the loop is locked.
     */
    var _proto = Engine.prototype;
    _proto.start = function start() {
      return this.unlock();
    }
    /**
     * Interrupt the engine by an asynchronous action
     */;
    _proto.lock = function lock() {
      this.lockCount++;
      return this;
    }
    /**
     * Resume execution (paused by a previous lock)
     */;
    _proto.unlock = function unlock() {
      if (!this.lockCount) {
        throw new Error("Cannot unlock unlocked engine");
      }
      this.lockCount--;
      while (!this.lockCount) {
        var actor = this.scheduler.next();
        if (!actor) {
          return this.lock();
        } /* no actors */
        var result = void 0;
        try {
          if (typeof actor !== "object" || actor === null) {
            return this.lock();
          }
          var act = Reflect.get(actor, "act");
          if (typeof act !== "function") {
            return this.lock();
          }
          result = Reflect.apply(act, actor, []);
        } catch (error) {
          if (!this.lockCount) {
            this.lock();
          }
          throw error;
        }
        if (typeof result === "object" && result !== null) {
          /* actor returned a "thenable", looks like a Promise */
          var then = Reflect.get(result, "then");
          if (typeof then !== "function") {
            continue;
          }
          this.lock();
          var _unlock = this.unlock.bind(this);
          Reflect.apply(then, result, [_unlock, _unlock]);
        }
      }
      return this;
    };
    return Engine;
  }();

  var __rest = undefined && undefined.__rest || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
    }
    return t;
  };
  /**
   * Lighting computation, based on a traditional FOV for multiple light sources and multiple passes.
   */
  var Lighting = /*#__PURE__*/function () {
    function Lighting(reflectivityCallback, options) {
      if (options === void 0) {
        options = {};
      }
      this.reflectivityCallback = reflectivityCallback;
      this.options = {
        passes: 1,
        emissionThreshold: 100,
        range: 10
      };
      this.lights = {};
      this.reflectivityCache = {};
      this.fovCache = {};
      this.setOptions(options);
    }
    /**
     * Adjust options at runtime
     * A range of zero lights only the source cell.
     */
    var _proto = Lighting.prototype;
    _proto.setOptions = function setOptions(options) {
      var hasRange = Object.prototype.hasOwnProperty.call(options, 'range');
      var range = options.range,
        remainingOptions = __rest(options, ["range"]);
      var rangeIsDefined = hasRange && range !== undefined;
      if (rangeIsDefined && (typeof range !== 'number' || !Number.isFinite(range) || range < 0)) {
        throw new RangeError('Lighting range must be a finite non-negative number');
      }
      Object.assign(this.options, remainingOptions);
      if (hasRange && range !== undefined) {
        this.options.range = range;
        this.reset();
      }
      return this;
    }
    /**
     * Set the used Field-Of-View algo
     */;
    _proto.setFOV = function setFOV(fov) {
      this.fov = fov;
      this.fovCache = {};
      return this;
    }
    /**
     * Set (or remove) a light source
     */;
    _proto.setLight = function setLight(x, y, color) {
      var key = x + "," + y;
      if (color) {
        this.lights[key] = typeof color === 'string' ? fromString(color) : color;
      } else {
        delete this.lights[key];
      }
      return this;
    }
    /**
     * Remove all light sources
     */;
    _proto.clearLights = function clearLights() {
      this.lights = {};
    }
    /**
     * Reset the pre-computed topology values. Call whenever the underlying map changes its light-passability.
     */;
    _proto.reset = function reset() {
      this.reflectivityCache = {};
      this.fovCache = {};
      return this;
    }
    /**
     * Compute the lighting
     */;
    _proto.compute = function compute(lightingCallback) {
      var doneCells = new Set();
      var emittingCells = Object.fromEntries(Object.entries(this.lights).map(function (_ref) {
        var key = _ref[0],
          light = _ref[1];
        return [key, add_([0, 0, 0], light)];
      }));
      var litCells = {};
      for (var pass = 0; pass < this.options.passes; pass++) {
        litCells = this.emitLight(emittingCells, litCells, doneCells);
        if (pass + 1 === this.options.passes) {
          continue;
        }
        emittingCells = this.computeEmitters(litCells, doneCells);
      }
      for (var _i = 0, _Object$entries = Object.entries(litCells); _i < _Object$entries.length; _i++) {
        var _Object$entries$_i = _Object$entries[_i],
          key = _Object$entries$_i[0],
          color = _Object$entries$_i[1];
        var _key$split = key.split(','),
          rawX = _key$split[0],
          rawY = _key$split[1];
        var x = Math.trunc(Number(rawX));
        var y = Math.trunc(Number(rawY));
        lightingCallback(x, y, color);
      }
      return this;
    }
    /**
     * Compute one iteration from all emitting cells
     * @param emittingCells These emit light
     * @param litCells Add projected light to these
     * @param doneCells These already emitted, forbid them from further calculations
     */;
    _proto.emitLight = function emitLight(emittingCells, litCells, doneCells) {
      var _this = this;
      return Object.entries(emittingCells).reduce(function (currentLitCells, _ref2) {
        var key = _ref2[0],
          color = _ref2[1];
        var _key$split2 = key.split(','),
          rawX = _key$split2[0],
          rawY = _key$split2[1];
        var x = Math.trunc(Number(rawX));
        var y = Math.trunc(Number(rawY));
        doneCells.add(key);
        return _this.emitLightFromCell(x, y, color, currentLitCells);
      }, litCells);
    }
    /**
     * Prepare a list of emitters for next pass
     */;
    _proto.computeEmitters = function computeEmitters(litCells, doneCells) {
      var _this2 = this;
      return Object.entries(litCells).reduce(function (result, _ref3) {
        var key = _ref3[0],
          color = _ref3[1];
        if (doneCells.has(key)) {
          return result;
        }
        var reflectivity;
        if (Object.prototype.hasOwnProperty.call(_this2.reflectivityCache, key)) {
          reflectivity = _this2.reflectivityCache[key];
        } else {
          var _key$split3 = key.split(','),
            rawX = _key$split3[0],
            rawY = _key$split3[1];
          var x = Math.trunc(Number(rawX));
          var y = Math.trunc(Number(rawY));
          reflectivity = _this2.reflectivityCallback(x, y);
          _this2.reflectivityCache[key] = reflectivity;
        }
        if (reflectivity === 0) {
          return result;
        }
        var _color$map = color.map(function (channel) {
            return Math.round(channel * reflectivity);
          }),
          red = _color$map[0],
          green = _color$map[1],
          blue = _color$map[2];
        var emission = [red, green, blue];
        var intensity = emission.reduce(function (total, channel) {
          return total + channel;
        }, 0);
        if (intensity > _this2.options.emissionThreshold) {
          result[key] = emission;
        }
        return result;
      }, {});
    }
    /**
     * Compute one iteration from one cell
     */;
    _proto.emitLightFromCell = function emitLightFromCell(x, y, color, litCells) {
      var sourceKey = x + "," + y;
      var fov;
      if (Object.prototype.hasOwnProperty.call(this.fovCache, sourceKey)) {
        fov = this.fovCache[sourceKey];
      } else {
        fov = this.updateFOV(x, y);
      }
      return Object.entries(fov).reduce(function (updatedLitCells, _ref4) {
        var targetKey = _ref4[0],
          formFactor = _ref4[1];
        var resultColor;
        if (Object.prototype.hasOwnProperty.call(updatedLitCells, targetKey)) {
          resultColor = updatedLitCells[targetKey];
        } else {
          resultColor = [0, 0, 0];
        }
        var _resultColor$map = resultColor.map(function (channel, index) {
            return channel + Math.round(color[index] * formFactor);
          }),
          red = _resultColor$map[0],
          green = _resultColor$map[1],
          blue = _resultColor$map[2];
        updatedLitCells[targetKey] = [red, green, blue];
        return updatedLitCells;
      }, litCells);
    }
    /**
     * Compute FOV ("form factor") for a potential light source at [x,y]
     */;
    _proto.updateFOV = function updateFOV(x, y) {
      var sourceKey = x + "," + y;
      var cache = {};
      this.fovCache[sourceKey] = cache;
      var range = this.options.range;
      var callback = function callback(cellX, cellY, distance, visibility) {
        var targetKey = cellX + "," + cellY;
        var formFactor = range === 0 ? distance === 0 ? visibility : 0 : visibility * (1 - distance / range);
        if (formFactor === 0) {
          return;
        }
        cache[targetKey] = formFactor;
      };
      var fov = this.fov;
      if (!fov) {
        throw new Error('FOV algorithm must be set before computing lighting');
      }
      fov.compute(x, y, range, callback);
      return cache;
    };
    return Lighting;
  }();

  var Util = util;
  var Color = color;
  var Text = text;
  var Scheduler = scheduler;
  var FOV = fov;
  var Noise = noise;
  var Path = path;

  exports.AStar = AStar;
  exports.Action = Action;
  exports.Color = Color;
  exports.DEFAULT_HEIGHT = DEFAULT_HEIGHT;
  exports.DEFAULT_WIDTH = DEFAULT_WIDTH;
  exports.DIRS = DIRS;
  exports.Dijkstra = Dijkstra;
  exports.DiscreteShadowcasting = DiscreteShadowcasting;
  exports.Display = Display;
  exports.Engine = Engine;
  exports.EventQueue = EventQueue;
  exports.FOV = FOV;
  exports.KEYS = KEYS;
  exports.Lighting = Lighting;
  exports.Map = Map;
  exports.Noise = Noise;
  exports.Path = Path;
  exports.PreciseShadowcasting = PreciseShadowcasting;
  exports.RNG = RNG;
  exports.RecursiveShadowcasting = RecursiveShadowcasting;
  exports.Scheduler = Scheduler;
  exports.Simple = Simple;
  exports.Simplex = Simplex;
  exports.Speed = Speed;
  exports.StringGenerator = StringGenerator;
  exports.Text = Text;
  exports.Util = Util;

}));
