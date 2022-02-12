import Flatbush from 'flatbush';
import Tool from '@recogito/annotorious/src/tools/Tool';
import { addClass } from '@recogito/annotorious/src/util/SVG';

import Crosshair from './Crosshair';
import { chunk, getImageData } from './Util';
import MagneticPolyline from './MagneticPolyline';

export default class MagneticPolylineTool extends Tool {

  constructor(g, config, env) {
    super(g, config, env);

    addClass(g.closest('svg'), 'no-cursor');

    // The 'rubberband' magnetic polyline
    this.rubberband = null;

    // Magnetic keypoints the mouse will snap to
    this.keypoints = [];
    this.keypointIndex = null;

    // Crosshair with snapping cursor
    this.crosshair = new Crosshair(g, env);
    
    // All computer vision happens in a background worker
    this.cv = new Worker(new URL('./CVWorker.js', import.meta.url));

    // Init the background CV pipeline
    this.cv.postMessage({
      action: 'init',
      image: getImageData(this.env.image)
    });

    this.attachListeners({ 
      mouseMove: this.onMouseMove
    });

    // CV response message handlers
    this.cv.onmessage = msg => {
      const { type } = msg.data;
      if (type === 'keypoints') {
        this.loadKeypoints(msg.data.result);
      } else if (type === 'scissorsInitialized') {
        // TODO cursor state!
        console.log('Scissors initialized');
      } else if (type === 'path') {
        if (this.rubberband)
          this.rubberband.setPath(msg.data.path);
      }
    };
  }

  loadKeypoints = buffer => {
    const keypoints = chunk(new Uint16Array(buffer), 2)
      .map(([x,y]) => ({x, y}));

    const index = new Flatbush(keypoints.length);

    for (const p of keypoints) {
      index.add(p.x, p.y, p.x, p.y);
    }
    
    index.finish();

    this.keypoints = keypoints;
    this.keypointIndex = index;

    console.log('Keypoints loaded'); 
  }

  startDrawing = () => {
    const { x, y } = this.crosshair.getCursorXY();
    
    this.rubberband = new MagneticPolyline([x, y], this.g);
    this.svg.addEventListener('mouseup', this.onMouseUp);

    this.cv.postMessage({ action: 'startScissors', x, y });
  }

  stop = () => {
    if (this.rubberband) {
      this.rubberband.destroy();
      this.rubberband = null;

      this.svg.removeEventListener('mouseup', this.onMouseUp);
    }
  }

  onMouseMove = (x, y) => {
    if (this.rubberband) {
      this.crosshair.setCursorXY(x, y);
      this.rubberband.dragTo([x, y]);
      this.cv.postMessage({ action: 'getPath', x, y });
    } else if (this.keypointIndex) {
      // Snap to closest keypoint
      const closest = this.keypointIndex.neighbors(x, y, 1, 20);
      const snapped = closest.length > 0 && this.keypoints[closest[0]];

      this.crosshair.setCursorXY(x, y, snapped);
    } else {
      this.crosshair.setCursorXY(x, y);
    }
  }

  onMouseUp = () => {
    this.rubberband?.onClick();
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