import { SVG_NAMESPACE } from '@recogito/annotorious/src/util/SVG';

export default class Crosshair {

  constructor(g, env) {
    this.el = document.createElementNS(SVG_NAMESPACE, 'g');
    this.el.setAttribute('class', 'a9s-crosshair');

    this.v = document.createElementNS(SVG_NAMESPACE, 'line');
    this.v.setAttribute('y1', 0);
    this.v.setAttribute('y2', env.image.naturalHeight);

    this.h = document.createElementNS(SVG_NAMESPACE, 'line');
    this.h.setAttribute('x1', 0);
    this.h.setAttribute('x2', env.image.naturalWidth);

    this.cursor = document.createElementNS(SVG_NAMESPACE, 'circle');
    this.cursor.setAttribute('r', 3.5);

    this.el.appendChild(this.v);
    this.el.appendChild(this.h);
    this.el.appendChild(this.cursor);

    g.appendChild(this.el);
  }

  setPos = (x, y, optSnapped) => {
    this.v.setAttribute('x1', x);
    this.v.setAttribute('x2', x);
    
    this.h.setAttribute('y1', y);
    this.h.setAttribute('y2', y);

    if (optSnapped) {
      this.cursor.setAttribute('cx', optSnapped.x);
      this.cursor.setAttribute('cy', optSnapped.y);
    } else {
      this.cursor.setAttribute('cx', x);
      this.cursor.setAttribute('cy', y);
    }
  }

  destroy = () => {
    this.el.parentElement.removeChild(this.el);
  }

}