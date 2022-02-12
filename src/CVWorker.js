import cv from '@techstark/opencv-js';

const DEFAULT_FAST_THRESHOLD = 20;

/**
 * Runs the FAST keypoint detection algorithm from OpenCV.
 */
const detectCorners = (image, optThreshold) => {
  const img = cv.matFromImageData(image);
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

const buildMap = (img, x, y) => {
  const scissors = new cv.segmentation_IntelligentScissorsMB();
  scissors.setEdgeFeatureCannyParameters(32, 100);
  scissors.setGradientMagnitudeMaxLimit(200);
  scissors.applyImage(img);

  // On each click!
  scissors.buildMap(new cv.Point(x, y));

  return scissors;
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

    lazy(() => detectCorners(image))
      .then(result => {
        const keypoints = new Uint16Array(result).buffer;
        self.postMessage({ type: 'keypoints', result: keypoints }, [ keypoints ]);
      });
  } else if (action === 'buildMap') {

    // TODO
    
    const scissors = buildMap(img, x, y);
    self.postMessage({ type: 'scissors', result: scissors });
  }
};
