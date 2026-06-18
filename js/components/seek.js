
import {Component} from './component.js' ;

// Steering behavior (Reynolds): steer at max speed toward entity.blackboard.target.
// Requires a Newton entity (uses applyForce).
class Seek extends Component {

	constructor(data, entity){
		super(data, entity) ;
		this.register() ;
		this.vMax = data.vMax || 1.5 ;
	}

	execute(dt){
		const target = this.entity.blackboard && this.entity.blackboard.target ;
		if (!target) return ;

		const toTarget = target.subtract(this.entity.position) ;
		if (toTarget.length() < 0.001) return ;

		const vd = toTarget.normalize().scale(this.vMax) ;
		const force = vd.subtract(this.entity.velocity) ;
		this.entity.applyForce(force) ;
	}
}

export {Seek} ;
