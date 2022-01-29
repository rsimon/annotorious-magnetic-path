import Tool from '@recogito/annotorious/src/tools/Tool';

import MagneticPolyline from './MagneticPolyline';

export default class MagneticPolylineTool extends Tool {

  constructor(g, config, env) {
    super(g, config, env);

    // The 'rubberband' magnetic polyline
    this.rubberband = null;

    // Init OpenCV magic
    cv.onRuntimeInitialized = () => {
      console.log('Initializing smart scissors');
      const img = cv.imread(this.env.image);

      this.scissors = new cv.segmentation_IntelligentScissorsMB();
      this.scissors.setEdgeFeatureCannyParameters(32, 100);
      this.scissors.setGradientMagnitudeMaxLimit(200);
      this.scissors.applyImage(img);
      console.log('Done.');
    }
  }

  startDrawing = (x, y) => {
    this.g.parentNode.style.cursor = 'none';

    console.time('Building map');
    this.scissors.buildMap(new cv.Point(x, y));
    console.timeEnd('Building map');

    this.attachListeners({
      mouseMove: this.onMouseMove,
      mouseUp: this.onMouseUp
    });

    this.rubberband = new MagneticPolyline([x, y], this.scissors, this.g, this.env);
  }

  stop = () => {
    if (this.rubberband) {
      this.rubberband.destroy();
      this.rubberband = null;
    }
  }

  onMouseMove = (x, y) =>
    this.rubberband.dragTo([x, y]);

  onMouseUp = () => {

  }

  get isDrawing() {
    return this.rubberband != null;
  }

  // TODO 
  createEditableShape = annotation => {
    throw 'Coming soon';
  }

}

MagneticPolylineTool.identifier = 'magnetic-polyline';

MagneticPolylineTool.supports = annotation => {
  // TODO
}