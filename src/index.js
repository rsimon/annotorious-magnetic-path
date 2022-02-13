import MagneticPathTool from './MagneticPathTool';

import './MagneticPath.scss';

const MagneticPathPlugin = anno => {

  anno.addDrawingTool(MagneticPathTool);
  
}

export default MagneticPathPlugin;