# Subquantum Graphity (SubQG 1.0)
## Architectural & Physical Specification

**Version:** 1.0.0  
**Status:** Production / Validated Core  
**Runtime Requirement:** Node.js >= 20.0.0 (Native ECMAScript Modules)  
**Dependencies:** Zero external dependencies (100% Native Standard Library)

---

## 1. Executive Summary & Foundational Ontology

Subquantum Graphity (**SubQG 1.0**) is a non-perturbative, pre-geometric theory of quantum gravity in which smooth spacetime, relativistic causal structures, and gravitational attraction emerge dynamically from a relational quantum graph substrate.

Rather than quantizing a classical metric manifold or postulating dark matter to explain cosmological discrepancies, SubQG derives:
1. **Continuous 3D Spacetime** via percolation of relational quantum bonds above a critical coupling threshold $\Lambda_c$.
2. **Relational Time & Causality** from quantum phase interference (Page-Wootters mechanism) and causal partial orders (posets).
3. **Emergent Gravitational Acceleration** via non-linear network conductance that transitions naturally from the Newtonian regime ($1/r^2$) in high-curvature sectors to the MONDian regime ($1/r$) in low-acceleration sectors ($g_N \ll a_0$), reproducing flat galaxy rotation curves without dark matter.
4. **Multiverse Phase Transitions** governing the formation of distinct cosmologies (Islands, Fractal, Multi-Temporal, and Standard 3D) parameterized by the dimensionless coupling ratio $\Lambda / \Lambda_c$.

---

## 2. Core Mathematical Formalism

### 2.1 The Pre-Geometric Substrate
The fundamental substrate consists of discrete subquantum states characterized by intrinsic phase angles $\{\theta_i\} \in [0, 2\pi)$ and variational degrees of freedom. Relational bond formation between any pair $(i, j)$ is governed by the universal cosine overlap:
$$\omega_{ij} = \frac{1 + \cos(\theta_i - \theta_j)}{2} \in [0, 1]$$

A physical link forms when $\omega_{ij} > \Theta_{\mathrm{th}}$, where $\Theta_{\mathrm{th}} \approx 0.70$ is the geometric percolation threshold.

### 2.2 Microaction Principle
The total action functional governing substrate relaxation is:
$$\mathcal{S}_{\mathrm{total}}[G, \psi] = \mathcal{S}_{\mathrm{SubQG}}[G] + \mathcal{S}_{\mathrm{exc}}[\psi, G] + \mathcal{S}_{\mathrm{feedback}}[G, \psi]$$

- $\mathcal{S}_{\mathrm{SubQG}}[G]$: Pre-geometric topological term minimizing graph tension.
- $\mathcal{S}_{\mathrm{exc}}[\psi, G]$: Kinetic action of localized wave-packet perturbations $\psi$.
- $\mathcal{S}_{\mathrm{feedback}}[G, \psi]$: Metric contraction induced by local energy density, contracting edge lengths $l_{ij} = l_0 (1 - \chi \rho_{ij})$.

### 2.3 Relational Time & Clocks
Physical time is non-existent as an external background parameter. Instead, relational time $t_{\mathrm{rel}}$ is derived via the Page-Wootters constraint:
$$\hat{\mathcal{H}} |\Psi\rangle = 0 \implies \langle \tau_B | \Psi \rangle = \hat{U}(\tau_B - \tau_A) \langle \tau_A | \Psi \rangle$$

The discrete causal order forms a Directed Acyclic Graph (DAG) whose transitive reduction defines a causal poset $(E, \prec)$ with topological depth $D(e) = 1 + \max_{p \in \mathrm{parents}(e)} D(p)$.

### 2.4 Emergent Gravitational Dynamics & Newton-to-MOND Crossover
The original algebraic galactic surrogate is:
$$g_{\mathrm{eff}} = \sqrt{g_N^2 + a_0 g_N}$$

Where:
- For $g_N \gg a_0$: $g_{\mathrm{eff}} = g_N + a_0/2 + O(a_0^2/g_N)$. INPOP10a excludes this residual constant term, so this algebraic form is not the universal Solar-System law.
- For $g_N \ll a_0$ (Galactic Outskirts / Low Acceleration): $g_{\mathrm{eff}} \approx \sqrt{a_0 g_N} = \frac{\sqrt{G M a_0}}{r}$ (MONDian $1/r$).
- Cosmological Scale $a_0$: Determined by the cosmic horizon diameter $L_H$:
  $$a_0 = \frac{c^2}{L_H} \approx 1.2 \times 10^{-10}\,\text{m/s}^2$$

Flat rotation curves satisfy the baryonic Tully-Fisher relation identically:
$$v_{\mathrm{flat}} = (G M a_0)^{1/4} \propto M^{0.25}$$

The surviving cross-scale equation is the microscopic variational flux law
$C_{\mathrm{SubQG}}(g)g=g_N$. Its analytic channel occupation approaches
$C_{\mathrm{SubQG}}=1$ exponentially at high field; the finite-precision
runtime clamps the indistinguishable remainder to one. The analytic deficit
bound is retained separately so numerical underflow is not presented as an
exact physical theorem. This produces $g=g_N$ to vastly beyond observational
precision throughout the tested planetary orbits without a Solar-System fit.
The dual-strain expression is retained as a falsified local extrapolation and
useful galactic surrogate.

For ideal localized matter packets, the same density norm defines both
metric force and inertial mass. Lean therefore proves composition-independent
free fall and an exactly vanishing Eötvös ratio for any two nonzero packet
profiles in a common constant metric gradient. The prediction agrees with the
final MICROSCOPE Ti/Pt result at `0.546` combined standard deviations. The
mapping from Standard-Model chemical composition to this universal packet
density remains an explicit open microscopic bridge.

The conditional massless-spin-2 radiation sector also reproduces the leading
Peters-Mathews orbital decay of PSR J0737-3039A/B from its published masses,
period and eccentricity, with no radiation fit. This result validates the
infrared candidate but is not yet a derivation of nonlinear radiation
reaction from the anchored scalar canonical microaction.

The same frozen infrared sector predicts propagation at light speed, zero
graviton mass and exactly two transverse-traceless tensor polarizations. These
parameter-free observables satisfy the GW170817 multimessenger speed interval,
the GWTC-3 and GWTC-4.0 dispersion bounds, and the GW170814/GWTC-4.0
polarization results. This closes the direct-observation portion of the G6
gate conditionally; deriving the normalized spin-2 source sector from the
anchored scalar canonical microaction remains open.

The apparent kinematic scalar-to-tensor obstruction is now resolved without
adding fundamental fields.  Each relational tetrahedron carries six scalar
edge lengths, and the coordinate-free Gram identity maps them invertibly to
the six components of a local symmetric spatial metric.  The canonical
seeded graph contains 1,003 such cells.  What remains open is dynamical rather
than kinematical: the positive static anchor must be replaced or eliminated
by a derived gauge-null Lorentzian collective operator.

The radiative kinematic map is also explicit.  Plus and cross perturbations
are encoded as six edge variations of a regular relational tetrahedron,
reconstructed in its local orthonormal frame, and projected transversely and
tracelessly.  Pure spatial gauge perturbations project to zero, while the two
physical edge-derived modes satisfy the massless Fierz-Pauli vacuum equation.
The remaining task is to derive this identified operator as the constrained
collective Hessian of the canonical action rather than supply it separately.

A global incidence audit prevents treating every tetrahedral clique as a
spatial cell: the full clique complex is non-manifold.  Nevertheless, the
same frozen canonical graph contains a parameter-free causally selected,
connected orientable sector of 116 tetrahedra on 28 original nodes. Its dual FPV Dirichlet
Hessian is positive semidefinite and has one exact uniform zero mode for each
of the plus and cross amplitudes. Orientation-preserving local frame transport
and norm-preserving plus/cross transport close on all 199 shared faces.
The 199-edge dual graph has cycle rank 84; all 84 fundamental-loop SO(3)
holonomies close numerically and are non-identity, while their spin-2 action
obeys the double-angle representation. Derivation of the admissibility rule as
an incremental variational equation is exact for all 1,003 cell decisions.
Deriving its hard constraint indicator from the original continuous
microaction is structurally impossible without extending the configuration
space: the implemented strictly convex fixed-topology quadratic has no cell
occupancy or orientation variables. A finite local penalty reproduces every
decision for any `Lambda>1`, but its microscopic origin and dimensionful
Regge/Einstein curvature matching remain open.

---

## 3. Architecture & Module Structure

The production codebase is organized into four clean directories:

```
developer/
├── package.json              # Version 1.0.0 metadata & test scripts
├── README.md                 # Developer quickstart & usage guide
├── LICENSE                   # MIT Open Source License
├── docs/
│   └── SPECIFICATION_1.0.md  # Physical & architectural specification
├── src/
│   ├── index.mjs             # Unified public API facade & CLI runner
│   ├── index.d.ts            # Complete TypeScript declaration file
│   └── modules/              # 35 First-principles physics modules
│       ├── subqg_action.mjs
│       ├── subqg_causal.mjs
│       ├── subqg_causal_waves.mjs
│       ├── subqg_clock_consistency.mjs
│       ├── subqg_dimension.mjs
│       ├── subqg_emergence.mjs
│       ├── subqg_emergent_clock.mjs
│       ├── subqg_emergent_gravity_darkmatter.mjs
│       ├── subqg_energy_front.mjs
│       ├── subqg_feedback.mjs
│       ├── subqg_first_principles_gravity.mjs
│       ├── subqg_fpv.mjs
│       ├── subqg_genesis.mjs
│       ├── subqg_geodesic.mjs
│       ├── subqg_graph_coupled_gravity.mjs
│       ├── subqg_gravity.mjs
│       ├── subqg_interacting_clocks.mjs
│       ├── subqg_internal_clock.mjs
│       ├── subqg_intrinsic.mjs
│       ├── subqg_joint_action.mjs
│       ├── subqg_link_audit.mjs
│       ├── subqg_local_rules.mjs
│       ├── subqg_metric_scaling.mjs
│       ├── subqg_micro_derivation_audit.mjs
│       ├── subqg_microaction.mjs
│       ├── subqg_multiverse_phases.mjs
│       ├── subqg_relational_clock.mjs
│       ├── subqg_scale_windows.mjs
│       ├── subqg_scaling.mjs
│       ├── subqg_signal_speed.mjs
│       ├── subqg_spectral.mjs
│       ├── subqg_spectral_ensemble.mjs
│       ├── subqg_speed_audit.mjs
│       ├── subqg_topology_audit.mjs
│       ├── subqg_unified_proof_engine.mjs
│       └── subqg_waves.mjs
├── tests/                    # 35 test suites, 270 unit tests (100% pass)
└── viewer/                   # 3D Documentary Viewer & Cinema Assets
    ├── index.html            # WebGL/Canvas 3D real-time simulation
    └── assets/
        ├── SubQG_Genesis_Dokumentation_3D.mp4
        └── SubQG_Genesis_Dokumentation_3D.srt
```

---

## 4. Test Suite & Validation Battery

SubQG 1.0 features an automated test battery with **337 unit tests**:
- **Total Tests:** 337
- **Passing:** 337 (100%)
- **Failing:** 0
- **Execution Time:** ~12-14 seconds

Execute the complete test suite:
```bash
npm test
```

---

## 5. CLI & Execution Commands

| Command | Action |
|---|---|
| `npm test` | Runs all 337 unit tests via `node --test` |
| `npm start` | Runs default Genesis Master Simulation demonstration |
| `npm run demo` | Runs Genesis Master Simulation showing Universe 1 vs 2 |
| `npm run audit` | Runs the Unified Proof Engine validating all 4 Criteria |
| `open viewer/index.html` | Opens the 3D Interactive Visualization & Documentary |

---

## 6. Mathematical Nomenclature

| Symbol | Definition | Default Value |
|---|---|---|
| $\Lambda$ | Subquantum resonance coupling parameter | Dynamic ($0.8 - 1.2$) |
| $\Lambda_c$ | Critical percolation threshold | $0.921983$ |
| $\omega_{ij}$ | Cosine phase overlap | $[0, 1]$ |
| $\Theta_{\mathrm{th}}$ | Geometric percolation threshold | $0.70$ |
| $d_s$ | Emergent spectral dimension | $3.00 \pm 0.05$ (Ordered 3D) |
| $c$ | Emergent maximum signal speed | $1.000$ (lattice unit) |
| $a_0$ | Milgrom acceleration scale | $c^2 / L_H \approx 1.2 \times 10^{-10}\,\text{m/s}^2$ |
| $v_{\mathrm{flat}}$ | Asymptotic galactic rotation velocity | $(G M a_0)^{1/4}$ |

*(End of Specification 1.0)*
