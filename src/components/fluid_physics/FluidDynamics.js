import React, { useRef, useEffect, useState } from 'react'; 

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

class FluidTension {
    static calculateForce(particleA, particleB) {
        const distanceX = particleB.position.x - particleA.position.x;
        const distanceY = particleB.position.y - particleA.position.y;
        const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

        if (distance === 0) return { x: 0, y: 0 }; // Avoid division by zero

        let force = { x: 0, y: 0 };

        // Calculate attraction/repulsion based on charge
        const chargeForceStrength = (particleA.charge * particleB.charge) / (distance ** 2); // Coulomb's Law

        // Attraction or Repulsion logic
        if (particleA.charge !== particleB.charge) { // Opposite charges attract
            force.x += chargeForceStrength * (distanceX / distance);
            force.y += chargeForceStrength * (distanceY / distance);
        } else { // Same charges repel
            force.x -= chargeForceStrength * (distanceX / distance);
            force.y -= chargeForceStrength * (distanceY / distance);
        }

        // Basic attraction/repulsion logic based on distance
        if (distance < 50) {
            const strength = (distance - 50) * 0.002;
            force.x += strength * (distanceX / distance);
            force.y += strength * (distanceY / distance);
        }

        if (distance < 20) {
            const strength = (20 - distance) * 0.05;
            force.x -= strength * (distanceX / distance);
            force.y -= strength * (distanceY / distance);
        }

        return force;
    }
}

const FluidDynamics = () => {
    const [particles, setParticles] = useState([]);
    const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
    const animationRef = useRef(null);

    // Initialize particles with random positions, velocities, masses, and charges
    useEffect(() => {
        const newParticles = Array.from({ length: 100 }, () => new Particle(
            { x: Math.random() * dimensions.width, y: Math.random() * dimensions.height },
            { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2 },
            Math.random() * 5, // Random mass
            Math.floor(Math.random() * 7) - 3 // Random charge between -3 and +3
        ));
        setParticles(newParticles);
    }, [dimensions]);

    const updateParticles = () => {
        setParticles(prevParticles => {
            return prevParticles.map((particle, i, arr) => {
                // Apply gravity (if you have a gravity class)
                // Gravity.applyGravity(particle);

                // Calculate forces from nearby particles
                arr.forEach((other, j) => {
                    if (i !== j) {
                        const force = FluidTension.calculateForce(particle, other);
                        particle.applyForce(force);
                    }
                });

                // Update particle state
                particle.update();

                // Keep particles within boundaries
                if (particle.position.x < 0 || particle.position.x > dimensions.width) {
                    particle.velocity.x *= -1;
                }
                if (particle.position.y < 0 || particle.position.y > dimensions.height) {
                    particle.velocity.y *= -1;
                }

                return particle;
            });
        });
    };

    // Animation loop
    useEffect(() => {
        const animate = () => {
            updateParticles();
            animationRef.current = requestAnimationFrame(animate);
        };
        animate();

        return () => cancelAnimationFrame(animationRef.current);
    }, [dimensions]);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
            {particles.map((particle, index) => (
                <div key={index} style={{
                    position: 'absolute',
                    left: particle.position.x,
                    top: particle.position.y,
                    width: '10px',
                    height: '10px',
                    backgroundColor: particle.charge > 0 ? 'blue' : particle.charge < 0 ? 'red' : 'gray',
                    borderRadius: '50%'
                }} />
            ))}
        </div>
    );
};

export default FluidDynamics;