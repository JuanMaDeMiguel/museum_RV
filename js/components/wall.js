
import {PRIMS} from '../prims.js' ; 
import {Component} from './component.js' ; 








class Wall extends Component {

	constructor(data, entity){
		super(data, entity);
		const l = data.width  || 5.0 ;
		const h = data.height || 3.0 ;
		const e = data.depth  || 0.1 ;    
        	const material = data.material || "rouge" ; 
        console.log("> > ", material)
        	const m = entity.sim.findAsset(material) ;  
        	const wall = PRIMS.wall(data.name,{hauteur:h, largeur:l, epaisseur:e,materiau:m},this.entity.sim.scene) ; 
        	this.entity.object3d = wall ; 
	}
}

export {Wall} ; 

