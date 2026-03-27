
import {PRIMS} from '../prims.js' ; 
import {Component} from './component.js' ; 

class Position extends Component {

	constructor(data, entity){
		super(data, entity);
        	const x = data.x || 0.0 ; 
        	const y = data.y || 0.0 ; 
        	const z = data.z || 0.0 ; 

        	if(this.entity.object3d != null){
	    		this.entity.position.set(x,y,z) ; 
            		this.entity.object3d.position.set(x,y,z) ; 
        	}
	}
}

export {Position} ; 


