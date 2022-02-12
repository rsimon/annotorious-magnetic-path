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

    this.el.appendChild(this.v);
    this.el.appendChild(this.h);

    g.appendChild(this.el);
  }

  setPos = (x, y) => {
    this.v.setAttribute('x1', x);
    this.v.setAttribute('x2', x);
    
    this.h.setAttribute('y1', y);
    this.h.setAttribute('y2', y);
  }

  destroy = () => {
    this.el.parentElement.removeChild(this.el);
  }

}