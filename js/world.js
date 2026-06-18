import { PRIMS } from './prims.js';
import { Simu } from './simu.js';

import { ENTITIES } from './entities/entities.js';
import { COMPS } from './components/components.js';
import { buildVisitorBT } from './bt/visitorBT.js';

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

    const materiau1 = PRIMS.standardMaterial("mat1", { couleur: [0.18, 0.18, 0.2] }, scene);
    const materiau2 = PRIMS.standardMaterial("mat_sol", { texture: "./assets/marble.jpg", uScale: 25, vScale: 25 }, scene);
    // Variantes de pared (gris oscuro, sin textura de madera) para que las salas no sean todas iguales.
    const materiauFondo   = PRIMS.standardMaterial("mat_fondo",   { couleur: [0.16, 0.16, 0.18] }, scene);
    const materiauLateral = PRIMS.standardMaterial("mat_lateral", { couleur: [0.22, 0.22, 0.25] }, scene);
    // Piso interior del museo (distinto del piso/plataforma exterior a cuadros).
    const materiauPiso = PRIMS.standardMaterial("mat_piso", { texture: "./assets/240.jpg", uScale: 6, vScale: 6, couleur: [0.45, 0.3, 0.2] }, scene);
    // Alfombras (color liso, sin textura específica disponible en assets).
    const materiauAlfombra = new BABYLON.StandardMaterial("mat_alfombra", scene);
    materiauAlfombra.diffuseColor = new BABYLON.Color3(0.45, 0.05, 0.08);

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
    const mur1 = PRIMS.wall("wall-1", { materiau: materiauFondo, largeur: 30, hauteur: 10 }, scene);
    mur1.position = new BABYLON.Vector3(15 + offsetX, 0, 30 + offsetZ);


    // ==========================================
    // 2. PAREDES LATERALES (Con ventanas de vidrio)
    // ==========================================
    // Pared Izquierda (mur2)
    const opcionesParedIzq = {
      cloison: { largeur: 30, hauteur: 10, materiau: materiauLateral, epaisseur: 0.5 },
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
      cloison: { largeur: 30, hauteur: 10, materiau: materiauLateral, epaisseur: 0.5 },
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

    // ==========================================
    // 5bis. PISO INTERIOR Y ALFOMBRAS
    // ==========================================
    // Piso propio del museo (distinto del piso/plataforma exterior), apenas
    // elevado para no pelearse con el suelo de afuera (z-fighting).
    const pisoMuseo = BABYLON.MeshBuilder.CreateGround("piso-museo", { width: 30, height: 30 }, scene);
    pisoMuseo.material = materiauPiso;
    pisoMuseo.position = new BABYLON.Vector3(15 + offsetX, 0.02, 15 + offsetZ);

    const alfombras = [
      { x: 15 + offsetX, z: 7.5 + offsetZ, width: 10, height: 4 },  // hall, frente a la puerta principal
      { x: 5 + offsetX,  z: 22.5 + offsetZ, width: 6,  height: 9 }, // sala 1
      { x: 15 + offsetX, z: 22.5 + offsetZ, width: 6,  height: 9 }, // sala 2 (sala principal)
      { x: 25 + offsetX, z: 22.5 + offsetZ, width: 6,  height: 9 }, // sala 3
    ];
    for (const a of alfombras) {
      const alfombra = BABYLON.MeshBuilder.CreateGround("alfombra-" + a.x + "-" + a.z, { width: a.width, height: a.height }, scene);
      alfombra.material = materiauAlfombra;
      alfombra.position = new BABYLON.Vector3(a.x, 0.04, a.z);
      alfombra.checkCollisions = false;
    }

    this.createEntity("estatua_valse", ENTITIES.entity, {})
      .add(COMPS.model, { name: "la_valse", fichier: "./assets/la_valse.glb", echelle: 0.006 })
      .add(COMPS.position, { x: 30, y: 0, z: 37 })
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

    // ==========================================
    // 7. VISITANTES (Newton + Behavior Tree + Steering)
    // ==========================================
    // Geometría real del edificio (coordenadas absolutas de mundo, ver mur4_final,
    // mur6, mur7, pInt1-3 más arriba):
    //   - Hall de entrada: X 15-45, Z 15-30 (entre fachada en Z=15 y mur4 en Z=30)
    //   - 3 puertas correderas en mur4 (Z≈30), centradas en X=20, X=30 y X=40
    //   - 3 salas detrás de mur4: X 15-25 / 25-35 / 35-45, todas Z 30-45
    // El recorrido siempre cruza la puerta en línea recta (misma X en el punto
    // del hall y en el punto de la sala) y nunca vuelve a una sala sin pasar
    // primero por el hall.
    const hall = { x: 30, y: 0, z: 22 };  // centro del hall de entrada

    function tramoSala(xPuerta, xRincon1, xRincon2) {
      const antesPuerta = { x: xPuerta, y: 0, z: 27 };  // lado del hall, frente a la puerta
      const dentroSala  = { x: xPuerta, y: 0, z: 33 };  // ya cruzó, lado de la sala
      const rincon1     = { x: xRincon1, y: 0, z: 35 };
      const rincon2     = { x: xRincon2, y: 0, z: 42 };
      return [hall, antesPuerta, dentroSala, rincon1, rincon2, dentroSala, antesPuerta];
    }

    const recorrido = [
      hall,
      ...tramoSala(20, 18, 22),  // sala 1 (X 15-25)
      hall,
      ...tramoSala(30, 28, 32),  // sala 2 (X 25-35)
      hall,
      ...tramoSala(40, 38, 42),  // sala 3 (X 35-45)
    ];

    const visitantes = [
      { nombre: "visitante_1", startIndex: 0,                      reverse: false, clothColor: [0.65, 0.15, 0.15] },
      { nombre: "visitante_2", startIndex: Math.floor(recorrido.length / 2), reverse: true,  clothColor: [0.15, 0.45, 0.25] },
    ];

    visitantes.forEach(({ nombre, startIndex, reverse, clothColor }) => {
      this.createEntity(nombre, ENTITIES.newton, { mass: 1.0 })
        .add(COMPS.person, { hauteur: 0.5, largeur: 0.4, epaisseur: 0.3, clothColor })
        .add(COMPS.position, recorrido[startIndex])
        .add(COMPS.trajectory, { waypoints: recorrido, pauseTime: 1.5, loop: true, startIndex, reverse })
        .add(COMPS.arrive, { vMax: 1.2, slowRadius: 2.0 })
        .add(COMPS.lookAtForward, {})
        .add(COMPS.behaviorTree, { root: buildVisitorBT() });
    });
  }
}

export { World }
