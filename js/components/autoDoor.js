
import {PRIMS} from '../prims.js' ;
import {Component} from './component.js' ;

// Puerta corrediza automática: se abre cuando un "agente" se acerca a menos de
// `radius` y se cierra al alejarse. Agentes = la cámara del jugador y los
// visitantes (entidades con blackboard). Sigue el mismo patrón que Person/Model:
// el constructor construye la malla (PRIMS.door) y execute() la anima cada frame.
//
// La detección por distancia sigue la directiva del curso (pág. 70, "regarder
// régulièrement"): en lugar de un raycast puntual, se evalúa la proximidad en
// cada tick de la simulación.
class AutoDoor extends Component {

	constructor(data, entity){
		super(data, entity) ;
		// Ojo: Entity.add() ya inserta el componente; no llamamos register()
		// para no ejecutarlo dos veces por frame.
		const groupe = PRIMS.door(entity.name, data, entity.sim.scene) ;
		entity.object3d = groupe ;

		// Cada hoja conoce su x cerrada/abierta (las guardó creerPorte en metadata).
		this.panels = groupe.getChildMeshes().map(p => ({
			mesh: p, closedX: p.metadata.closedX, openX: p.metadata.openX
		})) ;

		this.radius = data.radius || 3.5 ;  // distancia de apertura (en el plano)
		this.speed  = data.speed  || 0.12 ; // suavidad del deslizamiento (0..1)
	}

	// Distancia horizontal (ignora Y) entre dos puntos.
	static horizDist(a, b){
		const dx = a.x - b.x, dz = a.z - b.z ;
		return Math.sqrt(dx * dx + dz * dz) ;
	}

	// Distancia del agente más cercano (cámara + visitantes) a la puerta.
	nearestAgentDistance(){
		const doorPos = this.entity.object3d.getAbsolutePosition() ;
		let min = AutoDoor.horizDist(doorPos, this.entity.sim.camera.position) ;
		this.entity.sim.entities.forEach(e => {
			if (e.blackboard) {
				const d = AutoDoor.horizDist(doorPos, e.position) ;
				if (d < min) min = d ;
			}
		}) ;
		return min ;
	}

	execute(dt){
		const open = this.nearestAgentDistance() < this.radius ;
		for (const p of this.panels) {
			const targetX = open ? p.openX : p.closedX ;
			// Interpolación suave hacia el objetivo (abrir/cerrar).
			p.mesh.position.x += (targetX - p.mesh.position.x) * this.speed ;
		}
	}
}

export {AutoDoor} ;
