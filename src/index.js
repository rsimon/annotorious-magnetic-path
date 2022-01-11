import simplify from 'simplify-js';

/**
 * Helper: chunks an array (i.e array to array of arrays)	
 */
const chunk = (array, size) => {	
  const chunked_arr = [];	

  let index = 0;	
  while (index < array.length) {	
      chunked_arr.push(array.slice(index, size + index));	
      index += size;	
  }	

  return chunked_arr;	
}

const toAnnotation = coords => ({
  "@context": "http://www.w3.org/ns/anno.jsonld",
  "id": "#contour",
  "type": "Annotation",
  "body": [],
  "target": {
    "selector": [{
      "type": "SvgSelector",
      "value": `<svg><polygon points='${coords.map(xy => xy.join(',')).join(' ')}'></polygon></svg>`
    }]
  }
});

export default anno => {

  cv.onRuntimeInitialized = () => {
    console.log('Tool init');

    const image = document.getElementById('map');

    const src = cv.imread('map');
    
    const tool = new cv.segmentation_IntelligentScissorsMB();
    tool.setEdgeFeatureCannyParameters(32, 100);
    tool.setGradientMagnitudeMaxLimit(200);
    tool.applyImage(src);

    let hasMap = false;

    image.addEventListener('click', evt => {
      const { offsetX, offsetY } = evt;
      
      if (offsetX < src.cols && offsetY < src.rows) {
        console.time('Building map');
        tool.buildMap(new cv.Point(offsetX, offsetY));
        console.timeEnd('Building map');
        hasMap = true;
      }
    });

    image.addEventListener('mousemove', e => {
      const x = e.offsetX;
      const y = e.offsetY; 

      if (hasMap && x >= 0 && x < src.cols && y >= 0 && y < src.rows) {
        const contour = new cv.Mat();
        tool.getContour(new cv.Point(x, y), contour);

        const points = chunk(contour.data32S, 2).map(xy => ({ x: xy[0], y: xy[1] }));
        const simplified = simplify(points, 5, true).map(({x,y}) => [x, y]);

        const asAnnotation = toAnnotation(simplified);
        anno.addAnnotation(asAnnotation);        
      }
    });

    image.addEventListener('dispose', e => {
      src.delete();
      tool.delete();
    });
  }

}