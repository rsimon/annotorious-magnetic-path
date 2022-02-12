import Tool from '@recogito/annotorious/src/tools/Tool';

import { chunk, getImageData } from './Util';

/*
import MagneticPolyline from './MagneticPolyline';
*/

export default class MagneticPolylineTool extends Tool {

  constructor(g, config, env) {
    super(g, config, env);

    // The 'rubberband' magnetic polyline
    this.rubberband = null;

    // Magnetic keypoints the mouse will snap to
    this.keypoints = [];

    // All computer vision happens in a background worker
    this.cv = new Worker(new URL('./CVWorker.js', import.meta.url));

    // Init the background CV pipeline
    this.cv.postMessage({
      action: 'init',
      image: getImageData(this.env.image)
    });

    // TODO response message handlers
    this.cv.onmessage = msg => {
      const { type } = msg.data;
      if (type === 'keypoints') {
        this.loadKeypoints(msg.data.result);
      }
    };

    /*
    this.scissors = new cv.segmentation_IntelligentScissorsMB();
    this.scissors.setEdgeFeatureCannyParameters(32, 100);
    this.scissors.setGradientMagnitudeMaxLimit(200);
    this.scissors.applyImage(img);
    */
  }

  loadKeypoints = buffer => {
    // const arr = [ ...buffer ];
    this.keypoints = chunk(new Uint16Array(buffer), 2)
      .map(([x,y]) => ({x, y}));
    
    console.log('Keypoints loaded'); 
  }

  startDrawing = (x, y) => {
    const w = this.env.image.naturalWidth;
    const h = this.env.image.naturalHeight;

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(this.env.image, 0, 0);
    
    this.queue.postMessage({
      action: 'buildMap',
      x, y,
      image: ctx.getImageData(0, 0, w, h)
    });
    
    /*
    this.queue.onmessage = msg => {
      console.log('queue response', msg);
    };
    */

    // this.scissors.buildMap(new cv.Point(x, y));
    
    /*
    console.timeEnd('Building map');
   
    this.attachListeners({
      mouseMove: this.onMouseMove,
      mouseUp: this.onMouseUp
    });

    this.rubberband = new MagneticPolyline([x, y], this.scissors, this.g, this.env);
    */
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
    this.rubberband.onClick();

    const [x, y] = this.rubberband.points[this.rubberband.points.length - 1];
    
    console.time('Building map'); 
    this.scissors.buildMap(new cv.Point(x, y));
    console.timeEnd('Building map');

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