
import {Component} from './component.js' ;

// Orients the entity's mesh toward its direction of travel (velocity).
class LookAtForward extends Component {

	constructor(data, entity){
		super(data, entity) ;
		this.register() ;
		this.minSpeed = data.minSpeed || 0.05 ;
	}

	execute(dt){
		if (!this.entity.object3d) return ;
		const v = this.entity.velocity ;
		if (!v || v.length() < this.minSpeed) return ;
		const target = this.entity.position.add(v) ;
		this.entity.object3d.lookAt(target) ;
	}
}

export {LookAtForward} ;
