import { SVG_NAMESPACE } from '@recogito/annotorious/src/util/SVG';

/* Temporary hack
const getPoints = d => {
  const tmp = d.replace('M', 'L');
  const coords = tmp.split('L').map(str => str.trim()).filter(str => str);
  return coords.map(xy => xy.split(' ').map(str => parseFloat(str)));
}
*/

const pointsToPath = points => {
  const [[x, y], ...rest] = points;
  return `M ${x} ${y} ` +
    rest.map(([x,y]) => `L ${x} ${y}`).join(' ');
}

export default class MagneticPolyline {

  constructor(origin, g) {
    // Array of points, confirmed path 
    this.confirmedPoints = [];

    // Array of points, draft path
    this.draftPoints = [ origin ];

    // SVG elements
    this.selection = document.createElementNS(SVG_NAMESPACE, 'g');
    this.selection.setAttribute('class', 'a9s-selection a9s-magnetic-path');

    this.confirmedPath = document.createElementNS(SVG_NAMESPACE, 'path');
    this.confirmedPath.setAttribute('class', 'a9s-magnetic-path-confirmed');

    this.draftPath = document.createElementNS(SVG_NAMESPACE, 'path');
    this.draftPath.setAttribute('class', 'a9s-magnetic-path-draft');

    this.selection.appendChild(this.draftPath);
    this.selection.appendChild(this.confirmedPath);

    g.appendChild(this.selection);
  }

  get element() {
    return this.selection;
  }

  redraw = () => {
    const d = pointsToPath(this.draftPoints);
    this.draftPath.setAttribute('d', d);
  }

  dragTo = xy => {
    this.draftPoints = [...this.draftPoints, xy];
    this.redraw();
  }

  setDraftPath = points => {
    this.draftPoints = points;
    this.redraw();
  }

  onClick = () => {
    /*
    const [ _, ...nextLeg] = getPoints(this.ghost.getAttribute('d'));

    console.log(nextLeg);

    this.points = [...this.points, ...nextLeg];
    
    // this.completed.setAttribute('d', toPath(this.points.map(arr => ({ x: arr[0], y: arr[1] }))));
    */
  }

}