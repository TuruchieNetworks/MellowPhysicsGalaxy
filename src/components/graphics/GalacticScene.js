import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { SceneManager } from './components/SceneManager';
import { Lighting } from './components/Lighting';
import { Geometry } from './components/Geometry';
import { Animation } from './components/Animation';
import { Controls } from './components/Controls';
import { OrbitingObjects } from './components/OrbitingObjects';

const GalacticScene = () => {
    const containerRef = useRef();

    useEffect(() => {
        // Initialize SceneManager and other components
        const sceneManager = new SceneManager();
        const lighting = new Lighting(sceneManager.scene);
        const geometry = new Geometry(sceneManager.scene);
        const animation = new Animation(geometry.spheres);
        const controls = new Controls(sceneManager.scene, sceneManager.camera);
        const orbitingObjects = new OrbitingObjects(geometry.spheres);

        // Attach renderer to the DOM
        containerRef.current.appendChild(sceneManager.renderer.domElement);

        // Animation loop
        const clock = new THREE.Clock();
        const animateLoop = () => {
            const delta = clock.getDelta();
            animation.update(delta);
            orbitingObjects.update();
            sceneManager.update();
            controls.update();  // Add if controls need updating
            requestAnimationFrame(animateLoop);
        };

        animateLoop();

        // Cleanup on unmount
        return () => {
            sceneManager.renderer.dispose();
            containerRef.current.removeChild(sceneManager.renderer.domElement);
        };
    }, []);

    return <div ref={containerRef} style={{ width: '100%', height: '100vh' }} />;
};

export default GalacticScene;