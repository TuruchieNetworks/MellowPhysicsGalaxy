// components/Clouds.js

import React from 'react';
import * as THREE from 'three';
import { useEffect, useRef } from 'react';
import useGenerateCloudTexture from './hooks/useGenerateCloudTexture';

const FourierClouds = () => {
    const cloudsRef = useRef();
    const cloudTexture = useGenerateCloudTexture();

    useEffect(() => {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        cloudsRef.current.appendChild(renderer.domElement);

        if (cloudTexture) {
            const geometry = new THREE.PlaneGeometry(10, 10);
            const material = new THREE.MeshStandardMaterial({
                map: new THREE.Texture(cloudTexture),
                transparent: true,
                opacity: 0.7,
            });

            const cloudMesh = new THREE.Mesh(geometry, material);
            cloudMesh.rotation.x = -Math.PI / 2; // Rotate to face upwards
            scene.add(cloudMesh);

            camera.position.z = 5;

            const animate = () => {
                requestAnimationFrame(animate);
                cloudMesh.material.map.offset.x += 0.01; // Move texture for animation
                cloudMesh.material.map.needsUpdate = true;
                renderer.render(scene, camera);
            };

            animate();
        }

        // Clean up on component unmount
        return () => {
            cloudsRef.current.removeChild(renderer.domElement);
        };
    }, [cloudTexture]);

    return <div ref={cloudsRef} />;
};

export default FourierClouds;