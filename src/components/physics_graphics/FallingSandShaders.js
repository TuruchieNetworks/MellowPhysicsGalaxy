import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const FallingSandShader = ({ width = 800, height = 600 }) => {
    const canvasRef = useRef();

    useEffect(() => {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.z = 30;

        const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
        renderer.setSize(width, height);

        // Initialize particle data
        const particleCount = 1000;
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        
        // Randomize positions and velocities
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 20; // x
            positions[i * 3 + 1] = Math.random() * 20;      // y (start high)
            positions[i * 3 + 2] = (Math.random() - 0.5) * 20; // z
            
            velocities[i * 3] = 0;
            velocities[i * 3 + 1] = -Math.random() * 0.1; // downward velocity
            velocities[i * 3 + 2] = 0;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

        const material = new THREE.ShaderMaterial({
            vertexShader: `
                attribute vec3 velocity;
                uniform float uTime;
                void main() {
                    vec3 pos = position;
                    pos.y += velocity.y * uTime;
                    gl_PointSize = 2.0;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                void main() {
                    float dist = length(gl_PointCoord - vec2(0.5));
                    if (dist > 0.5) discard; // creates a circle
                    gl_FragColor = vec4(1.0, 0.8, 0.6, 1.0); // sand color
                }
            `,
            uniforms: {
                uTime: { value: 0 }
            },
            transparent: true
        });

        const particles = new THREE.Points(geometry, material);
        scene.add(particles);

        let startTime = Date.now();
        const animate = () => {
            requestAnimationFrame(animate);

            const elapsed = (Date.now() - startTime) / 1000; // seconds
            material.uniforms.uTime.value = elapsed;

            // Update particle positions (reset if they go below a threshold)
            const posArray = geometry.attributes.position.array;
            const velArray = geometry.attributes.velocity.array;
            for (let i = 0; i < particleCount; i++) {
                posArray[i * 3 + 1] += velArray[i * 3 + 1]; // Update y-position

                // Reset particle if it falls below a certain point
                if (posArray[i * 3 + 1] < -10) {
                    posArray[i * 3 + 1] = Math.random() * 20 + 10;
                }
            }
            geometry.attributes.position.needsUpdate = true; // Update GPU

            renderer.render(scene, camera);
        };
        animate();

        return () => {
            renderer.dispose();
        };
    }, [width, height]);

    return <canvas ref={canvasRef} />;
};

export default FallingSandShader;