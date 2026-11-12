import fs from 'node:fs';
import path from 'node:path';

const baseDir = 'H:/SubQG_Fundamental_Physics_Validation_FPV6/game_physic_engine';

const filesInOrder = [
  'src/math/MathUtils.mjs',
  'src/math/Vec2.mjs',
  'src/math/Mat22.mjs',
  'src/math/Transform.mjs',
  'src/math/AABB.mjs',
  'src/dynamics/Material.mjs',
  'src/collision/shapes/Shape.mjs',
  'src/collision/shapes/Circle.mjs',
  'src/collision/shapes/Box.mjs',
  'src/collision/shapes/Polygon.mjs',
  'src/collision/shapes/Capsule.mjs',
  'src/collision/shapes/Segment.mjs',
  'src/collision/broadphase/DynamicAABBTree.mjs',
  'src/collision/narrowphase/ContactManifold.mjs',
  'src/collision/narrowphase/SAT.mjs',
  'src/collision/Raycast.mjs',
  'src/collision/TriggerSystem.mjs',
  'src/subqg/RelationalGraph.mjs',
  'src/subqg/MetricLatticeSolver.mjs',
  'src/subqg/SubQGGravitationField.mjs',
  'src/subqg/SubQGContactBridge.mjs',
  'src/subqg/SubQGPureDynamics.mjs',
  'src/collision/narrowphase/CollisionNarrowphase.mjs',
  'src/dynamics/Body.mjs',
  'src/dynamics/ContactSolver.mjs',
  'src/dynamics/Island.mjs',
  'src/dynamics/joints/Joint.mjs',
  'src/dynamics/joints/DistanceJoint.mjs',
  'src/dynamics/joints/RevoluteJoint.mjs',
  'src/dynamics/joints/PrismaticJoint.mjs',
  'src/dynamics/joints/WeldJoint.mjs',
  'src/dynamics/joints/PulleyJoint.mjs',
  'src/world/StepConfig.mjs',
  'src/world/ContactListener.mjs',
  'src/world/World.mjs',
  'src/debug/SubQGInspector.mjs',
  'src/debug/CanvasRenderer.mjs',
  'demo/demo_scenes.mjs'
];

let bundleCode = '';

for (const relPath of filesInOrder) {
  const fullPath = path.join(baseDir, relPath);
  const code = fs.readFileSync(fullPath, 'utf8');
  // Strip import statements and export keywords
  const cleaned = code
    .replace(/^import\s+.*?from\s+['"].*?['"];?\s*$/gm, '')
    .replace(/^export\s+(default\s+)?/gm, '');
  bundleCode += `\n// --- ${relPath} ---\n` + cleaned + '\n';
}

const templateHtml = fs.readFileSync(path.join(baseDir, 'demo/index.html'), 'utf8');

// Replace module imports with bundled code
const demoScriptMatch = templateHtml.match(/<script type="module">([\s\S]*?)<\/script>/);
if (!demoScriptMatch) {
  throw new Error('Could not find script block in demo/index.html');
}

const demoScriptBody = demoScriptMatch[1]
  .replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, '');

const standaloneScript = `
<script>
${bundleCode}

// Application Logic
${demoScriptBody}
</script>
`;

const standaloneHtml = templateHtml.replace(/<script type="module">[\s\S]*?<\/script>/, standaloneScript);

fs.writeFileSync(path.join(baseDir, 'demo/standalone_demo.html'), standaloneHtml, 'utf8');
console.log('Successfully generated demo/standalone_demo.html!');
