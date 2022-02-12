import { SVG_NAMESPACE } from '@recogito/annotorious/src/util/SVG';

// Temporary hack
const getPoints = d => {
  const tmp = d.replace('M', 'L');
  const coords = tmp.split('L').map(str => str.trim()).filter(str => str);
  return coords.map(xy => xy.split(' ').map(str => parseFloat(str)));
}

export default class MagneticPolyline {

  constructor(origin, g) {
    this.origin = origin;

    this.points = [ origin ];

    this.selection = document.createElementNS(SVG_NAMESPACE, 'g');
    this.selection.setAttribute('class', 'a9s-selection a9s-magnetic-polyline');

    this.completed = document.createElementNS(SVG_NAMESPACE, 'path');
    this.completed.setAttribute('fill', 'none');
    this.completed.setAttribute('stroke', '#0000ff');
    this.completed.setAttribute('stroke-width', '4');

    this.ghost = document.createElementNS(SVG_NAMESPACE, 'path');
    this.ghost.setAttribute('stroke', 'rgba(255, 96, 96, 0.9)');
    this.ghost.setAttribute('fill', 'none');
    this.ghost.setAttribute('stroke-width', '4');
    this.ghost.setAttribute('stroke-dasharray', '10 6');

    this.selection.appendChild(this.ghost);
    this.selection.appendChild(this.completed);

    g.appendChild(this.selection);
  }

  get element() {
    return this.selection;
  }

  dragTo = xy => {
    const [ x, y ] = xy;
    const [ lastX, lastY ] = this.points[this.points.length - 1];

    const d = `M ${lastX} ${lastY} L ${x} ${y}`;
    this.ghost.setAttribute('d', d);
  }

  setPath = d => {
    this.ghost.setAttribute('d', d);
  }

  onClick = () => {
    const [ _, ...nextLeg] = getPoints(this.ghost.getAttribute('d'));

    console.log(nextLeg);

    this.points = [...this.points, ...nextLeg];
    
    // this.completed.setAttribute('d', toPath(this.points.map(arr => ({ x: arr[0], y: arr[1] }))));
  }

}