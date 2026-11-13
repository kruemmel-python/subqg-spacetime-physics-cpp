/**
 * Subquantum Graphity (SubQG 1.0)
 * TypeScript Definitions
 */

export interface SimulationStats {
  nodes: number;
  edges: number;
  faces: number;
  events: number;
}

export interface CrossoverAcceleration {
  gN: number;
  gEff: number;
  localExponent: number;
}

export interface GalacticCurve {
  curve: Array<{ r: number; v: number; gEff: number; gN: number }>;
  isFlat: boolean;
  flatnessVariation: number;
  vFlat: number;
}

export interface TullyFisherResult {
  data: Array<{ M: number; vFlat: number }>;
  meanExponent: number;
  matchesTheoretical025: boolean;
}

export function subqgDualStrainAcceleration(gbar: number, a0: number): number;
export function weakFieldMetricComponents(options: { potential: number; gamma: number; c?: number }): {
  g00: number;
  spatialDiagonal: number;
  epsilon: number;
  gamma: number;
};
export function lensingStrengthRelativeToGammaOne(gamma: number): number;
export function einsteinRadiusRelativeToGammaOne(gamma: number): number;
export function linearizedSpinTwoStaticDustClosure(potentialOverC2: number): {
  effectiveEquation: string;
  sourceSector: string;
  traceReversed00: number;
  traceReversedSpatial: number;
  trace: number;
  h00: number;
  hSpatial: number;
  gamma: number;
  noSlip: boolean;
};
export function microToSpinTwoBridgeAudit(): {
  readonly staticDustNoSlipInsideFierzPauli: true;
  readonly leanTheorem: string;
  readonly masslessSpinTwoSpectrumFromCanonicalMicroaction: false;
  readonly continuumLorentzInvarianceFromCanonicalMicroaction: false;
  readonly universalPhotonAndMatterMetricCouplingFromCanonicalMicroaction: false;
  readonly bridgeComplete: false;
};
export function singleMetricNoSlipClosure(): {
  readonly gamma: 1;
  readonly status: 'conditional';
  readonly equation: string;
  readonly formallyVerifiedTheorem: string;
  readonly requiredProof: readonly string[];
};

export class SubQGUnifiedProofEngine {
  constructor(options?: {
    supportRadius?: number;
    threshold?: number;
    rho0?: number;
    boxSize?: number;
    G?: number;
    seed?: number;
  });

  supportRadius: number;
  threshold: number;
  rho0: number;
  boxSize: number;
  G: number;
  seed: number;
  a0: number;
  events: Array<{ id: number; parents: number[]; depth: number; faceId: string }>;

  computeOverlap(posA: number[], phaseA: number, posB: number[], phaseB: number): number;
  initializeMicrostructure(options?: { centralMass?: number; clusterRadius?: number }): SimulationStats;
  reconstructSpatialDistance(i: number, j: number): number;
  internalRelationalTime(evA: number, evB: number): number;
  effectiveGravitationalAcceleration(M: number, r: number): CrossoverAcceleration;
  computeGalacticCurve(M: number, options?: { rMin?: number; rMax?: number; steps?: number }): GalacticCurve;
  validateTullyFisherScaling(masses: number[]): TullyFisherResult;
}

export class SubQGGenesisEngine {
  constructor(options?: {
    stateCount?: number;
    threshold?: number;
    universeMode?: 'CONTINUUM_3D' | 'CRITICAL_FRACTAL' | 'DECOUPLED_ISLANDS' | 'MULTI_TEMPORAL';
    seed?: number;
  });

  lambdaRatio: number;
  giantFraction: number;
  emergentDimension: number;

  measureEmergentSpeedLimit(options?: { pulseNodes?: number[]; maxSteps?: number }): {
    meanSpeedLimitC: number;
    speedSpreadPercent: number;
    isSpeedUniversal: boolean;
  };

  measureParticleSolitonStability(options?: { evolutionSteps?: number }): {
    isParticleStable: boolean;
    finalCoreRetention: number;
  };

  measureEmergentGravitationalAttraction(options?: { testSteps?: number }): {
    attractionProven: boolean;
    meanMetricContractionPercent: number;
    gravitationalFocusingRatio: number;
  };
}

export function executeMasterGenesisExperiment(): {
  subqgFundamentalRulesHeldStrictlyConstant: Record<string, string>;
  universe1_Continuum: any;
  universe2_Fractal: any;
  comparativeLawsOfNature: {
    differentEmergentDimensions: boolean;
    differentEmergentSpeedLimits: boolean;
    bothShowParticleStability: boolean;
    bothShowAttractiveGravity: boolean;
    natureLawsEmergeWithoutFormulas: boolean;
  };
};

export function minkowskiNormSquared(vectorContravariant: number[]): number;
export function linearizedEinsteinTensorFourier(hCovariant: number[][], kContravariant: number[]): any;
export function pureGaugePerturbation(kContravariant: number[], xiContravariant: number[]): number[][];
export function transverseTracelessPlaneWave(options: {
  waveNumber: number;
  plus?: number;
  cross?: number;
  speed?: number;
}): any;
export function spinTwoInfraredAudit(): any;
export function dualStrainAnomalousAcceleration(gNewton: number, a0: number): number;
export function dualStrainHighAccelerationLimit(a0: number): number;
export function secularPerihelionPrecession(options: {
  semiMajorAxis: number;
  eccentricity: number;
  centralMu: number;
  anomalousInwardAcceleration: (gNewton: number, radius: number) => number;
  samples?: number;
}): any;
export function constantRadialAccelerationPrecession(options: {
  semiMajorAxis: number;
  eccentricity: number;
  centralMu: number;
  acceleration: number;
}): any;
export function eotvosParameter(accelerationA: number, accelerationB: number): number;
export function universalFreeFallPrediction(fieldAcceleration: number, objectNorms: number[]): any;
export function combinedIndependentUncertainty(statistical: number, systematic: number): number;
export function standardizedResidual(predicted: number, observed: number, uncertainty: number): number;
export function petersMathewsPeriodDerivative(options: {
  massASolar: number;
  massBSolar: number;
  orbitalPeriodSeconds: number;
  eccentricity: number;
  solarMassTimeSeconds?: number;
}): any;
export function binaryRadiationClosureAudit(): any;
export function masslessSpinTwoObservables(options?: { speedOfLightMetersPerSecond?: number }): any;
export function closedIntervalCompatibility(prediction: number, lower: number, upper: number): any;
export function upperLimitCompatibility(prediction: number, upperLimit: number): any;
export function directGravitationalWaveAudit(options?: {
  speedLower?: number;
  speedUpper?: number;
  gwtc3GravitonMassUpperEv?: number;
  gwtc4GravitonMassUpperEv?: number;
  tensorVsVectorBayesFactorLower?: number;
  tensorVsScalarBayesFactorLower?: number;
}): any;
export function tetrahedronGramFromSquaredLengths(squaredLengths: Record<string, number>): number[][];
export function tetrahedralCells(world: any): number[][];
export function tetrahedronSquaredLengthsFromGram(gram: number[][]): Record<string, number>;
export function metricPerturbationFromSquaredLengthPerturbations(delta: Record<string, number>): number[][];
export function squaredLengthPerturbationsFromMetric(deltaMetric: number[][]): Record<string, number>;
export function tetrahedralCliques(world: any, options?: { exampleLimit?: number }): any;
export function simplexTensorKinematicsAudit(world: any): any;
export function transverseTracelessProjector(spatialMetricPerturbation: number[][], waveVector: number[]): number[][];
export function spatialGaugePerturbation(waveVector: number[], gaugeVector: number[]): number[][];
export function tensorPolarizationBasis(waveVector: number[]): any;
export function orthonormalPerturbationToSimplexGram(spatialMetricPerturbation: number[][], backgroundGram: number[][]): number[][];
export function simplexGramPerturbationToOrthonormal(deltaGram: number[][], backgroundGram: number[][]): number[][];
export function simplexRadiativeGaugeAudit(options?: {
  waveVector?: number[];
  plusAmplitude?: number;
  crossAmplitude?: number;
}): any;
export function tetrahedralIncidenceAudit(world: any): any;
export function extractOrientableManifoldSubcomplex(world: any, options?: {
  trials?: number;
  searchSeed?: number;
}): any;
export function extractCausalManifoldSector(world: any): any;
export function causalSelectionVariationalAudit(world: any): any;
export function applyDualGraphHessian(amplitudes: number[], bonds: any[], stiffness?: number): number[];
export function dualGraphQuadraticAction(amplitudes: number[], bonds: any[], stiffness?: number): number;
export function collectiveSpinTwoHessianAudit(world: any): any;
export function canonicalCollectiveSpinTwoHessianAudit(): any;
export function orientedRegularTetrahedronCoordinates(orientation?: number): number[][];
export function sharedFaceFrameTransport(
  cellA: number[], orientationA: number, cellB: number[], orientationB: number,
  face: string | number[]
): any;
export function spinTwoFrameTransport(rotationBToA: number[][], directionInA?: number[]): any;
export function canonicalDualHolonomyAudit(world: any): any;
export function canonicalDualHolonomyAuditDefault(): any;
export function canonicalSimplexParallelTransportAudit(world: any): any;
export function canonicalSimplexParallelTransportAuditDefault(): any;
export function subqgHubbleScaledAcceleration(z: number, options?: any): any;
export function museDarkIIIHScalingAudit(options?: any): any;
export function museDarkIIIHScalingAuditDefault(): any;
export function canonicalRelationalBackgroundAudit(options?: any): any;
export function canonicalRelationalBackgroundAuditDefault(): any;
export function deriveSubstrateClusteringClosure(options?: any): any;
export function deriveSubstrateClusteringClosureDefault(): any;
export function deriveSubQGFluidBackground(options?: any): any;
export function photonBaryonDragHorizon(background: any, options?: any): any;
export function auditPlanckAcousticScale(background: any, options?: any): any;
export function auditDesiDR2Bao(background: any, observations: any[], covariance: number[][]): any;
export function profileBbnCalibratedDesiBao(options?: any): any;
export function profileBbnDesiPlanckAcousticScale(options?: any): any;
export function evolveSubQGLinearGrowth(background: any, options?: any): any;
export function auditSubQGStructureAmplitude(background: any, options?: any): any;
export function measureSubstrateClusteringDynamics(options?: any): any;
export function measureSubstrateClusteringDynamicsDefault(): any;

export class SubQGMultiversePhaseEngine {
  constructor(options?: any);
}

export class SubQGGraphCoupledEngine {
  constructor(options?: any);
}

export class SubQGEmergentGravity {
  constructor(options?: any);
}

export class SubQGFirstPrinciplesEngine {
  constructor(options?: any);
}

export class ActionWorld {
  constructor(options?: any);
  step(): void;
  minimize(): any;
  action(): number;
  setMass(node: number, mass: number): void;
}

export class CausalWorld extends ActionWorld {}
export class GeodesicWorld extends CausalWorld {}
export class FeedbackWorld extends GeodesicWorld {}
export class GravityWorld extends FeedbackWorld {}
export class WaveWorld {
  constructor(options?: any);
}
export class CausalWaveWorld extends WaveWorld {}
export class EmergenceWorld {
  constructor(options?: any);
}

export class SubQGAppleWorld {
  constructor(config?: Record<string, any>);
  solveVariationalMetric(opts?: Record<string, any>): any;
  measureObservables(psiRe: Float64Array, psiIm: Float64Array, phiMetric: Float64Array, edgeFieldEnergy?: number): any;
  simulatePacketTrajectory(opts: Record<string, any>): any;
}

export class SubQGAppleExperiment {
  constructor(config?: Record<string, any>);
  runInertialCalibration(): any;
  runCoreGravityAndHolding(calibration: any, backgroundMode?: 'stationaryMetric' | 'coupledMetric'): any;
  runHandForceLimitExperiment(calibration: any): any;
  runControlSuite(calibration: any, primaryResults: any): any;
}

export function executeAppleExperimentSuite(config?: Record<string, any>): any;
export const DEFAULT_APPLE_OBJECTS: ReadonlyArray<{
  id: string;
  label: string;
  amplitude: number;
  sigma: number;
  color: string;
}>;
