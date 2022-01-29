import { SVG_NAMESPACE } from '@recogito/annotorious/src/util/SVG';

const CROSS_SIZE = 20;

export default class MagneticPolyline {

  constructor(originX, originY, g, env) {
    this.origin = [ originX, originY ];

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
    const x = xy[0] - CROSS_SIZE / 2;
    const y = xy[1] - CROSS_SIZE / 2;
    this.cross.setAttribute('transform', `translate(${x},${y})`);
  }

}