import { Vec2 } from '../../math/Vec2.mjs';
import { AABB } from '../../math/AABB.mjs';

/**
 * Node im dynamischen AABB-Baum
 */
class TreeNode {
  constructor(id) {
    this.id = id;
    this.aabb = new AABB();
    this.userData = null;
    this.parent = null;
    this.left = null;
    this.right = null;
    this.height = 0;
  }

  isLeaf() {
    return this.left === null;
  }
}

/**
 * DynamicAABBTree: Binarer Hüllkörperbaum (BVH) für O(N log N) Kollisionsabfragen.
 * Verwendet "Fat AABBs" mit Sicherheitsabstand (Padding), um teure Re-Insertions
 * bei kleinen Körperbewegungen zu eliminieren.
 */
export class DynamicAABBTree {
  constructor(fatPadding = 0.1) {
    this.fatPadding = fatPadding;
    this.root = null;
    this.nodePool = [];
    this.nodeCount = 0;
    this.nextNodeId = 1;
  }

  _allocateNode(userData, aabb) {
    const node = new TreeNode(this.nextNodeId++);
    node.userData = userData;
    // Fat AABB berechnen
    node.aabb.copy(aabb).expand(this.fatPadding);
    node.height = 0;
    return node;
  }

  insertLeaf(userData, aabb) {
    const leaf = this._allocateNode(userData, aabb);
    this.nodeCount++;

    if (!this.root) {
      this.root = leaf;
      return leaf;
    }

    // Finde besten Geschwisterknoten (Surface Area Heuristic)
    let best = this.root;
    let bestCost = AABB.combineArea(this.root.aabb, leaf.aabb);
    const queue = [{ node: this.root, inheritedCost: 0 }];

    while (queue.length > 0) {
      const { node, inheritedCost } = queue.shift();
      const combined = new AABB().copy(node.aabb).combine(leaf.aabb);
      const directCost = combined.getArea();
      const totalCost = directCost + inheritedCost;

      if (totalCost < bestCost) {
        bestCost = totalCost;
        best = node;
      }

      const newInheritedCost = inheritedCost + (directCost - node.aabb.getArea());
      const lowerBound = leaf.aabb.getArea() + newInheritedCost;

      if (lowerBound < bestCost && !node.isLeaf()) {
        queue.push({ node: node.left, inheritedCost: newInheritedCost });
        queue.push({ node: node.right, inheritedCost: newInheritedCost });
      }
    }

    // Neuer Elternknoten
    const oldParent = best.parent;
    const newParent = new TreeNode(this.nextNodeId++);
    newParent.parent = oldParent;
    newParent.aabb.copy(best.aabb).combine(leaf.aabb);
    newParent.height = best.height + 1;

    if (oldParent) {
      if (oldParent.left === best) oldParent.left = newParent;
      else oldParent.right = newParent;
    } else {
      this.root = newParent;
    }

    newParent.left = best;
    newParent.right = leaf;
    best.parent = newParent;
    leaf.parent = newParent;

    // Balanciere Baum nach oben
    this._refitHierarchy(leaf.parent);

    return leaf;
  }

  removeLeaf(leaf) {
    if (!leaf) return;
    this.nodeCount--;

    if (leaf === this.root) {
      this.root = null;
      return;
    }

    const parent = leaf.parent;
    const grandParent = parent.parent;
    const sibling = parent.left === leaf ? parent.right : parent.left;

    if (grandParent) {
      if (grandParent.left === parent) grandParent.left = sibling;
      else grandParent.right = sibling;
      sibling.parent = grandParent;
      this._refitHierarchy(grandParent);
    } else {
      this.root = sibling;
      sibling.parent = null;
    }
  }

  updateLeaf(leaf, aabb, displacement = null) {
    // Wenn neue AABB noch in der Fat AABB liegt, nichts tun!
    if (leaf.aabb.containsAABB(aabb)) {
      return false;
    }

    this.removeLeaf(leaf);

    // Fat AABB mit Bewegungsprädiktion berechnen
    leaf.aabb.copy(aabb).expand(this.fatPadding);
    if (displacement) {
      const pred = Vec2.scale(displacement, 2.0);
      leaf.aabb.expandByVec(pred);
    }

    // Neu einfügen
    if (!this.root) {
      this.root = leaf;
      leaf.parent = null;
      this.nodeCount++;
      return true;
    }

    // Standard Einfügen
    const best = this.root;
    const oldParent = best.parent;
    const newParent = new TreeNode(this.nextNodeId++);
    newParent.parent = oldParent;
    newParent.aabb.copy(best.aabb).combine(leaf.aabb);
    newParent.height = best.height + 1;

    if (oldParent) {
      if (oldParent.left === best) oldParent.left = newParent;
      else oldParent.right = newParent;
    } else {
      this.root = newParent;
    }

    newParent.left = best;
    newParent.right = leaf;
    best.parent = newParent;
    leaf.parent = newParent;

    this.nodeCount++;
    this._refitHierarchy(leaf.parent);
    return true;
  }

  _refitHierarchy(node) {
    let curr = node;
    while (curr) {
      curr = this._balance(curr);
      const left = curr.left;
      const right = curr.right;
      curr.height = 1 + Math.max(left.height, right.height);
      curr.aabb.copy(left.aabb).combine(right.aabb);
      curr = curr.parent;
    }
  }

  _balance(node) {
    if (node.isLeaf() || node.height < 2) return node;

    const left = node.left;
    const right = node.right;
    const balance = right.height - left.height;

    // Rotiere right up
    if (balance > 1) {
      const rLeft = right.left;
      const rRight = right.right;

      right.left = node;
      right.parent = node.parent;
      node.parent = right;

      if (right.parent) {
        if (right.parent.left === node) right.parent.left = right;
        else right.parent.right = right;
      } else {
        this.root = right;
      }

      if (rLeft.height > rRight.height) {
        right.right = rLeft;
        node.right = rRight;
        rRight.parent = node;
        node.aabb.copy(left.aabb).combine(rRight.aabb);
        right.aabb.copy(node.aabb).combine(rLeft.aabb);
        node.height = 1 + Math.max(left.height, rRight.height);
        right.height = 1 + Math.max(node.height, rLeft.height);
      } else {
        right.right = rRight;
        node.right = rLeft;
        rLeft.parent = node;
        node.aabb.copy(left.aabb).combine(rLeft.aabb);
        right.aabb.copy(node.aabb).combine(rRight.aabb);
        node.height = 1 + Math.max(left.height, rLeft.height);
        right.height = 1 + Math.max(node.height, rRight.height);
      }
      return right;
    }

    // Rotiere left up
    if (balance < -1) {
      const lLeft = left.left;
      const lRight = left.right;

      left.left = node;
      left.parent = node.parent;
      node.parent = left;

      if (left.parent) {
        if (left.parent.left === node) left.parent.left = left;
        else left.parent.right = left;
      } else {
        this.root = left;
      }

      if (lLeft.height > lRight.height) {
        left.right = lLeft;
        node.left = lRight;
        lRight.parent = node;
        node.aabb.copy(right.aabb).combine(lRight.aabb);
        left.aabb.copy(node.aabb).combine(lLeft.aabb);
        node.height = 1 + Math.max(right.height, lRight.height);
        left.height = 1 + Math.max(node.height, lLeft.height);
      } else {
        left.right = lRight;
        node.left = lLeft;
        lLeft.parent = node;
        node.aabb.copy(right.aabb).combine(lLeft.aabb);
        left.aabb.copy(node.aabb).combine(lRight.aabb);
        node.height = 1 + Math.max(right.height, lLeft.height);
        left.height = 1 + Math.max(node.height, lRight.height);
      }
      return left;
    }

    return node;
  }

  /**
   * Findet alle potentiell kollidierenden Paare im Baum
   */
  queryPairs(callback) {
    if (!this.root || this.root.isLeaf()) return;

    const stack = [this.root];
    while (stack.length > 0) {
      const node = stack.pop();
      if (node.isLeaf()) continue;

      this._queryCrossNodes(node.left, node.right, callback);
      stack.push(node.left);
      stack.push(node.right);
    }
  }

  _queryCrossNodes(nodeA, nodeB, callback) {
    if (!nodeA.aabb.intersects(nodeB.aabb)) return;

    if (nodeA.isLeaf() && nodeB.isLeaf()) {
      callback(nodeA.userData, nodeB.userData);
      return;
    }

    if (nodeA.isLeaf()) {
      this._queryCrossNodes(nodeA, nodeB.left, callback);
      this._queryCrossNodes(nodeA, nodeB.right, callback);
    } else if (nodeB.isLeaf()) {
      this._queryCrossNodes(nodeA.left, nodeB, callback);
      this._queryCrossNodes(nodeA.right, nodeB, callback);
    } else {
      if (nodeA.aabb.getArea() > nodeB.aabb.getArea()) {
        this._queryCrossNodes(nodeA.left, nodeB, callback);
        this._queryCrossNodes(nodeA.right, nodeB, callback);
      } else {
        this._queryCrossNodes(nodeA, nodeB.left, callback);
        this._queryCrossNodes(nodeA, nodeB.right, callback);
      }
    }
  }

  /**
   * Sucht alle Objekte, die eine AABB überlappen
   */
  queryAABB(aabb, callback) {
    if (!this.root) return;
    const stack = [this.root];
    while (stack.length > 0) {
      const node = stack.pop();
      if (node.aabb.intersects(aabb)) {
        if (node.isLeaf()) {
          const proceed = callback(node.userData);
          if (proceed === false) return;
        } else {
          stack.push(node.left);
          stack.push(node.right);
        }
      }
    }
  }

  /**
   * Raycast-Abfrage gegen den Baum
   */
  raycast(origin, dir, maxDist, callback) {
    if (!this.root) return;
    const stack = [this.root];
    while (stack.length > 0) {
      const node = stack.pop();
      const hit = node.aabb.raycast(origin, dir, maxDist);
      if (hit.hit) {
        if (node.isLeaf()) {
          const proceed = callback(node.userData);
          if (proceed === false) return;
        } else {
          stack.push(node.left);
          stack.push(node.right);
        }
      }
    }
  }
}
