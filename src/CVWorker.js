import cv from '@techstark/opencv-js';
import simplify from 'simplify-js';

import { chunk } from './Util';

const DEFAULT_FAST_THRESHOLD = 20;

let scissors = null;

/**
 * Runs the FAST keypoint detection algorithm from OpenCV.
 */
const detectCorners = (img, optThreshold) => {
  const kp = new cv.KeyPointVector();

  const fast = new cv.FastFeatureDetector();
  fast.setThreshold(optThreshold || DEFAULT_FAST_THRESHOLD);
  fast.detect(img, kp);

  const arr = [];

  for (let i=0; i<kp.size(); i++) {
    const { x, y } = kp.get(i).pt;
    arr.push(x);
    arr.push(y);
  }

  return arr;
}

const getPath = (x, y) => {
  const contour = new cv.Mat();
  scissors.getContour(new cv.Point(x, y), contour);

  const points = chunk(contour.data32S, 2)
    .map(xy => ({ x: xy[0], y: xy[1] }));

  return simplify(points, 3.5, true)
   .map(({x, y}) => ([x, y]));
}

/**
 * Helper: executes the function immediately if OpenCV is
 * ready, or waits until it is and executes then.
 */
const lazy = fn => new Promise(resolve => {
  const isLoaded = !!cv?.Mat;

  if (isLoaded)
    resolve(fn());
  else
    cv.onRuntimeInitialized = () => resolve(fn());
});

/** Handle incoming messages **/
self.onmessage = function({data}) {
  const { action, image, x, y } = data;

  if (action === 'init') {
    console.log('Initializing OpenCV worker');

    lazy(() => {
      const img = cv.matFromImageData(image);

      // Compute keypoints
      const keypoints = detectCorners(img);

      // Initialize intelligent scissors
      scissors = new cv.segmentation_IntelligentScissorsMB();
      scissors.setEdgeFeatureCannyParameters(32, 100);
      scissors.setGradientMagnitudeMaxLimit(200);
      scissors.applyImage(img);

      return keypoints;
    }).then(keypoints => {
        const buffer = new Uint16Array(keypoints).buffer;
        self.postMessage({ type: 'keypoints', result: buffer }, [ buffer ]);
      });
  } else if (action === 'startScissors') {
    console.time('Building map');
    scissors.buildMap(new cv.Point(x, y));
    console.timeEnd('Building map');

    self.postMessage({ type: 'scissorsInitialized' });
  } else if (action === 'getPath') {
    const path = getPath(x, y);
    self.postMessage({ type: 'path', path });
  }
};
