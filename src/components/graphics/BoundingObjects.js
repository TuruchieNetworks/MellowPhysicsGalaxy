import * as THREE from 'three';

export class BoundingObjects {
  constructor(scene, objQty = 50, radius = 0.15, cubeSize = 50, gravity = new THREE.Vector3(0, -9.8, 0), dampingFactor = 0.99) {
    this.spheres = [];
    this.objQty = objQty;
    this.radius = radius;
    this.cubeSize = cubeSize;
    this.gravity = gravity;
    this.dampingFactor = dampingFactor;
    this.scene = scene;

    this.createSpheres();
  }

  createSpheres() {
    // Clear existing spheres if any
    this.spheres.forEach(sphereObj => this.scene.remove(sphereObj.mesh));
    this.spheres = [];

    for (let i = 0; i < this.objQty; i++) {
      this.addSphere();
    }
  }

  addSphere() {
    const geometry = new THREE.SphereGeometry(this.radius, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff });
    const sphere = new THREE.Mesh(geometry, material);

    const mass = Math.random() * 2 + 1; // Mass between 1 and 3
    const velocity = new THREE.Vector3(Math.random(), Math.random(), Math.random()).multiplyScalar(0.01);

    sphere.position.set(
      (Math.random() - 0.5) * this.cubeSize,
      (Math.random() - 0.5) * this.cubeSize,
      (Math.random() - 0.5) * this.cubeSize
    );

    sphere.receiveShadow = true; 
    this.spheres.push({ mesh: sphere, velocity: velocity, mass: mass });
    this.scene.add(sphere);
  }

  updateProperties(objQty, radius) {
    this.objQty = objQty;
    this.radius = radius;
    this.createSpheres(); // Re-create spheres with updated properties
  }

  updateSpheres() {
    this.spheres.forEach((meshedObj) => {
      meshedObj.velocity.add(this.gravity); // Apply gravity
      meshedObj.velocity.multiplyScalar(this.dampingFactor); // Apply damping

      meshedObj.mesh.position.add(meshedObj.velocity); // Update position

      // Check bounds and reflect
      ['x', 'y', 'z'].forEach((axis) => {
        const halfCube = this.cubeSize / 2;
        if (meshedObj.mesh.position[axis] > halfCube || meshedObj.mesh.position[axis] < -halfCube) {
          meshedObj.velocity[axis] = -meshedObj.velocity[axis];
          meshedObj.mesh.position[axis] = THREE.MathUtils.clamp(meshedObj.mesh.position[axis], -halfCube, halfCube);
        }
      });
    });
  }
}
