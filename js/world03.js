
import {PRIMS} from './prims.js' ; 
import {Simu}  from './simu.js' ; 

class World extends Simu {

	constructor(){
		super() ; 
	}

	requete_http(www, port, requete, foo){
		const entete = "http://" + www + ":" + port + "/" + requete ;
		loadJSON(entete, (res) => {
			const data = JSON.parse(res) ; 
			foo(data) ; 
		}) ;
	} 



	createWorld(data) {
		const scene = this.scene ;
		
		const light0 = new BABYLON.HemisphericLight("l0",new BABYLON.Vector3(1,1,0), scene);
        	const light1 = new BABYLON.HemisphericLight("l0",new BABYLON.Vector3(1,-1,0), scene);
        	light1.intensity = 0.2 ;

        	const light2 = new BABYLON.HemisphericLight("l0",new BABYLON.Vector3(1,-1,0), scene);
        	light2.intensity = 0.2 ;

    		const materiau1 = PRIMS.standardMaterial("mat1",{texture:"./assets/240.jpg"},scene) ; 
    		const materiau2 = PRIMS.standardMaterial("mat_sol",{texture:"./assets/marble.jpg",uScale:25,vScale:25},scene);

		const ciel = PRIMS.sky("ciel",  {}, scene) ; 

		const sol = PRIMS.ground("sol", {materiau:materiau2}, scene) ;

    		const sphere = PRIMS.sphere("sph1", {}, scene) ; 
    		const sph    = PRIMS.sphere("sph2", {}, scene);
		sph.position.y = 0.5 ; 
 
    		const sph1 = PRIMS.creuser(sphere,sph);

   		const mur1 = PRIMS.wall("wall-1",{largeur:30, hauteur:10, epaisseur:0.1, materiau:materiau1}, scene) ; 
    		mur1.position = new BABYLON.Vector3(15,0,0) ; 


		const mur2 = PRIMS.wall("wall-2",{largeur:30, hauteur:10, epaisseur:0.1, materiau:materiau1}, scene) ; 
	//mur2.parent = mur1 ; 
		mur2.rotation.y = Math.PI/2 ;
		mur2.position.z = 15 ; 

		const poster = PRIMS.poster("poster01",{tableau:"./assets/4.jpg"},scene);
		poster.parent = mur2 ; 
		poster.position.y = 1.7 ; 
		poster.position.z = 0.1 ; 
		poster.rotation.y = Math.PI ; 

		const mur3 = PRIMS.wall("wall-3",{largeur:30, hauteur:10, epaisseur:0.1, materiau:materiau1}, scene) ; 
	//mur2.parent = mur1 ; 
		mur3.position = new BABYLON.Vector3(15,0,30) ;

/*		const mur4 = PRIMS.wall("wall-4",{largeur:30, hauteur:10, epaisseur:0.1, materiau:materiau1}, scene) ; 
	//mur2.parent = mur1 ; 
		mur4.rotation.y = Math.PI/2 ;
		mur4.position.z = 15 ; 
		mur4.position.x = 30 ; */

		const mur5 = PRIMS.wall("wall-1",{largeur:15, hauteur:10, epaisseur:0.1, materiau:materiau1}, scene) ; 
    	mur5.position = new BABYLON.Vector3(7.5,0,10) ; 

    	const sol1 = PRIMS.ground("sol1", {largeur:30, profondeur:30, materiau:materiau2}, scene) ;
    	sol1.position = new BABYLON.Vector3(15,5,15) ; 
    	const plafond1 = PRIMS.ground("plafond1", {largeur:30, profondeur:30}, scene) ;
    	plafond1.position = new BABYLON.Vector3(15,4.999,15) ; 
    	plafond1.rotation.x = Math.PI ; 
    }

}

export {World}
