
import {Component} from './component.js' ;

// Steering behavior (Reynolds): like Seek, but ramps speed down inside
// slowRadius so the entity stops smoothly instead of oscillating on the target.
class Arrive extends Component {

	constructor(data, entity){
		super(data, entity) ;
		this.register() ;
		this.vMax = data.vMax || 1.5 ;
		this.slowRadius = data.slowRadius || 2.0 ;
	}

	execute(dt){
		const target = this.entity.blackboard && this.entity.blackboard.target ;
		if (!target) return ;

		const toTarget = target.subtract(this.entity.position) ;
		const dist = toTarget.length() ;
		if (dist < 0.001) return ;

		const speed = dist < this.slowRadius ? this.vMax * (dist / this.slowRadius) : this.vMax ;
		const vd = toTarget.normalize().scale(speed) ;
		const force = vd.subtract(this.entity.velocity) ;
		this.entity.applyForce(force) ;
	}
}

export {Arrive} ;
