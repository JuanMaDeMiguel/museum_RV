import { PRIMS } from '../prims.js';
import { Component } from './component.js';

// Componente para móviles articulados (estilo Calder): construye la jerarquía con
// PRIMS.calder y, en cada frame, hace girar cada varilla sobre su eje Y a su propia
// velocidad. Así las partes se mueven unas respecto de otras (articulado animado),
// a diferencia del componente rotation, que gira el objeto entero como un bloque.
class Mobile extends Component {
    constructor(data, entity) {
        super(data, entity);
        const group = PRIMS.calder(data.name || "mobile", data, entity.sim.scene);
        this.entity.object3d = group;
        // Varillas a animar, expuestas por el prim en metadata.
        this.arms = (group.metadata && group.metadata.calderArms) || [];
    }

    execute(dt) {
        for (const arm of this.arms) {
            arm.node.rotation.y += arm.vitesse;
        }
    }
}

export { Mobile };
