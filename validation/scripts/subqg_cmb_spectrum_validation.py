"""Planck Plik_lite TT/TE/EE test of the frozen SubQG effective fluid.

CAMB is used only as a linear transfer integrator. Its conserved pressureless
fluid slot carries the SubQG network density fixed by 6/1.12; no particle-CDM
abundance is fitted or introduced.
"""
from __future__ import annotations

import json
from pathlib import Path

import camb
import numpy as np
from scipy.io import FortranFile
from scipy.optimize import minimize
from scipy.stats import chi2

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "validation" / "data" / "planck_plik_lite"
BACKGROUND_RESULT = ROOT / "validation" / "results" / "subqg_background_bao_validation.json"
RESULT = ROOT / "validation" / "results" / "subqg_cmb_spectrum_validation.json"
COUNTS = (215, 199, 199)
BIN_OFFSET = 30
SUBQG_RATIO = 6 / 1.12


def load_background() -> dict:
    if not BACKGROUND_RESULT.exists():
        raise FileNotFoundError(
            "Run npm run validation:background-bao before the CMB spectrum audit"
        )
    result = json.loads(BACKGROUND_RESULT.read_text(encoding="utf-8"))
    profile = result["profiledBbnBaoCmb"]
    return {
        "physical_baryon_density": profile["bestPhysicalBaryonDensity"],
        "hubble_constant": profile["bestHubbleConstantKmPerSecMpc"],
        "bbn_chi_square": profile["bbnChiSquare"],
        "bao_chi_square": profile["baoChiSquare"],
    }


def load_plik_lite() -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    required = ["cl_cmb_plik_v22.dat", "blmin.dat", "blmax.dat",
                "bweight.dat", "c_matrix_plik_v22.dat"]
    missing = [name for name in required if not (DATA / name).exists()]
    if missing:
        raise FileNotFoundError(
            f"Missing {missing}; run npm run validation:fetch:planck-plik-lite"
        )
    observed = np.loadtxt(DATA / "cl_cmb_plik_v22.dat")[:, 1]
    bin_min = np.loadtxt(DATA / "blmin.dat").astype(int) + BIN_OFFSET
    bin_max = np.loadtxt(DATA / "blmax.dat").astype(int) + BIN_OFFSET
    weights = np.loadtxt(DATA / "bweight.dat")
    ell = np.arange(len(weights)) + BIN_OFFSET
    weights = np.r_[np.zeros(BIN_OFFSET), weights * 2 * np.pi / ell / (ell + 1)]
    size = sum(COUNTS)
    with FortranFile(DATA / "c_matrix_plik_v22.dat", "r") as handle:
        covariance = handle.read_reals(float).reshape((size, size))
    covariance = np.tril(covariance) + np.tril(covariance, -1).T
    return observed, np.linalg.inv(covariance), bin_min, bin_max, weights


def main() -> None:
    background = load_background()
    observed, inverse_covariance, bin_min, bin_max, weights = load_plik_lite()
    calls = 0

    def spectrum(parameters: np.ndarray, transfer: bool = False):
        nonlocal calls
        calls += 1
        spectral_index = float(parameters[0])
        scalar_amplitude = float(np.exp(parameters[1]) * 1e-9)
        pars = camb.CAMBparams()
        pars.set_cosmology(
            H0=background["hubble_constant"],
            ombh2=background["physical_baryon_density"],
            omch2=SUBQG_RATIO * background["physical_baryon_density"],
            mnu=0.06, omk=0, tau=0.0544, nnu=3.046,
        )
        pars.InitPower.set_params(As=scalar_amplitude, ns=spectral_index)
        pars.set_for_lmax(2508, lens_potential_accuracy=1)
        if transfer:
            pars.set_matter_power(redshifts=[0], kmax=2.0)
        camb_result = camb.get_results(pars)
        dl = camb_result.get_cmb_power_spectra(
            pars, CMB_unit="muK", raw_cl=False
        )["total"]
        bandpowers = []
        for column, count in zip((0, 3, 1), COUNTS):
            for index in range(count):
                lower, upper = bin_min[index], bin_max[index]
                bandpowers.append(np.dot(
                    dl[lower:upper + 1, column], weights[lower:upper + 1]
                ))
        residual = observed - np.asarray(bandpowers)
        return float(residual @ inverse_covariance @ residual), camb_result

    optimum = minimize(
        lambda parameters: spectrum(parameters)[0],
        np.asarray([0.9728, np.log(2.0685)]),
        method="Nelder-Mead",
        options={"xatol": 2e-5, "fatol": 1e-3, "maxiter": 30},
    )
    cmb_chi_square, transfer = spectrum(optimum.x, transfer=True)
    scalar_amplitude = float(np.exp(optimum.x[1]) * 1e-9)
    sigma8 = float(transfer.get_sigma8_0())
    cmb_dof = sum(COUNTS) - 2
    joint_chi_square = (cmb_chi_square + background["bbn_chi_square"] +
                        background["bao_chi_square"])
    joint_dof = sum(COUNTS) + 13 + 1 - 4
    output = {
        "schemaVersion": 1,
        "model": {
            "ontology": "pressureless SubQG network fluid; CAMB CDM slot is an equation-level carrier, not particle dark matter",
            "networkToBaryonRatio": SUBQG_RATIO,
            "particleDarkMatterIntroduced": False,
            "nBodySimulationUsed": False,
            "physicalBaryonDensity": background["physical_baryon_density"],
            "hubbleConstantKmPerSecMpc": background["hubble_constant"],
            "tauExternalLowECalibration": 0.0544,
            "spectralIndex": float(optimum.x[0]),
            "scalarAmplitude": scalar_amplitude,
            "sigma8": sigma8,
        },
        "planckPlikLite": {
            "bandpowers": sum(COUNTS),
            "fittedPrimordialInitialConditions": 2,
            "chiSquare": cmb_chi_square,
            "degreesOfFreedom": cmb_dof,
            "pValue": float(chi2.sf(cmb_chi_square, cmb_dof)),
            "passesOnePercentGoodnessOfFit": bool(chi2.sf(cmb_chi_square, cmb_dof) >= 0.01),
        },
        "jointBbnDesiPlanck": {
            "observations": sum(COUNTS) + 13 + 1,
            "fittedQuantities": 4,
            "chiSquare": joint_chi_square,
            "degreesOfFreedom": joint_dof,
            "pValue": float(chi2.sf(joint_chi_square, joint_dof)),
            "passesOnePercentGoodnessOfFit": bool(chi2.sf(joint_chi_square, joint_dof) >= 0.01),
        },
        "numerics": {
            "optimizerSuccess": bool(optimum.success),
            "transferEvaluations": calls,
            "cambVersion": camb.__version__,
        },
        "sources": [
            {"title": "Planck 2018 results V: CMB power spectra and likelihoods", "arxiv": "1907.12875"},
            {"title": "Cobaya native Plik_lite release v1", "repositoryCommitTag": "abcbf96ae4a88f966f572b4209ef45d35098c4b4"},
        ],
    }
    RESULT.parent.mkdir(parents=True, exist_ok=True)
    RESULT.write_text(json.dumps(output, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()
