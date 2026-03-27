

import {Component} from './component.js' ; 

class LookAtCamera extends Component {
	
	constructor(data, entity) {
		super(data, entity) ; 
		this.camera = this.entity.sim.camera ; 
		this.register(0.1) ; 
	}
	
	execute(t){
	
		if(this.entity.object3d){
			this.entity.object3d.lookAt(this.camera.position) ; 
		}
	}

}

export {LookAtCamera} ; 
