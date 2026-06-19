# museum_RV

Museo virtual interactivo construido con Babylon.js. Incluye navegación en primera
persona (cámara con colisiones y gravedad), un edificio modelado con primitivas y
operaciones CSG, un sistema de entidades/componentes (ECS) propio, y NPCs visitantes
que recorren el museo usando **steering behaviors** y **árboles de comportamiento
(Behavior Trees)**.

Este documento describe la arquitectura del proyecto y, en detalle, cómo está
implementado el sistema de IA de los visitantes — útil como referencia para un
informe/rapport de la materia.

## Cómo correrlo

El proyecto usa ES modules (`<script type="module">`), por lo que el navegador
necesita servir los archivos por HTTP (no funciona con `file://`). Desde la raíz
del repo:

```
python3 -m http.server 8000
```

y abrir `http://localhost:8000/index.html`.

> Nota: los navegadores cachean agresivamente los módulos ES. Si editás un `.js` y
> no ves el cambio, forzar un hard refresh (Ctrl+Shift+R).

## Arquitectura general

```
index.html
js/
  visu.js          → capa base: motor Babylon (engine, scene, render loop)
  simu.js          → extiende Visu, agrega el bucle de simulación (entities, update)
  world.js         → createWorld(): construye el edificio + entidades de la escena
  prims.js         → fábrica de primitivas Babylon (paredes, puertas, materiales, personas...)
  pointerLock.js   → control de cámara en primera persona
  entities/
    entities.js    → clases base de entidad: Entity, Kine, Newton
  components/
    component.js   → clase base Component
    components.js  → registro COMPS { nombre: Clase } usado por world.js
    position.js, rotation.js, model.js, wall.js, ...  → componentes "de escena"
    person.js, seek.js, arrive.js, trajectory.js,
    lookAtForward.js, behaviorTree.js                 → componentes de IA/visitante
  bt/
    behaviorTree.js → primitivas genéricas de Behavior Tree (Status, Selector, Sequence...)
    visitorBT.js     → árbol de comportamiento concreto del visitante
```

### Patrón ECS (Entity-Component-System)

- **Entity** (`entities.js`): contenedor con `position`, `rotation`, `object3d` y una
  lista de `components`. `Newton` además tiene `velocity`/`force`/`mass` y
  `applyForce()` (dinámica newtoniana: integración de Euler).
- **Component** (`component.js`): clase base con `register()` (se suma a
  `entity.components`) y `execute(dt)` (lógica por frame).
- **Simu.update(dt)** (`simu.js`) hace **dos pasadas** sobre todas las entidades en
  cada frame:
  1. `entity.execute()` → cada componente decide/calcula (ej. fuerzas de steering,
     ticks del árbol de comportamiento).
  2. `entity.update(dt)` → integra el movimiento resultante (posición += velocidad·dt,
     o `moveWithCollisions` si hay colisión).

  Esta separación decisión/integración es clave: el Behavior Tree y los steering
  behaviors sólo *deciden* (fase 1); quien mueve realmente al NPC es `Newton.update`
  (fase 2).

### El edificio

`world.js` construye las paredes, puertas, techo y piso con primitivas de
`prims.js`, usando operaciones CSG (`creuser`) para recortar huecos de puertas en
los muros. Hay materiales separados para:
- piso exterior/plataforma (`materiau2`, textura mármol/cuadros),
- piso interior del museo (`materiauPiso`, distinto color/textura),
- alfombras por sala (`materiauAlfombra`, planos de color liso sobre el piso),
- paredes de fondo vs. laterales (`materiauFondo` / `materiauLateral`, gris oscuro
  liso, sin textura — variantes de tono para que las salas no sean idénticas).

La cámara (`prims.js`, `creerCamera`) usa el sistema de colisiones nativo de
Babylon: `checkCollisions = true`, una `ellipsoid` (cápsula de colisión) y
`applyGravity`. Los NPCs reutilizan exactamente la misma idea (ver más abajo).

## Sistema de IA de los visitantes

El objetivo: NPCs que recorren el museo de forma creíble — caminan por una sala,
se acercan a una puerta, la cruzan, entran a la siguiente sala, se detienen un
rato frente a una "obra" (waypoint), y repiten el recorrido en loop. Dos visitantes
con colores de ropa distintos recorren el mismo circuito en sentidos opuestos y
con desfase de fase (no caminan pegados).

El sistema se compone de tres piezas independientes que se combinan en cada NPC:

1. **Steering behaviors** (cómo moverse hacia un punto)
2. **Trajectory** (la lista de puntos a visitar)
3. **Behavior Tree** (cuándo seguir caminando vs. cuándo pausar/avanzar de punto)

### 1. Steering behaviors (`Seek` / `Arrive`)

Basados en Reynolds (1987). Son `Component`s que en `execute(dt)` leen
`entity.blackboard.target` (el waypoint actual) y aplican una fuerza al `Newton`
vía `applyForce`:

- **Seek** (`components/seek.js`): calcula la velocidad deseada (`vMax` en
  dirección al target) y aplica la diferencia con la velocidad actual como fuerza.
  Resultado: el NPC acelera al máximo hacia el objetivo y lo *pasa de largo* si no
  frena (overshoot).
- **Arrive** (`components/arrive.js`): igual que Seek, pero dentro de un
  `slowRadius` la velocidad deseada se escala linealmente con la distancia
  restante, generando una desaceleración suave. Es el que usan los visitantes
  (`COMPS.arrive`), para que se detengan limpiamente en cada punto en vez de
  rebotar contra el waypoint.

Estas fuerzas se acumulan en `Newton.force` y se integran en `Newton.update(dt)`
(fase 2 del frame).

### 2. Movimiento con colisiones (`Newton` + `Person`)

Inicialmente los NPCs atravesaban las paredes: la posición se copiaba directo a
la malla sin chequeo de colisión, y la malla visible (un `TransformNode`) no
tenía `checkCollisions` ni `ellipsoid`. La solución, en `components/person.js`,
es replicar el patrón de la cámara:

- Se crea una **malla collider invisible** (`BABYLON.MeshBuilder.CreateBox`, con
  `isVisible = false`) que tiene `checkCollisions = true` y una `ellipsoid` +
  `ellipsoidOffset` proporcionales al tamaño del personaje.
- El cuerpo visible del visitante (generado por `PRIMS.person`, con materiales de
  piel/ropa/pelo/ojos) se cuelga como **hijo** de ese collider.
- `entity.object3d` apunta al collider, no al cuerpo visible.

En `entities/entities.js`, `Newton.update(dt)` ahora detecta si `object3d` soporta
`moveWithCollisions` y, si es así, mueve el collider con
`object3d.moveWithCollisions(velocity·dt)` en vez de asignar la posición
directamente. Babylon se encarga de deslizar al NPC contra la pared (igual que
hace con la cámara) en lugar de dejarlo pasar o pegado en seco.

### 3. Trajectory: el grafo de waypoints

`components/trajectory.js` guarda una lista de `BABYLON.Vector3` (`waypoints`) y
expone el punto actual en `entity.blackboard.target`. Métodos/opciones:

- `next()`: avanza al siguiente waypoint (`index += direction`); si `loop` está
  activo, vuelve al principio/final en vez de detenerse.
- `startIndex` / `reverse`: permiten que distintos NPCs arranquen en puntos
  distintos del mismo array de waypoints y/o lo recorran en sentido inverso —
  así dos visitantes compartiendo el mismo circuito (`world.js`) no quedan
  sincronizados ni se pisan.

Los waypoints en sí (`world.js`) **no son arbitrarios**: se calcularon a partir de
las coordenadas absolutas reales de paredes y puertas ya definidas en la
construcción del edificio (posición de `mur4_final`, huecos de puerta en
`pInt1/2/3`, ancho de la hoja corrediza en `creerPorte`, etc.), para que cada
tramo del recorrido (hall → puerta → dentro de la sala → punto de interés →
salida) pase efectivamente por el hueco de la puerta y no contra el macizo de la
pared. Bug inicial detectado y corregido: un desfase doble de `offsetX/offsetZ`
hacía que los waypoints apuntaran dentro de otra sala o contra la pared.

### 4. Behavior Tree: cuándo caminar y cuándo pausar

`bt/behaviorTree.js` implementa las primitivas clásicas de BT, genéricas y
reutilizables (no dependen de "visitante" ni de Babylon):

| Nodo | Tipo | Semántica |
|---|---|---|
| `Selector` | compuesto | "OR": prueba hijos en orden, devuelve el primer resultado ≠ `FAILURE` |
| `Sequence` | compuesto | "AND": prueba hijos en orden, devuelve el primer resultado ≠ `SUCCESS` |
| `Inverter` | decorador | invierte `SUCCESS`↔`FAILURE` |
| `Succeeder` / `Failer` | decorador | fuerza el resultado del hijo a `SUCCESS`/`FAILURE` |
| `Condition` | hoja | pregunta booleana, nunca devuelve `RUNNING` |
| `Action` | hoja | ejecuta una acción del juego, devuelve cualquier `Status` |

`Status` es `{SUCCESS, FAILURE, RUNNING}`. Cada nodo expone `tick(entity, dt)`.

`bt/visitorBT.js` instancia un árbol concreto para el visitante:

```
[Selector]
├── [Sequence]  ← rama "está pausado"
│   ├── Condition: isPaused
│   └── Action:    waitOrResume   (descuenta el timer; al llegar a 0, Trajectory.next())
└── [Sequence]  ← rama "llegó a destino"
    ├── Condition: arrivedAtWaypoint  (distancia al target < 0.5)
    └── Action:    startPause         (marca paused=true, arranca el timer)
```

Si ninguna rama dispara (el NPC sigue caminando, no llegó todavía), el `Selector`
devuelve `FAILURE` — y eso está bien: simplemente significa "seguir caminando",
algo que ya hace `Arrive` en su propio `execute(dt)` sin que el árbol tenga que
ordenarlo explícitamente. El BT sólo gobierna las **transiciones de estado**
(caminar ↔ pausado), no el movimiento en sí.

`components/behaviorTree.js` es el puente entre el árbol y el ECS: es un
`Component` cuyo `execute(dt)` simplemente llama `this.root.tick(entity, dt)` en
cada frame.

### Blackboard

El patrón "blackboard" (`entity.blackboard = {...}`) es la memoria compartida
entre todas estas piezas sin que se conozcan entre sí directamente:

- `Trajectory` escribe `blackboard.target` (el waypoint actual).
- `Seek`/`Arrive` lo leen para calcular la fuerza de steering.
- `visitorBT` lee/escribe `blackboard.paused` y `blackboard.pauseTimer`.

Así, `Trajectory`, `Arrive` y `visitorBT` son componentes desacoplados — ninguno
necesita una referencia directa a los otros, sólo al blackboard compartido del
entity.

### Ensamblado de un visitante (`world.js`)

```js
this.createEntity(nombre, ENTITIES.newton, { mass: 1.0 })
  .add(COMPS.person,      { hauteur: 0.5, largeur: 0.4, epaisseur: 0.3, clothColor })
  .add(COMPS.position,    posicionInicial)
  .add(COMPS.trajectory,  { waypoints: recorrido, pauseTime: 1.5, loop: true, startIndex, reverse })
  .add(COMPS.arrive,      { vMax: 1.2, slowRadius: 2.0 })
  .add(COMPS.lookAtForward, {})
  .add(COMPS.behaviorTree,  { root: buildVisitorBT() }) ;
```

Cada frame, para esta entidad: `Arrive.execute` aplica fuerza hacia
`blackboard.target` → `BehaviorTree.execute` evalúa si hay que pausar/avanzar
de waypoint → `LookAtForward.execute` orienta la malla según la velocidad →
`Newton.update` integra la física y mueve el collider con `moveWithCollisions`.

## Puertas automáticas (`autoDoor`)

Las puertas correderas se abren solas cuando un agente (el jugador o un visitante)
se acerca, y se cierran al alejarse. Sigue la directiva del curso (pág. 70,
*"regarder régulièrement"*): en vez de un raycast puntual, la proximidad se evalúa
en cada tick de la simulación.

- **`prims.js` (`creerPorte`)**: cada puerta arranca **cerrada** y guarda en
  `mesh.metadata` la `x` cerrada y la `x` abierta de cada hoja. Cerradas, las dos
  hojas se tocan en el centro; abiertas, cada una desliza su propio ancho hacia su
  lado y despeja el hueco.
- **`components/autoDoor.js`**: mismo patrón que `Person`/`Model` (el constructor
  construye la malla con `PRIMS.door`; `execute()` la anima cada frame). En cada
  tick calcula la distancia horizontal del agente más cercano —la cámara más todas
  las entidades con `blackboard` (los visitantes)— y, si es menor que `radius`,
  interpola cada hoja hacia su `x` abierta; si no, hacia la cerrada. La
  interpolación suave (`x += (target - x) * speed`) da el deslizamiento.
- **`world.js`**: las 4 puertas (la principal y las 3 internas) pasan a ser
  **entidades** `ENTITIES.entity` con el componente `COMPS.autoDoor`, en vez de
  mallas sueltas. La detección reutiliza el `blackboard` ya existente como marca de
  "agente perceptible", sin acoplar `autoDoor` a la clase de los visitantes.

Detalle: la distancia se mide con `object3d.getAbsolutePosition()`, así funciona
igual para la puerta principal (que cuelga de la fachada como hijo) y para las
internas (posicionadas en coordenadas de mundo).

## Resumen de decisiones de diseño (para el informe)

- **Por qué ECS y no herencia de clases por tipo de objeto**: permite combinar
  comportamientos (steering + colisión + BT + orientación) por composición,
  agregando/quitando `Component`s sin tocar la clase `Entity`.
- **Por qué separar "decisión" (`execute`) de "integración" (`update`)**: evita que
  un componente de IA pise el estado físico a mitad de cálculo; todas las fuerzas
  del frame se acumulan primero y se integran una sola vez.
- **Por qué Behavior Tree y no una máquina de estados (FSM) ad-hoc**: los nodos
  compuestos (`Selector`/`Sequence`) son reutilizables y componibles — agregar un
  tercer estado (por ejemplo "evitar a otro visitante") es agregar una rama al
  árbol, no reescribir transiciones de una FSM.
- **Por qué un collider invisible separado del mesh visible**: reutiliza el motor
  de colisiones nativo de Babylon (el mismo que la cámara) sin atar la forma de
  colisión a la geometría visual del personaje, que puede ser más compleja o
  cambiar independientemente.
