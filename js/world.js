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

    this.createEntity("estatua_valse", ENTITIES.entity, {})
      .add(COMPS.model, { name: "la_valse", fichier: "./assets/la_valse.glb", echelle: 0.05 })
      .add(COMPS.position, { x: 30, y: 0, z: 20 })
      .add(COMPS.rotation, { alpha: 0.003 });

    // ==========================================
    // 6. CUADROS
    // ==========================================
    // Coordenadas LOCALES a cada pared (como en el ejemplo del profesor).
    // lz: offset perpendicular a la pared (+0.1 = hacia adentro del cuarto cuando
    //     local +Z apunta al interior, -0.1 cuando apunta al exterior).
    // ry: rotation.y del poster en el frame local de la pared.
    //     PI  → imagen mira hacia local +Z de la pared
    //     0   → imagen mira hacia local -Z de la pared
    //
    // Conversión local X ↔ mundo:
    //   mur1  (rot=0,   centro X=30): lx = worldX - 30
    //   mur2  (rot=3π/2,centro Z=30): lx = 30 - worldZ   (local +X → mundo -Z)
    //   mur3  (rot=π/2, centro Z=30): lx = worldZ - 30
    //   mur6  (rot=π/2, centro Z=37.5): lx = worldZ - 37.5
    //   mur7  (rot=π/2, centro Z=37.5): lx = worldZ - 37.5
    //
    // Ventana en mur2 en mundo Z≈37.5 → cuadro en Z=33 (lx=-3) la evita.

    const cuadros = [
      // --- Habitación 1 (izq, X=15-25, Z=30-45) ---
      // Fondo (mur1): lx = worldX - 30
      { wall: mur1,       lx: -11,  ly: 1.7, lz: -0.1, ry: 0,       image: "./assets/gioconde.jpg"      },
      { wall: mur1,       lx:  -8,  ly: 1.7, lz: -0.1, ry: 0,       image: "./assets/creacion_adan.jpg" },
      // Pared izq exterior (mur2): worldZ=33 → lx=30-33=-3, lejos de la ventana en Z=37.5
      { wall: mur2_final, lx:  -3,  ly: 1.7, lz:  0.1, ry: Math.PI, image: "./assets/sanmartin.jpg"     },
      // Pared der interna (mur7, lado hab.1): worldZ=38 → lx=0.5, lz=+0.1 apunta a hab.1
      { wall: mur7,       lx:  0.5, ly: 1.7, lz:  0.1, ry: Math.PI, image: "./assets/napoleon.jpg"      },

      // --- Habitación 2 (centro, X=25-35, Z=30-45) ---
      // Fondo (mur1)
      { wall: mur1,       lx:  -2,  ly: 1.7, lz: -0.1, ry: 0,       image: "./assets/starred_night.jpg" },
      { wall: mur1,       lx:   2,  ly: 1.7, lz: -0.1, ry: 0,       image: "./assets/diego.jpg"         },
      // Pared izq interna (mur7, lado hab.2): lz=-0.1 apunta hacia hab.2
      { wall: mur7,       lx:  0.5, ly: 1.7, lz: -0.1, ry: 0,       image: "./assets/ramses.jpg"        },
      // Pared der interna (mur6, lado hab.2): lz=+0.1 apunta hacia hab.2
      { wall: mur6,       lx:  0.5, ly: 1.7, lz:  0.1, ry: Math.PI, image: "./assets/caruso.jpeg"       },

      // --- Habitación 3 (der, X=35-45, Z=30-45) ---
      // Fondo (mur1)
      { wall: mur1,       lx:   8,  ly: 1.7, lz: -0.1, ry: 0,       image: "./assets/4.jpg"             },
      { wall: mur1,       lx:  12,  ly: 1.7, lz: -0.1, ry: 0,       image: "./assets/edd.jpg"           },
      // Pared izq interna (mur6, lado hab.3): lz=-0.1 apunta hacia hab.3
      { wall: mur6,       lx:  0.5, ly: 1.7, lz: -0.1, ry: 0,       image: "./assets/habbo.png"         },

      // --- Planta alta (Y=7.5) ---
      // Fondo (mur1)
      { wall: mur1,       lx:  -5,  ly: 7.5, lz: -0.1, ry: 0,       image: "./assets/kike.png"          },
      { wall: mur1,       lx:   5,  ly: 7.5, lz: -0.1, ry: 0,       image: "./assets/rich.jpeg"         },
      // Pared der exterior (mur3): worldZ=36 → lx=6, sin ventanas en Z=30-45
      { wall: mur3_final, lx:   6,  ly: 7.5, lz:  0.1, ry: Math.PI, image: "./assets/tinelli.jpeg"      },
    ];

    for (const c of cuadros) {
      const cuadro = PRIMS.poster(c.image, { largeur: 2.5, hauteur: 2.0, tableau: c.image }, scene);
      cuadro.parent = c.wall;
      cuadro.position.x = c.lx;
      cuadro.position.y = c.ly;
      cuadro.position.z = c.lz;
      cuadro.rotation.y = c.ry;
      cuadro.checkCollisions = false;
    }
  }
}

export { World }
