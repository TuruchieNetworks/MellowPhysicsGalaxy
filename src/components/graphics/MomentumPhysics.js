import * as THREE from 'three';

export class MomentumPhysics {
  constructor(objects, cubeSize, radius = 1, qtn = new THREE.Quaternion(), gravity = new THREE.Vector3(0, -0.1, 0), dampingFactor = 0.99) {
    this.objects = objects; // Expecting objects with `mesh`, `velocity`, and `mass`
    this.cubeSize = cubeSize;
    this.radius = radius;  // Add radius to class properties
    this.qtn = qtn;        // Add quaternion (if used later)
    this.gravity = gravity; // Use gravity as-is
    this.dampingFactor = dampingFactor;

    // Ensure each object's geometry has a bounding sphere
    this.objects.forEach(obj => {
      if (obj.mesh && obj.mesh.geometry) {
        obj.mesh.geometry.computeBoundingSphere();
      }
    });
  }

  applyGravityAndDamping(deltaTime) {
    this.objects.forEach(obj => {
      if (!obj.mesh || !obj.velocity) return; // Guard clause for invalid objects

      // Apply gravity
      obj.velocity.add(this.gravity.clone().multiplyScalar(deltaTime));

      // Apply damping
      obj.velocity.multiplyScalar(this.dampingFactor);

      // Update position based on velocity
      obj.mesh.position.add(obj.velocity.clone().multiplyScalar(deltaTime));

      // Check for wall collisions
      this.checkWallCollision(obj);
    });
  }
  

  handleCollision(objA, objB) {
    const posA = objA.mesh.position;
    const posB = objB.mesh.position;
    const distVec = new THREE.Vector3().subVectors(posA, posB);
    const distance = distVec.length();

    // Ensure bounding spheres are calculated
    const radiusA = objA.mesh.geometry.boundingSphere ? objA.mesh.geometry.boundingSphere.radius : this.radius; // Default to this.radius
    const radiusB = objB.mesh.geometry.boundingSphere ? objB.mesh.geometry.boundingSphere.radius : this.radius; // Default to this.radius
    const minDistance = radiusA + radiusB;

    if (distance < minDistance) {
      // Calculate and apply impulse for collision
      const overlap = minDistance - distance;
      distVec.normalize();
      const relVel = new THREE.Vector3().subVectors(objA.velocity, objB.velocity);
      const velAlongDist = relVel.dot(distVec);

      if (velAlongDist > 0) return; // Objects are moving apart

      const impulse = (2 * velAlongDist) / (objA.mass + objB.mass);
      objA.velocity.sub(distVec.clone().multiplyScalar(impulse * objB.mass));
      objB.velocity.add(distVec.clone().multiplyScalar(impulse * objA.mass));
    }
  }

  checkWallCollision(obj) {
    const pos = obj.mesh.position;
    const halfCube = this.cubeSize / 2;
    const radius = obj.mesh.geometry.boundingSphere ? obj.mesh.geometry.boundingSphere.radius : this.radius; // Default to this.radius

    // Check collisions with walls in the x, y, and z axes
    ['x', 'y', 'z'].forEach(axis => {
      // Check if the object is beyond the left or right wall (or bottom and top for y)
      if (pos[axis] - radius < -halfCube) {
        pos[axis] = -halfCube + radius; // Position object at the edge
        obj.velocity[axis] *= -1; // Reflect velocity
      } else if (pos[axis] + radius > halfCube) {
        pos[axis] = halfCube - radius; // Position object at the edge
        obj.velocity[axis] *= -1; // Reflect velocity
      }
    });
  }

  updatePhysics(deltaTime, substeps) {
    const timeStep = deltaTime / substeps;

    for (let step = 0; step < substeps; step++) {
      // Handle collisions between objects
      for (let i = 0; i < this.objects.length; i++) {
        for (let j = i + 1; j < this.objects.length; j++) {
          this.handleCollision(this.objects[i], this.objects[j]);
        }
      }

      // Apply gravity and update positions
      this.applyGravityAndDamping(timeStep);
    }
  }
}
