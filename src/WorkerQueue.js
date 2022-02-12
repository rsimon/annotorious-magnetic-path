import cv from '@techstark/opencv-js';

const DEFAULT_FAST_THRESHOLD = 20;

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

const buildMap = (img, x, y) => {
  const scissors = new cv.segmentation_IntelligentScissorsMB();
  scissors.setEdgeFeatureCannyParameters(32, 100);
  scissors.setGradientMagnitudeMaxLimit(200);
  scissors.applyImage(img);

  // On each click!
  scissors.buildMap(new cv.Point(x, y));

  return scissors;
}

self.onmessage = function({data}) {
  const { action, x, y, image } = data;

  if (action === 'buildMap') {
    const img = cv.matFromImageData(image);

    const keypoints = new Uint16Array(detectCorners(img)).buffer;
    self.postMessage({ type: 'keypoints', result: keypoints }, [ keypoints ]);

    const scissors = buildMap(img, x, y);
    self.postMessage({ type: 'scissors', result: scissors });
  }
};
