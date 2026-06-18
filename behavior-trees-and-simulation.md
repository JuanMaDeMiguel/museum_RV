# Behavior Trees & Virtual World Simulation — Reference

> Compiled from three sources:
> - *Behavior Trees for Modelling AI in Games: A Tutorial* — Marcotte & Hamilton (2017)
> - *Behavior Trees for AI: How They Work* — Chris Simpson (2014)
> - *Simuler pour animer* — Eric Maisel (2026)

---

## Table of Contents

1. [Behavior Trees — Fundamentals](#1-behavior-trees--fundamentals)
2. [Node Types](#2-node-types)
3. [Control Flow Nodes](#3-control-flow-nodes)
4. [Decorator Nodes](#4-decorator-nodes)
5. [Building a Behavior Tree — Example](#5-building-a-behavior-tree--example)
6. [Practical BT Tips (Project Zomboid)](#6-practical-bt-tips-project-zomboid)
7. [BT Editors](#7-bt-editors)
8. [BT Limitations & Recommendations](#8-bt-limitations--recommendations)
9. [Virtual World Simulation Architecture](#9-virtual-world-simulation-architecture)
10. [Entity-Component System](#10-entity-component-system)
11. [Kinematics & Newtonian Dynamics](#11-kinematics--newtonian-dynamics)
12. [Steering Behaviors](#12-steering-behaviors)
13. [Crowd Simulation (Flocking)](#13-crowd-simulation-flocking)

---

## 1. Behavior Trees — Fundamentals

A **Behavior Tree (BT)** is a model for plan execution represented as a tree. It is executed each game tick starting from the root node via **pre-order traversal** (root first, then children left-to-right).

### When to use BTs
- Game designers who are not programmers are involved
- Complex conditions govern entity behavior
- NPCs share aspects of behavior in common

### Status Codes
Every node returns one of:

| Code | Meaning |
|------|---------|
| `SUCCESS` | Task completed successfully |
| `FAILURE` | Task completed, but not successfully |
| `RUNNING` | Task not yet complete, needs more ticks |
| `ERROR` | Debug only — programming error |

### Origins
BTs became popular after use in *Halo 2* (Bungie, 2004). They grew from work on story-character behavior design and are now also used in robotics.

### Alternatives to BTs
- Procedures in an ordinary programming language
- Finite State Machines (states + transitions)
- Hierarchical Task Networks (require a planner)
- Scripts / behavior languages

---

## 2. Node Types

### Leaf Nodes (can only appear at leaves)

#### Action
Performs a game action (move entity, play sound, pathfind, etc.).
- Returns `SUCCESS` / `FAILURE` / `RUNNING`
- Represented as a labeled box, e.g. `Wander`

#### Condition
Stores a Boolean question ("Am I near the player?", "Am I low on HP?").
- Returns `SUCCESS` if true, `FAILURE` if false
- **Never** returns `RUNNING`
- Represented as a labeled box with a question

#### Reference
Links to another BT (enables modularity/reuse).
- Returns the status of the linked BT
- Represented as a double-boxed node with a BT name

### Internal Nodes

#### Control Flow (non-leaf nodes)
Groups children and directs execution order — see Section 3.

#### Decorators (leaf or non-leaf)
Modifies a single child's return code — see Section 4.

---

## 3. Control Flow Nodes

### Selector (`?` — circle with question mark)
> "Try children left-to-right; succeed on first success."
> Analogous to an **OR gate**.

```
foreach child in children:
  childStatus = execute(child)
  if childStatus == RUNNING  → return RUNNING
  if childStatus == SUCCESS  → return SUCCESS
return FAILURE
```

- Stops and returns `SUCCESS` as soon as one child succeeds
- Skips remaining children after a success
- Returns `FAILURE` only if ALL children fail
- **Use for**: choosing between multiple courses of action, prioritized fallbacks

### Sequence (`→` — box with arrow)
> "Run children left-to-right; fail on first failure."
> Analogous to an **AND gate**.

```
foreach child in children:
  childStatus = execute(child)
  if childStatus == RUNNING  → return RUNNING
  if childStatus == FAILURE  → return FAILURE
return SUCCESS
```

- Stops and returns `FAILURE` as soon as one child fails
- Returns `SUCCESS` only if ALL children succeed
- **Use for**: ordered task lists, condition-then-action patterns (e.g. `[Has low HP?] → [Find aid]`)

### Random Selector / Random Sequence
Same as above but children are processed in **random order**. Useful for adding unpredictability when there is no clear priority between options.

---

## 4. Decorator Nodes

Decorators wrap exactly **one** child and modify its return code or control its execution.

| Decorator | Icon | Behavior |
|-----------|------|----------|
| **Inverter** (`!`) | `!` | Inverts result: `SUCCESS`↔`FAILURE`, `RUNNING` unchanged |
| **Succeeder** | `✓` | Always returns `SUCCESS` regardless of child result |
| **Failer** | `✗` | Always returns `FAILURE` regardless of child result |
| **Basic Repeater** | `↺` | Runs child N times, returns `SUCCESS` when done |
| **Repeat-Until-SUCCESS** | `↺✓` | Repeats child until `SUCCESS`; optional max iterations |
| **Repeat-Until-FAILURE** | `↺✗` | Repeats child until `FAILURE`; optional max iterations |
| **Count-Based Limit** | `lim n→c` | Allows child to run at most N times total; returns `FAILURE` after limit |
| **Timer-Based Limit** | `⏱` | Enforces a minimum time between executions; returns `RUNNING` if not enough time elapsed |

### Inverter pseudocode
```
childStatus = execute(child)
if childStatus == SUCCESS → return FAILURE
if childStatus == FAILURE → return SUCCESS
return childStatus
```

### Repeat-Until-SUCCESS pseudocode
```
repeat:
  if i == MAX_TIMES → return FAILURE
  childStatus = execute(child)
  if childStatus not in {SUCCESS, FAILURE} → return childStatus
  i++
until childStatus == SUCCESS
return SUCCESS
```

### Count-Based Limit pseudocode
```
if totalCalls < MAX_TIMES:
  childStatus = execute(child)
  totalCalls++
  return childStatus
return FAILURE
```

### Timer-Based Limit pseudocode
```
totalTimeElapsed += timeElapsedSincePreviousFrame
if totalTimeElapsed >= TIME_INTERVAL:
  childStatus = execute(child)
  totalTimeElapsed -= TIME_INTERVAL
  return childStatus
return RUNNING
```

> **Note:** `RUNNING` is not changed by `Inverter`. It passes through unmodified.

---

## 5. Building a Behavior Tree — Example

### Warrior NPC ("Simple Attacker")

Goal: "If being attacked, evade. If low HP, find aid. If enemy nearby, attack. Otherwise, wander."

Tree structure (root is a **Selector**):

```
[Selector ?]
├── [Sequence →]  ← EVADE
│   ├── Player is attacking? (Condition)
│   └── Evade (Action)
├── [Sequence →]  ← FIND AID
│   ├── Has low HP? (Condition)
│   └── Find aid (Action)
├── [Sequence →]  ← ATTACK
│   ├── Player is in line of sight? (Condition)
│   └── <<Attack BT>> (Reference)
└── Wander (Action)
```

### Attack Sub-Tree

```
[Selector ?]  ← Attack BT
├── Fire arrow at player (Action)
├── Attack player with sword (Action)
└── Taunt the player (Action)
```

### Attack with Sword Sub-Tree

```
[Sequence →]
├── Player in front? (Condition)
└── Swing sword (Action)
```

### Completeness (Böhm-Jacopini theorem)
BTs can express **any computable behavior**:
- Sequence → sequential execution
- Selector → conditional branching (if/else)
- Repeat-Until-SUCCESS → loops

---

## 6. Practical BT Tips (Project Zomboid)

### Data Context
Each BT instance has a **shared data context** (key-value store, e.g. a HashMap). Nodes can read/write arbitrary variables. This is what makes BTs truly powerful — nodes pass information through shared state.

```
// Example: GetSafeLocation stores result; Walk reads it
GetSafeLocation → stores "targetPos" in context
Walk(targetPos)  → reads "targetPos" from context
```

### Leaf Node Interface
Every custom leaf node implements two methods:

- `init()` — Called once when the node becomes active. Initialize state, start actions (e.g. kick off pathfinding).
- `process()` — Called every tick. Returns `SUCCESS`, `FAILURE`, or `RUNNING`.

### Stack Nodes Pattern
Adding stack utility nodes enables iteration over collections:

```
PushToStack(item, stackVar)
PopFromStack(stack, itemVar)   // FAILURE if stack empty
IsEmpty(stack)
```

Combined with `Repeat-Until-FAILURE`, this allows iterating over all doors in a building, trying each one until one succeeds.

### EnsureItemInInventory Pattern (recursive fallback)
```
[Selector]
├── Check main inventory
├── Check bags → transfer to inventory
├── Find item in building → travel + take
└── Craft item (recursive EnsureItemInInventory for each ingredient)
```
Failure cascades naturally; no special error handling needed.

### Key Design Insight
> Failure is not an error — it is a natural part of decision-making. Layer selectors with fallbacks for every situation.

---

## 7. BT Editors

| Feature | Behavior Designer | Behave | Behavior3 | Brainiac Designer | Unreal Engine BT |
|---------|:-:|:-:|:-:|:-:|:-:|
| Fundamental BT components | ✓ | ✓ | ✓ | ✓ | ✓ |
| Manage collections of BTs | ✓ | ✓ | ✓ | ✓ | ✓ |
| Drag-and-drop interface | ✓ | ✓ | ✓ | ✓ | ✓ |
| Auto-arrange components | | | ✓ | | ✓ |
| Add comments to components | ✓ | | | | |
| Extensible via user components | | | | ✓ | ✓ |
| Event-driven BTs | | | | | ✓ |
| Conditional aborts/restarts | | | | | ✓ |
| Requires specific dev environment | ✓ | ✓ | | | ✓ |
| BT-specific debugger | ✓ | ✓ | | | ✓ |

**Behavior3** is open-source, platform-independent, uses JSON import/export.

**Recommendation:** Use platform-specific editor (Unity/Unreal) when targeting one platform (better debugging); use platform-independent editor otherwise.

---

## 8. BT Limitations & Recommendations

### Limitations
1. **State-based behaviors** — BTs are not well suited for entities that need to react to external events interrupting current actions.
2. **Teamwork** — Coordinating actions between multiple BTs is difficult.
3. **High memory requirements** — Especially when each agent has its own BT.
4. **History** — Storing and retrieving past actions is inherently hard in a tree structure.
5. **Heuristic reasoning** — Not well suited to evaluating numeric heuristic functions.
6. **No standardization** — BT files from one editor cannot be read by another.

### Workarounds
- **Blackboards** (globally shared state) for history and state storage
- **Parameterized BTs** for team coordination
- **Query-enabled BTs** to build trees at runtime (reduce memory)
- **Utility selectors** for heuristic functions

---

## 9. Virtual World Simulation Architecture

*(From: Simuler pour animer — Maisel, 2026)*

### Core Philosophy
A virtual world is more credible when it contains **autonomous objects** that adapt to their dynamic environment rather than following pre-scripted animations.

Approach: Instead of *animating*, we *simulate* — given a state at time `t` and rules (laws of the virtual world), compute states at subsequent times.

### Class Hierarchy

```
Visu
└── Simu          (manages entities, calls update loop)
    └── World     (createWorld() — populates the scene)

Entity            (has id, position, object3d, update(dt))
Component         (has entity ref, execute())
```

### Entity Model

An `Entity` represents a distinguishable "thing" in the virtual world:
- Has a **unique identifier**
- Has **embodiment** (visible/audible/tangible)
- Has **state**
- Has an `update(dt)` procedure

```javascript
class Entity {
  constructor(id, data, world) {
    this.id = id;
    this.world = world;
    this.object3d = data.object3d || null;
    this.position = data.position || new BABYLON.Vector3(0, 0, 0);
  }
  update(dt) {}
}
```

### Simu Loop

```javascript
class Simu extends Visu {
  update(dt) {
    this.entities.forEach(e => e.execute()); // run components
    this.entities.forEach(e => e.update(dt)); // physics/movement
  }
}
```

---

## 10. Entity-Component System

### Problem with pure inheritance
Combining behaviors (e.g. rotate AND move randomly) requires a new subclass for every combination → **combinatorial explosion**.

### Solution: Entity-Component Architecture (ECS)
- An entity is just an ID + a list of components
- **Components** define appearance and behavior
- Components can be added/removed dynamically

```javascript
class Entity {
  add(ComponentType, data) {
    const comp = new ComponentType(data, this);
    return comp; // chainable
  }
  execute() {
    this.components.forEach(c => c.execute());
  }
}
```

### Component base class

```javascript
class Component {
  constructor(data, entity) {
    this.entity = entity;
  }
  register() {
    this.entity.components.push(this); // marks for regular execution
  }
  execute() {}
}
```

> Call `this.register()` in the constructor of any component that needs to run every tick.

### Usage (fluent/chainable API)

```javascript
createEntity("e0", ENTITIES.Entity, {})
  .add(COMPS.box,      { width: 5, height: 3, depth: 0.05 })
  .add(COMPS.position, { x: 3, z: 5 })
  .add(COMPS.rotation, { y: Math.PI / 4.0 });
```

### Component Examples

**Box (embodiment)**
```javascript
class Box extends Component {
  constructor(data, entity) {
    super(data, entity);
    entity.object3d = PRIMS.box(entity.id, data, entity.world.scene);
  }
}
```

**Rotateur (behavior — runs every tick)**
```javascript
class Rotateur extends Component {
  constructor(data, entity) {
    super(data, entity);
    this.register(); // ← needed for execute() to be called
    this.alpha = data.alpha || Math.PI / 180;
  }
  execute() {
    if (this.entity.object3d)
      this.entity.object3d.rotation.y += this.alpha;
  }
}
```

**BrownianMotion (velocity-based)**
```javascript
class BrownianMotion extends Component {
  constructor(data, entity) {
    super(data, entity);
    this.register();
    this.p0   = data.p0   || 0.1;
    this.vMax = data.vMax || 1.0;
  }
  execute() {
    if (Math.random() < this.p0) {
      entity.velocity.set(
        (0.5 - Math.random()) * this.vMax,
        0,
        (0.5 - Math.random()) * this.vMax
      );
    }
  }
}
```

---

## 11. Kinematics & Newtonian Dynamics

### Kinematic Entity (`Kine`)
Movement controlled via velocity (not time directly):

```
P(t+dt) = P(t) + v⃗(t)·dt
v⃗(t+dt) = v⃗(t) + γ⃗(t)·dt
```

```javascript
class Kine extends Entity {
  constructor(id, data, wld) {
    super(id, data, wld);
    this.velocity     = BABYLON.Zero();
    this.acceleration = BABYLON.Zero();
  }
  update(dt) {
    this.velocity.scaleAndAddToRef(dt, this.position);
    this.acceleration.scaleAndAddToRef(dt, this.velocity);
    if (this.object3d) this.object3d.position.copyFrom(this.position);
  }
}
```

### Newtonian Entity (`Newton`)
Forces → acceleration → velocity → position (Euler integration):

```
P(t+dt) = P(t) + v⃗·dt
v⃗(t+dt) = v⃗(t) + (ΣF⃗/m)·dt
```

Three steps each tick:
1. **Force accumulation** — components call `applyForce(f)`
2. **Integration** — `update(dt)` computes new velocity and position
3. **Reset forces** — `force.set(0,0,0)`

```javascript
class Newton extends Entity {
  constructor(id, data, world) {
    super(id, data, world);
    this.mass     = data.mass || 1.0;
    this.velocity = new BABYLON.Vector3(0, 0, 0);
    this.force    = new BABYLON.Vector3(0, 0, 0);
  }
  applyForce(f) { this.force.addInPlace(f); }
  update(dt) {
    this.velocity.scaleAndAddToRef(dt, this.position);
    this.force.scaleAndAddToRef(dt / this.mass, this.velocity);
    this.force.set(0, 0, 0);
    if (this.object3d) this.object3d.position.copyFrom(this.position);
  }
}
```

### BabylonJS Vector3 API (quick reference)

| Method | Effect |
|--------|--------|
| `u.set(x,y,z)` | u := (x,y,z) |
| `u.addInPlace(v)` | u := u + v |
| `u.subtractInPlace(v)` | u := u − v |
| `u.subtractToRef(v, w)` | w := u − v |
| `u.scaleAndAddToRef(k, v)` | v := v + k·u |
| `BABYLON.Vector3.Distance(u,v)` | returns scalar distance |

---

## 12. Steering Behaviors

*(Based on Reynolds 1987, "Flocks, Herds and Schools")*

### Principle
Given a desired velocity `v⃗d` and current velocity `v⃗c`, the steering force is:

```
F⃗s = k(v⃗d − v⃗c)
```

Velocities and forces are clamped to max values `vM` and `FM`.

### Seek
Move toward a target point C at maximum speed:

```
v⃗d = (vM / |PC⃗|) · PC⃗
F⃗  = v⃗d − v⃗c
F⃗s = clamp(F⃗, FM)
```

```javascript
class Seek extends Component {
  execute() {
    this.C.subtractToRef(this.entity.object3d.position, this.vd);
    this.vd.normalize();
    this.vd.scaleInPlace(this.entity.vMax);
    this.vd.subtractToRef(this.entity.velocity, this.force);
    this.entity.applyForce(this.force);
  }
}
```

### Arrive
Like Seek, but slows down near the target (avoids oscillation):

```
if distance >= d0: vM = v0          (full speed)
if distance <  d0: vM = k·v0·d/d0  (ramped speed)
```

### Avoidance
Generate a steering force away from nearby obstacles:

- Place a virtual probe `P' = P + k·v⃗c` in front of the entity
- Collision possible if `|P'C| < r` (probe inside obstacle bounding sphere)
- If collision detected: apply force `(k'/|CP'|)·CP'⃗`

### Combining Behaviors
Apply multiple steering forces simultaneously:

```
F⃗total = w1·F⃗seek + w2·F⃗avoidance + w3·F⃗alignment + ...
```

### Trajectory Component
Chain multiple Seek/Arrive calls through N waypoints. Options:
- Loop back to first point
- Stop at last point
- Always orient entity in direction of travel (`lookAt(position + velocity)`)

---

## 13. Crowd Simulation (Flocking)

Three Reynolds rules, each producing a force:

### Separation Force `F⃗s`
Avoid collisions with neighbors. Repulsion inversely proportional to distance squared:

```
F⃗s = Σ (1/|PjPi|²) · PjPi⃗    for all Oj in neighborhood(Oi)
```

Neighborhood = sphere of radius `rs` centered on Pi.

### Cohesion Force `F⃗c`
Stay grouped. Steer toward center of gravity of neighbors:

```
G   = (1/|neighbors|) · Σ Pj
F⃗c = seek(Oi, G)
```

### Alignment Force `F⃗a`
Match velocity of neighbors:

```
v⃗m = (1/|neighbors|) · Σ v⃗j
F⃗a = v⃗m − v⃗i
```

### Combined Flocking Force
```
F⃗b = ks·F⃗s + kc·F⃗c + ka·F⃗a     (with ks + kc + ka = 1)
```

Tuning the coefficients:
- High `ks` → fewer collisions, less cohesion
- High `kc` → tight group, more collisions
- High `ka` → uniform direction, less flexibility

Coefficients can be **global** (same for all) or **local** (per-entity).

### Guide + Visitor Group Pattern
```
Guide:    follows a predefined Trajectory component
Visitors: use flocking rules + seek(guide_position_offset)
All:      use lookAtForward component
          use Rebond component to stay within bounds
```

---

## Quick Reference: Component Types

| Component | Type | Description |
|-----------|------|-------------|
| `Box` | Embodiment | Creates a box mesh |
| `Position` | Transform | Sets initial position |
| `Rotation` | Transform | Sets initial rotation |
| `Rotateur` | Behavior | Rotates entity every tick |
| `BrownianMotion` | Behavior | Random velocity changes |
| `Alea` | Force | Random steering force (Newton) |
| `Seek` | Steering | Move toward a point |
| `Arrive` | Steering | Move toward a point, stop gracefully |
| `Trajectory` | Steering | Follow N waypoints |
| `Avoidance` | Steering | Steer away from obstacles |
| `Separation` | Flocking | Avoid neighbors |
| `Cohesion` | Flocking | Stay near group center |
| `Alignment` | Flocking | Match group velocity |
| `Rebond` | Constraint | Bounce off virtual box walls |
| `LookAtForward` | Orientation | Face direction of travel |

---

*End of reference document.*
