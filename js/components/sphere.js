
import {PRIMS} from '../prims.js' ; 
import {Component} from './component.js' ; 


class Sphere extends Component {

	constructor(data, entity){
		super(data, entity);
		const diametre = data.diameter || 1.0 ;  
		const m = entity.sim.assets[data.material] || null ;
        	const sph = PRIMS.sphere(data.name,{diametre:diametre, materiau:m},this.entity.sim.scene) ; 
        	this.entity.object3d = sph ; 
	}
}

export {Sphere};
