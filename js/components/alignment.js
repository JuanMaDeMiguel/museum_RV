
import {Component} from './component.js' ;

// Flocking rule (Reynolds): ALIGNMENT.
// Steers the entity so its velocity matches the average velocity of its
// neighbours, making the group move in the same direction:
//
//   vm = (1/|neighbours|) · Σ vj
//   Fa = vm − vi
//
class Alignment extends Component {

	constructor(data, entity){
		super(data, entity) ;
		this.register() ;
		this.group  = data.group  || [] ;
		this.radius = data.radius || 4.0 ;
		this.k      = data.k !== undefined ? data.k : 1.0 ;
	}

	execute(dt){
		const p = this.entity.position ;
		const vm = new BABYLON.Vector3(0, 0, 0) ;
		let count = 0 ;
		for (const other of this.group){
			if (other === this.entity || !other.velocity) continue ;
			if (BABYLON.Vector3.Distance(p, other.position) < this.radius){
				vm.addInPlace(other.velocity) ;
				count++ ;
			}
		}
		if (count === 0) return ;
		vm.scaleInPlace(1.0 / count) ;                 // average neighbour velocity

		const force = vm.subtract(this.entity.velocity) ;
		this.entity.applyForce(force.scale(this.k)) ;
	}
}

export {Alignment} ;
