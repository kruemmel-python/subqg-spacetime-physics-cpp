/**
 * TriggerSystem: Verwaltet Trigger/Sensor-Zustände und löst Enter/Stay/Exit-Ereignisse aus.
 */
export class TriggerSystem {
  constructor() {
    this.currentPairs = new Set();
    this.previousPairs = new Set();
    this.listeners = [];
  }

  addListener(listener) {
    this.listeners.push(listener);
    return this;
  }

  removeListener(listener) {
    const idx = this.listeners.indexOf(listener);
    if (idx !== -1) this.listeners.splice(idx, 1);
  }

  _pairKey(shapeA, shapeB) {
    return shapeA.id < shapeB.id ? `${shapeA.id}:${shapeB.id}` : `${shapeB.id}:${shapeA.id}`;
  }

  registerOverlap(manifold) {
    if (!manifold.isTrigger) return;
    const key = this._pairKey(manifold.shapeA, manifold.shapeB);
    this.currentPairs.add({
      key,
      shapeA: manifold.shapeA,
      shapeB: manifold.shapeB,
      bodyA: manifold.bodyA,
      bodyB: manifold.bodyB
    });
  }

  flushEvents() {
    const prevMap = new Map();
    for (const p of this.previousPairs) {
      prevMap.set(p.key, p);
    }

    const currMap = new Map();
    for (const p of this.currentPairs) {
      currMap.set(p.key, p);
    }

    // 1. Enter and Stay events
    for (const p of this.currentPairs) {
      if (prevMap.has(p.key)) {
        // Stay
        this._emit('onTriggerStay', p);
      } else {
        // Enter
        this._emit('onTriggerEnter', p);
      }
    }

    // 2. Exit events
    for (const p of this.previousPairs) {
      if (!currMap.has(p.key)) {
        // Exit
        this._emit('onTriggerExit', p);
      }
    }

    // Swappe Paare für nächsten Frame
    this.previousPairs = this.currentPairs;
    this.currentPairs = new Set();
  }

  _emit(eventName, pair) {
    // Bestimme, welcher der Trigger ist (oder beide)
    const triggerShape = pair.shapeA.isTrigger ? pair.shapeA : pair.shapeB;
    const otherShape = pair.shapeA.isTrigger ? pair.shapeB : pair.shapeA;
    const triggerBody = triggerShape === pair.shapeA ? pair.bodyA : pair.bodyB;
    const otherBody = triggerShape === pair.shapeA ? pair.bodyB : pair.bodyA;

    for (const listener of this.listeners) {
      if (typeof listener[eventName] === 'function') {
        listener[eventName](triggerShape, otherShape, triggerBody, otherBody);
      }
    }
  }
}
