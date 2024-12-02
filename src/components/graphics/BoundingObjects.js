import * as THREE from 'three';
import Shaders from '../graphics/Shaders';

export class BoundingObjects {
  constructor(scene, objQty = 50, radius = 0.65, cubeSize = 50, gravity = new THREE.Vector3(0, -9.8, 0), dampingFactor = 0.99) {
    this.spheres = [];
    this.objQty = objQty;
    this.radius = radius;
    this.cubeSize = cubeSize;
    this.gravity = gravity;
    this.dampingFactor = dampingFactor;
    this.scene = scene;
    this.shader = new Shaders(); // Assuming Shader class includes your noise shader

    this.createSpheres(this.objQty, null, this.radius);
  }

  createRandomHexColor = () => {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
  };

  createBoundaryBox() {
    const boundaryGeom = new THREE.BoxGeometry(this.cubeSize, this.cubeSize, this.cubeSize);
    const boundaryMat = new THREE.MeshPhongMaterial({
      color: this.createRandomHexColor(),
      wireframe: true,
    });
    const boundary = new THREE.Mesh(boundaryGeom, boundaryMat);
    this.scene.add(boundary);
  }

  createSpheres(qty = this.objQty, mat = null, radius = this.radius) {
    // Clear existing spheres if any
    this.spheres.forEach(sphereObj => this.scene.remove(sphereObj.mesh));
    this.spheres = [];

    for (let i = 0; i < qty; i++) {
      let material
      if (i % 3 === 1) {
        material = this.shader.shaderMaterials().sawMaterial;
      } else
      if (i % 3 === 2) {
        // material = this.shader.shaderMaterials().powderMaterial;
        // material = this.shader.shaderMaterials().wrinkledMaterial;
        material = mat
      } else {
        material = mat
      }

      // for (let i = 0; i < qty; i++) {
      //   let material
      //   if (i % 3 === 0) {
      //     material = this.shader.shaderMaterials().axialSawMaterial
      //   } else
      //   if (i % 3 === 1) {
      //     material = this.shader.shaderMaterials().wrinkledMaterial
      //   } else
      //   if (i % 3 === 2){
      //     material = mat
      //   }
      
      this.addSphere(material, radius);
    }
  }

  addSphere(mat = null, radius = this.radius) {
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    let material;
    mat === null ? 
    material = this.shader.shaderMaterials().axialSawMaterial:
    material = mat;
    ///const material = this.shader.shaderMaterials().explosiveMaterial; // Use the noise shader material

    const sphere = new THREE.Mesh(geometry, material);

    const mass = Math.random(3) * 2 + 1; // Mass between 1 and 3
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

  updateProperties(objQty, radius, mat = null) {
    this.objQty = objQty;
    this.radius = radius;
    this.createSpheres(this.objQty, mat); // Re-create spheres with updated properties
  }

  updateSpheres() {
    this.spheres.forEach((obj) => {
      obj.mesh.rotation.x += 0.1;
      obj.mesh.rotation.y += 0.1;
      obj.mesh.rotation.z += 0.1;

      obj.velocity.add(this.gravity); // Apply gravity
      obj.velocity.multiplyScalar(this.dampingFactor); // Apply damping

      obj.mesh.position.add(obj.velocity); // Update position

      // Check bounds and reflect
      ['x', 'y', 'z'].forEach((axis) => {
        const halfCube = this.cubeSize / 2;
        if (obj.mesh.position[axis] > halfCube || obj.mesh.position[axis] < -halfCube) {
          obj.velocity[axis] = -obj.velocity[axis];
          obj.mesh.position[axis] = THREE.MathUtils.clamp(obj.mesh.position[axis], -halfCube, halfCube);
        }
      });
    });
  }
}

export default BoundingObjects;
