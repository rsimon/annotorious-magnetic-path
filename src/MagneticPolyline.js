import { SVG_NAMESPACE } from '@recogito/annotorious/src/util/SVG';

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
    if (this.confirmedPoints.length > 0) {
      const confirmed = pointsToPath(this.confirmedPoints);
      this.confirmedPath.setAttribute('d', confirmed);
    }

    const draft = pointsToPath(this.draftPoints);
    this.draftPath.setAttribute('d', draft);
  }

  dragTo = xy => {
    // As long as there is no computed path,
    // just connect draft start + mouse pos
    if (this.draftPoints.length < 3) {
      this.draftPoints = [ this.draftPoints[0], xy];
      this.redraw();
    }
  }

  setDraftPath = points => {
    this.draftPoints = points;
    this.redraw();
  }

  onClick = () => {
    this.confirmedPoints = [ ...this.confirmedPoints, ...this.draftPoints ];
    this.redraw();
  }

}