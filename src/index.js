export default () => {

  cv['onRuntimeInitialized'] = () =>{

    let src = cv.imread('map');
    //cv.resize(src, src, new cv.Size(1024, 1024));
    
    cv.imshow('mapOut', src);

    let tool = new cv.segmentation_IntelligentScissorsMB();
    tool.setEdgeFeatureCannyParameters(32, 100);
    tool.setGradientMagnitudeMaxLimit(200);
    tool.applyImage(src);

    let hasMap = false;

    let canvas = document.getElementById('mapOut');

    canvas.addEventListener('click', e => {
        let startX = e.offsetX, startY = e.offsetY; console.log(startX, startY);
        if (startX < src.cols && startY < src.rows)
        {
            console.time('buildMap');
            tool.buildMap(new cv.Point(startX, startY));
            console.timeEnd('buildMap');
            hasMap = true;
        }
    });

    canvas.addEventListener('mousemove', e => {
        let x = e.offsetX, y = e.offsetY; //console.log(x, y);
        let dst = src.clone();
        if (hasMap && x >= 0 && x < src.cols && y >= 0 && y < src.rows)
        {
            let contour = new cv.Mat();
            tool.getContour(new cv.Point(x, y), contour);
            let contours = new cv.MatVector();
            contours.push_back(contour);
            let color = new cv.Scalar(255, 0, 0, 255);  // RGBA
            cv.polylines(dst, contours, false, color, 3, cv.LINE_8);
            contours.delete(); contour.delete();
        }
        cv.imshow('mapOut', dst);
        dst.delete();
    });
    canvas.addEventListener('dispose', e => {
        src.delete();
        tool.delete();
    });

  }

}