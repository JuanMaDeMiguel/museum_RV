

import {Component} from './component.js' ; 

class BrownianMotion extends Component {
	
	constructor(data, entity) {
		super(data, entity) ; 
		this.register(0.1) ; 
		this.p0   = data.p0   || 0.1 ; 
		this.vMax = data.vMax || 1.0 ;  
	}
	
	execute(t){
	
		console.log("Brownian") ; 
		const p = Math.random() ; 
		if(this.p0>p){
			const vx = (0.5-Math.random())*this.vMax ;
			const vz = (0.5-Math.random())*this.vMax ;
			this.entity.velocity.copyFromFloats(vx,0.0,vz) ;
		}
	}

}

export {BrownianMotion} ; 
