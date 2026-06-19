
import {Component} from './component.js' ;

// Makes a visitor follow a GUIDE entity (cours2.pdf §6, Ex.3 option (b)):
// instead of steering toward the guide itself, the visitor steers toward a
// point located *behind* the guide, in the opposite direction of its motion.
// This keeps the group trailing the leader instead of piling up on top of it.
//
// It behaves like an Arrive (speed ramps down near the target) so the group
// gently stops when the guide stops.
//
// It also relays the guide's "look target" (set by the guide BT when it pauses
// in front of a painting) into this entity's blackboard.gazeTarget, so the
// Gaze component can turn the visitor to face the same painting.
class FollowGuide extends Component {

	constructor(data, entity){
		super(data, entity) ;
		this.register() ;
		this.guideName  = data.guide ;                                  // name in sim.directory
		this.offset     = data.offset !== undefined ? data.offset : 2.5 ; // distance behind the guide
		this.vMax       = data.vMax || 1.4 ;
		this.slowRadius = data.slowRadius || 2.0 ;
		this.k          = data.k !== undefined ? data.k : 1.0 ;
		// "Espacio personal" del guía: si éste se acerca a menos de avoidRadius,
		// el visitante recibe un empujón para apartarse de su camino. El radio es
		// menor que la distancia normal de seguimiento (offset), así sólo actúa
		// cuando el guía está por atravesarlo, no mientras lo sigue de lejos.
		this.avoidRadius = data.avoidRadius !== undefined ? data.avoidRadius : 1.5 ;
		this.avoidK      = data.avoidK !== undefined ? data.avoidK : 6.0 ;
		this.guide      = null ;
		// Last known "behind" direction, reused while the guide is (almost) still.
		this.lastBack   = new BABYLON.Vector3(0, 0, -this.offset) ;

		entity.blackboard = entity.blackboard || {} ;
	}

	execute(dt){
		if (!this.guide) this.guide = this.entity.sim.findEntity(this.guideName) ;
		const guide = this.guide ;
		if (!guide) return ;

		// Point behind the guide, along the opposite of its current velocity.
		const v = guide.velocity ;
		if (v && v.length() > 0.05){
			v.normalizeToRef(this.lastBack) ;
			this.lastBack.scaleInPlace(-this.offset) ;
		}
		const target = guide.position.add(this.lastBack) ;

		const toTarget = target.subtract(this.entity.position) ;
		const dist = toTarget.length() ;
		if (dist > 0.001){
			const speed = dist < this.slowRadius ? this.vMax * (dist / this.slowRadius) : this.vMax ;
			const vd = toTarget.normalize().scale(speed) ;
			const force = vd.subtract(this.entity.velocity) ;
			this.entity.applyForce(force.scale(this.k)) ;
		}

		// Cederle el paso al guía: empuje desde el guía hacia el visitante cuando
		// éste invade su espacio personal (rampa lineal: 0 en el borde, máximo en
		// el centro). Así los visitantes se corren del camino del guía.
		const away = this.entity.position.subtract(guide.position) ;
		const dg = away.length() ;
		if (dg > 0.0001 && dg < this.avoidRadius){
			const push = away.normalize().scale(this.avoidK * (this.avoidRadius - dg) / this.avoidRadius) ;
			this.entity.applyForce(push) ;
		}

		// Relay the guide's gaze target (painting it is presenting, or null).
		this.entity.blackboard.gazeTarget = guide.blackboard ? guide.blackboard.lookTarget : null ;
	}
}

export {FollowGuide} ;
