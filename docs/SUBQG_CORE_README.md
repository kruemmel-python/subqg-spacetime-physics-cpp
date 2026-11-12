# Subquantum Graphity (SubQG 1.0)

[![Tests](https://img.shields.io/badge/tests-270%20passing-brightgreen)](#)
[![Version](https://img.shields.io/badge/version-1.0.0-blue)](#)
[![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-informational)](#)
[![License](https://img.shields.io/badge/license-MIT-green)](#)

A production-grade, zero-dependency computational physics engine for **Subquantum Graphity (SubQG 1.0)**. 

SubQG models the emergence of smooth 3D spacetime, relativistic causal structures, and gravitational attraction directly from pre-geometric quantum network percolation, deriving the **Newton-to-MOND crossover** without postulating dark matter.

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 20.0.0 (Native ECMAScript Modules support)

### Installation
Clone or copy the `developer` directory to your project workspace:
```bash
cd developer
```
*(No `npm install` needed – SubQG 1.0 has 0 external runtime dependencies!)*

### Running Tests
Run the entire validation suite of **270 unit tests**:
```bash
npm test
```
All 270 unit tests will execute and report passing in ~12 seconds:
```
# tests 270
# pass 270
# fail 0
```

### Running Simulations
```bash
# Run the Genesis Master Simulation (Universe 1 vs Universe 2)
npm start

# Run the Unified Proof Engine Audit (MOND crossover, Tully-Fisher, and Causal Poset)
npm run audit
```

---

## 📁 Directory Structure

```
developer/
├── package.json              # Version 1.0.0 metadata & test runner scripts
├── README.md                 # This developer guide
├── LICENSE                   # MIT Open Source License
├── docs/
│   └── SPECIFICATION_1.0.md  # Formal mathematical specification
├── media/                    # Complete Scientific Audio & Video Assets
│   ├── SubQG_Genesis_Simulation.mp4       # Genesis network percolation video
│   ├── How_Spacetime_Builds_Itself.m4a    # Audio explanation of relational spacetime
│   ├── SubQG_Genesis_Dokumentation_3D.mp4 # 3D documentary film (1080p, 24 FPS)
│   ├── SubQG_Genesis_Dokumentation_3D.srt # Synchronized subtitles
│   └── subqg_crystal_clear_verification.png
├── src/
│   ├── index.mjs             # Unified public API facade & CLI entrypoint
│   ├── index.d.ts            # Full TypeScript declaration file
│   └── modules/              # 35 First-principles physics modules
├── tests/                    # 35 test suites (270 unit tests, 100% pass)
└── viewer/                   # 3D Documentary Viewer & Cinema Assets
    ├── index.html            # WebGL/Canvas 3D real-time simulation
    └── assets/
        ├── SubQG_Genesis_Dokumentation_3D.mp4  # Rendered 64s 1080p documentary
        └── SubQG_Genesis_Dokumentation_3D.srt  # Cinema subtitles
```

---

## 🔬 Core Architecture & API

Import any component directly via ESM:

```javascript
import { 
  SubQGUnifiedProofEngine, 
  SubQGGenesisEngine, 
  SubQGMultiversePhaseEngine 
} from './src/index.mjs';

// 1. Pre-geometric Microstructure & Gravitational Crossover
const proofEngine = new SubQGUnifiedProofEngine({ G: 1.0, boxSize: 20.0 });
const stats = proofEngine.initializeMicrostructure({ centralMass: 20.0 });

// Calculate effective acceleration: Newton (alpha=2) -> MOND (alpha=1)
const nearField = proofEngine.effectiveGravitationalAcceleration(20.0, 0.4);  // alpha ~ 2.0
const farField  = proofEngine.effectiveGravitationalAcceleration(20.0, 200.0); // alpha ~ 1.0

console.log(`Near exponent: ${nearField.localExponent}, Far exponent: ${farField.localExponent}`);

// 2. Genesis Transition: Emergence of Distinct Cosmologies
const genesis = new SubQGGenesisEngine({
  universeMode: 'CONTINUUM_3D',
  stateCount: 200,
  threshold: 0.75
});
const speedResult = genesis.measureEmergentSpeedLimit();
console.log(`Emergent speed of light c = ${speedResult.meanSpeedLimitC}`);
```

---

## 🎬 3D Interactive Documentary Viewer

Open `viewer/index.html` in any modern web browser:
- **WebGL/2D Canvas 3D Perspective Projection**
- **Cinematic Subtitle System** with real-time cosmological telemetry ($\Lambda/\Lambda_c, \Delta^*, d, c$)
- **Interactive Multi-Cam Modes** (NASA Orbit, Split-View, Universe 1 3D vs Universe 2 Fractal)
- **Direct Video Export** capability with burned-in subtitles

---

## 📜 License

MIT License. Free for academic research, open-source development, and commercial exploration.
