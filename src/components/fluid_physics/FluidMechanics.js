import React, { useRef, useEffect, useState } from 'react'; 

const FluidSimulation = () => {
    const [particles, setParticles] = useState([]);
    const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
    const animationRef = useRef(null);

    // Initialize particles with random positions and velocities
    useEffect(() => {
        const newParticles = Array.from({ length: 100 }, () => new Particle(
            { x: Math.random() * dimensions.width, y: Math.random() * dimensions.height },
            { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2 },
            Math.random() * 5 // Random mass
        ));
        setParticles(newParticles);
    }, [dimensions]);

    const updateParticles = () => {
        setParticles(prevParticles => {
            return prevParticles.map((particle, i, arr) => {
                // Apply gravity
                Gravity.applyGravity(particle);

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
        <svg width={dimensions.width} height={dimensions.height} style={{ border: '1px solid black' }}>
            {particles.map((particle, index) => (
                <circle
                    key={index}
                    cx={particle.position.x}
                    cy={particle.position.y}
                    r={4}
                    fill="#1E90FF"
                />
            ))}
        </svg>
    );
};

export default FluidSimulation;
