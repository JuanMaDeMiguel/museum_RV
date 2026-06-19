
import {Component} from './component.js' ;

// Hace que una entidad (p.ej. un visitante que deambula libre) se aparte del
// camino del guía: si el guía entra en su "espacio personal" (radio), recibe un
// empujón en dirección opuesta al guía (rampa lineal: 0 en el borde del radio,
// máximo cuando lo tiene encima). Es la misma idea que la repulsión que ya
// aplica FollowGuide al grupo guiado, pero como componente suelto para añadirla
// a entidades que NO siguen al guía.
//
// El disparo usa distancia 3D, así un guía que está en otro piso (5 m más abajo)
// nunca activa el empuje; el empuje en sí es horizontal (no los levanta).
class AvoidGuide extends Component {

	constructor(data, entity){
		super(data, entity) ;
		this.register() ;
		this.guideName = data.guide || "guia" ;
		this.radius    = data.radius !== undefined ? data.radius : 1.5 ;
		this.k         = data.k !== undefined ? data.k : 6.0 ;
		this.guide     = null ;
	}

	execute(dt){
		if (!this.guide) this.guide = this.entity.sim.findEntity(this.guideName) ;
		const guide = this.guide ;
		if (!guide || !guide.position) return ;

		const away = this.entity.position.subtract(guide.position) ;
		const dist = away.length() ;                       // distancia 3D (incluye Y)
		if (dist > 0.0001 && dist < this.radius){
			away.y = 0 ;                                   // empuje sólo horizontal
			const horiz = away.length() ;
			if (horiz < 0.0001) return ;
			const push = away.scale((this.k * (this.radius - dist) / this.radius) / horiz) ;
			this.entity.applyForce(push) ;
		}
	}
}

export {AvoidGuide} ;
