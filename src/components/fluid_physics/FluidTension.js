class FluidTension {
  static calculateForce(particleA, particleB) {
      const distanceX = particleB.position.x - particleA.position.x;
      const distanceY = particleB.position.y - particleA.position.y;
      const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);
      
      if (distance === 0) return { x: 0, y: 0 }; // Avoid division by zero
      
      let force = { x: 0, y: 0 };
      
      // Attraction
      if (distance < 50) {
          const strength = (distance - 50) * 0.002;
          force.x += strength * (distanceX / distance);
          force.y += strength * (distanceY / distance);
      }
      
      // Repulsion
      if (distance < 20) {
          const strength = (20 - distance) * 0.05;
          force.x -= strength * (distanceX / distance);
          force.y -= strength * (distanceY / distance);
      }
      
      return force;
  }
}