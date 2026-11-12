# SubQG Game Physics Engine – native C++ library

This package combines the native C++17 game-physics layer with an exact C++
runtime API for the complete canonical FPV6 SubQG research core. The native
game simulation runs directly in process. The canonical runtime deliberately
executes the bundled, authoritative `developer/src` modules with Node.js so
the novel spacetime and gravity equations are not approximated or silently
rewritten during the C++ integration.

Included in the native library:

- rigid bodies, compound shapes and materials;
- circle, box, convex polygon, capsule and segment geometry;
- collision detection, contact/friction solver, raycasts and triggers;
- distance, revolute, prismatic, weld and pulley joints;
- hybrid and `PureSubQG` modes;
- relational graph, metric-lattice relaxation, emergent gravity, SubQG contact
  bridge, pure action dynamics and destruction;
- diagnostics including edge action, metric strain and the proof-relevant
  `contactSolverCalls == 0` invariant in pure mode.
- complete access to every export in the canonical FPV6 `developer/src/modules`
  tree through `CanonicalRuntime`, including stateful engine classes.

## Build with the supplied KR toolchain

From the repository root:

```powershell
.\build-cpp.ps1 -Configuration Release -Clean
```

Artifacts are written to `dist/cpp/Release`:

- `lib/libsubqg_physics.a` – static library;
- `bin/subqg_physics.dll` and `lib/libsubqg_physics.dll.a` – shared library;
- `include/subqg/physics.hpp` – public header;
- native parity test and example executables.
- `share/subqg/developer/src` – exact canonical FPV6 runtime sources;
- `share/subqg/runtime/subqg_bridge.mjs` – private C++ runtime bridge.

The default toolchain is
`H:\KR-Compiler\KR-Compiler-Windows-x64-v4.3.1\toolchain`. Override it with
`-Toolchain` when moving the project.

## Use

```cpp
#include <subqg/physics.hpp>

subqg::World world({0, -9.81}, subqg::PhysicsMode::PureSubQG);
world.createBox(0, 0, 20, 1, subqg::BodyType::Static);
auto& box = world.createBox(0, 5, 1, 1);
world.step(1.0 / 60.0);
```

Link against `libsubqg_physics.a`, or define `SUBQG_SHARED` and link the DLL
import library.

## Complete canonical FPV6 API

```cpp
#include <subqg/canonical_runtime.hpp>

subqg::CanonicalRuntime runtime({
    "node.exe",
    "share/subqg/developer",
    "share/subqg/runtime/subqg_bridge.mjs"
});

// In an installed release this is sufficient:
auto bundledRuntime = subqg::CanonicalRuntime::bundled("path/to/dist/cpp/Release");

auto proof = runtime.construct(
    "subqg_unified_proof_engine",
    "SubQGUnifiedProofEngine",
    "[{\"G\":1,\"boxSize\":20}]"
);
std::string result = runtime.call(
    proof,
    "effectiveGravitationalAcceleration",
    "[20,0.4]"
);
```

Arguments and results are JSON. `inventory()` lists every bundled module and
export. Function calls, constructors, instance methods and properties are all
supported.
