import * as THREE from 'three';

export class MomentumPhysics {
  constructor(objects, cubeSize, radius = 1, qtn = new THREE.Quaternion(), gravity = new THREE.Vector3(0, -0.1, 0), dampingFactor = 0.99) {
    this.objects = objects; // Expecting objects with `mesh`, `velocity`, and `mass`
    this.cubeSize = cubeSize;
    this.radius = radius;
    this.qtn = qtn;
    this.planeHeight = -cubeSize / 2;

    // Initialize Manual Physics
    this.gravityEnabled = true;
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
      if (!obj.mesh || !obj.velocity) return;

      // Apply gravity
      obj.velocity.add(this.gravity.clone().multiplyScalar(deltaTime));

      // Apply damping
      obj.velocity.multiplyScalar(this.dampingFactor);

      // Update position based on velocity
      obj.mesh.position.add(obj.velocity.clone().multiplyScalar(deltaTime));

      // Check for wall and plane collisions
      this.checkWallCollision(obj);
      this.checkPlaneCollision(obj);
    });
  }

  handleCollision(objA, objB) {
    const posA = objA.mesh.position;
    const posB = objB.mesh.position;
    const distVec = new THREE.Vector3().subVectors(posA, posB);
    const distance = distVec.length();

    const radiusA = objA.mesh.geometry.boundingSphere ? objA.mesh.geometry.boundingSphere.radius : this.radius;
    const radiusB = objB.mesh.geometry.boundingSphere ? objB.mesh.geometry.boundingSphere.radius : this.radius;
    const minDistance = radiusA + radiusB;

    if (distance < minDistance) {
      // Normalize distance vector and compute relative velocity
      distVec.normalize();
      const relVel = new THREE.Vector3().subVectors(objA.velocity, objB.velocity);
      const velAlongDist = relVel.dot(distVec);

      if (velAlongDist > 0) return; // Objects are moving apart

      // Conservation of momentum: calculate and apply impulse for elastic collision
      const impulse = (2 * velAlongDist) / (objA.mass + objB.mass);
      objA.velocity.sub(distVec.clone().multiplyScalar(impulse * objB.mass));
      objB.velocity.add(distVec.clone().multiplyScalar(impulse * objA.mass));
    }
  }

  checkWallCollision(obj) {
    const pos = obj.mesh.position;
    const halfCube = this.cubeSize / 2;
    const radius = obj.mesh.geometry.boundingSphere ? obj.mesh.geometry.boundingSphere.radius : this.radius;

    // Check collisions with walls in the x, y, and z axes
    ['x', 'y', 'z'].forEach(axis => {
      if (pos[axis] - radius < -halfCube) {
        pos[axis] = -halfCube + radius;
        obj.velocity[axis] *= -1;
      } else if (pos[axis] + radius > halfCube) {
        pos[axis] = halfCube - radius;
        obj.velocity[axis] *= -1;
      }
    });
  }

  checkPlaneCollision(obj) {
    const pos = obj.mesh.position;
    const radius = obj.mesh.geometry.boundingSphere ? obj.mesh.geometry.boundingSphere.radius : this.radius;

    // Check for collision with the plane at `this.planeHeight`
    if (pos.y - radius < this.planeHeight) {
      pos.y = this.planeHeight + radius; // Position object on the plane
      obj.velocity.y *= -1; // Reflect velocity in the y-axis
    }
  }

  // Toggle gravity on or off
  toggleGravity() {
      this.gravityEnabled = !this.gravityEnabled;
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

export default MomentumPhysics;