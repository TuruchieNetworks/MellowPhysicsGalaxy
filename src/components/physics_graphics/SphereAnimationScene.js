import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Lighting } from '../graphics/Lighting';
import { LightAxisUtilHelper } from '../graphics/LightAxisUtilHelper';
import { SceneManager } from '../../components/graphics/SceneManager';
import { Geometry } from '../../components/graphics/Geometry';
import useColorUtils from '../hooks/UseColorUtils'; // Utility functions for random colors

const SphereAnimationScene = () => {
    const containerRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const rendererRef = useRef(null);
    const { randomHexColor, randomRgbaColor } = useColorUtils();

    useEffect(() => {
        // if (containerRef.current) {
            const sceneManager = new SceneManager(containerRef.current.clientWidth, containerRef.current.clientHeight);
            sceneRef.current = sceneManager.getScene();
            cameraRef.current = sceneManager.getCamera();
            rendererRef.current = sceneManager.getRenderer();

            // Lighting setup
            const light = new Lighting(sceneRef.current);
            light.addAmbientLight({ color: 0x222222, intensity: 0.5, castShadow: true });
            light.addSpotLight({ color: 0xFFFFFF, intensity: 1, position: { x: -100, y: 100, z: 0 }, angle: 0.2, castShadow: true });
            light.addHemisphereLight({ skyColor: 0xFFFFFF, groundColor: 0x444444, intensity: 0.9, position: { x: 0, y: 50, z: 0 }, castShadow: true });
            light.addPointLight({ color: 0xff0000, intensity: 0.8, position: { x: 20, y: 20, z: 20 }, castShadow: true });
            light.addDirectionalLight({ color: 0xFFFFFF, intensity: 1, position: { x: 10, y: 20, z: 10 }, castShadow: true });

            // Adding paths for objects or animations
            const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(10, 0, 0)];
            light.createPath(points, randomRgbaColor());
            const fogPathPoints = [new THREE.Vector3(-10, 0, 0), new THREE.Vector3(0, 0, 0)];
            light.createPath(fogPathPoints, randomHexColor());

            // Initialize helpers
            const directionalLight = light.addDirectionalLight({ color: 0xFFFFFF, intensity: 1, position: { x: 10, y: 20, z: 10 }, castShadow: true });
            const helpers = new LightAxisUtilHelper(sceneRef.current, cameraRef.current, rendererRef.current);
            helpers.addAxesHelper();
            helpers.addGridHelper();
            helpers.addShadowCameraHelper(directionalLight);
            helpers.addDirectionalLightHelper(directionalLight);
            helpers.addOrbitControls();

            // Create Geometry instance with desired counts
            const geometry = new Geometry(sceneRef.current);
            geometry.createBoxes(3);
            geometry.createSpheres(3);
            geometry.createBox({scene: sceneRef.current, width: 2, height: 2, depth: 2, position: new THREE.Vector3(-10, 10, 10), color: 0xff7700 });
            geometry.createSphere({scene: sceneRef.current, width: 2, height: 2, depth: 2, position: new THREE.Vector3(10, -10, 10), color: 0xff7700 });

            const animate = () => {
                requestAnimationFrame(animate);
                geometry.update();
                rendererRef.current.render(sceneRef.current, cameraRef.current);
            };
            animate();

            const handleResize = () => {
                const newWidth = containerRef.current.clientWidth;
                const newHeight = containerRef.current.clientHeight;
                cameraRef.current.aspect = newWidth / newHeight;
                cameraRef.current.updateProjectionMatrix();
                rendererRef.current.setSize(newWidth, newHeight);
            };

            window.addEventListener('resize', handleResize);
            handleResize(); // Set initial size

            return () => {
                geometry.dispose(); // Clean up geometries if necessary
                rendererRef.current.dispose();
                window.removeEventListener('resize', handleResize);
                helpers.dispose(); // If you have a dispose method in LightAxisUtilHelper
            };
        // }
    }, []);

    return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};

export default SphereAnimationScene;










































































































// import React, { useState, useEffect, useRef } from 'react';
// import * as THREE from 'three';
// import SphereAnimator from './SphereAnimator';
// import useSphereGenerator from '../hooks/UseSphereGenerator';

// const SphereAnimationScene = () => {
//     const [spheresData, setSpheresData] = useState([]);
//     const [clickedSpheres, setClickedSpheres] = useState([]);
//     const containerRef = useRef(null);

//     const gravity = new THREE.Vector3(0, -0.1, 0);
//     const sceneRef = useRef(null);
//     const cameraRef = useRef(null);
//     const rendererRef = useRef(null);

//     // Initial Three.js scene setup
//     useEffect(() => {
//         // Initialize scene, camera, and renderer
//         const scene = new THREE.Scene();
//         const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
//         const renderer = new THREE.WebGLRenderer();
        
//         // Set camera and renderer
//         camera.position.z = 5;
//         renderer.setSize(window.innerWidth, window.innerHeight);
//         containerRef.current.appendChild(renderer.domElement);

//         // Ambient light
//         const ambientLight = new THREE.AmbientLight(0x222222, 0.5);
//         scene.add(ambientLight);

//         // Directional light
//         const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
//         directionalLight.position.set(10, 20, 10);
//         scene.add(directionalLight);

//         // Store references
//         sceneRef.current = scene;
//         cameraRef.current = camera;
//         rendererRef.current = renderer;

//         // Clean up renderer on component unmount
//         return () => {
//             renderer.dispose();
//         };
//     }, []);

//     // Function to add a new sphere
//     const addSphere = (newSphere) => {
//         setSpheresData((prev) => [...prev, newSphere]);
//     };


//     // Use custom hook to handle spheres' events
//     useSphereGenerator(addSphere, gravity, setClickedSpheres, clickedSpheres, cameraRef.current, sceneRef.current);

//     // Animation Loop
//     useEffect(() => {
//         const animate = () => {
//             requestAnimationFrame(animate);
//             rendererRef.current.render(sceneRef.current, cameraRef.current);
//         };
//         animate();
//     }, []);

//     return (
//         <div ref={containerRef}>
//             <h1>Sphere Animation</h1>
//             <button onClick={() => addSphere({ mesh: new THREE.Mesh(new THREE.SphereGeometry(1), new THREE.MeshBasicMaterial({ color: 0xff0000 })), velocity: new THREE.Vector3(0, 0, 0) })}>
//                 Add Sphere
//             </button>
//             <SphereAnimator spheresData={spheresData} gravity={gravity} />
//         </div>
//     );
// };

// export default SphereAnimationScene;
