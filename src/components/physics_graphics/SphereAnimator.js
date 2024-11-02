import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

const SphereAnimator = ({ spheresData, gravity }) => {
    const sceneRef = useRef(null); // Reference to the Three.js scene
    const [mixers, setMixers] = useState({}); // For animation mixers
    const clock = new THREE.Clock(); // Clock to track delta time

    // Define your box boundaries (min and max coordinates)
    const boxBoundary = {
        min: new THREE.Vector3(-10, 0, -10),
        max: new THREE.Vector3(10, 10, 10),
    };

    // Define your sphere boundary (center and radius)
    const sphereBoundary = {
        center: new THREE.Vector3(0, 5, 0),
        radius: 10,
    };

    const animateMeshedObjects = (obj, t) => {
        // Update sphere position based on velocity and gravity
        obj.velocity.add(gravity.clone().multiplyScalar(t)); // Apply gravity
        obj.mesh.position.add(obj.velocity.clone().multiplyScalar(t)); // Update position

        // Check for boundary conditions
        if (!isWithinBoxBoundary(obj.mesh.position, boxBoundary)) {
            obj.velocity.x *= -1; // Reverse x velocity
            obj.velocity.y *= -1; // Reverse y velocity (optional)
            obj.velocity.z *= -1; // Reverse z velocity
            keepWithinBoxBoundary(obj.mesh.position, boxBoundary);
        }

        if (!isWithinSphereBoundary(obj.mesh.position, sphereBoundary)) {
            const direction = obj.mesh.position.clone().sub(sphereBoundary.center).normalize();
            obj.velocity.reflect(direction); // Reflect the velocity off the sphere
            keepWithinSphereBoundary(obj.mesh.position, sphereBoundary);
        }

        // Rotate the object along its own axis
        obj.mesh.rotation.x += 0.01;
        obj.mesh.rotation.y += 0.01;
        obj.mesh.rotation.z += 0.01;

        // Optional: Implement collision detection with ground
        if (obj.mesh.position.y <= 0) {
            obj.velocity.y *= -0.7; // Reverse velocity for bounce effect
            obj.mesh.position.y = 0; // Keep mesh on ground
        }
    };

    const isWithinBoxBoundary = (position, boundary) => {
        return (
            position.x >= boundary.min.x &&
            position.x <= boundary.max.x &&
            position.y >= boundary.min.y &&
            position.y <= boundary.max.y &&
            position.z >= boundary.min.z &&
            position.z <= boundary.max.z
        );
    };

    const keepWithinBoxBoundary = (position, boundary) => {
        position.x = Math.max(boundary.min.x, Math.min(boundary.max.x, position.x));
        position.y = Math.max(boundary.min.y, Math.min(boundary.max.y, position.y));
        position.z = Math.max(boundary.min.z, Math.min(boundary.max.z, position.z));
    };

    const isWithinSphereBoundary = (position, boundary) => {
        return position.distanceTo(boundary.center) <= boundary.radius;
    };

    const keepWithinSphereBoundary = (position, boundary) => {
        const direction = position.clone().sub(boundary.center).normalize();
        position.copy(boundary.center).add(direction.multiplyScalar(boundary.radius));
    };

    const animate = () => {
        requestAnimationFrame(animate);
        const deltaTime = clock.getDelta(); // Time since the last frame

        // Update each sphere
        spheresData.forEach((sphere) => {
            animateMeshedObjects(sphere, deltaTime);
        });

        // Update all mixers
        Object.values(mixers).forEach(mixer => {
            if (mixer) {
                mixer.update(deltaTime);
            }
        });

        // Render the scene
        sceneRef.current.renderer.render(sceneRef.current.scene, sceneRef.current.camera);
    };

    useEffect(() => {
        animate(); // Start the animation loop
    }, [spheresData]);

    return (
        <div ref={sceneRef} style={{ width: '100%', height: '100%' }}>
            {/* The Three.js scene will be rendered here */}
        </div>
    );
};

export default SphereAnimator;