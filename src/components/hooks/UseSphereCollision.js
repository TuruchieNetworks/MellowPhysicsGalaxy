import { useEffect } from 'react';
import * as THREE from 'three';

// Custom hook to handle sphere collisions
const useSphereCollision = (spheres, radius) => {
  const handleCollision = (sphereA, sphereB) => {
    const posA = sphereA.mesh.position;
    const posB = sphereB.mesh.position;

    const distVec = new THREE.Vector3().subVectors(posA, posB);
    const distance = distVec.length();
    const minDistance = radius * 2;

    if (distance < minDistance) {
      // Normalize the distance vector
      distVec.normalize();

      // Relative velocity
      const relVel = new THREE.Vector3().subVectors(sphereA.velocity, sphereB.velocity);

      // Velocity along the line of collision
      const velAlongDist = relVel.dot(distVec);

      if (velAlongDist > 0) return; // They are moving apart, no need for collision response

      // Calculate impulse scalar
      const impulse = (2 * velAlongDist) / (sphereA.mass + sphereB.mass);

      // Update velocities based on mass and impulse
      sphereA.velocity.sub(distVec.clone().multiplyScalar(impulse * sphereB.mass));
      sphereB.velocity.add(distVec.clone().multiplyScalar(impulse * sphereA.mass));
    }
  };

  const updateCollisions = () => {
    for (let i = 0; i < spheres.length; i++) {
      for (let j = i + 1; j < spheres.length; j++) {
        handleCollision(spheres[i], spheres[j]);
      }
    }
  };

  return updateCollisions;
};

// Custom hook to handle wall collisions and physics updates
const useWallCollision = (spheres, radius, cubeSize, gravity, dampingFactor) => {
  const checkWallCollision = (sphere) => {
    const pos = sphere.mesh.position;
    const v = sphere.velocity;

    // Check for collisions with the walls
    if (pos.x - radius < -cubeSize / 2 || pos.x + radius > cubeSize / 2) {
      v.x *= -1; // Reverse velocity in X
    }
    if (pos.y - radius < -cubeSize / 2 || pos.y + radius > cubeSize / 2) {
      v.y *= -1; // Reverse velocity in Y
    }
    if (pos.z - radius < -cubeSize / 2 || pos.z + radius > cubeSize / 2) {
      v.z *= -1; // Reverse velocity in Z
    }
  };

  const applyGravityAndUpdatePositions = (deltaTime) => {
    for (const sphere of spheres) {
      // Apply gravity
      sphere.velocity.add(gravity);

      // Dampen the velocity
      sphere.velocity.multiplyScalar(dampingFactor);

      // Update position based on velocity
      sphere.mesh.position.add(sphere.velocity.clone().multiplyScalar(deltaTime));

      // Check for wall collisions
      checkWallCollision(sphere);
    }
  };

  return { applyGravityAndUpdatePositions };
};

// Main physics hook
export const usePhysics = (spheres, deltaTime, substeps, radius, cubeSize, gravity, dampingFactor) => {
  const updateCollisions = useSphereCollision(spheres, radius);
  const { applyGravityAndUpdatePositions } = useWallCollision(spheres, radius, cubeSize, gravity, dampingFactor);

  useEffect(() => {
    const animate = () => {
      const timeStep = deltaTime / substeps;

      for (let step = 0; step < substeps; step++) {
        // Check for collisions
        updateCollisions();

        // Apply gravity and update positions
        applyGravityAndUpdatePositions(timeStep);
      }

      requestAnimationFrame(animate);
    };

    animate();
  }, [spheres, deltaTime, substeps, updateCollisions, applyGravityAndUpdatePositions]);
};