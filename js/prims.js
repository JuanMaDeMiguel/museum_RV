

function creerScene() {
  var scn = new BABYLON.Scene(engine);
  scn.gravity = new BABYLON.Vector3(0, -9.8, 0);
  scn.collisionsEnabled = true;
  return scn;
}


function creerCamera(name, options, scn) {
  // console.log("creation camera");
  // Création de la caméra
  // =====================

  const camera = new BABYLON.UniversalCamera(name, new BABYLON.Vector3(10, 1.7, 5), scn);
  camera.setTarget(new BABYLON.Vector3(0.0, 0.7, 0.0));

  camera.minZ = 0.05;

  camera.checkCollisions = false;
  camera.ellipsoid = new BABYLON.Vector3(0.5, 1.0, 0.5);
  camera.applyGravity = true;
  camera.keysLeft = [65, 37];  // A y Flecha Izquierda
  camera.keysUp = [87, 38];    // W y Flecha Arriba
  camera.keysRight = [68, 39]; // D y Flecha Derecha
  camera.keysDown = [83, 40];  // S y Flecha Abajo
  camera.inertia = 0.01;
  camera.angularSensibility = 1000;
  camera.speed = 10


  return camera
}

function creerReticule(nom, opts, scn) {
  const reticule = BABYLON.MeshBuilder.CreateSphere("reticule", { segments: 4, diameter: 0.0025 }, scn);
  const retMat = new BABYLON.StandardMaterial("reticuleMat", scn);
  retMat.emissiveColor = BABYLON.Color3.Red();
  retMat.specularColor = BABYLON.Color3.Black();
  retMat.diffuseColor = BABYLON.Color3.Black();
  reticule.material = retMat;
  reticule.isPickable = false;
  reticule.position.z = 0.3;

  return reticule;
}

function creerCiel(nom, options, scene) {
  const skyMaterial = new BABYLON.StandardMaterial("mat_skybox", scene);
  skyMaterial.backFaceCulling = false;
  skyMaterial.reflectionTexture = new BABYLON.CubeTexture("./assets/skybox/skybox", scene);
  skyMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
  skyMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
  skyMaterial.specularColor = new BABYLON.Color3(0, 0, 0);

  const skyBox = BABYLON.Mesh.CreateBox("skybox", 200, scene);
  skyBox.material = skyMaterial;

  return skyBox;
}

function creerSol(name, options, scn) {
  options = options || {};
  const width = options.largeur || 100.0;
  const height = options.profondeur || width;

  const subdivisions = Math.round(width / 10);

  let materiau = options.materiau || null;

  const sol = BABYLON.MeshBuilder.CreateGround(name, { width, height, subdivisions }, scn);

  if (materiau) {
    sol.material = materiau;
  } else {
    materiau = new BABYLON.StandardMaterial("materiau-defaut-" + name, scn);
    materiau.diffuseColor = new BABYLON.Color3(1.0, 0.8, 0.6);
    sol.material = materiau;
  };

  sol.checkCollisions = true;

  return sol;

}

function creerPrairie(name, options, scn) {
  let sol = BABYLON.Mesh.CreateGround(name, 220.0, 220.0, 2.0, scn);
  sol.checkCollisions = true;
  sol.material = new BABYLON.StandardMaterial("blanc", scn);
  // sol.material.diffuseColor  = new BABYLON.Color3(1.0,0,0) ;
  sol.material.diffuseTexture = new BABYLON.Texture('./assets/textures/grass.png', scn);
  sol.material.specularTexture = new BABYLON.Texture('./assets/textures/grass.png', scn);
  sol.material.emissiveTexture = new BABYLON.Texture('./assets/textures/grass.png', scn);
  sol.material.ambientTexture = new BABYLON.Texture('./assets/textures/grass.png', scn);
  sol.material.diffuseTexture.uScale = 10.0;
  sol.material.diffuseTexture.vScale = 10.0;
  sol.material.specularTexture.uScale = 10.0;
  sol.material.specularTexture.vScale = 10.0;
  sol.material.emissiveTexture.uScale = 10.0;
  sol.material.emissiveTexture.vScale = 10.0;
  sol.material.ambientTexture.uScale = 10.0;
  sol.material.ambientTexture.vScale = 10.0;
  sol.receiveShadows = true;
  sol.metadata = { "type": 'ground' }
  return sol
}

function creerMateriauStandard(nom, options, scn) {
  let rvb = options.couleur || [1, 1, 1];
  const coul = new BABYLON.Color3(rvb[0], rvb[1], rvb[2]);
  let texture = options.texture || null;
  let uScale = options.uScale || 1.0;
  let vScale = options.vScale || 1.0;

  let materiau = new BABYLON.StandardMaterial(nom, scn);
  if (coul != null) materiau.diffuseColor = coul;
  if (texture != null) {
    materiau.diffuseTexture = new BABYLON.Texture(texture, scn);
    materiau.diffuseTexture.uScale = uScale;
    materiau.diffuseTexture.vScale = vScale;
  }
  return materiau;
}


function creerSphere(nom, opts, scn) {

  let options = opts || {};
  let diametre = opts.diametre || 1.0;
  let materiau = opts.materiau || null;

  if (materiau == null) {
    materiau = new BABYLON.StandardMaterial("blanc", scn);
    materiau.diffuseColor = new BABYLON.Color3(1.0, 1.0, 1.0);
  }

  let sph = BABYLON.Mesh.CreateSphere(nom, 16, diametre, scn);
  sph.material = materiau

  return sph;

}


function creerBoite(nom, opts, scn) {
  let options = opts || {};
  let width = opts.largeur || 1.0;
  let height = opts.hauteur || 1.0;
  let depth = opts.profondeur || 1.0;
  let hasAlpha = opts.hasAlpha || false;
  let alpha = opts.alpha || 0.0;
  let backFaceCulling = opts.backFaceCulling || true;
  let materiau = opts.materiau || null;

  if (materiau == null) {
    materiau = new BABYLON.StandardMaterial("blanc", scn);
    materiau.diffuseColor = new BABYLON.Color3(1.0, 1.0, 1.0);
  }
  if (hasAlpha) {
    materiau.alpha = alpha; // transparencia
    materiau.specularColor = new BABYLON.Color3(1.0, 1.0, 1.0); // reflejo blanco
    materiau.backFaceCulling = backFaceCulling; // ver las dos caras (muy importante)
    console.log("#################################")
  }

  let box = BABYLON.MeshBuilder.CreateBox(nom, { width, height, depth }, scn);
  box.material = materiau

  return box;
}

function creerPoster(nom, opts, scn) {

  let options = opts || {};
  let hauteur = options["hauteur"] || 1.0;
  let largeur = options["largeur"] || 1.0;
  let textureName = options["tableau"] || "";

  var group = new BABYLON.TransformNode("group-" + nom)
  var tableau1 = BABYLON.MeshBuilder.CreatePlane("tableau-" + nom, { width: largeur, height: hauteur }, scn);
  var verso = BABYLON.MeshBuilder.CreatePlane("verso-" + nom, { width: largeur, height: hauteur }, scn);
  tableau1.parent = group;
  verso.position.z = -0.01;
  verso.parent = group;
  tableau1.rotation.y = Math.PI;

  var mat = new BABYLON.StandardMaterial("tex-tableau-" + nom, scn);
  mat.diffuseTexture = new BABYLON.Texture(textureName, scn);
  tableau1.material = mat;

  tableau1.checkCollisions = true;

  return group;

}

function creerCloison(nom, opts, scn) {

  let options = opts || {};
  let hauteur = options.hauteur || 3.0;
  let largeur = options.largeur || 5.0;
  let epaisseur = options.epaisseur || 0.1;

  let materiau = options.materiau || new BABYLON.StandardMaterial("materiau-pos" + nom, scn);

  let groupe = new BABYLON.TransformNode("groupe-" + nom);

  let cloison = BABYLON.MeshBuilder.CreateBox(nom, { width: largeur, height: hauteur, depth: epaisseur }, scn);
  cloison.material = materiau;
  cloison.parent = groupe;
  cloison.position.y = hauteur / 2.0;

  cloison.checkCollisions = true;

  return groupe;
}

function creerCloisonEtTrou(nom, opts, scn) {

  let options = opts || {};
  let optionsCloison = options.cloison || {};
  let optionsTrou = options.trou || {}

  // Crear grupo padre
  const groupe = creerCloison(nom, optionsCloison, scn);;
  // Obtener mesh de la pared
  const cloison = groupe.getChildMeshes()[0];


  // Crear el agujero
  const trouGroupe = creerCloison("mur_" + nom, optionsTrou, scn);
  // Ubicar el agujero respecto a la pared
  const pos = opts.trou.position || new BABYLON.Vector3(0, opts.trou.hauteur / 2.0, 0);
  trouGroupe.position = cloison.position.add(pos);

  // Boolean: restar el agujero
  const csgCloison = BABYLON.CSG.FromMesh(cloison);
  const csgTrou = BABYLON.CSG.FromMesh(trouGroupe.getChildMeshes()[0]);
  const csgResult = csgCloison.subtract(csgTrou);

  // Generar la mesh de la pared sin el agujero con un material
  const nouvelleCloison = csgResult.toMesh("cloison-avec-trou-" + nom, cloison.material, scn);
  nouvelleCloison.checkCollisions = true;
  nouvelleCloison.parent = groupe;

  // Limpiar
  cloison.dispose();
  trouGroupe.getChildMeshes()[0].dispose();

  return groupe;
}


function creuser(mesh0, mesh1) {
  const csg0 = BABYLON.CSG.FromMesh(mesh0);
  const csg1 = BABYLON.CSG.FromMesh(mesh1);
  csg0.subtractInPlace(csg1);
  const csgMesh = csg0.toMesh();
  mesh0.dispose();
  mesh1.dispose();
  return csgMesh;
}


function creerPersonne(nom, opts, scn) {
  let options = opts || {};
  let hauteur = options.hauteur || 0.5;
  let largeur = options.largeur || 0.5;
  let epaisseur = options.epaisseur || 0.5;
  let diametre = options.diametre || 0.1;

  let materiau = options.materiau || new BABYLON.StandardMaterial("materiau-pos" + nom, scn);
  let eye_material = options.eye_material || new BABYLON.StandardMaterial("materiau-pos" + nom, scn);
  let body_material = options.body_material || new BABYLON.StandardMaterial("materiau-pos" + nom, scn);
  let hair_material = options.hair_material;

  if (!hair_material) {
    hair_material = new BABYLON.StandardMaterial("materiau-pos" + nom, scn);
    hair_material.diffuseColor = new BABYLON.Color3(0, 0, 0);
  }//noir

  let groupe = new BABYLON.TransformNode("groupe-" + nom);

  let body = BABYLON.MeshBuilder.CreateBox(nom, { width: largeur * 2, height: hauteur * 4, depth: epaisseur * 2 }, scn);
  body.material = body_material;
  body.parent = groupe;
  body.position.y = hauteur * 2;

  let head = BABYLON.MeshBuilder.CreateBox(nom, { width: largeur, height: hauteur * 0.8, depth: epaisseur }, scn);
  head.material = materiau;
  head.parent = groupe;
  head.position.y = hauteur * 4 + hauteur * 0.8 / 2.0;

  let hair = BABYLON.MeshBuilder.CreateBox(nom, { width: largeur, height: hauteur * 0.2, depth: epaisseur }, scn);
  hair.material = hair_material;
  hair.parent = groupe;
  hair.position.y = hauteur * 4 + hauteur * 0.8 + 0.1 * hauteur;

  let eye_L = BABYLON.MeshBuilder.CreateSphere(nom, { diameter: diametre }, scn);
  eye_L.material = eye_material;
  eye_L.parent = groupe;
  eye_L.position.x = largeur / 5;
  eye_L.position.y = hauteur * 4 + hauteur / 2.0;
  eye_L.position.z = largeur / 2;
  eye_L.rotation.y = 2 * Math.PI / 4;

  let eye_R = BABYLON.MeshBuilder.CreateSphere(nom, { diameter: diametre }, scn);
  eye_R.material = eye_material;
  eye_R.parent = groupe;
  eye_R.position.x = -largeur / 5;
  eye_R.position.y = hauteur * 4 + hauteur / 2.0;
  eye_R.position.z = largeur / 2;
  eye_R.rotation.y = 2 * Math.PI / 4;

  return groupe;
}


function creerCloisonAvecTrous(nom, opts, scn) {
  let options = opts || {};
  let optionsCloison = options.cloison || {};
  let trous = options.trous || []; // Array de huecos

  // Crear grupo padre y obtener la pared base
  const groupe = creerCloison(nom, optionsCloison, scn);
  const cloison = groupe.getChildMeshes()[0];

  // CSG base
  let csgCloison = BABYLON.CSG.FromMesh(cloison);

  // Para cada hueco
  for (let i = 0; i < trous.length; i++) {
    let trouOpts = trous[i];
    let trouGroup = creerCloison(`trou_${nom}_${i}`, trouOpts, scn);
    let pos = trouOpts.position || new BABYLON.Vector3(0, trouOpts.hauteur / 2.0, 0);
    trouGroup.position = cloison.position.add(pos);

    const trouMesh = trouGroup.getChildMeshes()[0];
    const csgTrou = BABYLON.CSG.FromMesh(trouMesh);
    csgCloison = csgCloison.subtract(csgTrou);

    trouMesh.dispose();
  }

  const nouvelleCloison = csgCloison.toMesh(`cloison-avec-trous-${nom}`, cloison.material, scn);
  nouvelleCloison.checkCollisions = true;
  nouvelleCloison.parent = groupe;

  const boisMat = new BABYLON.StandardMaterial("fenetre", scn);


  for (let i = 0; i < trous.length; i++) {
    let trouOpts = trous[i];
    if (trouOpts.fenetre) {

      if (scn.textures.find(t => t.name === trouOpts.materiau)) {
        boisMat.diffuseTexture = new BABYLON.Texture(trouOpts.materiau)
      } else {
        boisMat.diffuseTexture = new BABYLON.Texture("./assets/rock.jpg", scn);
      }
      boisMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
      // Reflejo ambiental (HDR o skybox)
      var hdrTexture = new BABYLON.HDRCubeTexture("./assets/skybox/partly_cloudy_puresky.hdr", scn, 512);

      // Skybox
      var hdrSkybox = BABYLON.Mesh.CreateBox("hdrSkyBox", 1000.0, scn);
      var hdrSkyboxMaterial = new BABYLON.PBRMaterial("skyBox", scn);
      hdrSkyboxMaterial.backFaceCulling = false;
      hdrSkyboxMaterial.reflectionTexture = hdrTexture.clone();
      hdrSkyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
      hdrSkyboxMaterial.microSurface = 1.0;
      hdrSkyboxMaterial.cameraExposure = 0.66;
      hdrSkyboxMaterial.cameraContrast = 1.66;
      hdrSkyboxMaterial.disableLighting = true;
      hdrSkybox.material = hdrSkyboxMaterial;
      hdrSkybox.infiniteDistance = true;


      var glass = new BABYLON.PBRMaterial("glass", scn);
      glass.reflectionTexture = hdrTexture;
      glass.indexOfRefraction = 0.52;
      glass.alpha = 0.5;
      glass.directIntensity = 0.0;
      glass.environmentIntensity = 0.7;
      glass.cameraExposure = 0.66;
      glass.cameraContrast = 1.66;
      glass.microSurface = 1;
      glass.reflectivityColor = new BABYLON.Color3(0.2, 0.2, 0.2);
      glass.albedoColor = new BABYLON.Color3(0.95, 0.95, 0.95);


      let frameOpts = trouOpts
      frameOpts.materiau = boisMat
      let frameGroupe = creerCloison(`trou_frame_${nom}_${i}`, frameOpts, scn);
      frameGroupe.parent = nouvelleCloison
      let pos = frameOpts.position || new BABYLON.Vector3(0, frameOpts.hauteur / 2.0, 0);
      frameGroupe.position = pos//nouvelleCloison.position.add(pos)
      let frame = frameGroupe.getChildMeshes()[0]
      let csgFrame = BABYLON.CSG.FromMesh(frame);

      let glassOpts = trouOpts
      glassOpts.largeur *= 0.85
      glassOpts.hauteur *= 0.85
      glassOpts.position = new BABYLON.Vector3(0, 0, 0);
      glassOpts.position.y += (- (frameOpts.hauteur / 2)) //(glassOpts.hauteur*0.075)
      glassOpts.materiau = glass
      let glassGroupe = creerCloison(`trou_glass_${nom}_${i}`, glassOpts, scn);
      glassGroupe.position = frame.position.add(glassOpts.position)
      glassGroupe.parent = frameGroupe
      let glassMesh = glassGroupe.getChildMeshes()[0]
      let csgGlass = BABYLON.CSG.FromMesh(glassMesh);

      csgFrame = csgFrame.subtract(csgGlass)
      //glassMesh.dispose()

      const nouvelleFrame = csgFrame.toMesh(`frame_bois_${nom}_${i}`, frame.material, scn);
      nouvelleFrame.checkCollisions = true;
      nouvelleFrame.parent = frameGroupe
      frame.dispose()
    }
  }


  cloison.dispose();

  return groupe;
}


function creerPorte(nom, opts, scn) {

  let options = opts || {};
  let hauteur = options.height || 3.0;
  let largeur = options.width || 5.0;
  let epaisseur = options.epaisseur || 0.1;
  let ndoors = 1

  //const materiau = new BABYLON.StandardMaterial("door_metal", scn);
  let materiau;
  let groupe = new BABYLON.TransformNode("groupe-" + nom);

  if (options.type == "coulissante") {
    // Matériau en verre noir translucide
    materiau = new BABYLON.StandardMaterial("verre_noir", scn);
    materiau.diffuseColor = new BABYLON.Color3(0, 0, 0);
    materiau.alpha = 0.6;
    materiau.hasAlpha = true;
    materiau.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    materiau.backFaceCulling = false;
    ndoors = 2
  } else {
    materiau.diffuseTexture = new BABYLON.Texture("./assets/ceilling.jpg", scn);
  }

  for (let i = 0; i < ndoors; i++) {
    let door = BABYLON.MeshBuilder.CreateBox(nom + i, { width: largeur / ndoors, height: hauteur, depth: epaisseur }, scn);
    door.material = materiau
    door.checkCollisions = true
    door.parent = groupe
    door.position.x = door.position.x + (-1 + (2 * i)) * largeur / 4
  }

  return groupe
}


// function to impor a .glb file
function creerModel3D(nom, opts, scn) {
  const filename = opts.fichier || "";
  const scaling = opts.echelle || 0.1;

  const container = new BABYLON.TransformNode("model-container-" + nom, scn);

  BABYLON.SceneLoader.ImportMesh(
    null,
    "",
    filename,
    scn,
    function (meshes) {
      meshes.forEach(mesh => {
        mesh.parent = container;
      });
      container.scaling = new BABYLON.Vector3(scaling, scaling, scaling);
    },
    null,
    function (scene, message, exception) {
      console.error("Erreur de chargement du modèle 3D :", message, exception);
    }
  );

  return container;
}

function creerEtoile(nom, opts, scn) {
  let options = opts || {};
  let largeur = options.largeur || 0.2;
  let hauteur = options.hauteur || 2.0;
  let profondeur = options.profondeur || 0.2;
  let materiau = options.materiau || null;

  if (materiau == null) {
    materiau = new BABYLON.StandardMaterial("mat_" + nom, scn);
    materiau.diffuseColor = new BABYLON.Color3(1.0, 1.0, 0.8); // dorado claro
    materiau.specularColor = new BABYLON.Color3(1.0, 1.0, 1.0);
  }

  const base = new BABYLON.TransformNode(nom, scn);

  // Primer cubo 
  const box1 = BABYLON.MeshBuilder.CreateBox(nom + "_1", {
    width: largeur,
    height: hauteur,
    depth: profondeur
  }, scn);
  box1.material = materiau;
  box1.parent = base;

  // Segundo cubo
  const box2 = BABYLON.MeshBuilder.CreateBox(nom + "_2", {
    width: largeur,
    height: hauteur,
    depth: profondeur
  }, scn);
  box2.material = materiau;
  box2.rotation.y = Math.PI / 4;
  box2.parent = base;

  // Tercer cubo
  const box3 = BABYLON.MeshBuilder.CreateBox(nom + "_3", {
    width: largeur,
    height: hauteur,
    depth: profondeur
  }, scn);
  box3.material = materiau;
  box3.rotation.x = Math.PI / 4;
  box3.parent = base;

  // Cuarto cubo
  const box4 = BABYLON.MeshBuilder.CreateBox(nom + "_4", {
    width: largeur,
    height: hauteur,
    depth: profondeur
  }, scn);
  box4.material = materiau;
  box4.rotation.z = Math.PI / 4;
  box4.parent = base;

  return base;
}

const PRIMS = {
  "camera": creerCamera,
  "reticule": creerReticule,
  "wall": creerCloison,
  "sphere": creerSphere,
  "box": creerBoite,
  "poster": creerPoster,
  "standardMaterial": creerMateriauStandard,
  "meadow": creerPrairie,
  "ground": creerSol,
  "sky": creerCiel,
  "creuser": creuser,
  "person": creerPersonne,
  "wallHole": creerCloisonAvecTrous,//creerCloisonEtTrou
  "door": creerPorte,
  "model": creerModel3D,
  "star": creerEtoile,
}

export { PRIMS }; 
