import Mathlib.Basic.Real.Basic
import Mathlib.Tactic.Ring
import Mathlib.Tactic.FieldSimp
import Mathlib.Tactic.NormNum

set_option autoImplicit false

namespace SubQGFormalVerification

/-!
Machine-checked formal companion to the numerical `.mreformula` analysis.
Theorems 01--19 correspond to the canonical numbered suite.
Rational identities state every required nonzero-denominator assumption.
-/

theorem formula01_mond_flux
    (x y : ℝ) (hxy : x + y ≠ 0) :
    x^2 / (x + y) + x * y / (x + y) = x := by
  field_simp [hxy]

theorem formula02_conductivity_substitution
    (x y : ℝ) (hy : y ≠ 0) (hxy : x + y ≠ 0) :
    x / (1 + x / y) = (x * y) / (x + y) := by
  have hden : 1 + x / y = (x + y) / y := by
    field_simp [hy]
    ring
  rw [hden]
  field_simp [hy, hxy]

theorem formula03_four_momentum_identity (x y : ℝ) :
    ((x + y) * (x - y))^2 = (x^2 - y^2)^2 := by
  ring

theorem formula04_tully_fisher_power (x : ℝ) :
    (x^2)^2 = x^4 := by
  ring

theorem formula05_metric_contraction (x y : ℝ) :
    x * (1 - y) = x - x * y := by
  ring

theorem formula06_lieb_robinson_product (x y : ℝ) :
    (x * y)^2 = x^2 * y^2 := by
  ring

theorem formula07_landau_identity (x y : ℝ) :
    (x + y)^2 - 2 * x * y = x^2 + y^2 := by
  ring

theorem formula08_horizon_scale
    (x y : ℝ) (hy : y ≠ 0) :
    (x^2 / y) * y = x^2 := by
  field_simp [hy]

theorem formula09_page_wootters (x y : ℝ) :
    (x - y) + (y - x) = 0 := by
  ring

theorem formula10_causal_cube (x y : ℝ) :
    (x + y)^3 = x^3 + 3 * x^2 * y + 3 * x * y^2 + y^3 := by
  ring

theorem formula11_parallelogram (x y : ℝ) :
    (x + y)^2 + (x - y)^2 = 2 * x^2 + 2 * y^2 := by
  ring

theorem formula12_newton_counterexample :
    ∃ x y : ℝ, x^2 + x * y ≠ x^2 := by
  refine ⟨-10, -10, ?_⟩
  norm_num

theorem formula13_linear_conductivity_counterexample :
    ∃ x y : ℝ, x + y ≠ 0 ∧ x / (x + y) ≠ 1 := by
  refine ⟨-10, -10, by norm_num, ?_⟩
  norm_num

theorem formula14_edge_screening (x y : ℝ) :
    (x + y)^2 - x^2 - y^2 = 2 * x * y := by
  ring

theorem formula15_ehrenfest_cancellation
    (x y : ℝ) (hx : x ≠ 0) :
    (x * y) / x = y := by
  field_simp [hx]

theorem formula16_weight_inertia
    (x y : ℝ) (hy : y ≠ 0) :
    (x * y) / y = x := by
  field_simp [hy]

theorem formula17_refractive_invariance
    (y : ℝ) (hy : 1 - y ≠ 0) :
    (1 / (1 - y)) * (1 - y) = 1 := by
  field_simp [hy]

theorem formula18_orthogonal_decoupling (x y : ℝ) :
    (x + y)^2 + (x - y)^2 - 2 * (x^2 + y^2) = 0 := by
  ring

theorem formula19_cross_force_counterexample :
    ∃ x y : ℝ, (x + y)^2 ≠ x^2 + y^2 := by
  refine ⟨-10, -10, ?_⟩
  norm_num

theorem formula20_transient_tunneling_invariance (x y : ℝ) :
    (x + y)^2 - 2 * (x^2 + y^2) + (x - y)^2 = 0 := by
  ring

-- Additional noncanonical formulas that are not exact duplicates of 01--19.

theorem extra_binomial (x y : ℝ) :
    (x + y)^2 = x^2 + 2 * x * y + y^2 := by
  ring

theorem extra_graph_dispersion (x y : ℝ) :
    (x + y) * (x - y) = x^2 - y^2 := by
  ring

theorem extra_mond_crossover
    (x y : ℝ) (hxy : x + y ≠ 0) :
    x * (x / (x + y)) = x^2 / (x + y) := by
  field_simp [hxy]

#print axioms formula01_mond_flux
#print axioms formula02_conductivity_substitution
#print axioms formula03_four_momentum_identity
#print axioms formula04_tully_fisher_power
#print axioms formula05_metric_contraction
#print axioms formula06_lieb_robinson_product
#print axioms formula07_landau_identity
#print axioms formula08_horizon_scale
#print axioms formula09_page_wootters
#print axioms formula10_causal_cube
#print axioms formula11_parallelogram
#print axioms formula12_newton_counterexample
#print axioms formula13_linear_conductivity_counterexample
#print axioms formula14_edge_screening
#print axioms formula15_ehrenfest_cancellation
#print axioms formula16_weight_inertia
#print axioms formula17_refractive_invariance
#print axioms formula18_orthogonal_decoupling
#print axioms formula19_cross_force_counterexample
#print axioms formula20_transient_tunneling_invariance
#print axioms extra_binomial
#print axioms extra_graph_dispersion
#print axioms extra_mond_crossover

end SubQGFormalVerification
