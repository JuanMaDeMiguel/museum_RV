
import {PRIMS} from '../prims.js' ; 
import {Component} from './component.js' ; 




class Box extends Component {

	constructor(data, entity){
		super(data, entity);
		const l = data.width    || 1.0 ;
		const h = data.height   || 1.0 ;
		const e = data.depth    || 1.0 ;   
        const material = data.material || "rouge" ; 
        console.log("> > ", material)
        const m = entity.sim.findAsset(material) ;  
        console.log("> > ", m)
        	const box = PRIMS.box(data.name,{hauteur:h, largeur:l, epaisseur:e, 		materiau:m},this.entity.sim.scene) ; 
        	this.entity.object3d = box ; 
	}
}



export {Box};
