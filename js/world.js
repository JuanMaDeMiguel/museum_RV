import { PRIMS } from './prims.js';
import { Simu } from './simu.js';

import { ENTITIES } from './entities/entities.js';
import { COMPS } from './components/components.js';

class World extends Simu {

  constructor() {
    super();
  }

  requete_http(www, port, requete, foo) {
    const entete = "http://" + www + ":" + port + "/" + requete;
    loadJSON(entete, (res) => {
      const data = JSON.parse(res);
      foo(data);
    });
  }

  createWorld(data) {
    const scene = this.scene;
    scene.gravity = new BABYLON.Vector3(0, -0.5, 0)

    const light0 = new BABYLON.HemisphericLight("l0", new BABYLON.Vector3(1, 1, 0), scene);
    const light1 = new BABYLON.HemisphericLight("l0", new BABYLON.Vector3(1, -1, 0), scene);
    light1.intensity = 0.2;

    const light2 = new BABYLON.HemisphericLight("l0", new BABYLON.Vector3(1, -1, 0), scene);
    light2.intensity = 0.2;

    const materiau1 = PRIMS.standardMaterial("mat1", { texture: "./assets/240.jpg" }, scene);
    const materiau2 = PRIMS.standardMaterial("mat_sol", { texture: "./assets/marble.jpg", uScale: 25, vScale: 25 }, scene);

    const ciel = PRIMS.sky("ciel", {}, scene);
    const sol = PRIMS.ground("sol", { materiau: materiau2 }, scene);

    const sphere = PRIMS.sphere("sph1", {}, scene);
    const sph = PRIMS.sphere("sph2", {}, scene);
    sph.position.y = 0.5;
    const sph1 = PRIMS.creuser(sphere, sph);

    // --- VARIABLES DE DESPLAZAMIENTO (OFFSET) ---
    const offsetX = 15;
    const offsetZ = 15;

    // ==========================================
    // 1. PARED DEL FONDO
    // ==========================================
    const mur1 = PRIMS.wall("wall-1", { materiau: materiau1, largeur: 30, hauteur: 10 }, scene);
    mur1.position = new BABYLON.Vector3(15 + offsetX, 0, 30 + offsetZ);


    // ==========================================
    // 2. PAREDES LATERALES (Con ventanas de vidrio)
    // ==========================================
    // Pared Izquierda (mur2)
    const opcionesParedIzq = {
      cloison: { largeur: 30, hauteur: 10, materiau: materiau1, epaisseur: 0.5 },
      trous: [
        { largeur: 8, hauteur: 6, epaisseur: 2, fenetre: true, position: new BABYLON.Vector3(-7.5, -4, 0) },
        { largeur: 8, hauteur: 3, epaisseur: 2, fenetre: true, position: new BABYLON.Vector3(7.5, -4, 0) }
      ]
    };
    const mur2_final = PRIMS.wallHole("wall-left-base", opcionesParedIzq, scene);
    mur2_final.position = new BABYLON.Vector3(0 + offsetX, 0, 15 + offsetZ);
    mur2_final.rotation.y = 3 * Math.PI / 2;

    // Pared Derecha (mur3)
    const opcionesParedDer = {
      cloison: { largeur: 30, hauteur: 10, materiau: materiau1, epaisseur: 0.5 },
      trous: [
        { largeur: 8, hauteur: 3, epaisseur: 2, fenetre: true, position: new BABYLON.Vector3(-7.5, -4, 0) }
      ]
    };
    const mur3_final = PRIMS.wallHole("wall-right-base", opcionesParedDer, scene);
    mur3_final.position = new BABYLON.Vector3(30 + offsetX, 0, 15 + offsetZ);
    mur3_final.rotation.y = Math.PI / 2;


    // ==========================================
    // 3. FACHADA FRONTAL Y PUERTA PRINCIPAL
    // ==========================================
    const opcionesFachada = {
      cloison: { largeur: 30, hauteur: 10, materiau: materiau1, epaisseur: 0.5 },
      trous: [
        // Puerta central
        { largeur: 6, hauteur: 4, epaisseur: 2, fenetre: false, position: new BABYLON.Vector3(0, -5, 0) },
        // Ventanas bajadas a Y = -4 para que arranquen a 1m del piso
        { largeur: 3, hauteur: 6, epaisseur: 2, fenetre: true, position: new BABYLON.Vector3(-9, -4, 0) },
        { largeur: 3, hauteur: 6, epaisseur: 2, fenetre: true, position: new BABYLON.Vector3(9, -4, 0) }
      ]
    };
    const fachada_final = PRIMS.wallHole("fachada_base", opcionesFachada, scene);
    fachada_final.position = new BABYLON.Vector3(15 + offsetX, 0, 0 + offsetZ);

    // Puerta corrediza principal
    const puertaPrin = PRIMS.door("door_prin", { ndoors: 2, largeur: 6, hauteur: 4, type: "coulissante" }, scene);
    puertaPrin.parent = fachada_final;
    // Offset local en Z aumentado a 0.5 para que pase por detrás del muro sin rozarlo
    puertaPrin.position.z = 0.5;


    // ==========================================
    // 4. TECHO
    // ==========================================
    const techo = PRIMS.wall("techo_general", { materiau: materiau1, largeur: 30, hauteur: 30 }, scene);
    techo.position = new BABYLON.Vector3(15 + offsetX, 10, 30 + offsetZ);
    techo.rotation.x = -Math.PI / 2;


    // ==========================================
    // 5. INTERIORES
    // ==========================================
    const mur5 = PRIMS.wall("floor-level-1", { materiau: materiau1, largeur: 30, hauteur: 15 }, scene);
    mur5.position = new BABYLON.Vector3(15 + offsetX, 5, 30 + offsetZ);
    mur5.rotation.x = -Math.PI / 2;

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

    // --- MURO INTERNO (mur4) ---
    const mur4_base = PRIMS.wall("wall-4-base", { materiau: materiau1, largeur: 30, hauteur: 5 }, scene);
    const porte1 = PRIMS.wall("porte1", { largeur: 2, hauteur: 3 }, scene);
    const porte2 = PRIMS.wall("porte2", { largeur: 2, hauteur: 3 }, scene);
    const porte3 = PRIMS.wall("porte3", { largeur: 2, hauteur: 3 }, scene);

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

    // --- LAS 3 PUERTAS INTERNAS CORREDIZAS ---
    const pInt1 = PRIMS.door("pint1", { ndoors: 2, largeur: 2, hauteur: 3, type: "coulissante" }, scene);
    pInt1.position = new BABYLON.Vector3(5 + offsetX, 0, 15.2 + offsetZ);

    const pInt2 = PRIMS.door("pint2", { ndoors: 2, largeur: 2, hauteur: 3, type: "coulissante" }, scene);
    pInt2.position = new BABYLON.Vector3(15 + offsetX, 0, 15.2 + offsetZ);

    const pInt3 = PRIMS.door("pint3", { ndoors: 2, largeur: 2, hauteur: 3, type: "coulissante" }, scene);
    pInt3.position = new BABYLON.Vector3(25 + offsetX, 0, 15.2 + offsetZ);

    //pared derecha adentro
    const mur6 = PRIMS.wall("wall-right-inside", { materiau: materiau1, largeur: 15, hauteur: 5 }, scene);
    mur6.position = new BABYLON.Vector3(20 + offsetX, 0, 22.5 + offsetZ)
    mur6.rotation.y = Math.PI / 2;

    //pared izq adentro
    const mur7 = PRIMS.wall("wall-right-inside", { materiau: materiau1, largeur: 15, hauteur: 5 }, scene);
    mur7.position = new BABYLON.Vector3(10 + offsetX, 0, 22.5 + offsetZ)
    mur7.rotation.y = Math.PI / 2;

    const statue = PRIMS.model("statue", { echelle: 0.005, fichier: "./assets/la_valse.glb" }, scene);

    const matVerreBleu = new BABYLON.StandardMaterial("verre_bleu", scene);
    matVerreBleu.diffuseColor = new BABYLON.Color3(0.6, 0.8, 1.0);
    matVerreBleu.alpha = 0.4;

    this.createEntity("cubo_rotatorio", ENTITIES.entity, {})
      .add(COMPS.box, { name: "mesh_cubo", width: 2, height: 2, depth: 2 })
      .add(COMPS.position, { x: 5, y: 1, z: 5 })
      .add(COMPS.rotation, { alpha: 0.05 }); // alpha es la velocidad de giro
  }
}

export { World }
