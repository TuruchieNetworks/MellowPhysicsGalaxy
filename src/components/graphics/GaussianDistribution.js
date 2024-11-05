import * as THREE from 'three';

class GaussianDistribution {
  constructor() {
    this.meanVelocity = 0;
    this.stdDevVelocity = 1.943;

    this.meanMass = 2;
    this.stdDevMass = 0.5;
  }

  randomGaussian() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  getVelocity() {
    return new THREE.Vector3(
      this.meanVelocity + this.stdDevVelocity * this.randomGaussian(),
      this.meanVelocity + this.stdDevVelocity * this.randomGaussian(),
      this.meanVelocity + this.stdDevVelocity * this.randomGaussian()
    );
  }

  getMass() {
    return Math.max(this.meanMass + this.stdDevMass * this.randomGaussian(), 0.1);
  }

  generateGaussianValues(count) {
    const gaussianValues = [];

    for (let i = 0; i < count; i++) {
      const mass = this.getMass();
      const velocity = this.getVelocity();
      gaussianValues.push({
        mass,
        velocity,
      });
    }

    return gaussianValues;
  }
}

export default GaussianDistribution;
