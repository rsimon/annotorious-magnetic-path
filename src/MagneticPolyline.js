import simplify from 'simplify-js';
// import cv from '@techstark/opencv-js';

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

const toPath = points => {
  const [first, ...rest] = points;
  return `M ${first.x} ${first.y} ` +
    rest.map(({x,y}) => `L ${x} ${y}`).join(' ');
}

// Temporary hack
const getPoints = d => {
  const tmp = d.replace('M', 'L');
  const coords = tmp.split('L').map(str => str.trim()).filter(str => str);
  return coords.map(xy => xy.split(' ').map(str => parseFloat(str)));
}

export default class MagneticPolyline {

  constructor(origin, scissors, g, env) {
    this.origin = origin;

    this.scissors = scissors;

    this.points = [ origin ];

    this.selection = document.createElementNS(SVG_NAMESPACE, 'g');
    this.selection.setAttribute('class', 'a9s-selection a9s-magnetic-polyline');

    this.completed = document.createElementNS(SVG_NAMESPACE, 'path');
    this.completed.setAttribute('fill', 'none');
    this.completed.setAttribute('stroke', '#0000ff');
    this.completed.setAttribute('stroke-width', '4');

    this.mousePoint = document.createElementNS(SVG_NAMESPACE, 'circle');
    this.mousePoint.setAttribute('r', 3)
    this.mousePoint.setAttribute('fill', 'red');

    this.ghost = document.createElementNS(SVG_NAMESPACE, 'path');
    this.ghost.setAttribute('stroke', 'rgba(255, 96, 96, 0.9)');
    this.ghost.setAttribute('fill', 'none');
    this.ghost.setAttribute('stroke-width', '4');
    this.ghost.setAttribute('stroke-dasharray', '10 6');

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
    this.selection.appendChild(this.completed);

    g.appendChild(this.mousePoint);
    g.appendChild(this.ghost);
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

    const simplifiedMuch = simplify(points, 3.5, true);

    // Identify last relevant corner
    const p1 = simplifiedMuch[simplifiedMuch.length - 1];
    const p2 = simplifiedMuch[simplifiedMuch.length - 2];

    if (simplifiedMuch.length > 1) {
      const dist = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
      if (dist < 30) 
        simplifiedMuch.pop();

      const d = toPath(simplifiedMuch);
      this.ghost.setAttribute('d', d);

      // const { x, y } = simplified[simplified.length - 1];
      // this.cross.setAttribute('transform', `translate(${x - CROSS_SIZE / 2},${y - CROSS_SIZE / 2})`);
    }

    this.mousePoint.setAttribute('cx', xy[0]);
    this.mousePoint.setAttribute('cy', xy[1]);
  }

  onClick = () => {
    const [ _, ...nextLeg] = getPoints(this.ghost.getAttribute('d'));

    console.log(nextLeg);

    this.points = [...this.points, ...nextLeg];
    
    this.completed.setAttribute('d', toPath(this.points.map(arr => ({ x: arr[0], y: arr[1] }))));
  }

}