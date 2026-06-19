import { PRIMS } from './prims.js';
import { Simu } from './simu.js';

import { ENTITIES } from './entities/entities.js';
import { COMPS } from './components/components.js';
import { buildVisitorBT } from './bt/visitorBT.js';
import { buildGuideBT } from './bt/guideBT.js';

// Genera un material de pasto estilo Minecraft sin depender de imágenes externas:
// dibuja una textura pixelada (rejilla de tonos verdes al azar) sobre un canvas y la
// tilea por todo el suelo con muestreo NEAREST para conservar el look "bloque".
function crearMaterialPasto(nombre, scene) {
  const px = 16; // resolución de la textura (16x16 = 1 "bloque" de Minecraft)
  const dt = new BABYLON.DynamicTexture(nombre + "_tex", { width: px, height: px }, scene, false);
  const ctx = dt.getContext();

  // Paleta de verdes (de oscuro a claro) típica del pasto.
  const verdes = ["#4a7a2a", "#558b2f", "#5e9a33", "#69a83a", "#74b341", "#7cc04a"];
  for (let y = 0; y < px; y++) {
    for (let x = 0; x < px; x++) {
      ctx.fillStyle = verdes[Math.floor(Math.random() * verdes.length)];
      ctx.fillRect(x, y, 1, 1);
    }
  }
  dt.update(false);
  dt.updateSamplingMode(BABYLON.Texture.NEAREST_SAMPLINGMODE); // pixelado, no borroso
  dt.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
  dt.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
  // Cada repetición = ~2.7m → cada "bloque" mide ~0.17m, bien denso.
  dt.uScale = 60;
  dt.vScale = 60;

  const mat = new BABYLON.StandardMaterial(nombre, scene);
  mat.diffuseTexture = dt;
  mat.specularColor = new BABYLON.Color3(0, 0, 0); // pasto mate, sin brillos
  return mat;
}

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
    // Pasto exterior estilo Minecraft (textura procedural pixelada, sin assets externos).
    const materiauPasto = crearMaterialPasto("mat_pasto", scene);
    // Variantes de pared (gris oscuro, sin textura de madera) para que las salas no sean todas iguales.
    const materiauFondo   = PRIMS.standardMaterial("mat_fondo",   { couleur: [0.16, 0.16, 0.18] }, scene);
    const materiauLateral = PRIMS.standardMaterial("mat_lateral", { couleur: [0.22, 0.22, 0.25] }, scene);
    // Piso interior del museo (distinto del piso/plataforma exterior a cuadros).
    const materiauPiso = PRIMS.standardMaterial("mat_piso", { texture: "./assets/240.jpg", uScale: 6, vScale: 6, couleur: [0.45, 0.3, 0.2] }, scene);
    // Alfombras (color liso, sin textura específica disponible en assets).
    const materiauAlfombra = new BABYLON.StandardMaterial("mat_alfombra", scene);
    materiauAlfombra.diffuseColor = new BABYLON.Color3(0.45, 0.05, 0.08);

    const ciel = PRIMS.sky("ciel", {}, scene);
    const sol = PRIMS.ground("sol", { materiau: materiauPasto }, scene);

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

    // Puerta corrediza principal (entidad con autoDoor: abre/cierra por proximidad).
    const puertaPrin = this.createEntity("door_prin", ENTITIES.entity, {})
      .add(COMPS.autoDoor, { ndoors: 2, largeur: 6, hauteur: 4, type: "coulissante", radius: 5 });
    puertaPrin.object3d.parent = fachada_final;
    // Offset local en Z: pegada a la fachada (antes 0.5) pero sin meterse en el muro.
    puertaPrin.object3d.position.z = 0.35;


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

    // --- BARANDA DE VIDRIO DE LA MEZZANINE ---
    // La mezzanine (piso de arriba, y=5, X[15,45] Z[30,45]) está cerrada por muros
    // altos atrás (mur1, Z=45), izquierda (mur2, X=15) y derecha (mur3, X=45). El
    // único borde abierto es el del frente (Z=30, sobre mur4), que da al hall de
    // abajo. Ponemos ahí una baranda de vidrio para no poder caerse: solo se baja
    // por la escalera, que llega a la mezzanine en X[42,45]. Por eso la baranda va
    // de X=15 a X=42 y deja libre ese hueco de la escalera.
    const barandaY = 5;          // piso de la mezzanine
    const barandaAltura = 1.2;   // alto de la baranda
    const barandaZ = 30 + offsetZ - 15; // = 30 (borde frontal de la mezzanine)
    const barandaXIni = 0 + offsetX;     // X=15 (pared izquierda)
    const barandaXFin = 27 + offsetX;    // X=42 (donde empieza el hueco de la escalera)
    const barandaLargo = barandaXFin - barandaXIni; // 27
    const barandaCentroX = (barandaXIni + barandaXFin) / 2;

    // Vidrio: azulado y translúcido, igual que las ventanas (ver creerCloisonAvecTrous).
    const matVidrioBaranda = new BABYLON.StandardMaterial("mat_baranda_vidrio", scene);
    matVidrioBaranda.diffuseColor = new BABYLON.Color3(0.6, 0.8, 1.0);
    matVidrioBaranda.alpha = 0.3;
    matVidrioBaranda.specularColor = new BABYLON.Color3(0.4, 0.4, 0.4);
    matVidrioBaranda.backFaceCulling = false;

    const vidrioBaranda = BABYLON.MeshBuilder.CreateBox("baranda-vidrio", {
      width: barandaLargo, height: barandaAltura, depth: 0.06
    }, scene);
    vidrioBaranda.material = matVidrioBaranda;
    vidrioBaranda.position = new BABYLON.Vector3(barandaCentroX, barandaY + barandaAltura / 2, barandaZ);
    vidrioBaranda.checkCollisions = true; // frena a la cámara/visitantes: no se puede atravesar

    // Pasamanos superior (barra metálica fina) que remata el vidrio, más visible.
    const matPasamanos = new BABYLON.StandardMaterial("mat_baranda_pasamanos", scene);
    matPasamanos.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.33);
    matPasamanos.specularColor = new BABYLON.Color3(0.6, 0.6, 0.6);

    const pasamanos = BABYLON.MeshBuilder.CreateBox("baranda-pasamanos", {
      width: barandaLargo, height: 0.08, depth: 0.12
    }, scene);
    pasamanos.material = matPasamanos;
    pasamanos.position = new BABYLON.Vector3(barandaCentroX, barandaY + barandaAltura, barandaZ);
    pasamanos.checkCollisions = false; // el vidrio ya hace de barrera física

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

    // --- LAS 3 PUERTAS INTERNAS CORREDIZAS (entidades con autoDoor) ---
    const puertasInternas = [
      { nombre: "pint1", x: 5 + offsetX },
      { nombre: "pint2", x: 15 + offsetX },
      { nombre: "pint3", x: 25 + offsetX },
    ];
    for (const p of puertasInternas) {
      const puerta = this.createEntity(p.nombre, ENTITIES.entity, {})
        .add(COMPS.autoDoor, { ndoors: 2, largeur: 2, hauteur: 3, type: "coulissante" });
      // z=15.08: casi pegadas al muro interno (mur4 en z=15), sin rozarlo.
      puerta.object3d.position.set(p.x, 0, 15.08 + offsetZ);
    }

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

    // Base circular (pedestal) sobre la que gira la estatua. Su centro coincide
    // con el eje de rotación de la estatua, así el giro tiene sentido visual.
    const estatuaPos = { x: 30, z: 37 };
    const baseRadio = 1.5;   // <-- ajustá este radio a gusto
    const baseAltura = 0.2;
    const baseEstatua = BABYLON.MeshBuilder.CreateCylinder("base-estatua", {
      diameter: baseRadio * 2,
      height: baseAltura,
      tessellation: 48,
    }, scene);
    const matBaseEstatua = new BABYLON.StandardMaterial("mat_base_estatua", scene);
    matBaseEstatua.diffuseColor = BABYLON.Color3.FromHexString("#4c4c45");
    baseEstatua.material = matBaseEstatua;
    // Centro del cilindro a media altura → su base apoya en y=0 y su tapa en baseAltura.
    baseEstatua.position = new BABYLON.Vector3(estatuaPos.x, baseAltura / 2, estatuaPos.z);

    this.createEntity("estatua_valse", ENTITIES.entity, {})
      .add(COMPS.model, { name: "la_valse", fichier: "./assets/la_valse.glb", echelle: 0.006 })
      .add(COMPS.position, { x: estatuaPos.x, y: baseAltura, z: estatuaPos.z })
      .add(COMPS.rotation, { alpha: 0.003 });

    // --- ANIMALES LOW POLY (hall de entrada) ---
    // Tres GLB low poly colocados equidistantes y centrados en el hall, justo al
    // entrar. Se cargan igual que la estatua de la valse (COMPS.model los apoya en
    // el suelo y centra su huella), pero no giran: les fijamos una rotación estática
    // en 'onCharge' (después de que poserAuSol centre la huella, porque ese centrado
    // asume que el contenedor no está rotado).
    //
    // La entrada del museo está hacia -Z (fachada en z=15) y el hall hacia +Z. Con
    // rotación 0 los animales miran a +Z (de espaldas a la entrada), así que la base
    // para mirar a la entrada es PI. El caballo (centro) mira derecho; el gato y el
    // lobo (laterales) van inclinados hacia el centro/puerta.
    //
    // 'echelle' = el doble de la altura natural (tamaño nativo en Y: cat≈0.36,
    // horse≈1.99, wolf≈2.26). Tocá estos valores a gusto.
    const mirarEntrada = Math.PI;
    const animales = [
      { id: "animal_cat",   name: "cat",   fichier: "./assets/cat.glb",   echelle: 2.6, x: 23, ry: mirarEntrada - 0.5 },
      { id: "animal_horse", name: "horse", fichier: "./assets/horse.glb", echelle: 1.7, x: 30, ry: mirarEntrada },
      { id: "animal_wolf",  name: "wolf",  fichier: "./assets/wolf.glb",  echelle: 0.9, x: 37, ry: mirarEntrada + 0.5 },
    ];
    for (const a of animales) {
      this.createEntity(a.id, ENTITIES.entity, {})
        .add(COMPS.model, {
          name: a.name,
          fichier: a.fichier,
          echelle: a.echelle,
          // Se ejecuta una vez cargado y centrado el modelo.
          onCharge: (meshes, container) => {
            container.rotation.y = a.ry;           // orientación fija hacia la entrada
            meshes.forEach(m => { m.checkCollisions = true; }); // obstáculo: visitantes y cámara no lo atraviesan
          },
        })
        .add(COMPS.position, { x: a.x, y: 0, z: 22 });
    }

    // --- MÓVIL DE CALDER (mezzanine / piso de arriba) ---
    // Escultura articulada animada: cuelga del techo (y=10) sobre la mezzanine
    // (piso a y=5) y sus varillas giran a distintas velocidades.
    // Raíz a ras del techo (y=10): el hilo de suspensión cuelga desde ahí.
    this.createEntity("calder_mezzanine", ENTITIES.entity, {})
      .add(COMPS.mobile, { name: "calder1", niveaux: 3, vitesse: 0.012, suspension: 1.2 })
      .add(COMPS.position, { x: 30, y: 10, z: 39 });

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
    // Punto central al que vuelven todos entre sala y sala. Va DETRÁS del caballo
    // (el caballo está en x=30,z=22 mirando a la entrada; su huella de colisión
    // ocupa z≈19.8–24.2), por eso z=26: queda libre del área bloqueada por el
    // caballo y antes de las puertas (z=30), así nadie se queda atrapado.
    const hall = { x: 30, y: 0, z: 26 };

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

    // Recorrido de la planta alta (mezzanine, y=5): tour por los cuadros de
    // arriba (kike, rich, tinelli) y por el móvil de Calder ("cosa colgante").
    // Las personas aparecen directamente arriba (no usan la escalera) y, como no
    // hay gravedad sobre ellas, se mantienen a y=5 siguiendo waypoints a y=5.
    const recorridoArriba = [
      { x: 30, y: 5, z: 34 },  // 0 zona de llegada (cabecera de la escalera)
      { x: 25, y: 5, z: 42 },  // 1 cuadro "kike"   (mur1, planta alta)
      { x: 30, y: 5, z: 39 },  // 2 móvil de Calder (cosa colgante)
      { x: 35, y: 5, z: 42 },  // 3 cuadro "rich"   (mur1, planta alta)
      { x: 42, y: 5, z: 36 },  // 4 cuadro "tinelli"(mur3, planta alta)
      { x: 34, y: 5, z: 34 },  // 5 tránsito de vuelta
    ];

    // Lista compartida de TODOS los peatones (libres + guiados). Aunque las
    // personas no colisionan físicamente entre sí, cada una lleva una fuerza de
    // separación (Reynolds) que recorre esta lista para esquivarse mutuamente.
    // Se va llenando a medida que se crean; los componentes la recorren recién en
    // ejecución, así que para entonces ya están todos dentro. (El guía no entra:
    // a él lo esquivan con avoidGuide / FollowGuide, no con separación.)
    const peatones = [] ;

    // 6 visitantes que deambulan libres (misma lógica que los originales):
    //  - 3 abajo, uno empezando dentro de cada sala (rincón de sala 1/2/3).
    //  - 3 arriba, cada uno yendo primero a un punto distinto: un cuadro, otro
    //    cuadro y la cosa colgante (startIndex 1, 3 y 2 del recorrido de arriba).
    // Todos esquivan al guía gracias al nuevo componente avoidGuide.
    const visitantes = [
      // --- abajo: uno por sala ---
      { nombre: "visitante_1", ruta: recorrido,       startIndex: 4,  reverse: false, clothColor: [0.65, 0.15, 0.15] }, // sala 1
      { nombre: "visitante_2", ruta: recorrido,       startIndex: 12, reverse: false, clothColor: [0.15, 0.45, 0.25] }, // sala 2
      { nombre: "visitante_3", ruta: recorrido,       startIndex: 20, reverse: true,  clothColor: [0.20, 0.30, 0.65] }, // sala 3
      // --- arriba: cuadros + cosa colgante ---
      { nombre: "visitante_4", ruta: recorridoArriba, startIndex: 1,  reverse: false, clothColor: [0.70, 0.50, 0.15] }, // a un cuadro
      { nombre: "visitante_5", ruta: recorridoArriba, startIndex: 3,  reverse: false, clothColor: [0.50, 0.25, 0.60] }, // a otro cuadro
      { nombre: "visitante_6", ruta: recorridoArriba, startIndex: 2,  reverse: false, clothColor: [0.20, 0.55, 0.60] }, // a la cosa colgante
    ];

    visitantes.forEach(({ nombre, ruta, startIndex, reverse, clothColor }) => {
      const v = this.createEntity(nombre, ENTITIES.newton, { mass: 1.0, maxSpeed: 1.6 })
        .add(COMPS.person, { hauteur: 0.5, largeur: 0.4, epaisseur: 0.3, clothColor })
        .add(COMPS.position, ruta[startIndex])
        .add(COMPS.trajectory, { waypoints: ruta, pauseTime: 1.5, loop: true, startIndex, reverse })
        .add(COMPS.arrive, { vMax: 1.2, slowRadius: 2.0 })
        // Esquivar al resto de peatones (libres y guiados) sin chocar físicamente.
        .add(COMPS.separation, { group: peatones, radius: 1.4, k: 2.0 })
        .add(COMPS.lookAtForward, {})
        .add(COMPS.avoidGuide, { guide: "guia" })
        .add(COMPS.behaviorTree, { root: buildVisitorBT() });
      peatones.push(v) ;
    });

    // ==========================================
    // 7bis. GUÍA + GRUPO GUIADO (Simulation de foule, cours2.pdf §6)
    // ==========================================
    // Un guía recorre su propia trayectoria por el museo y se detiene frente a
    // algunos cuadros (Ej.3/4/5). Un grupo de 8 visitantes lo sigue aplicando
    // las reglas de Reynolds (separación/cohesión/alineamiento, Ej.1) más una
    // fuerza "seguir un punto detrás del guía" (Ej.3 opción b). Cuando el guía
    // se para frente a un cuadro, el grupo se agrupa y todos lo miran (Ej.4).
    // Con los 2 visitantes independientes de arriba, el museo queda con 10.

    // Recorrido del guía. Cada parada {x,z} puede llevar:
    //   look  : punto del cuadro a mirar (world coords; los cuadros de mur1
    //           están en Z≈45 y miran hacia -Z, así que se ven desde Z<45)
    //   pause : segundos detenido presentando ese cuadro
    // Los waypoints sin pause se cruzan de largo (sirven para atravesar puertas
    // del hall (Z<30) a las salas (Z>30) en línea recta, misma X a ambos lados).
    const Y_OJO = 1.7 ;  // altura aproximada del centro de los cuadros
    const guideRoute = [
      { x: 27, z: 20 },                                                   // 0  inicio/loop: en el hueco entre el gato (x=23) y el caballo (x=30), corrido a la derecha y fuera de la huella del caballo
      // --- Sala 1 (puerta X=20) ---
      { x: 20, z: 27 },                                                   // 1  hall, frente a la puerta
      { x: 20, z: 33 },                                                   // 2  ya dentro de la sala 1
      { x: 19, z: 41, pause: 4.0, look: { x: 19, y: Y_OJO, z: 44.5 } },   // 3  cuadro "gioconde" (mur1)
      { x: 20, z: 33 },                                                   // 4  vuelve hacia la puerta
      { x: 20, z: 27 },                                                   // 5  de nuevo en el hall
      // --- Sala 2 (puerta X=30) ---
      { x: 30, z: 27 },                                                   // 6
      { x: 30, z: 33 },                                                   // 7  dentro de la sala 2
      { x: 28, z: 41, pause: 4.0, look: { x: 28, y: Y_OJO, z: 44.5 } },   // 8  "starred_night" (mur1)
      { x: 32, z: 41, pause: 4.0, look: { x: 32, y: Y_OJO, z: 44.5 } },   // 9  "diego" (mur1)
      { x: 30, z: 33 },                                                   // 10
      { x: 30, z: 27 },                                                   // 11
      // --- Sala 3 (puerta X=40) ---
      { x: 40, z: 27 },                                                   // 12
      { x: 40, z: 33 },                                                   // 13  dentro de la sala 3
      { x: 38, z: 41, pause: 4.0, look: { x: 38, y: Y_OJO, z: 44.5 } },   // 14  "4.jpg" (mur1)
      { x: 40, z: 33 },                                                   // 15
      { x: 40, z: 27 },                                                   // 16  de vuelta al hall (luego loop al 0)
    ];

    const guideWaypoints = guideRoute.map(w => ({ x: w.x, y: 0, z: w.z })) ;
    // Mapa índice→{pause, look} que consume el BT del guía.
    const guideStops = {} ;
    guideRoute.forEach((w, i) => {
      if (w.pause) {
        guideStops[i] = { pause: w.pause, look: new BABYLON.Vector3(w.look.x, w.look.y, w.look.z) } ;
      }
    }) ;

    // El guía: persona más alta y de color dorado, para distinguirlo del grupo.
    this.createEntity("guia", ENTITIES.newton, { mass: 1.0, maxSpeed: 1.5, planar: true })
      .add(COMPS.person, { hauteur: 0.62, largeur: 0.42, epaisseur: 0.32, clothColor: [0.85, 0.65, 0.1] })
      .add(COMPS.position, guideWaypoints[0])
      .add(COMPS.trajectory, { waypoints: guideWaypoints, loop: true, startIndex: 0 })
      .add(COMPS.arrive, { vMax: 1.1, slowRadius: 1.5 })
      .add(COMPS.lookAtForward, {})
      .add(COMPS.gaze, {})
      .add(COMPS.behaviorTree, { root: buildGuideBT(guideStops) }) ;

    // Grupo de 4 visitantes que sigue al guía. Se llena este array a medida que
    // se crean; los componentes de flocking lo recorren recién en ejecución, así
    // que para entonces ya están todos los vecinos dentro.
    const grupoGuiado = [] ;
    const coloresGrupo = [
      [0.20, 0.35, 0.70], [0.70, 0.30, 0.30], [0.30, 0.60, 0.35], [0.65, 0.55, 0.20],
    ] ;

    for (let i = 0; i < 4; i++) {
      // Posición inicial en el hueco entre el gato (x=23) y el caballo (x=30),
      // corrida a la derecha (hacia el caballo) y delante de su huella, para que
      // nadie arranque trabado contra el caballo. Cluster 2x2.
      const px = 25.5 + (i % 2) * 2 ;          // 25.5 / 27.5
      const pz = 19   + Math.floor(i / 2) * 2 ; // 19 / 21
      const visitante = this.createEntity("seguidor_" + i, ENTITIES.newton, { mass: 1.0, maxSpeed: 1.5, planar: true })
        .add(COMPS.person, { hauteur: 0.5, largeur: 0.4, epaisseur: 0.3, clothColor: coloresGrupo[i] })
        .add(COMPS.position, { x: px, y: 0, z: pz })
        // Separación contra TODOS los peatones (libres + guiados): se esquivan
        // entre sí aunque no colisionen físicamente.
        .add(COMPS.separation, { group: peatones, radius: 1.4, k: 2.0 })
        // Cohesión y alineamiento solo dentro del grupo guiado (comportamiento
        // de grupo): no queremos que se agrupen con los que deambulan libres.
        .add(COMPS.cohesion,   { group: grupoGuiado, radius: 4.0, vMax: 1.2, k: 0.25 })
        .add(COMPS.alignment,  { group: grupoGuiado, radius: 3.0, k: 0.4 })
        // Seguir un punto detrás del guía (motor principal del grupo):
        .add(COMPS.followGuide, { guide: "guia", offset: 2.5, vMax: 1.4, slowRadius: 2.0, k: 1.2 })
        // Orientación: mira hacia donde camina y, si el guía presenta un cuadro,
        // gira para mirarlo (gaze tiene la última palabra → se añade después).
        .add(COMPS.lookAtForward, {})
        .add(COMPS.gaze, {}) ;
      grupoGuiado.push(visitante) ;
      peatones.push(visitante) ;
    }
  }
}

export { World }
