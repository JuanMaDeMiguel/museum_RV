
import {PRIMS} from '../prims.js' ; 
import {Component} from './component.js' ; 


class AnchoredTo extends Component {

	constructor(data, entity){
		super(data, entity) ;
		const nomParent = data.parent || null ;
		
		if(nomParent != null){
		
			const parent = entity.sim.getEntity(nomParent) ; 
			
			if(parent != null){
				if(entity.object3d && parent.object3d){
					entity.object3d.parent = parent.object3d ; 
				}
			}
		}
	
	}

}



export {AnchoredTo};
