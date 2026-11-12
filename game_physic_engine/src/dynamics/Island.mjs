/**
 * Island: Gruppierung von zusammenhängenden Körpern, Kontakten und Gelenken.
 * Ermöglicht getrennte parallele Ausführung und automatischen Schlafzustand (Sleeping),
 * wenn eine Konstruktion (z. B. ein Kistenturm) zur Ruhe gekommen ist.
 */
export class Island {
  constructor() {
    this.bodies = [];
    this.contacts = [];
    this.joints = [];
  }

  addBody(body) {
    this.bodies.push(body);
  }

  addContact(contact) {
    this.contacts.push(contact);
  }

  addJoint(joint) {
    this.joints.push(joint);
  }

  clear() {
    this.bodies.length = 0;
    this.contacts.length = 0;
    this.joints.length = 0;
  }

  /**
   * Prüft, ob alle Körper der Insel schlafen gelegt werden können
   */
  evaluateSleep(dt, linTolSq = 0.005, angTolSq = 0.005, timeToSleep = 0.5) {
    let canSleep = true;

    for (const b of this.bodies) {
      if (b.type !== 'dynamic' || !b.allowSleep) {
        canSleep = false;
        break;
      }

      const linVelSq = b.velocity.lengthSq();
      const angVelSq = b.angularVelocity * b.angularVelocity;

      if (linVelSq > linTolSq || angVelSq > angTolSq) {
        b.sleepTime = 0.0;
        canSleep = false;
      } else {
        b.sleepTime += dt;
        if (b.sleepTime < timeToSleep) {
          canSleep = false;
        }
      }
    }

    if (canSleep) {
      for (const b of this.bodies) {
        b.putToSleep();
      }
    }
  }
}
