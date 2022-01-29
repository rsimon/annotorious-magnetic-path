import simplify from 'simplify-js';

import { SVG_NAMESPACE } from '@recogito/annotorious/src/util/SVG';

const CROSS_SIZE = 20;

/**
 * Helper: chunks an array (i.e array to array of arrays)	
 */
const chunk = (array, size) => {	
  const chunked_arr = [];	

  let index = 0;	
  while (index < array.length) {	
      chunked_arr.push(array.slice(index, size + index));	
      index += size;	
  }	

  return chunked_arr;	
}

export default class MagneticPolyline {

  constructor(origin, scissors, g, env) {
    this.origin = origin;

    this.scissors = scissors;

    this.points = [];

    this.selection = document.createElementNS(SVG_NAMESPACE, 'g');
    this.selection.setAttribute('class', 'a9s-selection a9s-magnetic-polyline');

    // The mouse is followed by a cross marker, which will snap
    // to the nearest edge
    this.cross = document.createElementNS(SVG_NAMESPACE, 'g');
    this.cross.setAttribute('class', 'a9s-magnetic-polyline-marker');

    const v = document.createElementNS(SVG_NAMESPACE, 'line');
    v.setAttribute('x1', CROSS_SIZE / 2);
    v.setAttribute('y1', 0);
    v.setAttribute('x2', CROSS_SIZE / 2);
    v.setAttribute('y2', CROSS_SIZE);
    this.cross.appendChild(v);

    const h = document.createElementNS(SVG_NAMESPACE, 'line');
    h.setAttribute('x1', 0);
    h.setAttribute('y1', CROSS_SIZE / 2);
    h.setAttribute('x2', CROSS_SIZE);
    h.setAttribute('y2', CROSS_SIZE / 2);
    this.cross.appendChild(h);

    this.selection.appendChild(this.cross);

    g.appendChild(this.selection);
  }

  get element() {
    return this.selection;
  }

  dragTo = xy => {
    const contour = new cv.Mat();
    this.scissors.getContour(new cv.Point(xy[0], xy[1]), contour);

    const points = chunk(contour.data32S, 2)
      .map(xy => ({ x: xy[0], y: xy[1] }));
    
    const simplified = simplify(points, 1.0, true);

    const { x, y } = simplified[simplified.length - 2];
    this.cross.setAttribute('transform', `translate(${x - CROSS_SIZE / 2},${y - CROSS_SIZE / 2})`);
  }

}