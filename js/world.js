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
        scene.gravity = new BABYLON.Vector3(0,-0.5,0)
        
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

        // --- VARIABLES DE DESPLAZAMIENTO (OFFSET) ---
        const offsetX = 15;  
        const offsetZ = 15; 

        // ==========================================
        // 1. PARED DEL FONDO
        // ==========================================
        const mur1 = PRIMS.wall("wall-1",{materiau:materiau1, largeur:30, hauteur:10},  scene) ; 
        mur1.position = new BABYLON.Vector3(15 + offsetX, 0, 30 + offsetZ) ; 


        // ==========================================
        // 2. PAREDES LATERALES (Con ventanas)
        // ==========================================
        // Molde genérico para ventanas (4m ancho x 3m alto)
        const moldeVentana1 = PRIMS.wall("mv1", {largeur: 8, hauteur: 6}, scene);
        const moldeVentana2 = PRIMS.wall("mv2", {largeur: 8, hauteur: 3}, scene);
        moldeVentana1.scaling.z = 5; 
        moldeVentana2.scaling.z = 5;
        // Posiciones relativas de las ventanas en la pared (Y=0 es el centro de la pared de 10m alto)
        moldeVentana1.position = new BABYLON.Vector3(-7.5, 2, 0); 
        moldeVentana2.position = new BABYLON.Vector3(7.5, 1, 0);

        // Pared Izquierda (mur2)
        const mur2_base = PRIMS.wall("wall-left-base", {materiau: materiau1, largeur: 30, hauteur: 10}, scene);
        let temp_m2 = PRIMS.creuser(mur2_base.getChildMeshes()[0], moldeVentana1.getChildMeshes()[0]);
        const mur2_final = PRIMS.creuser(temp_m2, moldeVentana2.getChildMeshes()[0]);
        
        mur2_final.position = new BABYLON.Vector3(0 + offsetX, 5, 15 + offsetZ);
        mur2_final.rotation.y = 3 * Math.PI / 2;
        mur2_final.material = materiau1;
        mur2_final.checkCollisions = true;
        mur2_base.dispose(); temp_m2.dispose();

        // Creamos moldes nuevos para la derecha (porque los anteriores ya se destruyeron en el CSG)
        const moldeVentana3 = PRIMS.wall("mv3", {largeur: 8, hauteur: 3}, scene);
        const moldeVentana4 = PRIMS.wall("mv4", {largeur: 4, hauteur: 5}, scene);
        moldeVentana3.scaling.z = 5; 
        moldeVentana4.scaling.z = 5;
        moldeVentana3.position = new BABYLON.Vector3(-7.5, 1, 0); 
        moldeVentana4.position = new BABYLON.Vector3(7.5, 1, 0); //adelante

        // Pared Derecha (mur3)
        const mur3_base = PRIMS.wall("wall-right-base", {materiau: materiau1, largeur: 30, hauteur: 10}, scene);
        let temp_m3 = PRIMS.creuser(mur3_base.getChildMeshes()[0], moldeVentana3.getChildMeshes()[0]);
        const mur3_final = PRIMS.creuser(temp_m3, moldeVentana4.getChildMeshes()[0]);

        mur3_final.position = new BABYLON.Vector3(30 + offsetX, 5, 15 + offsetZ);
        mur3_final.rotation.y = Math.PI / 2;
        mur3_final.material = materiau1;
        mur3_final.checkCollisions = true;
        mur3_base.dispose(); temp_m3.dispose(); moldeVentana1.dispose(); moldeVentana2.dispose(); moldeVentana3.dispose(); moldeVentana4.dispose();


        // ==========================================
        // 3. FACHADA FRONTAL Y PUERTAS PRINCIPALES
        // ==========================================
        const fachada_base = PRIMS.wall("fachada_base", {materiau: materiau1, largeur: 30, hauteur: 10}, scene);
        const molde_puerta_prin = PRIMS.wall("molde_pp", {largeur: 6, hauteur: 4}, scene);
        molde_puerta_prin.scaling.z = 5;
        molde_puerta_prin.position = new BABYLON.Vector3(0, 0, 0); 

        const fachada_final = PRIMS.creuser(fachada_base.getChildMeshes()[0], molde_puerta_prin.getChildMeshes()[0]);
        fachada_final.position = new BABYLON.Vector3(15 + offsetX, 5, 0 + offsetZ);
        fachada_final.material = materiau1;
        fachada_final.checkCollisions = true;
        fachada_base.dispose(); molde_puerta_prin.dispose();

        // Puertas frontales abiertas a 90 grados
        const puertaPrinIzq = PRIMS.wall("pp_izq", {materiau: materiau1, largeur: 3, hauteur: 4}, scene);
        puertaPrinIzq.position = new BABYLON.Vector3(12 + offsetX, 0, 1.5 + offsetZ); // Hacia adentro (Z = 1.5)
        puertaPrinIzq.rotation.y = Math.PI / 2;

        const puertaPrinDer = PRIMS.wall("pp_der", {materiau: materiau1, largeur: 3, hauteur: 4}, scene);
        puertaPrinDer.position = new BABYLON.Vector3(18 + offsetX, 0, 1.5 + offsetZ);
        puertaPrinDer.rotation.y = Math.PI / 2;


        // ==========================================
        // 4. TECHO
        // ==========================================
        // Cubre 30x30 y va ubicado a 10m de altura
        const techo = PRIMS.wall("techo_general", {materiau: materiau1, largeur: 30, hauteur: 30}, scene);
        techo.position = new BABYLON.Vector3( 15 + offsetX, 10, 30 +  offsetZ);
        techo.rotation.x = -Math.PI / 2;


        // ==========================================
        // 5. INTERIORES
        // ==========================================
        // piso de adentro
        const mur5 = PRIMS.wall("floor-level-1",{materiau:materiau1, largeur:30, hauteur:15},  scene) ; 
        mur5.position = new BABYLON.Vector3(15 + offsetX, 5, 30 + offsetZ) ; 
        mur5.rotation.x = -Math.PI/2 ;

        // --- ESCALERA VISUAL Y FÍSICA ---
        const cantEscalones = 20;
        const altoPiso = 5;
        const altoEscalon = altoPiso / cantEscalones; 
        const anchoEscalera = 3; 
        const profTotal = 10; 
        const profEscalon = profTotal / cantEscalones; 

        for (let i = 0; i < cantEscalones; i++) {
            const bloqueColision = BABYLON.MeshBuilder.CreateBox("colision_" + i, {
                width: anchoEscalera, height: (i + 1) * altoEscalon, depth: profEscalon
            }, scene);
            bloqueColision.position = new BABYLON.Vector3(
                28.5 + offsetX, ((i + 1) * altoEscalon) / 2, 5.5 + (i * profEscalon) + (profEscalon / 2) + offsetZ
            );
            bloqueColision.checkCollisions = true; 
            bloqueColision.isVisible = false;      

            const grosorEscalon = 0.15; 
            const tablaVisual = BABYLON.MeshBuilder.CreateBox("tabla_" + i, {
                width: anchoEscalera, height: grosorEscalon, depth: profEscalon
            }, scene);
            tablaVisual.material = materiau1; 
            tablaVisual.position = new BABYLON.Vector3(
                28.5 + offsetX, ((i + 1) * altoEscalon) - (grosorEscalon / 2), 5.5 + (i * profEscalon) + (profEscalon / 2) + offsetZ
            );
            tablaVisual.checkCollisions = false;
        }

        // --- MURO INTERNO (mur4) CON SUS 3 PUERTAS ABIERTAS ---
        const mur4_base = PRIMS.wall("wall-4-base", {materiau: materiau1, largeur: 30, hauteur: 5}, scene);
        const porte1 = PRIMS.wall("porte1", {largeur: 2, hauteur: 3}, scene);
        const porte2 = PRIMS.wall("porte2", {largeur: 2, hauteur: 3}, scene);
        const porte3 = PRIMS.wall("porte3", {largeur: 2, hauteur: 3}, scene);

        porte1.scaling.z = 5; porte2.scaling.z = 5; porte3.scaling.z = 5;
        porte1.position = new BABYLON.Vector3(-10, 0, 0); 
        porte2.position = new BABYLON.Vector3(0, 0, 0);   
        porte3.position = new BABYLON.Vector3(10, 0, 0);  

        let temp_mesh1 = PRIMS.creuser(mur4_base.getChildMeshes()[0], porte1.getChildMeshes()[0]);
        let temp_mesh2 = PRIMS.creuser(temp_mesh1, porte2.getChildMeshes()[0]);
        const mur4_final = PRIMS.creuser(temp_mesh2, porte3.getChildMeshes()[0]);

        mur4_final.position = new BABYLON.Vector3(15 + offsetX, 2.5, 15 + offsetZ);
        mur4_final.material = materiau1;
        mur4_final.checkCollisions = true;

        mur4_base.dispose(); porte1.dispose(); porte2.dispose(); porte3.dispose(); temp_mesh1.dispose(); temp_mesh2.dispose();

        // Las 3 puertas internas "abiertas" (tamaño 2x3, empujadas 1 metro en Z por la rotación)
        const pInt1 = PRIMS.wall("pint1", {materiau: materiau1, largeur: 2, hauteur: 3}, scene);
        pInt1.position = new BABYLON.Vector3(4 + offsetX, 0, 16 + offsetZ); // El marco izquierdo está en X=4
        pInt1.rotation.y = Math.PI / 2;

        const pInt2 = PRIMS.wall("pint2", {materiau: materiau1, largeur: 2, hauteur: 3}, scene);
        pInt2.position = new BABYLON.Vector3(14 + offsetX, 0, 16 + offsetZ); // El marco izquierdo está en X=14
        pInt2.rotation.y = Math.PI / 2;

        const pInt3 = PRIMS.wall("pint3", {materiau: materiau1, largeur: 2, hauteur: 3}, scene);
        pInt3.position = new BABYLON.Vector3(24 + offsetX, 0, 16 + offsetZ); // El marco izquierdo está en X=24
        pInt3.rotation.y = Math.PI / 2;

        //pared derecha adentro
        const mur6 = PRIMS.wall("wall-right-inside",{materiau:materiau1, largeur:15, hauteur:5}, scene) ; 
        mur6.position = new BABYLON.Vector3(20 + offsetX, 0, 22.5 + offsetZ)
        mur6.rotation.y = Math.PI/2 ; 

        //pared izq adentro
        const mur7 = PRIMS.wall("wall-right-inside",{materiau:materiau1, largeur:15, hauteur:5}, scene) ; 
        mur7.position = new BABYLON.Vector3(10 + offsetX, 0, 22.5 + offsetZ)
        mur7.rotation.y = Math.PI/2 ; 

        const statue = PRIMS.model("statue", {echelle:0.005, fichier:"./assets/la_valse.glb"}, scene) ;
        
        const matVerreBleu = new BABYLON.StandardMaterial("verre_bleu", scene);
        matVerreBleu.diffuseColor = new BABYLON.Color3(0.6, 0.8, 1.0);
        matVerreBleu.alpha = 0.4;
    }
}

export {World}