import {Component} from './component.js' ; 
import {PRIMS} from '../prims.js' ; 



class Poster extends Component {

	constructor(data, entity){
		super(data, entity);
		const largeur = data.width || 1.0 ; 
		const hauteur = data.height || 1.0 ; 	
		const tableau = data.image || './assets/4.jpg' ; 
		console.log("@@ ",data.name) ; 
		const opts = {largeur:largeur, hauteur:hauteur, tableau:tableau} ; 
        	const poster = PRIMS.poster(data.name, opts, this.entity.sim.scene);
        	this.entity.object3d = poster;
	}
}



export {Poster};
