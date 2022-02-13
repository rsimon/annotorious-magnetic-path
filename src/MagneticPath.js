import { Selection, ToolLike } from '@recogito/annotorious/src/tools/Tool';
import { SVG_NAMESPACE } from '@recogito/annotorious/src/util/SVG';

const pointsToPath = points => {
  const [[x, y], ...rest] = points;
  return `M ${x} ${y} ` +
    rest.map(([x,y]) => `L ${x} ${y}`).join(' ');
}

export const pointsToSVGTarget = (points, image) => ({
  source: image?.src,
  selector: {
    type: "SvgSelector",
    value: `<svg><polygon points="${points.map(t => `${t[0]},${t[1]}`).join(' ')}" /></svg>`
  }
});

export default class MagneticPath extends ToolLike {

  constructor(origin, g, config, env) {
    super(g, config, env);

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

    this.closeHandle = this.drawHandle(origin[0], origin[1]);
    this.closeHandle.style.display = 'none';

    this.selection.appendChild(this.draftPath);
    this.selection.appendChild(this.confirmedPath);
    this.selection.appendChild(this.closeHandle);

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

    // Display close handle if distance < 40px
    const d = this.getDistanceToStart(xy);
    if (d < 40) {
      this.closeHandle.style.display = null;
    } else { 
      this.closeHandle.style.display = 'none';
    }
  }

  getDistanceToStart = xy => {
    if (this.confirmedPoints.length < 3)
      return Infinity; // Just return if not at least 3 points

    const dx = Math.abs(xy[0] - this.confirmedPoints[0][0]);
    const dy = Math.abs(xy[1] - this.confirmedPoints[0][1]);

    return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)) / this.scale;
  }

  setDraftPath = points => {
    this.draftPoints = points;
    this.redraw();
  }

  onClick = () => {
    this.confirmedPoints = [ ...this.confirmedPoints, ...this.draftPoints ];
    this.redraw();

    if (this.isClosable()) {
      const points = this.confirmedPoints.slice(0, -1);
      const selection = new Selection(pointsToSVGTarget(points, this.env.image));
      this.emit('close', { shape: this.selection, selection });
    }
  }

  isClosable = () => {
    const xy = this.confirmedPoints[this.confirmedPoints.length - 1];
    const d = this.getDistanceToStart(xy);
    return d < 6 * this.scale;
  }

}