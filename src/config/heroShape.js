// Exact outline of the hero photo, taken from the Figma "Vector" layer (node 40:10, file "Plants Project").
//
// How it was made (so you can redo it if the design changes):
//   1. Figma gives the vector's path in its own box (1411 x 1228 px) plus a 2.42 degree rotation
//      and its position inside the 1440 x 1024 "Hero 2 Page" frame.
//   2. Every point was rotated/moved into frame coordinates, then shifted so (0, 0) is the
//      frame point x=520, y=175. The frame clips the shape on the right (x=1440) and bottom;
//      the page does the same by letting the photo bleed off the right edge and the hero's bottom.
//   3. Result: one closed path in a 920 x 1246 coordinate box.
//
// The shape is NOT squashed on different screens: the SVG in Home.jsx scales it evenly (same
// proportions), and CSS in home.css sets how wide it is.
export const HERO_SHAPE = {
  width: 920,
  height: 1246,
  path: 'M1474.4,486.1 C1460.2,596.5 1214.6,626.8 1130.6,748.8 C1046.7,870.9 1139.3,999.6 1054.8,1096.4 C970.3,1193.1 852.1,1220.5 708.1,1232.5 C564.1,1244.5 458.1,1226.4 334.8,1156.2 C211.5,1086.1 133.3,1004.3 91.4,881.7 C49.5,759.1 129,676.7 125.3,543 C121.6,409.4 11,292.4 73,213.4 C134.9,134.4 318.4,189.4 435.1,148 C551.8,106.7 565.7,10.4 656.4,6.7 C747,2.9 779.6,91.1 888.6,129.1 C997.6,167.1 1084.4,125.2 1201.5,196.6 C1318.7,268 1488.6,375.7 1474.4,486.1 Z',
};
