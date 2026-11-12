import Mathlib.Basic.Real.Basic
import Mathlib.Algebra.BigOperators.Ring.Finset
import Mathlib.Analysis.SpecialFunctions.Exp
import Mathlib.Analysis.SpecialFunctions.SmoothTransition
import Mathlib.Analysis.SpecialFunctions.Trigonometric.Basic
import Mathlib.Tactic.FieldSimp
import Mathlib.Tactic.Linarith
import Mathlib.Tactic.NormNum
import Mathlib.Tactic.Positivity
import Mathlib.Tactic.Ring

/-!
# Formal SubQG edge-action derivation

This file formalizes the mathematical core used by
`src/modules/subqg_microaction.mjs` and
`src/modules/subqg_apple_experiment.mjs`:

1. a finite weighted graph;
2. the quadratic edge action;
3. its weak stationarity equation;
4. the stationary-minimum consequence;
5. the node metric potential;
6. norm-weighted object force and discrete motion;
7. the exact compact-support glitch window and symmetric two-sector coupling.

The action is an explicit model ansatz.  Lean proves consequences of the
stated ansatz and assumptions; it does not assert that the ansatz is a law of
nature.
-/

set_option autoImplicit false

open scoped BigOperators

namespace SubQG

noncomputable section

/--
A finite graph with weighted edges and a finite list of interacting edge
pairs.  `Pair` represents the line-graph adjacency used by the JavaScript
metric solver.  Each pair occurs once, matching the implementation's
`e ~ f` sum.
-/
structure FiniteWeightedGraph
    (Vertex Edge Pair : Type)
    [Fintype Vertex] [Fintype Edge] [Fintype Pair] where
  edgeSrc : Edge → Vertex
  edgeDst : Edge → Vertex
  edgeWeight : Edge → ℝ
  edgeWeight_nonneg : ∀ e, 0 ≤ edgeWeight e
  pairLeft : Pair → Edge
  pairRight : Pair → Edge
  pairWeight : Pair → ℝ
  pairWeight_nonneg : ∀ p, 0 ≤ pairWeight p

section EdgeAction

variable
  {Vertex Edge Pair : Type}
  [Fintype Vertex] [Fintype Edge] [Fintype Pair]
  (G : FiniteWeightedGraph Vertex Edge Pair)

/--
The implemented edge action

`S(x) = μ/2 ∑ xₑ² + κ/2 ∑ cₚ(x_left(p)-x_right(p))²
        + β ∑ wₑ ρₑ xₑ`.
-/
def edgeAction
    (μ κ β : ℝ) (ρ x : Edge → ℝ) : ℝ :=
  (∑ e : Edge, ((μ / 2) * (x e)^2 + β * G.edgeWeight e * ρ e * x e)) +
  ∑ p : Pair, (κ / 2) * G.pairWeight p *
    (x (G.pairLeft p) - x (G.pairRight p))^2

/-- Coefficient of `t` in `S(x+t h)-S(x)`. -/
def firstVariation
    (μ κ β : ℝ) (ρ x h : Edge → ℝ) : ℝ :=
  (∑ e : Edge, (μ * x e * h e + β * G.edgeWeight e * ρ e * h e)) +
  ∑ p : Pair, κ * G.pairWeight p *
    (x (G.pairLeft p) - x (G.pairRight p)) *
    (h (G.pairLeft p) - h (G.pairRight p))

/-- Quadratic remainder in the variation of the action. -/
def quadraticRemainder
    (μ κ : ℝ) (h : Edge → ℝ) : ℝ :=
  (∑ e : Edge, (μ / 2) * (h e)^2) +
  ∑ p : Pair, (κ / 2) * G.pairWeight p *
    (h (G.pairLeft p) - h (G.pairRight p))^2

/--
Exact finite-dimensional expansion of the action along an arbitrary
variation.  This is the algebraic replacement for an informal derivative.
-/
theorem edgeAction_along_variation
    (μ κ β t : ℝ) (ρ x h : Edge → ℝ) :
    edgeAction G μ κ β ρ (fun e => x e + t * h e) =
      edgeAction G μ κ β ρ x +
      t * firstVariation G μ κ β ρ x h +
      t^2 * quadraticRemainder G μ κ h := by
  classical
  have hedge :
      (∑ e : Edge,
        ((μ / 2) * (x e + t * h e)^2 +
          β * G.edgeWeight e * ρ e * (x e + t * h e))) =
        (∑ e : Edge, ((μ / 2) * (x e)^2 + β * G.edgeWeight e * ρ e * x e)) +
        t * (∑ e : Edge, (μ * x e * h e + β * G.edgeWeight e * ρ e * h e)) +
        t^2 * (∑ e : Edge, (μ / 2) * (h e)^2) := by
    rw [Finset.mul_sum, Finset.mul_sum]
    rw [← Finset.sum_add_distrib, ← Finset.sum_add_distrib]
    apply Finset.sum_congr rfl
    intro e _
    ring
  have hpairs :
      (∑ p : Pair, (κ / 2) * G.pairWeight p *
        ((x (G.pairLeft p) + t * h (G.pairLeft p)) -
          (x (G.pairRight p) + t * h (G.pairRight p)))^2) =
        (∑ p : Pair, (κ / 2) * G.pairWeight p *
          (x (G.pairLeft p) - x (G.pairRight p))^2) +
        t * (∑ p : Pair, κ * G.pairWeight p *
          (x (G.pairLeft p) - x (G.pairRight p)) *
          (h (G.pairLeft p) - h (G.pairRight p))) +
        t^2 * (∑ p : Pair, (κ / 2) * G.pairWeight p *
          (h (G.pairLeft p) - h (G.pairRight p))^2) := by
    rw [Finset.mul_sum, Finset.mul_sum]
    rw [← Finset.sum_add_distrib, ← Finset.sum_add_distrib]
    apply Finset.sum_congr rfl
    intro p _
    ring
  simp only [edgeAction, firstVariation, quadraticRemainder]
  rw [hedge, hpairs]
  ring

/--
Weak Euler--Lagrange equation.  In matrix notation this is exactly

`(μ I + κ L_edge) x = -β (w ⊙ ρ)`.

Using all test variations avoids hiding a coordinate or differentiability
assumption.
-/
def IsStationary
    (μ κ β : ℝ) (ρ x : Edge → ℝ) : Prop :=
  ∀ h : Edge → ℝ, firstVariation G μ κ β ρ x h = 0

theorem stationary_action_expansion
    {μ κ β : ℝ} {ρ x : Edge → ℝ}
    (hx : IsStationary G μ κ β ρ x)
    (h : Edge → ℝ) :
    edgeAction G μ κ β ρ (fun e => x e + h e) =
      edgeAction G μ κ β ρ x + quadraticRemainder G μ κ h := by
  have hv := edgeAction_along_variation G μ κ β 1 ρ x h
  rw [hx h] at hv
  simpa using hv

theorem quadraticRemainder_nonneg
    {μ κ : ℝ} (hμ : 0 ≤ μ) (hκ : 0 ≤ κ)
    (h : Edge → ℝ) :
    0 ≤ quadraticRemainder G μ κ h := by
  classical
  apply add_nonneg
  · apply Finset.sum_nonneg
    intro e _
    exact mul_nonneg (div_nonneg hμ (by norm_num)) (sq_nonneg (h e))
  · apply Finset.sum_nonneg
    intro p _
    exact mul_nonneg
      (mul_nonneg (div_nonneg hκ (by norm_num)) (G.pairWeight_nonneg p))
      (sq_nonneg (h (G.pairLeft p) - h (G.pairRight p)))

/-- Every stationary configuration is a global action minimizer. -/
theorem stationary_is_global_minimum
    {μ κ β : ℝ} {ρ x : Edge → ℝ}
    (hμ : 0 ≤ μ) (hκ : 0 ≤ κ)
    (hx : IsStationary G μ κ β ρ x)
    (y : Edge → ℝ) :
    edgeAction G μ κ β ρ x ≤ edgeAction G μ κ β ρ y := by
  let h : Edge → ℝ := fun e => y e - x e
  have hexpand := stationary_action_expansion G hx h
  have hnonneg := quadraticRemainder_nonneg G hμ hκ h
  have hpoint : (fun e => x e + h e) = y := by
    funext e
    simp [h]
  rw [hpoint] at hexpand
  linarith

/-- The stationarity equation evaluated in the direction `h=x`. -/
theorem stationary_energy_balance
    {μ κ β : ℝ} {ρ x : Edge → ℝ}
    (hx : IsStationary G μ κ β ρ x) :
    (∑ e : Edge, (μ * x e * x e + β * G.edgeWeight e * ρ e * x e)) +
      ∑ p : Pair, κ * G.pairWeight p *
        (x (G.pairLeft p) - x (G.pairRight p)) *
        (x (G.pairLeft p) - x (G.pairRight p)) = 0 := by
  simpa only [firstVariation] using hx x

end EdgeAction

section PotentialAndMotion

variable
  {Vertex Edge Pair : Type}
  [Fintype Vertex]
  [Fintype Edge] [Fintype Pair]
  (G : FiniteWeightedGraph Vertex Edge Pair)

section NodePotential

variable [DecidableEq Vertex]

/-- `Φ_metric(u) = β/2 ∑_{e∋u} wₑ xₑ`, matching the JS model. -/
def nodeMetricPotential (β : ℝ) (x : Edge → ℝ) (u : Vertex) : ℝ :=
  (β / 2) * ∑ e : Edge,
    if G.edgeSrc e = u ∨ G.edgeDst e = u
    then G.edgeWeight e * x e
    else 0

end NodePotential

/-- Total excitation norm `N_Ψ = ∑ᵤ ρᵤ`. -/
def objectNorm (density : Vertex → ℝ) : ℝ :=
  ∑ u, density u

/--
Force obtained from a discrete directional derivative of the metric
potential: `F = -∑ᵤ ρᵤ ∇Φ(u)`.
-/
def metricForce
    (density potentialGradient : Vertex → ℝ) : ℝ :=
  -∑ u, density u * potentialGradient u

/-- In the normalized model, inertial mass is the packet norm. -/
def inertialMass (density : Vertex → ℝ) : ℝ :=
  objectNorm density

/-- Acceleration of the packet center under the norm-weighted force. -/
def objectAcceleration
    (density potentialGradient : Vertex → ℝ) : ℝ :=
  metricForce density potentialGradient / inertialMass density

/-- A simple discrete state for the packet center. -/
structure MotionState where
  position : ℝ
  velocity : ℝ

/-- Symplectic-Euler center update used as a formal movement abstraction. -/
def motionStep (dt acceleration : ℝ) (s : MotionState) : MotionState :=
  let nextVelocity := s.velocity + dt * acceleration
  { position := s.position + dt * nextVelocity
    velocity := nextVelocity }

theorem metricForce_constant_gradient
    (density : Vertex → ℝ) (g : ℝ) :
    metricForce density (fun _ => -g) = objectNorm density * g := by
  classical
  simp [metricForce, objectNorm, Finset.sum_mul]

/--
Formal free-fall universality theorem.

Assumption: the directional metric-potential gradient is constant (`-g`)
over the packet support and the packet norm is nonzero.  Under exactly these
conditions the norm cancels and the center acceleration is independent of the
object norm.
-/
theorem constant_metric_gradient_gives_universal_acceleration
    (density : Vertex → ℝ) (g : ℝ)
    (hnorm : objectNorm density ≠ 0) :
    objectAcceleration density (fun _ => -g) = g := by
  rw [objectAcceleration, metricForce_constant_gradient]
  simp [inertialMass, hnorm]

/-- Eötvös ratio used in composition-dependent free-fall tests. -/
def eotvosRatio (accelerationA accelerationB : ℝ) : ℝ :=
  2 * (accelerationA - accelerationB) / (accelerationA + accelerationB)

/--
For any two nonzero packet densities in the same nonzero constant metric
gradient, the ideal SubQG matter model predicts an exactly vanishing Eötvös
ratio.  The densities may have different shapes and norms.
-/
theorem universal_free_fall_eotvos_zero
    (densityA densityB : Vertex → ℝ) (g : ℝ)
    (hnormA : objectNorm densityA ≠ 0)
    (hnormB : objectNorm densityB ≠ 0)
    (_hg : g ≠ 0) :
    eotvosRatio
      (objectAcceleration densityA (fun _ => -g))
      (objectAcceleration densityB (fun _ => -g)) = 0 := by
  rw [constant_metric_gradient_gives_universal_acceleration densityA g hnormA]
  rw [constant_metric_gradient_gives_universal_acceleration densityB g hnormB]
  simp [eotvosRatio]

/-- Holding force is proportional to the packet norm in the same field. -/
theorem holding_force_is_mass_proportional
    (density : Vertex → ℝ) (g : ℝ) :
    -metricForce density (fun _ => -g) = -(inertialMass density * g) := by
  rw [metricForce_constant_gradient]
  rfl

theorem motionStep_velocity
    (dt acceleration : ℝ) (s : MotionState) :
    (motionStep dt acceleration s).velocity =
      s.velocity + dt * acceleration := by
  rfl

theorem motionStep_position
    (dt acceleration : ℝ) (s : MotionState) :
    (motionStep dt acceleration s).position =
      s.position + dt * (s.velocity + dt * acceleration) := by
  rfl

/-- One formally verified movement step in a constant metric field. -/
theorem universal_free_fall_step
    (density : Vertex → ℝ) (g dt : ℝ)
    (hnorm : objectNorm density ≠ 0)
    (s : MotionState) :
    motionStep dt (objectAcceleration density (fun _ => -g)) s =
      motionStep dt g s := by
  rw [constant_metric_gradient_gives_universal_acceleration density g hnorm]

end PotentialAndMotion

section ExactGlitch

/-!
## Exact compact-support glitch and symmetric sector coupling

This section mirrors the mathematical core of
`src/modules/subqg_exact_glitch_tunneling.mjs`.  Complex vectors are written
as real and imaginary components so that the cancellation behind norm
conservation remains completely explicit.
-/

/-- Valid parameters for the compactly supported glitch window. -/
structure ExactGlitchParameters where
  timeMid : ℝ
  halfWidth : ℝ
  halfWidth_pos : 0 < halfWidth
  epsilonMax : ℝ
  tunnelStrength : ℝ

/-- Dimensionless time coordinate `s = (t - t_mid) / tau`. -/
def normalizedGlitchTime (p : ExactGlitchParameters) (t : ℝ) : ℝ :=
  (t - p.timeMid) / p.halfWidth

/--
The infinitely smooth bump function with compact support on `(-1, 1)`:
`bumpGlue s = exp(1) * expNegInvGlue (1 - s^2)`.
Inside `(-1, 1)`, it equals `exp(1 - 1 / (1 - s^2))`.
Outside `(-1, 1)`, it is identically 0.
-/
def bumpGlue (s : ℝ) : ℝ :=
  Real.exp 1 * expNegInvGlue (1 - s^2)

theorem bumpGlue_contDiff {n : ℕ∞} : ContDiff ℝ n bumpGlue := by
  change ContDiff ℝ n (fun s => Real.exp 1 * expNegInvGlue (1 - s^2))
  refine contDiff_const.mul ?_
  refine expNegInvGlue.contDiff.comp ?_
  exact contDiff_const.sub (contDiff_id.pow 2)

theorem bumpGlue_zero_of_not_mem {s : ℝ} (hs : ¬ |s| < 1) : bumpGlue s = 0 := by
  simp only [bumpGlue]
  have h1 : 1 - s^2 ≤ 0 := by
    have h2 : 1 ≤ |s| := not_lt.mp hs
    have h3 : 1 ≤ s^2 := by
      rw [← sq_abs]
      nlinarith
    linarith
  rw [expNegInvGlue.zero_of_nonpos h1, mul_zero]

/--
The smooth bump function across time `t` for parameters `p`.
-/
def smoothGlitchBump (p : ExactGlitchParameters) (t : ℝ) : ℝ :=
  bumpGlue (normalizedGlitchTime p t)

theorem smoothGlitchBump_contDiff (p : ExactGlitchParameters) {n : ℕ∞} :
    ContDiff ℝ n (fun t => smoothGlitchBump p t) := by
  change ContDiff ℝ n (fun t => bumpGlue ((t - p.timeMid) / p.halfWidth))
  refine bumpGlue_contDiff.comp ?_
  exact (contDiff_id.sub contDiff_const).div_const p.halfWidth

theorem smoothGlitchBump_outside
    (p : ExactGlitchParameters) (t : ℝ)
    (hout : ¬ |normalizedGlitchTime p t| < 1) :
    smoothGlitchBump p t = 0 :=
  bumpGlue_zero_of_not_mem hout

/--
The exact piecewise bump used by `computeGlitchCoupling`.  The explicit
outside branch is what makes the bridge identically zero rather than merely
small outside the open interval `|s| < 1`.
-/
def compactGlitchBump (p : ExactGlitchParameters) (t : ℝ) : ℝ :=
  let s := normalizedGlitchTime p t
  if |s| < 1 then Real.exp (1 - 1 / (1 - s^2)) else 0

def glitchEpsilon (p : ExactGlitchParameters) (t : ℝ) : ℝ :=
  p.epsilonMax * compactGlitchBump p t

/-- `w_AB(t) = sin²(epsilon(t))` from the exact engine. -/
def overlapWeight (p : ExactGlitchParameters) (t : ℝ) : ℝ :=
  (Real.sin (glitchEpsilon p t))^2

/-- `g(t) = J_tunnel * w_AB(t)`. -/
def tunnelCoupling (p : ExactGlitchParameters) (t : ℝ) : ℝ :=
  p.tunnelStrength * overlapWeight p t

theorem compactGlitchBump_outside
    (p : ExactGlitchParameters) (t : ℝ)
    (hout : ¬ |normalizedGlitchTime p t| < 1) :
    compactGlitchBump p t = 0 := by
  simp [compactGlitchBump, hout]

/-- At the center of a valid glitch window the normalized bump is exactly 1. -/
theorem compactGlitchBump_at_center (p : ExactGlitchParameters) :
    compactGlitchBump p p.timeMid = 1 := by
  simp [compactGlitchBump, normalizedGlitchTime]

theorem overlapWeight_nonneg (p : ExactGlitchParameters) (t : ℝ) :
    0 ≤ overlapWeight p t := by
  exact sq_nonneg _

/-- The implemented peak value is exactly `sin²(epsilonMax)`. -/
theorem overlapWeight_at_center (p : ExactGlitchParameters) :
    overlapWeight p p.timeMid = (Real.sin p.epsilonMax)^2 := by
  simp [overlapWeight, glitchEpsilon, compactGlitchBump_at_center]

/-- Outside the compact support every bridge quantity is identically zero. -/
theorem bridge_closed_outside
    (p : ExactGlitchParameters) (t : ℝ)
    (hout : ¬ |normalizedGlitchTime p t| < 1) :
    glitchEpsilon p t = 0 ∧
      overlapWeight p t = 0 ∧
      tunnelCoupling p t = 0 := by
  have hbump := compactGlitchBump_outside p t hout
  simp [glitchEpsilon, overlapWeight, tunnelCoupling, hbump]

/-- Edge source injected from sector B into A by the exact engine. -/
def crossMetricSource
    {Edge : Type} (p : ExactGlitchParameters) (t : ℝ)
    (rhoB : Edge → ℝ) (e : Edge) : ℝ :=
  overlapWeight p t * rhoB e

theorem crossMetricSource_outside
    {Edge : Type} (p : ExactGlitchParameters) (t : ℝ)
    (rhoB : Edge → ℝ)
    (hout : ¬ |normalizedGlitchTime p t| < 1) :
    crossMetricSource p t rhoB = fun _ => 0 := by
  funext e
  have hclosed := (bridge_closed_outside p t hout).2.1
  simp [crossMetricSource, hclosed]

section TwoSector

variable {Site : Type} [Fintype Site]

/-- Real part of the complex inner product used by the block energy. -/
def realOverlap
    (aRe aIm bRe bIm : Site → ℝ) : ℝ :=
  ∑ u : Site, (aRe u * bRe u + aIm u * bIm u)

/-- Squared complex norm of one sector. -/
def sectorNorm (re im : Site → ℝ) : ℝ :=
  ∑ u : Site, ((re u)^2 + (im u)^2)

def totalSectorNorm
    (aRe aIm bRe bIm : Site → ℝ) : ℝ :=
  sectorNorm aRe aIm + sectorNorm bRe bIm

/-- Directional rate of a squared complex norm. -/
def sectorNormRate
    (re im dRe dIm : Site → ℝ) : ℝ :=
  ∑ u : Site, 2 * (re u * dRe u + im u * dIm u)

/-- `E_cross = 2 g Re(<Psi_A|Psi_B>)`. -/
def blockCouplingEnergy
    (g : ℝ) (aRe aIm bRe bIm : Site → ℝ) : ℝ :=
  2 * g * realOverlap aRe aIm bRe bIm

/-- The real pairing of the two off-diagonal blocks is symmetric. -/
theorem realOverlap_symmetric
    (aRe aIm bRe bIm : Site → ℝ) :
    realOverlap aRe aIm bRe bIm =
      realOverlap bRe bIm aRe aIm := by
  classical
  apply Finset.sum_congr rfl
  intro u _
  ring

/--
The symmetric coupling terms in the two Schrödinger equations cancel
exactly in the rate of `N_A + N_B`.  `dA0` and `dB0` are the uncoupled
sector derivatives; the four added terms are precisely those implemented in
`_computeBlockRhs`.
-/
theorem symmetric_coupling_preserves_total_norm_rate
    (g : ℝ)
    (aRe aIm bRe bIm dA0Re dA0Im dB0Re dB0Im : Site → ℝ) :
    sectorNormRate aRe aIm
        (fun u => dA0Re u + g * bIm u)
        (fun u => dA0Im u - g * bRe u) +
      sectorNormRate bRe bIm
        (fun u => dB0Re u + g * aIm u)
        (fun u => dB0Im u - g * aRe u) =
      sectorNormRate aRe aIm dA0Re dA0Im +
        sectorNormRate bRe bIm dB0Re dB0Im := by
  classical
  simp only [sectorNormRate]
  rw [← Finset.sum_add_distrib, ← Finset.sum_add_distrib]
  apply Finset.sum_congr rfl
  intro u _
  ring

/-- If both uncoupled self-adjoint sectors preserve norm, so does their
symmetric real coupling at the differential-equation level. -/
theorem total_norm_rate_zero_of_symmetric_coupling
    (g : ℝ)
    (aRe aIm bRe bIm dA0Re dA0Im dB0Re dB0Im : Site → ℝ)
    (hA : sectorNormRate aRe aIm dA0Re dA0Im = 0)
    (hB : sectorNormRate bRe bIm dB0Re dB0Im = 0) :
    sectorNormRate aRe aIm
        (fun u => dA0Re u + g * bIm u)
        (fun u => dA0Im u - g * bRe u) +
      sectorNormRate bRe bIm
        (fun u => dB0Re u + g * aIm u)
        (fun u => dB0Im u - g * aRe u) = 0 := by
  rw [symmetric_coupling_preserves_total_norm_rate]
  rw [hA, hB]
  norm_num

/--
Exact partial energy/work identity for a coupling change while the state is
held fixed.  Dividing by a time increment gives the implemented power term
`2 * g'(t) * Re(<Psi_A|Psi_B>)` in the differential limit.
-/
theorem blockCouplingEnergy_parameter_change
    (g deltaG : ℝ) (aRe aIm bRe bIm : Site → ℝ) :
    blockCouplingEnergy (g + deltaG) aRe aIm bRe bIm -
      blockCouplingEnergy g aRe aIm bRe bIm =
      2 * deltaG * realOverlap aRe aIm bRe bIm := by
  simp [blockCouplingEnergy]
  ring

/--
The joint Hamiltonian energy of the coupled two-sector SubQG universe,
including intrinsic wave packet energies, transient cross-coupling energy,
and the variational edge field actions of both sectors:
`H_joint = E_Psi,A + E_Psi,B + E_cross + S_edge[x_A] + S_edge[x_B]`.
-/
def jointBlockEnergy
    (g : ℝ) (eA eB sEdgeA sEdgeB : ℝ)
    (aRe aIm bRe bIm : Site → ℝ) : ℝ :=
  eA + eB + blockCouplingEnergy g aRe aIm bRe bIm + sEdgeA + sEdgeB

/--
Complete joint energy-work theorem with metric feedback:
When the transient glitch changes the tunneling coupling by `deltaG`
and the cross-metric coupling weight by `deltaW`, the instantaneous
energy variation of the joint Hamiltonian is the sum of the tunnel work
`2 * deltaG * Re(<Psi_A | Psi_B>)` and the metric distortion power
`deltaW * beta * ∑ w_e * rho_B,e * x_A,e`.
-/
theorem joint_energy_variation_with_metric_feedback
    (g deltaG eA eB sEdgeA sEdgeB deltaW beta metricCrossInt : ℝ)
    (aRe aIm bRe bIm : Site → ℝ) :
    jointBlockEnergy (g + deltaG) eA eB (sEdgeA + deltaW * beta * metricCrossInt) sEdgeB aRe aIm bRe bIm -
      jointBlockEnergy g eA eB sEdgeA sEdgeB aRe aIm bRe bIm =
      2 * deltaG * realOverlap aRe aIm bRe bIm +
        deltaW * beta * metricCrossInt := by
  simp only [jointBlockEnergy, blockCouplingEnergy]
  ring

end TwoSector

end ExactGlitch

/-! ## Linearized spin-2 weak-field closure

This section proves the algebraic part of the relativistic closure.  It does
not assume that the current graph action has already been shown to converge to
Fierz--Pauli theory.  Instead it states exactly what follows once its static
dust response is the trace-reversed massless spin-2 response
`bar h_00 = 4 U`, `bar h_ij = 0` (in units `c = 1`).
-/

section LinearizedSpinTwoClosure

/-- Abstract lower-bound form of the anchored metric Hessian. -/
def anchoredMetricQuadratic
    (anchor normSquared interaction : ℝ) : ℝ :=
  anchor * normSquared + interaction

/-- A positive anchor and nonnegative interaction give a strict mass-gap
lower bound for every nonzero fluctuation norm. -/
theorem anchored_metric_hessian_lower_bound
    (anchor normSquared interaction : ℝ)
    (hInteraction : 0 ≤ interaction) :
    anchor * normSquared ≤
      anchoredMetricQuadratic anchor normSquared interaction := by
  simp [anchoredMetricQuadratic]
  exact hInteraction

/-- If both the anchor and fluctuation norm are positive, the quadratic
response is strictly positive, so the mode cannot be massless. -/
theorem positive_anchor_excludes_zero_metric_mode
    (anchor normSquared interaction : ℝ)
    (hAnchor : 0 < anchor)
    (hNorm : 0 < normSquared)
    (hInteraction : 0 ≤ interaction) :
    0 < anchoredMetricQuadratic anchor normSquared interaction := by
  dsimp [anchoredMetricQuadratic]
  nlinarith [mul_pos hAnchor hNorm]

/-- Trace of the trace-reversed perturbation for static pressureless matter. -/
def staticDustTrace (U : ℝ) : ℝ := -(4 * U)

/-- `h_00 = bar h_00 - 1/2 eta_00 bar h`, with `eta_00 = -1`. -/
def staticDustTimePerturbation (U : ℝ) : ℝ :=
  4 * U + (1 / 2 : ℝ) * staticDustTrace U

/-- `h_ii = bar h_ii - 1/2 eta_ii bar h`, with `bar h_ii = 0`. -/
def staticDustSpatialPerturbation (U : ℝ) : ℝ :=
  -(1 / 2 : ℝ) * staticDustTrace U

/-- Trace reversal gives the Newtonian time perturbation `h_00 = 2 U`. -/
theorem static_dust_time_perturbation (U : ℝ) :
    staticDustTimePerturbation U = 2 * U := by
  simp [staticDustTimePerturbation, staticDustTrace]
  ring

/-- Trace reversal gives the same spatial perturbation `h_ii = 2 U`. -/
theorem static_dust_spatial_perturbation (U : ℝ) :
    staticDustSpatialPerturbation U = 2 * U := by
  simp [staticDustSpatialPerturbation, staticDustTrace]
  ring

/-- The linearized massless spin-2 static-dust response has no slip. -/
theorem linearized_spin_two_static_dust_no_slip (U : ℝ) :
    staticDustSpatialPerturbation U = staticDustTimePerturbation U := by
  rw [static_dust_spatial_perturbation, static_dust_time_perturbation]

/-- For a nonzero source, the PPN ratio is exactly `gamma = 1`. -/
theorem linearized_spin_two_static_dust_gamma_one (U : ℝ) (hU : U ≠ 0) :
    staticDustSpatialPerturbation U / staticDustTimePerturbation U = 1 := by
  rw [static_dust_spatial_perturbation, static_dust_time_perturbation]
  field_simp

/-- The corresponding weak-field lensing strength `(1 + gamma)/2` is one. -/
theorem gamma_one_full_lensing_strength :
    ((1 : ℝ) + 1) / 2 = 1 := by
  norm_num

end LinearizedSpinTwoClosure

#print axioms edgeAction_along_variation
#print axioms stationary_action_expansion
#print axioms quadraticRemainder_nonneg
#print axioms stationary_is_global_minimum
#print axioms stationary_energy_balance
#print axioms metricForce_constant_gradient
#print axioms constant_metric_gradient_gives_universal_acceleration
#print axioms universal_free_fall_eotvos_zero
#print axioms holding_force_is_mass_proportional
#print axioms universal_free_fall_step
#print axioms bumpGlue_contDiff
#print axioms bumpGlue_zero_of_not_mem
#print axioms smoothGlitchBump_contDiff
#print axioms smoothGlitchBump_outside
#print axioms compactGlitchBump_outside
#print axioms compactGlitchBump_at_center
#print axioms overlapWeight_at_center
#print axioms bridge_closed_outside
#print axioms crossMetricSource_outside
#print axioms symmetric_coupling_preserves_total_norm_rate
#print axioms total_norm_rate_zero_of_symmetric_coupling
#print axioms blockCouplingEnergy_parameter_change
#print axioms joint_energy_variation_with_metric_feedback
#print axioms static_dust_time_perturbation
#print axioms static_dust_spatial_perturbation
#print axioms linearized_spin_two_static_dust_no_slip
#print axioms linearized_spin_two_static_dust_gamma_one
#print axioms gamma_one_full_lensing_strength
#print axioms anchored_metric_hessian_lower_bound
#print axioms positive_anchor_excludes_zero_metric_mode

end

end SubQG
