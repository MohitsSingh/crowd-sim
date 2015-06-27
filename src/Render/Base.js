'use strict';

var Colors = {
  Hover: 0x646729,
  Context: 0xe1eca0,
  Agent: 0xFF0000,
  Wall: 0x00FF00,
  Joint: 0xFFFFFF,
  Path: 0xe00777,
  Waypoint: 0x7a7a7a,
  Forces: {desired: 0xfffff,
          agents: 0xFF0000,
          walls: 0xc49220
          }
};

var Fonts = {
  default: {font: '2px Mono monospace', fill: 0xFFFFFF,
  align: 'center'},
  resolution: 12
};

module.exports.Colors = Colors;
module.exports.Fonts = Fonts;