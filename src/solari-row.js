var SolariFlap = require('./solari-flap');
var _  = require('underscore');

var SolariRow = function (y, scene) {
  this.flaps = [];
  this.y = y || 0;
  this.x = 0;
  this.height = 0;
  this.spins = 0;
};

SolariRow.prototype = {
  add: function (textureSet) {
    var flap = new SolariFlap(textureSet, this.x + (textureSet.faceWidth / 2), -this.y);
    this.height = Math.max(this.height, textureSet.faceHeight * 2);
    this.x += textureSet.faceWidth + 6;
    this.flaps.push(flap);

    return this;
  },
  setChars: function (chars) {
    var maxSpins = 0;
    _.each(this.flaps, function (flap, i) {
      var f = flap.setChar(chars[i] ? chars[i] : ' ');
      if(f.spins > maxSpins){
        maxSpins = f.spins;
      }
    });
    this.spins = maxSpins;
    return this;
  }
};

module.exports = SolariRow;