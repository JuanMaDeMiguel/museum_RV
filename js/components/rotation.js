
import {PRIMS} from '../prims.js' ; 
import {Component} from './component.js' ; 



class Rotation extends Component {

	constructor(data, entity){
		super(data, entity);
		
		const x = data.x || 0.0 ; 
        	const y = data.y || 0.0 ; 
        	const z = data.z || 0.0 ; 

        	if(this.entity.object3d != null){
        		console.log("ROTATION") ; 
	    		this.entity.rotation.set(x,y,z) ; 
            		this.entity.object3d.rotation = new BABYLON.Vector3(x,y,z) ; 
        	}
	}
}




export {Rotation};
