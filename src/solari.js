var THREE = require('three');
var _ = require('underscore');
var Events = require('backbone-events');
var SolariTexture = require('./solari-texture');
var SolariRow = require('./solari-row');

String.prototype.rpad = function (padString, length) {
  var str = this;
  while (str.length < length) {
    str = str + padString;
  }
  return str;
};

String.prototype.truncate = function (length) {
  this.length = length;
  return this;
};

window.requestAnimFrame = (function (callback) {
  return window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.oRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  function (callback) {
    window.setTimeout(callback, 1000 / 60);
  };
}());

var Solari = function () {
  this.animate = false;
  this.flaps = [];
  this.rows = [];
  this.y = -60;
  this.width = window.innerWidth;
  this.height = window.innerHeight;
  this.aspect = this.width / this.height;
  this.renderer = new THREE.WebGLRenderer();
  this.renderer.sortObjects = false;

  this.camera = new THREE.PerspectiveCamera(
    20.0,
    window.innerWidth / window.innerHeight,
    this.NEAR,
    this.FAR
  );
  this.scene = new THREE.Scene();

  this.renderer.setSize(this.width, this.height);

  // Removed ambient light
  // this.pointLight = new THREE.PointLight(0xFFFFFF);
  // this.ambientLight = new THREE.AmbientLight(0x333333);

  // this.pointLight.position.x = 600;
  // this.pointLight.position.y = -300;
  // this.pointLight.position.z = 300;

  // this.scene.add(this.pointLight);
  // this.scene.add(this.ambientLight);

  // Pull the camera back
  this.camera.position.z = 3200;
  this.camera.lookAt(new THREE.Vector3(0, 0, 0));

  this.spins = 0;
  this.el = this.renderer.domElement;
  this.started = false;
};

Solari.prototype = _.extend({
  VIEW_ANGLE: 45,
  NEAR: 1,
  FAR: 10000,
  render: function () {
    this.renderer.render(this.scene, this.camera);
    if(this.showStats) this.stats.update();
  },
  add: function (row) {
    this.rows.push(row);
    this.flaps = this.flaps.concat(row.flaps);

    var self = this;
    _.each(row.flaps, function (flap) {
      _.each(flap.objToRender, function (obj) {
       self.scene.add(obj);
      });
    });
    this.y += row.height + 10;

    this.camera.position.x = (row.x - 10) / 2;
    this.camera.position.y = -((row.y - (row.height/2)) / 2);

    window.addEventListener('resize', _.bind(this.resizeHandler, this));

    return this;
  },
  update: function (diff) {
    var i,
        flaps = this.flaps,
        done = true;

    for (i = 0; i < flaps.length; i++) {
      done = flaps[i].update(diff) && done;
    }
    return done;
  },
  start: function () {
    if (this.started) {return};
    var self = this,
        lastTime = new Date().getTime();

    function animate () {
      // update
      var time = new Date().getTime();
      var timeDiff = time - lastTime;
      lastTime = time;

      // render
      self.anim = !self.update(timeDiff);
      self.render();

      // request new frame
      if (self.anim) {
        requestAnimFrame(animate);
      } else {
        setTimeout(function () {
          animate((new Date().getTime()));
        }, 2000);
      }

    }
    animate();
    this.trigger('start');
    this.started = true;
  },
  setMessage: function (msg) {
    var maxSpins = 0;
    _.each(this.rows, function (row, i) {
      var r = row.setChars(msg[i] ? msg[i] : ' ');
      if(r.spins > maxSpins){
        maxSpins = r.spins;
      }
    });
    this.spins = maxSpins;
    console.log("Spins: " + this.spins);
    return this;
  },
  resizeHandler: function () {
    var w = window.innerWidth;
    var h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);

    this.render();
  }
}, Events);

module.exports = { Solari: Solari, SolariRow: SolariRow, SolariTexture: SolariTexture };
