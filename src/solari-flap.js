var THREE = require('three');

var DEG2RAD =  Math.PI / 180,
    SPEED = 1400.0,
    SolariFlap;

SolariFlap = function (textureSet, x, y) {
  var origX = x, origY = y;
  x = x + 3;
  y = y - 10;

  var flapWidth = textureSet.faceWidth * 3 / 4,
      flapHeight = textureSet.faceHeight * 2 / 3,
      top = new THREE.Mesh(
        new THREE.PlaneGeometry(flapWidth, flapHeight),
        textureSet.spriteMaterial),
      bottom = new THREE.Mesh(
        new THREE.PlaneGeometry(flapWidth, flapHeight),
        textureSet.spriteMaterial),
      flap = new THREE.Mesh(
        new THREE.CubeGeometry(flapWidth, flapHeight, 0, 1, 1, 1, [
            null, null, null, null,
            textureSet.spriteMaterial,
            textureSet.spriteMaterial
        ]),
        new THREE.MeshFaceMaterial()),
      varia = 1.1 - Math.random() * 0.2;

  this.SPEED = SPEED * DEG2RAD / 1000.0 * varia;

  this.textureSet = textureSet;
  this.top_g = top.geometry;
  this.bottom_g = bottom.geometry;
  this.flap_g = flap.geometry;
  this.top_g.dynamic = this.bottom_g.dynamic = this.flap_g.dynamic = true;

  bottom.position = new THREE.Vector3(x, y, 0);
  top.position = new THREE.Vector3(x, y + flapHeight, 0);
  flap.position = new THREE.Vector3(0, flapHeight/2, 0);

  this.flapWrapper = new THREE.Object3D();
  this.flapWrapper.position = new THREE.Vector3(x, y + flapHeight/2, 2);
  this.flapWrapper.add(flap);


  /*
   * Create a Rectangle 
   */
  // material
  var material = new THREE.LineBasicMaterial( { color: 0x071F2E, linewidth: 5 } );
  var dividerMaterial = new THREE.LineBasicMaterial( { color: 0x000000, linewidth: 2 } );

  // geometry
  var line = new THREE.Mesh(
        new THREE.PlaneGeometry(textureSet.faceWidth, textureSet.faceHeight * 2),
        material);
  line.position = new THREE.Vector3(origX, origY, 0);

  var dividerLine = new THREE.Mesh(
        new THREE.PlaneGeometry(textureSet.faceWidth, 1),
        dividerMaterial);
  dividerLine.position = new THREE.Vector3(origX, origY + 11, 0);
  // console.log(origX);

  this.objToRender = [top, bottom, this.flapWrapper, dividerLine, line];

  this.i = 0;
  this.setUpTextures(0, 1);
};

SolariFlap.prototype = {
  MAX_X: 180 * DEG2RAD,
  initialize: function (textureSet, x, y) {
    var flapWidth = textureSet.faceWidth,
        flapHeight = textureSet.faceHeight,
        top = new THREE.Mesh(
          new THREE.PlaneGeometry(flapWidth, flapHeight),
          textureSet.spriteMaterial),
        bottom = new THREE.Mesh(
          new THREE.PlaneGeometry(flapWidth, flapHeight),
          textureSet.spriteMaterial),
        flap = new THREE.Mesh(
          new THREE.CubeGeometry(flapWidth, flapHeight, 0, 1, 1, 1, [
              null, null, null, null,
              textureSet.spriteMaterial,
              textureSet.spriteMaterial
          ]),
          new THREE.MeshFaceMaterial()),
        varia = 1.1 - Math.random() * 0.2;

    this.SPEED = SPEED * DEG2RAD / 1000.0 * varia;

    this.textureSet = textureSet;
    this.top_g = top.geometry;
    this.bottom_g = bottom.geometry;
    this.flap_g = flap.geometry;
    this.top_g.dynamic = this.bottom_g.dynamic = this.flap_g.dynamic = true;

    bottom.position = new THREE.Vector3(x, y, 0);
    top.position = new THREE.Vector3(x, y + flapHeight, 0);
    flap.position = new THREE.Vector3(0, flapHeight/2, 0);

    this.flapWrapper = new THREE.Object3D();
    this.flapWrapper.position = new THREE.Vector3(x, y + flapHeight/2, 2);
    this.flapWrapper.add(flap);

    this.objToRender = [top, bottom, this.flapWrapper];

    this.i = 0;
    this.spins = 0;
    this.setUpTextures(0, 1);
  },
  setUpTextures: function (from, to) {
    /* Setting up the coming character. */
    var current = this.textureSet.UV[from],
        next = this.textureSet.UV[to];

    this.top_g.faceVertexUvs[0][0] = next.top;
    this.bottom_g.faceVertexUvs[0][0] = current.bottom;
    this.flap_g.faceVertexUvs[0][4] = current.top;
    this.flap_g.faceVertexUvs[0][5] = next.back;

    this.top_g.__dirtyUvs = this.bottom_g.__dirtyUvs = this.flap_g.__dirtyUvs = true;
  },
  setChar: function (ch) {
    var i = this.textureSet.chars.indexOf(ch);
    this.currentChar = i !== -1 ? i : this.textureSet.max;
    this.wedged = this.currentChar === this.i;
    
    var diff = this.currentChar - this.i;
    this.spins = 0;
    if (diff > 0){
      this.spins = diff;
    }else if (diff < 0){
      this.spins = this.textureSet.max + 1 + diff;
    }

    return this;
  },
  next: function () {
    window.Board.audio().play();
    clearTimeout(window.to);
    window.to = setTimeout(function(){
      window.Board.audio().pause();
      window.Board.audio().currentTime = 0;
    }, 200);
    this.i = this.i >= this.textureSet.max ? 0 : this.i + 1;
    var next = (this.i + 1 > this.textureSet.max) ? 0 : this.i + 1;
    this.setUpTextures(this.i, next);

    this.wedged = (this.currentChar === this.i);
  },
  update: function (diff) {
    if (this.wedged) {
      this.flapWrapper.rotation.x = 0;
      return true;
    }
    var x = this.flapWrapper.rotation.x;
    x += diff * this.SPEED;
    
    this.flapWrapper.rotation.x = x;
    if (x > this.MAX_X) {
      this.flapWrapper.rotation.x = 0;
      this.next();
    }
    return false;
  }
};

module.exports = SolariFlap;