import { PRIMS } from '../prims.js';
import { Component } from './component.js';

class Model extends Component {
    constructor(data, entity) {
        super(data, entity);
        const container = PRIMS.model(data.name || "model", data, entity.sim.scene);
        this.entity.object3d = container;
    }
}

export { Model };
