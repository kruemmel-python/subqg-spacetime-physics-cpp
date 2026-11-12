# Native port coverage manifest

The only authoritative SubQG source for this port is:

the repository root (`src`, `tests`, `formal`, and `mre_formulas`)

The authoritative game-physics source is:

`game_physic_engine`

The developer repository was verified at commit `da9648b` (2026-11-12). This
manifest ties the original game-engine modules to their native C++17
counterparts. The original `.mjs` files remain in `game_physic_engine/` as the
behavioral reference.

| Original subsystem | Native public API |
|---|---|
| `math/Vec2`, `Mat22`, `Transform`, `AABB`, `MathUtils` | `Vec2`, `Mat22`, `Transform`, `AABB`, constants/helpers |
| `collision/shapes/*` | `Shape`, `Circle`, `Box`, `Polygon`, `Capsule`, `Segment` |
| `collision/narrowphase/*` | `SAT`, `CollisionNarrowphase`, `ContactManifold` |
| `collision/broadphase/DynamicAABBTree` | `DynamicAABBTree` |
| `collision/Raycast`, `TriggerSystem` | `World::raycast(All)`, listener trigger lifecycle |
| `dynamics/Body`, `Material`, `ContactSolver`, `Island` | `Body`, `Material`, `World` solver and sleeping |
| `dynamics/joints/*` | `DistanceJoint`, `RevoluteJoint`, `PrismaticJoint`, `WeldJoint`, `PulleyJoint` |
| `subqg/RelationalGraph` | `RelationalGraph` |
| `subqg/MetricLatticeSolver` | `MetricLatticeSolver` |
| `subqg/SubQGGravitationField` | `SubQGGravitationField` |
| `subqg/SubQGContactBridge` | `SubQGContactBridge` |
| `subqg/SubQGPureDynamics` | `SubQGPureDynamics`, `PhysicsMode::PureSubQG` |
| `destruction/SubQGDestructionSystem` | `SubQGDestructionSystem` |
| `world/World`, `StepConfig`, `ContactListener` | `World`, `StepConfig`, `ContactListener` |
| `debug/SubQGInspector` | `World::diagnostics` |

Browser canvas rendering, the JSON/TCP server and Blender/Unreal/custom-engine
bridges are integration layers rather than simulation code. They remain intact
in the imported reference tree. Native games link directly to the C++ API and
therefore do not require the server bridge.

## Verification gates

- static-library native parity executable;
- DLL/import-library native parity executable;
- hybrid and pure-SubQG ground contact;
- pure-mode zero classical solver calls;
- relational metric deformation and action diagnostics;
- trigger enter/stay/exit, raycast and distance joint;
- original game engine: 38/38 tests;
- canonical SubQG research core: 277/277 JavaScript reference tests.

The 277 passing reference tests do not by themselves certify native C++
coverage. Native coverage of the full `developer/src` API is tracked
separately and must pass numerical reference-vector comparisons before the C++
port may be called complete.
