/**
 * StepConfig: Konfigurationsparameter für Zeitschritt und Solver
 */
export class StepConfig {
  constructor(config = {}) {
    this.dt = config.dt ?? (1.0 / 60.0);
    this.velocityIterations = config.velocityIterations ?? 8;
    this.positionIterations = config.positionIterations ?? 3;
    this.enableSubQGLattice = config.enableSubQGLattice ?? true; // SubQG Netzwerk im Hintergrund aktiv
    this.enableWarmStarting = config.enableWarmStarting ?? true;
    this.enableSleeping = config.enableSleeping ?? true;
    this.timeToSleep = config.timeToSleep ?? 0.5; // Sekunden bis zum Einschlafen
  }
}
