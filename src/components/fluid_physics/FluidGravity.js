class FluidGravity {
  static applyGravity(particle) {
      const g = 9.8; // Acceleration due to gravity
      particle.applyForce({ x: 0, y: g * particle.mass });
  }
}