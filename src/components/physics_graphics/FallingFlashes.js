import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import * as THREE from "three";
import * as CANNON from "cannon-es"; // Import Cannon.js here
import useColorUtils from '../hooks/UseColorUtils';
import stars from '../../galaxy_imgs/stars.jpg';
import nebula from '../../galaxy_imgs/nebula.jpg';

// import { useBox, useMultiBox } from '../hooks/UseBoxGeometry';
import { useCannonBox } from '../hooks/UseCannonGeometry';
import { useCannonGround, useCannonUnderground } from '../hooks/UseCannonGround';
import { LightAxisUtilHelper } from '../graphics/LightAxisUtilHelper';
import Shaders from "../graphics/Shaders";
import SandParticles from "../graphics/SandParticles";
import FontMaker from "../graphics/FontMaker";
import SphereUtils from "../graphics/SphereUtils";
import { Lighting } from "../graphics/Lighting";
import MediaPlayer from "../graphics/MediaPlayer";
import { GUI } from "dat.gui";

const FallingFlashes = ({ height = window.innerHeight, width = window.innerWidth, particleCount = 500 }) => {
    const { randomHexColor, randomRgbaColor } = useColorUtils();
    const canvasRef = useRef();
    const sceneRef = useRef(new THREE.Scene());
    const worldRef = useRef(new CANNON.World());
    const sandParticlesRef = useRef([]);
    const sphereBodiesRef = useRef([]);
    const sphereMeshRef = useRef([]);
    const particleBodiesRef = useRef([]);
    const navigate = useNavigate();
    // const box = useBox();
    // const multiBox = useMultiBox();
    // Access the Cannon.js ground
    const { groundBody } = useCannonGround();
    const { underGroundBody } = useCannonUnderground();
    const { cannonBox, boxMesh } = useCannonBox(); // If you want to use boxes as well

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

    const timeStep = 1 / 60;

    // // Define boundary walls for confinement
    // const boundaries = [
    //     { size: [0.1, 10, 20], position: [boxBoundary.min.x, 5, 0] }, // Left wall
    //     { size: [0.1, 10, 20], position: [boxBoundary.max.x, 5, 0] }, // Right wall
    //     { size: [20, 10, 0.1], position: [0, 5, boxBoundary.min.z] }, // Front wall
    //     { size: [20, 10, 0.1], position: [0, 5, boxBoundary.max.z] }, // Back wall
    //     // { size: [20, 0.1, 20], position: [0, boxBoundary.max.y, 0] }  // Top wall
    // ];



    // // Iterate over each boundary to create and add walls to the physics world
    // boundaries.forEach(({ size, position }) => {
    //     const wallShape = new CANNON.Box(new CANNON.Vec3(size[0] / 2, size[1] / 2, size[2] / 2));
    //     const wallBody = new CANNON.Body({ mass: 0, position: new CANNON.Vec3(...position) });
    //     wallBody.addShape(wallShape);
    //     worldRef.current.addBody(wallBody);  // Access world using worldRef.current
    // });
    useEffect(() => {
        const scene = sceneRef.current;
        const world = worldRef.current; // Ensure you're using the reference 
        const gui = new GUI();

        // Set up camera
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.set(-1, 0, 30);

        // Set up renderer
        const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
        renderer.setSize(width, height);
        renderer.shadowMap.enabled = true; // Enable shadow mapping
        renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Optional: set shadow type

        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(nebula);

        // Cube Scene Textures
        const cubeTextureLoader = new THREE.CubeTextureLoader();
        scene.background = cubeTextureLoader.load([
            stars,
            stars,
            stars,
            stars,
            nebula,
            nebula
        ]);

        // Fog
        scene.fog = new THREE.Fog(0xFFFFFF, 0, 200);
        scene.fog = new THREE.FogExp2(randomHexColor(), 0.01);

        // Configure world gravity
        world.gravity.set(0, -9.81, 0);

        const light = new Lighting(scene, camera, 5.0, renderer);
        light.initializeLightAndHelpers();

        // Add ground mesh to scene
        // scene.add(groundMesh);
        const canonBoxGeo = new THREE.BoxGeometry(2, 2, 2);
        const canonBoxMat = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true
        });

        const canonBoxMesh = new THREE.Mesh(canonBoxGeo, canonBoxMat);
        scene.add(canonBoxMesh);

        const canonSphereGeo = new THREE.SphereGeometry(1);
        const canonSphereMat = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            wireframe: true,
        });

        const canonSphereParticle = new THREE.Mesh(canonSphereGeo, canonSphereMat);
        scene.add(canonSphereParticle);

        // Correct the ground body instantiation
        // const groundBody = new CANNON.Body({
        //     mass: 0, // Set mass to 0 for static bodies
        //     position: new CANNON.Vec3(0, -1, 0)
        // });
        underGroundBody.addShape(new CANNON.Plane()); // Add plane shape to ground body
        world.addBody(underGroundBody);
        underGroundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);


        const boxPhysMat = new CANNON.Material();
        const groundPhysMat = new CANNON.Material();
        const canonBoxBody = new CANNON.Body({
            mass: 1,
            position: new CANNON.Vec3(1, 20, 0),
            material: boxPhysMat
        });
        canonBoxBody.addShape(new CANNON.Box(new CANNON.Vec3(1, 1, 1)));
        world.addBody(canonBoxBody);

        // const groundGeo = new THREE.PlaneGeometry(30, 30);
        // const groundMat = new THREE.MeshBasicMaterial({
        //     color: 0xffffff,
        //     side: THREE.DoubleSide,
        //     wireframe: true
        // });

        // const groundMesh = new THREE.Mesh(groundGeo, groundMat);
        // scene.add(groundMesh);

        const groundBoxContactMat = new CANNON.ContactMaterial(
            groundPhysMat,
            boxPhysMat,
            { friction: 0.04 }
        );

        world.addContactMaterial(groundBoxContactMat);

        const spherePhysMat = new CANNON.Material();
        const canonSphereBody = new CANNON.Body({
            mass: 4,
            position: new CANNON.Vec3(0, 10, -10),
            material: spherePhysMat
        });
        canonSphereBody.addShape(new CANNON.Sphere(1)); // Adjust the size if needed
        world.addBody(canonSphereBody);

        // const groundSphereContactMat = new CANNON.ContactMaterial(
        //     groundPhysMat,
        //     spherePhysMat,
        //     { restitution: 0.9 }
        // );

        // world.addContactMaterial(groundSphereContactMat);

        // Add the plane geometry to the scene
        const planeGeometry = new THREE.PlaneGeometry(30, 30, 30);
        const planeMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide
        });

        const shader = new Shaders(width, height, timeStep, 0.1, 50, cubeTextureLoader, 0.1, 2, 1, true);
        const plane = new THREE.Mesh(planeGeometry, shader.shaderMaterials().sawMaterial);
        scene.add(plane);
        plane.rotation.x = -0.5 * Math.PI;
        plane.receiveShadow = true;

        plane.receiveShadow = true;

        // Instanced mesh setup
        // const particleGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        // const particleMaterial = new THREE.MeshStandardMaterial({ color: randomHexColor() });

        // const instancedMesh = new THREE.InstancedMesh(particleGeometry, particleMaterial, particleCount);
        // scene.add(instancedMesh);


        // Add a ground plane
        // const groundGeometry = new THREE.PlaneGeometry(20, 20);
        // const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x00aa00 });
        // const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        // ground.rotation.x = -Math.PI / 2;
        // ground.position.y = 8;
        // scene.add(ground);
        let time = Date.now();

        // Initialize matrix and Cannon bodies for each particle
        // const tempMatrix = new THREE.Matrix4();  
        const sphereUtils = new SphereUtils(scene, world, camera, textureLoader, plane);
        sphereUtils.createCannonSphere({ r: 10, w: 50, h: 50 }, randomHexColor(), { x: -10, y: 20, z: -80 }, 10.1, shader.shaderMaterials().sawMaterial);
        const sandParticles = new SandParticles(scene, world, shader.shaderMaterials().sawMaterial, 60);
        sandParticles.createNoiseParticles(60, 1.4, shader.shaderMaterials().sawMaterial, shader.shaderMaterials().explosiveMaterial);
        const mediaPlayer = new MediaPlayer(scene, camera, renderer, gui, canvasRef.current, width, height, shader);

        const fontMaker = new FontMaker(scene, camera, navigate);
        // Create sand particles in both Three.js and Cannon.js
        for (let i = 0; i < particleCount; i++) {
            // Three.js particle
            let material;
            const geometry = new THREE.SphereGeometry(0.3, 16, 16);

            if (i % 3 === 1) {
                material = shader.shaderMaterials().explosiveMaterial;
            } else if (i % 3 === 2) {
                material = shader.shaderMaterials().explosiveMaterial;
            } else {
                material = new THREE.MeshStandardMaterial({ color: randomHexColor() });
            }

            const mesh = new THREE.Mesh(geometry, material);

            const pos = sandParticles.createRandomPoints();

            // Set random position
            mesh.position.set(pos.x, pos.y, pos.z);

            // Set position in the instanced mesh matrix
            // tempMatrix.setPosition(x, y, z);
            // instancedMesh.setMatrixAt(i, tempMatrix);
            scene.add(mesh);
            sandParticlesRef.current.push(mesh);

            // Cannon.js body for physics
            const shape = new CANNON.Sphere(0.2);
            const particleBody = new CANNON.Body({
                mass: 13.1,
                position: new CANNON.Vec3(mesh.position.x, mesh.position.y, mesh.position.z),
                // type: CANNON.Body.STATIC
                linearDamping: 0.1, // Add damping for more realistic inertia (slower stopping)
                angularDamping: 0.1, // Optional: If you want to dampen angular momentum too
            });

            particleBody.addShape(shape);
            world.addBody(particleBody);
            particleBodiesRef.current.push(particleBody);
        }

        // box.position.y = 4;
        // multiBox.position.y = 4;

        // scene.add(box);
        // scene.add(multiBox);


        // fontMaker.initialize('Falling Ghoasts Rush: Shoot Or Die Trying!!!', {
        //     color: 0xff0000,
        //     size: 1.6,
        //     height: 0.3,
        //     position: { x: -10, y: -15, z: 0 }, // Adjust y-position to place text below main scene area
        // });

        // Load the font and create the text mesh
        fontMaker.loadFont(() => {
            fontMaker.createTextMesh('Falling Ghoasts Rush: Shoot Or Die!!!', {
                color: 0xff0000,
                size: 3.6,
                height: 5.3,
                position: { x: -10, y: -15, z: 10 }, // Adjust y-position to place text below main scene area
            });

            // Optionally enable raycasting for click detection
            fontMaker.enableRaycast();
        });

        // Event listeners for mouse movements and clicks
        const onMouseMove = (event) => {
            fontMaker.onMouseMove(event);
            sphereUtils.updateHover(event);
        };

        const onMouseClick = (event) => {
            sphereUtils.handleClick(shader.shaderMaterials().explosiveMaterial);

            if (mediaPlayer.isPlaying === false) {
                mediaPlayer.loadMedia();
            }

            fontMaker.onMouseClick(event, '/FallingTracks');
        }

        // Attach event listeners
        window.addEventListener('click', onMouseClick);
        window.addEventListener('mousemove', onMouseMove);

        // Handle window resizing and adjust font size based on screen width
        const handleWindowResize = () => {
            // Update camera and renderer on window resize
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);

            // Determine new font size based on window width
            const newSize = window.innerWidth <= 700 ? 1.4 : 1.6;

            // Update font size only if it differs from the current size
            if (fontMaker.textMesh && fontMaker.textMesh.geometry.parameters.size !== newSize) {
                // Remove the existing text mesh
                scene.remove(fontMaker.textMesh);

                // Re-create the text mesh with the updated size
                fontMaker.createTextMesh('Falling Ghoasts Rush: Shoot Or Die!!!', {
                    color: 0xff0000,
                    size: newSize,
                    height: 0.3,
                    position: { x: -10, y: -15, z: 0 },
                });
            }
        };

        // Add window resize listener
        window.addEventListener('resize', handleWindowResize);

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);

            // Step the physics world
            world.step(timeStep);

            // Sync Three.js meshes with Cannon.js bodies
            sandParticlesRef.current.forEach((mesh, i) => {
                mesh.rotation.x += 0.1;
                mesh.rotation.y += 0.1;
                mesh.rotation.z += 0.2;
                const body = particleBodiesRef.current[i];
                mesh.position.copy(body.position);
                mesh.quaternion.copy(body.quaternion);
            });

            // Sync Three.js meshes with Cannon.js bodies
            // sphereMeshRef.current.forEach((mesh, i) => {
            //     const body = sphereBodiesRef.current[i];
            //     mesh.position.copy(body.position);
            //     mesh.quaternion.copy(body.quaternion);
            // });
            light.update();
            shader.update();
            fontMaker.update();
            sphereUtils.update();
            mediaPlayer.update();
            sandParticles.updateNoiseParticles();
            shader.shaderMaterials().sawMaterial.uniforms.time.value = time * 0.001;
            shader.shaderMaterials().explosiveMaterial.uniforms.shapeFactor.value = time * Math.sin(0.001 + time);
            // shader.shaderMaterials().explosiveMaterial.uniforms.explodeIntensity.value = 0.5 + (time * Math.sin(0.01 + time));

            // Render the scene
            renderer.render(scene, camera);
        };
        animate();

        return () => {
            // Remove all particles from the scene
            sandParticlesRef.current.forEach(mesh => {
                scene.remove(mesh);
                mesh.geometry.dispose();
                if (mesh.material.map) mesh.material.map.dispose();
                mesh.material.dispose();
            });

            // Dispose of font maker resources
            fontMaker.dispose();
            sphereUtils.dispose();
            sandParticles.cleanup();
            mediaPlayer.cleanup();

            // Clean up renderer to release WebGL context
            renderer.dispose();

            console.log('Cleaned up FallingSand resources.');
        };
    }, [width, height, particleCount]);

    return <canvas ref={canvasRef} className="galaxial-animation" />;
};

export default FallingFlashes;