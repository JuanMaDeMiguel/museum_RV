
import {PRIMS} from '../prims.js' ; 
import {Component} from './component.js' ; 




class Sky extends Component {

	constructor(data, entity){
		super(data, entity);

        	const sky = PRIMS.sky(data.name,{},this.entity.sim.scene) ; 
        	this.entity.object3d = sky ; 
	}
}



export {Sky};
