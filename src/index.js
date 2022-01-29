import MagneticPolylineTool from './MagneticPolylineTool';

const MagneticPolylinePlugin = anno => {

  anno.addDrawingTool(MagneticPolylineTool);
  
}

export default MagneticPolylinePlugin;