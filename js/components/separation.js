
import {Component} from './component.js' ;

// Flocking rule (Reynolds): SEPARATION.
// Applies a repulsion force away from each neighbour inside a radius, with a
// magnitude inversely proportional to the squared distance:
//
//   Fs = Σ (1/|PjPi|²) · PjPi⃗     for every Oj in neighbourhood(Oi)
//
// The neighbourhood is the list passed in data.group (a plain array of
// entities shared by the whole group). The entity itself is skipped.
class Separation extends Component {

	constructor(data, entity){
		super(data, entity) ;
		this.register() ;
		this.group  = data.group  || [] ;
		this.radius = data.radius || 1.5 ;
		this.k      = data.k !== undefined ? data.k : 1.0 ;
	}

	execute(dt){
		const force = new BABYLON.Vector3(0, 0, 0) ;
		const p = this.entity.position ;
		for (const other of this.group){
			if (other === this.entity || !other.position) continue ;
			// PjPi = me - neighbour  → points away from the neighbour.
			const away = p.subtract(other.position) ;
			const dist = away.length() ;
			if (dist > 0.0001 && dist < this.radius){
				force.addInPlace(away.scale(1.0 / (dist * dist))) ;
			}
		}
		this.entity.applyForce(force.scale(this.k)) ;
	}
}

export {Separation} ;
