'use strict';

var Base = require('./Base');
var Joint = require('./Joint');
var Entity = require('./Entity');
var Detail = require('./Detail');
var Colors = Base.Colors;
var Fonts = Base.Fonts;
var WallModel = require('../Entities/Wall');

var Wall = function(wall) {
  if (!wall) {
    throw 'Wall object must be defined';
  }
  Entity.call(this, wall, Wall.container);
};

Wall.CreateFromModel = function(wall) {
  return new Wall(wall);
};

Wall.CreateFromPoint = function(x, y, parent, options) {
  var wall = new WallModel(x, y, parent, options);
  return new Wall(wall);
};

Wall.prototype.destroy = function() {
  for (var i in this.joints) {
    this.joints[i].destroy(this.graphics);
  }
  Entity.prototype.destroyGraphics.call(this, Wall.container, this.graphics);
  this.destroyGraphics(Wall.container);
  Entity.prototype.destroy.call(this);
};

Wall.prototype.createGraphics = function(wall) {
  this.graphics = Entity.prototype.createGraphics.call(this, Wall.container);
  this.joints = [];
  var corners = wall.getCorners();
  for (var j in corners) {
    var c = corners[j];
    var joint = new Joint(c, Wall.texture);
    joint.createGraphics(this.graphics);
    this.joints.push(joint);
  }
};

Wall.prototype.render = function(options) {
  if (!Wall.detail.level) {
    this.graphics.clear();
    return;
  }
  Entity.prototype.render.call(this, this.graphics);
  var wall = this.entityModel;
  var corners = wall.getCorners();

  // init render
  if (!this.graphics && Wall.detail.level > 0) {
    this.createGraphics(wall);
  } else {
    this.graphics.clear();
    // color on hover
  }

  if (Wall.detail.level > 0) {
    //this.display.beginFill(Colors.Wall, 0.1);
    this.graphics.lineStyle(wall.getWidth(), this.hover ? Colors.Hover : Colors.Wall);
    //this.graphics.moveTo(corners[0][0], corners[0][1]);
    var points = [];
    for (var i = 0; i < corners.length; i++) {
      //this.graphics.lineTo(corners[i][0], corners[i][1]);
      points.push(corners[i].pos[0], corners[i].pos[1]);
      this.joints[i].render();
    }
    this.graphics.drawPolygon(points);
    //this.display.endFill();
  }
  if (Wall.detail.level > 1) {
    /*this.graphics.beginFill(this.hover ? Colors.Hover : Colors.Joint);
    for (var j in this.joints) {
      if (this.joints[j].hover) {

      }
      this.graphics.drawShape(this.joints[j].circle);
    }
    this.graphics.endFill();*/
  }
};

Wall.prototype.addCorner = function(x, y) {
  var wall = this.entityModel;
  var j = wall.addCorner(x, y);
  var joint = new Joint(j, Wall.texture);
  joint.createGraphics(this.graphics);
  this.joints.push(joint);
};

Wall.texture = null; // wall joints texture
Wall.detail = new Detail(2);

module.exports = Wall;
