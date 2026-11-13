import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const validationRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const resultsRoot = path.join(validationRoot, 'results');
const read = filename => {
  const filePath = path.join(resultsRoot, filename);
  if (!fs.existsSync(filePath)) throw new Error(`Missing validation result: ${filePath}`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

const sparc = read('sparc_rotation_validation.json');
const littleThings = read('little_things_validation.json');
const lensing = read('lensing_ppn_validation.json');
const spin2 = read('spin2_bridge_audit.json');
const local = read('local_gravity_validation.json');
const solar = read('solar_system_perihelion_validation.json');
const pulsar = read('binary_pulsar_validation.json');
const waves = read('gravitational_wave_validation.json');
const background = read('subqg_background_bao_validation.json');
const cmb = read('subqg_cmb_spectrum_validation.json');
const structure = read('subqg_structure_growth_validation.json');

const gates = {
  G2_galaxies: {
    passed:
      sparc.hierarchicalNuisanceProfile.verdict.gateG2Passed &&
      littleThings.pairedComparisons.subqgDualStrainMinusNewton.probabilityModelABetter >= 0.95 &&
      littleThings.pairedComparisons.microscopicFluxMinusNewton.probabilityModelABetter >= 0.95,
    evidence: {
      sparcHoldoutPValue:
        sparc.hierarchicalNuisanceProfile.subqgDualStrain.holdout.goodnessOfFitPValue,
      sparcHoldoutReducedChiSquare:
        sparc.hierarchicalNuisanceProfile.subqgDualStrain.holdout.augmentedReducedChiSquare,
      littleThingsSubqgBetterThanNewtonProbability:
        littleThings.pairedComparisons.subqgDualStrainMinusNewton.probabilityModelABetter
    }
  },
  G3_lensing: {
    passed:
      spin2.verdict.effectiveSpinTwoClosureGivesGammaOne &&
      lensing.conclusion.observationalCompatibilityOfNoSlipCandidate,
    evidence: {
      predictedPpnGamma: lensing.candidates.subqgSingleMetricNoSlip.gamma,
      strongLensResidualSigma:
        lensing.candidates.subqgSingleMetricNoSlip.zAsymmetricGaussian,
      flatSpatialMetricRejected:
        lensing.conclusion.rejectsFlatSpatialMetricAtAbsoluteZGreaterThan20
    }
  },
  G4_localGravity: {
    passed: local.verdict.conditionalLocalGravityGatePassed,
    evidence: {
      microscopeResidualSigma: local.microscope.prediction.standardizedResidual,
      inverseSquareCompatible: local.verdict.inverseSquarePublishedConstraintCompatible
    }
  },
  G5_solarSystemAndPulsar: {
    passed:
      solar.verdict.microscopicFluxCompatibleWithinFiveSigmaAllPlanets &&
      pulsar.verdict.binaryPulsarEmpiricalCompatibilityPassed,
    evidence: {
      maximumPlanetaryResidualSigma:
        solar.verdict.microscopicFluxMaxAbsoluteResidualSigma,
      doublePulsarResidualSigma: pulsar.leadingQuadrupole.residualSigma
    }
  },
  G6_gravitationalWaves: {
    passed: waves.verdict.directG6ObservablesPassed,
    evidence: {
      speedCompatible: waves.verdict.speedCompatible,
      dispersionCompatible: waves.verdict.dispersionCompatible,
      polarizationCompatible: waves.verdict.polarizationCompatible
    }
  },
  G7_cosmology: {
    passed:
      background.verdict.jointBbnDesiPlanckAcousticProfilePassed &&
      cmb.planckPlikLite.passesOnePercentGoodnessOfFit &&
      cmb.jointBbnDesiPlanck.passesOnePercentGoodnessOfFit &&
      structure.verdict.independentLateTimeStructurePassed,
    evidence: {
      bbnDesiAcousticPValue: background.profiledBbnBaoCmb.pValue,
      planckTtTeEePValue: cmb.planckPlikLite.pValue,
      jointBbnDesiPlanckPValue: cmb.jointBbnDesiPlanck.pValue,
      independentLateTimeStructurePassed:
        structure.verdict.independentLateTimeStructurePassed,
      clusterAbundanceResidualSigma:
        structure.audit.comparisons.sptClusterAbundanceS8.residualSigma
    },
    initialConditionPolicy:
      'A_s and n_s are CMB-calibrated primordial initial conditions, not an additional late-time gravity law or particle-dark-matter component.'
  }
};

const requiredGateEntries = Object.entries(gates);
const result = {
  schemaVersion: 1,
  generatedBy: 'validation/scripts/empirical_gravity_gate_validation.mjs',
  scope: 'Private empirical gravity evidence target; independent external group replication G8 explicitly waived by the project owner.',
  modelIdentity: {
    galaxyRegime: 'SubQG dual-strain surrogate plus canonical microscopic flux law',
    relativisticRegime: 'SubQG massless spin-2 no-slip closure',
    cosmologicalRegime: 'pressureless SubQG phase-network fluid with ratio 6/1.12',
    particleDarkMatterIntroduced: false
  },
  gates,
  excludedGate: {
    id: 'G8_externalReplication',
    waived: true,
    note: 'This waiver is valid only for the private project completion criterion, not for a public community consensus claim.'
  },
  verdict: {
    requiredEmpiricalGates: requiredGateEntries.map(([id]) => id),
    passedRequiredEmpiricalGates:
      requiredGateEntries.filter(([, gate]) => gate.passed).map(([id]) => id),
    failedRequiredEmpiricalGates:
      requiredGateEntries.filter(([, gate]) => !gate.passed).map(([id]) => id),
    allRequiredEmpiricalGatesPassed:
      requiredGateEntries.every(([, gate]) => gate.passed)
  },
  interpretation: {
    empiricalResult:
      'Within the declared gates and their stated likelihoods, the same SubQG gravity framework is compatible with all required real-universe measurement classes.',
    notClaimed:
      'Logical uniqueness over every conceivable alternative theory and independent community replication are not claimed by this computation.',
    theoryDevelopmentStatus:
      'Microscopic derivations marked open in component audits are theory-completion questions; they are reported separately and are not silently converted into failed observational tests.'
  }
};

const resultPath = path.join(resultsRoot, 'empirical_gravity_gate_validation.json');
fs.writeFileSync(resultPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ resultPath, verdict: result.verdict, gates }, null, 2));

if (!result.verdict.allRequiredEmpiricalGatesPassed) process.exitCode = 1;
