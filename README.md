# SubQG Spacetime Physics C++

A C++17 game-physics library backed by the complete canonical Subquantum
Graphity (SubQG) FPV6 research runtime: emergent spacetime, relational clocks,
causal order, graph waves, Genesis cosmologies, MOND-like gravity,
multiverse-phase analysis, the apple experiment, and the associated validation
engines.

## What is included

- Native C++ 2D rigid-body physics with hybrid and pure-SubQG modes.
- Shapes, compound bodies, collisions, joints, raycasts, triggers, sleeping,
  destruction, relational metric lattice, and diagnostics.
- The complete canonical FPV6 `src/modules` runtime through the C++
  `CanonicalRuntime` API.
- Static and shared-library builds for Windows x64.
- Original FPV6 documentation, formal proofs, formulas, tests, media, viewer,
  and the complete game-physics reference implementation.
- Reproducible SHA-256 source manifest in every release package.

The native game simulation runs directly in C++. The full research runtime is
executed from its original bundled modules through a private Node.js process.
This preserves the novel spacetime and gravity equations exactly instead of
approximating them during a language rewrite.

## Build

The verified toolchain is KR Compiler 4.3.1:

```powershell
.\build-cpp.ps1 -Configuration Release -Clean `
  -Toolchain "H:\KR-Compiler\KR-Compiler-Windows-x64-v4.3.1\toolchain"
```

Build output is written to `dist/cpp/Release` and includes:

- `lib/libsubqg_physics.a`
- `lib/libsubqg_physics.dll.a`
- `bin/subqg_physics.dll`
- public headers under `include/subqg`
- bundled canonical SubQG modules and source hashes
- native and canonical-runtime test executables

## C++ example

```cpp
#include <subqg/physics.hpp>
#include <subqg/canonical_runtime.hpp>

subqg::World world({0, -9.81}, subqg::PhysicsMode::PureSubQG);
world.createBox(0, 0, 20, 1, subqg::BodyType::Static);
auto& body = world.createBox(0, 5, 1, 1);
world.step(1.0 / 60.0);

auto runtime = subqg::CanonicalRuntime::bundled("dist/cpp/Release");
auto proof = runtime.construct(
    "subqg_unified_proof_engine",
    "SubQGUnifiedProofEngine",
    "[{\"G\":1,\"boxSize\":20}]"
);
auto gravity = runtime.call(
    proof,
    "effectiveGravitationalAcceleration",
    "[20,0.4]"
);
```

## Verification

- Canonical FPV6 research core: 277/277 tests passing.
- Canonical game-physics engine: 38/38 tests passing.
- Static C++ library tests passing.
- Shared-library/DLL tests passing.
- Bundled-runtime tests passing.
- Canonical source bundle: 41/41 files, zero SHA-256 differences.

## Project layout

- `cpp/` — C++ library, runtime bridge, examples, and native tests.
- `src/`, `tests/`, `formal/`, `mre_formulas/` — canonical FPV6 SubQG core.
- `game_physic_engine/` — canonical JavaScript game-physics reference.
- `docs/`, `viewer/`, `media/` — research documentation and visual material.

## License

This repository is licensed under the [GNU General Public License v3.0](LICENSE).
The optional bundled Node.js runtime retains its own notices in
[`THIRD_PARTY_LICENSES/NODEJS_LICENSE`](THIRD_PARTY_LICENSES/NODEJS_LICENSE).

SubQG is a research project. Its computational results are not a substitute
for independent scientific validation or experimental evidence.
