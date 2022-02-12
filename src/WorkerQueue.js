import cv from '@techstark/opencv-js';

const DEFAULT_FAST_THRESHOLD = 20;

const detectCorners = (imageData, optThreshold) => {
  const img = cv.matFromImageData(imageData);
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

self.onmessage = function({data}) {
  const { action, x, y, image } = data;

  if (action === 'buildMap') {
    const keypoints = new Uint16Array(detectCorners(image)).buffer;
    self.postMessage({ type: 'keypoints', result: keypoints }, [ keypoints ]);
  }
};
