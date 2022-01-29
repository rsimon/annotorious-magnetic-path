import MagneticPolylineTool from './MagneticPolylineTool';

import './MagneticPolyline.scss';

const MagneticPolylinePlugin = anno => {

  anno.addDrawingTool(MagneticPolylineTool);
  
}

export default MagneticPolylinePlugin;