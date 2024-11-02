import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

const FallingWindyHills = ({ width = 800, height = 600 }) => {
    const canvasRef = useRef();
    const [windDirection, setWindDirection] = useState(new THREE.Vector3(0.5, 0, 0.2)); // initial wind direction
    const [windIntensity, setWindIntensity] = useState(0.1);

    useEffect(() => {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.z = 30;

        const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
        renderer.setSize(width, height);

        const particleCount = 1000;
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 1] = Math.random() * 20;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
            velocities[i * 3] = 0;
            velocities[i * 3 + 1] = -Math.random() * 0.1;
            velocities[i * 3 + 2] = 0;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

        const material = new THREE.ShaderMaterial({
            vertexShader: `...`, // Use the vertex shader from above
            fragmentShader: `
                void main() {
                    float dist = length(gl_PointCoord - vec2(0.5));
                    if (dist > 0.5) discard;
                    gl_FragColor = vec4(1.0, 0.8, 0.6, 1.0);
                }
            `,
            uniforms: {
                uTime: { value: 0 },
                windDirection: { value: windDirection },
                windIntensity: { value: windIntensity },
                cubeSize: { value: new THREE.Vector3(20, 20, 20) }
            },
            transparent: true
        });

        const particles = new THREE.Points(geometry, material);
        scene.add(particles);

        let startTime = Date.now();
        const animate = () => {
            requestAnimationFrame(animate);
            const elapsed = (Date.now() - startTime) / 1000;
            material.uniforms.uTime.value = elapsed;
            renderer.render(scene, camera);
        };
        animate();

        return () => {
            renderer.dispose();
        };
    }, [width, height, windDirection, windIntensity]);

    return (
        <div>
            <canvas ref={canvasRef} />
            <div>
                <label>
                    Wind Intensity:
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={windIntensity}
                        onChange={(e) => setWindIntensity(parseFloat(e.target.value))}
                    />
                </label>
                <label>
                    Wind Direction X:
                    <input
                        type="range"
                        min="-1"
                        max="1"
                        step="0.1"
                        value={windDirection.x}
                        onChange={(e) => setWindDirection(new THREE.Vector3(parseFloat(e.target.value), windDirection.y, windDirection.z))}
                    />
                </label>
                <label>
                    Wind Direction Z:
                    <input
                        type="range"
                        min="-1"
                        max="1"
                        step="0.1"
                        value={windDirection.z}
                        onChange={(e) => setWindDirection(new THREE.Vector3(windDirection.x, windDirection.y, parseFloat(e.target.value)))}
                    />
                </label>
            </div>
        </div>
    );
};

export default FallingWindyHills;
