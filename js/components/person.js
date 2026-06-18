
import {PRIMS} from '../prims.js' ;
import {Component} from './component.js' ;

class Person extends Component {

	constructor(data, entity){
		super(data, entity);
		const scn = entity.sim.scene ;
		const hauteur = data.hauteur || 0.5 ;
		const largeur = data.largeur || 0.5 ;
		const epaisseur = data.epaisseur || 0.5 ;

		const id = data.name || entity.name ;

		const skinMat = new BABYLON.StandardMaterial("piel-" + id, scn) ;
		skinMat.diffuseColor = new BABYLON.Color3(0.93, 0.76, 0.62) ;

		const bodyMat = new BABYLON.StandardMaterial("ropa-" + id, scn) ;
		const c = data.clothColor || [0.2, 0.4, 0.7] ;
		bodyMat.diffuseColor = new BABYLON.Color3(c[0], c[1], c[2]) ;

		const hairMat = new BABYLON.StandardMaterial("pelo-" + id, scn) ;
		hairMat.diffuseColor = new BABYLON.Color3(0.15, 0.1, 0.08) ;

		const eyeMat = new BABYLON.StandardMaterial("ojos-" + id, scn) ;
		eyeMat.diffuseColor = new BABYLON.Color3(0.05, 0.05, 0.05) ;

		const groupe = PRIMS.person(id, {
			...data,
			materiau: skinMat,
			body_material: bodyMat,
			hair_material: hairMat,
			eye_material: eyeMat
		}, scn) ;

		// Collider invisible (igual idea que el ellipsoid de la cámara): se mueve
		// con moveWithCollisions y la malla visible lo sigue como hijo.
		const collider = BABYLON.MeshBuilder.CreateBox("collider-" + (data.name || entity.name), {
			width:  largeur   * 1.5,
			height: hauteur   * 4.5,
			depth:  epaisseur * 1.5
		}, scn) ;
		collider.isVisible = false ;
		collider.checkCollisions = true ;
		collider.ellipsoid = new BABYLON.Vector3(largeur * 0.75, hauteur * 2.25, epaisseur * 0.75) ;
		collider.ellipsoidOffset = new BABYLON.Vector3(0, hauteur * 2.25, 0) ;

		groupe.parent = collider ;
		groupe.position.set(0, 0, 0) ;

		this.entity.object3d = collider ;
	}
}

export {Person} ;
