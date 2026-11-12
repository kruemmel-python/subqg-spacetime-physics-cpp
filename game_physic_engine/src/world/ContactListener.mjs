/**
 * ContactListener: Callback-Schnittstelle für Spiel- und Kollisionsereignisse
 */
export class ContactListener {
  onBeginContact(contact) {}
  onEndContact(contact) {}
  onPreSolve(contact) {}
  onPostSolve(contact, normalImpulses, tangentImpulses) {}
}
