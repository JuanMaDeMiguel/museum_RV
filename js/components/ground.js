
import {PRIMS} from '../prims.js' ; 
import {Component} from './component.js' ; 




class Ground extends Component {

	constructor(data, entity){
		super(data, entity);
		const m = entity.sim.assets[data.material] || null ;
        	const ground = PRIMS.ground(data.name,{materiau:m},this.entity.sim.scene) ; 
        	this.entity.object3d = ground ; 
	}
}



export {Ground};
