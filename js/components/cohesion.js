
import {Component} from './component.js' ;

// Flocking rule (Reynolds): COHESION.
// Steers the entity toward the centre of gravity (barycentre) of its
// neighbours, so the group stays together:
//
//   G  = (1/|neighbours|) · Σ Pj
//   Fc = seek(Pi, G)
//
// Implemented as a Seek toward G (vd = vMax·dir, F = vd − v).
class Cohesion extends Component {

	constructor(data, entity){
		super(data, entity) ;
		this.register() ;
		this.group  = data.group  || [] ;
		this.radius = data.radius || 4.0 ;
		this.vMax   = data.vMax   || 1.2 ;
		this.k      = data.k !== undefined ? data.k : 1.0 ;
	}

	execute(dt){
		const p = this.entity.position ;
		const center = new BABYLON.Vector3(0, 0, 0) ;
		let count = 0 ;
		for (const other of this.group){
			if (other === this.entity || !other.position) continue ;
			if (BABYLON.Vector3.Distance(p, other.position) < this.radius){
				center.addInPlace(other.position) ;
				count++ ;
			}
		}
		if (count === 0) return ;
		center.scaleInPlace(1.0 / count) ;            // G

		const toG = center.subtract(p) ;
		if (toG.length() < 0.0001) return ;
		const vd = toG.normalize().scale(this.vMax) ; // seek desired velocity
		const force = vd.subtract(this.entity.velocity) ;
		this.entity.applyForce(force.scale(this.k)) ;
	}
}

export {Cohesion} ;
