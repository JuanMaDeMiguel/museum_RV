import { PRIMS } from '../prims.js';
import { Component } from './component.js';

class Rotation extends Component {

  constructor(data, entity) {
    super(data, entity);

    const x = data.x || 0.0;
    const y = data.y || 0.0;
    const z = data.z || 0.0;

    // Guardamos la velocidad de rotación
    this.alpha = data.alpha || 0.0;

    if (this.entity.object3d != null) {
      this.entity.rotation.set(x, y, z);
      this.entity.object3d.rotation = new BABYLON.Vector3(x, y, z);
    }
  }

  execute(dt) {
    // Si hay velocidad de rotación, se la sumamos al eje Y en cada frame
    if (this.alpha !== 0.0 && this.entity.object3d != null) {
      this.entity.object3d.rotation.y += this.alpha;
    }
  }
}

export { Rotation };
