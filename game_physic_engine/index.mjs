// =========================================================================
// SUBQG GAME PHYSIC ENGINE - MAIN ENTRY POINT
// =========================================================================

// Math
export { Vec2 } from './src/math/Vec2.mjs';
export { Mat22 } from './src/math/Mat22.mjs';
export { Transform } from './src/math/Transform.mjs';
export { AABB } from './src/math/AABB.mjs';
export { clamp, lerp, sign, normalizeAngle, isApproxZero, EPSILON, DEG2RAD, RAD2DEG } from './src/math/MathUtils.mjs';

// World & Configuration
export { World } from './src/world/World.mjs';
export { StepConfig } from './src/world/StepConfig.mjs';
export { ContactListener } from './src/world/ContactListener.mjs';

// Dynamics & Bodies
export { Body } from './src/dynamics/Body.mjs';
export { Material } from './src/dynamics/Material.mjs';
export { ContactSolver } from './src/dynamics/ContactSolver.mjs';
export { Island } from './src/dynamics/Island.mjs';

// Shapes
export { Shape } from './src/collision/shapes/Shape.mjs';
export { Box } from './src/collision/shapes/Box.mjs';
export { Circle } from './src/collision/shapes/Circle.mjs';
export { Polygon } from './src/collision/shapes/Polygon.mjs';
export { Capsule } from './src/collision/shapes/Capsule.mjs';
export { Segment } from './src/collision/shapes/Segment.mjs';

// Joints
export { Joint } from './src/dynamics/joints/Joint.mjs';
export { DistanceJoint } from './src/dynamics/joints/DistanceJoint.mjs';
export { RevoluteJoint } from './src/dynamics/joints/RevoluteJoint.mjs';
export { PrismaticJoint } from './src/dynamics/joints/PrismaticJoint.mjs';
export { WeldJoint } from './src/dynamics/joints/WeldJoint.mjs';
export { PulleyJoint } from './src/dynamics/joints/PulleyJoint.mjs';

// Collision & Queries
export { DynamicAABBTree } from './src/collision/broadphase/DynamicAABBTree.mjs';
export { CollisionNarrowphase } from './src/collision/narrowphase/CollisionNarrowphase.mjs';
export { ContactManifold, ContactPoint } from './src/collision/narrowphase/ContactManifold.mjs';
export { SAT } from './src/collision/narrowphase/SAT.mjs';
export { Ray, RaycastHit } from './src/collision/Raycast.mjs';
export { TriggerSystem } from './src/collision/TriggerSystem.mjs';

// SubQG Relational Model (Internal & Pure Dynamics)
export { RelationalGraph } from './src/subqg/RelationalGraph.mjs';
export { MetricLatticeSolver } from './src/subqg/MetricLatticeSolver.mjs';
export { SubQGGravitationField } from './src/subqg/SubQGGravitationField.mjs';
export { SubQGContactBridge } from './src/subqg/SubQGContactBridge.mjs';
export { SubQGPureDynamics } from './src/subqg/SubQGPureDynamics.mjs';
export { SubQGInspector } from './src/debug/SubQGInspector.mjs';

// Debug & Visualization
export { CanvasRenderer } from './src/debug/CanvasRenderer.mjs';
