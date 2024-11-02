import * as THREE from 'three';

export class Gravity {
  constructor(initialGravity) {
    this.gravity = initialGravity; // This should be a THREE.Vector3 instance
  }

  setGravity(newGravity) {
    this.gravity.copy(newGravity); // Make sure newGravity is also a THREE.Vector3
  }

  getGravity() {
    return this.gravity; // Returns the gravity vector
  }
}