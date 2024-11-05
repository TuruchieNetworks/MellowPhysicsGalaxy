import { useEffect } from 'react';

const useAnimateParticles = (world, sandParticlesRef, particleBodiesRef, timeStep = 1 / 60) => {
    useEffect(() => {
        let animationId;

        const animateParticles = () => {
            animationId = requestAnimationFrame(animateParticles);

            // Step the physics world forward
            world.step(timeStep);

            // Sync Three.js meshes with Cannon.js bodies
            sandParticlesRef.current.forEach((mesh, i) => {
                const body = particleBodiesRef.current[i];
                if (body) {
                    mesh.position.copy(body.position);
                    mesh.quaternion.copy(body.quaternion);
                }
            });
        };

        // Start animation
        animateParticles();

        // Cleanup function to cancel animation on unmount
        return () => cancelAnimationFrame(animationId);
    }, [world, sandParticlesRef, particleBodiesRef, timeStep]);
};

export default useAnimateParticles;