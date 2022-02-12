import Tool from '@recogito/annotorious/src/tools/Tool';

// import cv from '@techstark/opencv-js';

// import jsfeat from 'jsfeat';

/*
import MagneticPolyline from './MagneticPolyline';

const chunk = (array, size) => {	
  const chunked_arr = [];	

  let index = 0;	
  while (index < array.length) {	
      chunked_arr.push(array.slice(index, size + index));	
      index += size;	
  }	

  return chunked_arr;	
}

*/

export default class MagneticPolylineTool extends Tool {

  constructor(g, config, env) {
    super(g, config, env);

    // The 'rubberband' magnetic polyline
    this.rubberband = null;

    this.queue = new Worker(new URL('./WorkerQueue.js', import.meta.url));

    this.queue.onmessage = msg => {
      console.log('queue response', msg);
    };
    
    /* Init OpenCV magic
    cv.onRuntimeInitialized = () => {
      */

      // const img = cv.imread('map');
      // 
      // // const img = new cv.Mat();
      // // cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0);
// 
      // const dst = new cv.Mat();
			// cv.cvtColor(img, dst, cv.COLOR_RGB2GRAY.value, 0);
      
      /*
      const img = cv.imread('map');
      const greyscale = new cv.Mat();
      // You can try more different parameters
      cv.cvtColor(img, greyscale, cv.COLOR_RGB2GRAY);


      const dst = new cv.Mat();
      
      /*
      const blockSize = 2;
      const apertureSize = 3;
      const k = 0.05;
      */

      /*
      let kp = new cv.KeyPointVector();

      const fast = new cv.FastFeatureDetector(); // null, null, cv.FastFeatureDetector_TYPE_5_8);
      // fast.setNonmaxSuppression(false);
      fast.setThreshold(20);

      fast.detect(img, kp);

      cv.imshow('out', img);

      const canvas = document.getElementById('out');
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'red';

      for (let i=0; i<kp.size(); i++) {
        const { x, y } = kp.get(i).pt;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, 2 * Math.PI);
        ctx.fill();
      }
      */

      /*

      this.scissors = new cv.segmentation_IntelligentScissorsMB();
      this.scissors.setEdgeFeatureCannyParameters(32, 100);
      this.scissors.setGradientMagnitudeMaxLimit(200);
      this.scissors.applyImage(img);
      */
    // }
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