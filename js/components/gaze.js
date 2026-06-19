
import {Component} from './component.js' ;

// Orients the entity's mesh toward entity.blackboard.gazeTarget when one is
// set (e.g. the painting the guide is presenting). When no gaze target is
// active it does nothing, leaving orientation to LookAtForward (face the
// direction of travel). Register this component AFTER LookAtForward so that,
// while a gaze target is active, it has the final say on the mesh rotation.
class Gaze extends Component {

	constructor(data, entity){
		super(data, entity) ;
		this.register() ;
		entity.blackboard = entity.blackboard || {} ;
	}

	execute(dt){
		const target = this.entity.blackboard && this.entity.blackboard.gazeTarget ;
		if (!target || !this.entity.object3d) return ;
		// Girar en horizontal hacia el objetivo (mismo Y que el cuerpo) para que
		// la persona no se incline hacia arriba al mirar un cuadro alto.
		const flat = new BABYLON.Vector3(target.x, this.entity.object3d.position.y, target.z) ;
		this.entity.object3d.lookAt(flat) ;
	}
}

export {Gaze} ;
