class Particle {
  constructor(position, velocity, mass = 1, charge = 0) {
      this.position = position;
      this.velocity = velocity;
      this.mass = mass;
      this.charge = charge; // Charge can range from -3 to +3 (or any other range you prefer)
      this.acceleration = { x: 0, y: 0 };
  }

  update() {
      // Update velocity based on acceleration
      this.velocity.x += this.acceleration.x;
      this.velocity.y += this.acceleration.y;

      // Update position based on velocity
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;

      // Reset acceleration
      this.acceleration = { x: 0, y: 0 };
  }

  applyForce(force) {
      // F = ma => a = F/m
      this.acceleration.x += force.x / this.mass;
      this.acceleration.y += force.y / this.mass;
  }
}