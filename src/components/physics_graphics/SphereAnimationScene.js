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
