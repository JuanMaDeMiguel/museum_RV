
import {PRIMS} from '../prims.js' ; 
import {Component} from './component.js' ; 




class LookAtPoint extends Component {

	constructor(data, entity){
		super(data, entity);
		const p = data.target || [0,0,0] ; 
		this.target = new BABYLON.Vector3(p[0],p[1],p[2]) ; 
		this.register(0.1) ;
        	//this.entity.object3d = box ; 
	}
	
	execute(t){
		console.log("Execute lookAtPoint ", this.entity.name) ; 
		this.entity.object3d.lookAt(this.target) ; 
	}
}



export {LookAtPoint};
