import { PRIMS } from './prims.js';
import { Visu } from './visu.js';
import { SafeArray } from './safeArray.js';

class Simu extends Visu {

  constructor() {
    super();
    this.directory = {};
    this.entities = new SafeArray();
  }

  createWorld(data) { } // Méthode abstraite

  update(dt) {
    // 1. Ejecutar la lógica de los componentes (toma de decisiones, cálculo de fuerzas)
    this.entities.forEach((e) => {
      if (e.execute) e.execute();
    });

    // 2. Actualizar el estado cinemático de las entidades (aplicar movimiento)
    this.entities.forEach((e) => {
      if (e.update) e.update(dt);
    });
  }

  createEntity(name, Type, data) {
    // Se pasan name (id) y this (el mundo) para que la entidad conozca su entorno
    const entity = new Type(name, data, this);
    this.directory[name] = entity;
    this.entities.add(entity);
    return entity;
  }

  removeEntity(entity) {
    // Bug original corregido (name no estaba definido)
    delete this.directory[entity.id];
    this.entities.remove(entity);
  }

  findEntity(name) { return this.directory[name] || null; }
}

export { Simu }
