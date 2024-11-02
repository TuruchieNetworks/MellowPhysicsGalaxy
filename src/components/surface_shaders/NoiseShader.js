import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import * as CANNON from "cannon-es";
import stars from '../../galaxy_imgs/stars.jpg';
import nebula from '../../galaxy_imgs/nebula.jpg';
import useColorUtils from '../hooks/UseColorUtils';
import { LightAxisUtilHelper } from '../graphics/LightAxisUtilHelper';
import { Lighting } from '../graphics/Lighting';
import { Mixer } from '../../components/graphics/Mixer';
import { Plane } from '../../components/graphics/Plane';
import { Gravity } from '../../components/graphics/Gravity';
import { MomentumPhysics } from '../../components/graphics/MomentumPhysics';

const NoiseShader = ({ width = window.innerWidth, height = window.innerHeight, particleCount = 50 }) => {
    const canvasRef = useRef();
    const cameraRef = useRef();
    const sandParticlesRef = useRef([]);
    const particleBodiesRef = useRef([]);
    const sceneRef = useRef(new THREE.Scene());
    const worldRef = useRef(new CANNON.World());
    const { randomHexColor, randomRgbaColor } = useColorUtils();

    const noiseShader = {
        uniforms: {
            time: { value: 0.0 },
            resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            varying vec2 vUv;

            float noise(float x, float z) {
                return fract(sin(dot(vec2(x, z) + time, vec2(12.9898, 78.233))) * 43758.5453);
            }

            float S(float t) {
                return smoothstep(0.0, 1.0, t);
            }

            void main() {
                vec2 uv = vUv * 10.0; // Scale the UV coordinates
                float x = uv.x;
                float z = uv.y;

                float burst = noise(x, z);
                float value = 0.0;

                for (int i = -1; i <= 1; i++) {
                    for (int j = -1; j <= 1; j++) {
                        float aij = 0.0; // base value
                        float bij = 1.0; // variation
                        float cij = 0.51; // adjust
                        float dij = 0.33; // noise contribution

                        value += aij + (bij - aij) * S(x - float(i)) + (aij - bij - cij + dij) * S(x - float(i)) * S(z - float(j));
                    }
                }

                gl_FragColor = vec4(vec3(value + burst), 1.0); // Change the color based on the shader output
            }
        `,
    };

    // Create a camera path with yet another color
    const cameraPathPoints = [
        new THREE.Vector3(60, 5, -35),
        new THREE.Vector3(-10, 20, 30),
        new THREE.Vector3(-20, 30, -30),
    ];

    useEffect(() => {
        const scene = sceneRef.current;
        const world = worldRef.current;

        // Set up camera
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.set(0, 5, 15);
        cameraRef.current = camera; // Store the camera in a ref

        camera.position.set(-5, 30, 30);
        // Set up renderer
        const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
        renderer.setSize(width, height);
        renderer.shadowMap.enabled = true;

        // Set up background
        const cubeTextureLoader = new THREE.CubeTextureLoader();
        scene.background = cubeTextureLoader.load([stars, stars, stars, stars, nebula, nebula]);

        // Fog
        scene.fog = new THREE.Fog(0xFFFFFF, 0, 200);
        scene.fog = new THREE.FogExp2(randomHexColor(), 0.01);
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(nebula);
        // scene.background = textureLoader.load(stars);

        // Lighting setup
        const light = new Lighting(scene);
        light.addAmbientLight({ color: randomHexColor(), intensity: 0.5, castShadow: true });
        light.addSpotLight({ color: randomRgbaColor(), intensity: 1, position: { x: -100, y: 100, z: 0 }, angle: 0.2, castShadow: true });
        light.addHemisphereLight({ skyColor: 0xFFFFFF, groundColor: 0x444444, intensity: 0.9, position: { x: 0, y: 50, z: 0 }, castShadow: true });
        light.addDirectionalLight({ color: randomHexColor(), intensity: 1, position: { x: 10, y: 20, z: 10 }, castShadow: true });
        light.addPointLight({ color: randomRgbaColor(), intensity: 0.8, position: { x: 20, y: 20, z: 20 }, castShadow: true });
        const directionalLight = light.addDirectionalLight({ color: randomHexColor(), intensity: 1, position: { x: 10, y: 20, z: 10 }, castShadow: true });

        // Optionally, add a path for an object or animation
        const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(10, 0, 0)];
        light.createPath(points, randomRgbaColor())
        light.createPath(cameraPathPoints, randomHexColor());

        // Initialize helpers
        const helpers = new LightAxisUtilHelper(scene, camera, renderer);

        // // Add helpers to the scene
        helpers.addAxesHelper(); // Adds the axes helper to the scene automatically
        helpers.addGridHelper(); // Also adds the grid helper to the scene
        // helpers.addHemisphereLightHelper(light);
        helpers.addShadowCameraHelper(directionalLight);
        helpers.addDirectionalLightHelper(directionalLight);
        helpers.addOrbitControls(); // Add orbit controls

        // Create plane geometry and material
        const geo = new THREE.PlaneGeometry(20, 20, 32, 32); // Increase the size of the plane
        const mat = new THREE.ShaderMaterial({
            uniforms: noiseShader.uniforms,
            vertexShader: noiseShader.vertexShader,
            fragmentShader: noiseShader.fragmentShader,
        });

        const plane = new THREE.Mesh(geo, mat); // Apply the shader material to the plane
        plane.rotation.x = -Math.PI / 2; // Rotate the plane to face upwards
        scene.add(plane); // Add the plane to the scene // Add the plane geometry to the scene
        const planeGeometry = new THREE.PlaneGeometry(60, 60, 60);
        const planeMaterial = new THREE.MeshPhongMaterial({
            color: randomHexColor(),
            side: THREE.DoubleSide
        });

        const planePad = new THREE.Mesh(planeGeometry, planeMaterial);
        planePad.rotation.x = -Math.PI / 2;
        planePad.receiveShadow = true;
        scene.add(planePad);

        const groundGeo = new THREE.PlaneGeometry(30, 30);
        const groundMat = new THREE.MeshBasicMaterial({
            color: randomHexColor(),
            side: THREE.DoubleSide,
            wireframe: true
        });

        //   const groundMesh = new THREE.Mesh(groundGeo, groundMat);
        //   scene.add(groundMesh);

        // Instanced mesh setup
        const particleGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        const particleMaterial = new THREE.MeshStandardMaterial({ color: randomHexColor() });
        
        // Correct the ground body instantiation
        // Step 1: Define materials for particles and ground
        const sandMaterial = new CANNON.Material("sandMaterial");
        const groundMaterial = new CANNON.Material("groundMaterial");

        // Step 2: Set up contact materials for particle-ground and particle-particle interactions
        const groundContactMaterial = new CANNON.ContactMaterial(sandMaterial, groundMaterial, {
            friction: 0.3,     // Ground friction
            restitution: 0.1   // Minimal bounciness on ground
        });
        const particleContactMaterial = new CANNON.ContactMaterial(sandMaterial, sandMaterial, {
            friction: 0.2,     // Friction between particles
            restitution: 0.1   // Minimal bounciness between particles
        });
        world.addContactMaterial(groundContactMaterial);
        world.addContactMaterial(particleContactMaterial);

        // Step 3: Configure collision detection for better performance with many particles
        world.broadphase = new CANNON.SAPBroadphase(world); // Better for objects on a plane
        world.allowSleep = true;                            // Enable sleeping for particles that come to rest

        // Step 4: Create a ground plane in Cannon.js
        const groundShape = new CANNON.Plane();
        const groundBody = new CANNON.Body({
            mass: 0, // Static ground
            material: groundMaterial
        });
        groundBody.addShape(groundShape);
        groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0); // Rotate to lie flat
        world.addBody(groundBody);

        // Set gravity for the world
        world.gravity.set(0, -9.81, 0);

        // Step 4: Create an InstancedMesh for particles
        const geometry = new THREE.SphereGeometry(0.2, 16, 16);
        const material = new THREE.MeshStandardMaterial({ color: randomHexColor() });
        const particlesMesh = new THREE.InstancedMesh(geometry, material, particleCount);
        particlesMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        scene.add(particlesMesh);

        // Step 5: Create sand particles with assigned material and interaction properties
        for (let i = 0; i < particleCount; i++) {
            // Three.js particle
            const geometry = new THREE.SphereGeometry(0.2, 16, 16);
            const material = new THREE.MeshStandardMaterial({ color: randomHexColor() });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(
                (Math.random() - 0.5) * 10,
                Math.random() * 10 + 10,
                (Math.random() - 0.5) * 10
            );
            scene.add(mesh);
            sandParticlesRef.current.push(mesh);

            // Cannon.js body for physics
            const body = new CANNON.Sphere(0.2);
            const particleBody = new CANNON.Body({
                mass: 0.1, // Small mass for realistic sand behavior
                position: new CANNON.Vec3(mesh.position.x, mesh.position.y, mesh.position.z),
                material: sandMaterial // Assign the sand material for particle interactions
            });

            particleBody.addShape(body);
            particleBody.allowSleep = true;  // Allow particles to sleep when at rest
            particleBody.sleepSpeedLimit = 0.1; // Lower speed threshold for sleeping
            particleBody.sleepTimeLimit = 1;  // Time required to enter sleep state
            world.addBody(particleBody);
            particleBodiesRef.current.push(particleBody);
        }

        // const instancedMesh = new THREE.InstancedMesh(particleGeometry, particleMaterial, particleCount);
        // scene.add(instancedMesh);

        // Initialize matrix and Cannon bodies for each particle
        // const tempMatrix = new THREE.Matrix4();
        // // Create sand particles in both Three.js and Cannon.js
        // for (let i = 0; i < particleCount; i++) {
        //     // Three.js particle
        //     const geometry = new THREE.SphereGeometry(0.2, 16, 16);
        //     const material = new THREE.MeshStandardMaterial({ color: randomHexColor() });
        //     const mesh = new THREE.Mesh(geometry, material);
        //     mesh.position.set(
        //         (Math.random() - 0.5) * 10,
        //         Math.random() * 10 + 10,
        //         (Math.random() - 0.5) * 10
        //     );
        //     const x = (Math.random() - 0.5) * 10;
        //     const y = Math.random() * 10 + 10;
        //     const z = (Math.random() - 0.5) * 10;

        //     // Set position in the instanced mesh matrix
        //     tempMatrix.setPosition(x, y, z);
        //     instancedMesh.setMatrixAt(i, tempMatrix);

        //     scene.add(mesh);
        //     sandParticlesRef.current.push(mesh);

        //     // Cannon.js body for physics
        //     // Create corresponding Cannon.js body
        //     const shape = new CANNON.Sphere(0.2);
        //     const particleBody = new CANNON.Body({
        //         mass: 0.1,
        //         position: new CANNON.Vec3(x, y, z),
        //     });
        //     particleBody.addShape(shape);
        //     world.addBody(particleBody);
        //     particleBodiesRef.current.push(particleBody);
        // }

        // Animation loop
        let startTime = Date.now(); // Move this outside `animate`

        const animate = (time) => {
            requestAnimationFrame(animate);
            const elapsedTime = (Date.now() - startTime) / 1000; // Convert to seconds
            const speed = 5; // Speed factor
            const totalPoints = cameraPathPoints.length;

            // Step the physics world forward
            world.step(1 / 60);

            // Sync InstancedMesh with physics bodies
            const dummy = new THREE.Object3D();
            particleBodiesRef.current.forEach((body, i) => {
                dummy.position.copy(body.position);
                dummy.quaternion.copy(body.quaternion);
                dummy.updateMatrix();
                particlesMesh.setMatrixAt(i, dummy.matrix);
            });
            particlesMesh.instanceMatrix.needsUpdate = true;

            // Camera movement along path
            const pointIndex = Math.floor((elapsedTime / speed)) % totalPoints;
            const nextPointIndex = (pointIndex + 1) % totalPoints;
            const t = (elapsedTime % speed) / speed;
            const currentPoint = cameraPathPoints[pointIndex];
            const nextPoint = cameraPathPoints[nextPointIndex];
            camera.position.lerpVectors(currentPoint, nextPoint, t);
            camera.lookAt(scene.position);

            // Update shader time
            noiseShader.uniforms.time.value = time * 0.001; // Update time uniform

            renderer.render(scene, camera);
        };


        animate();

        // Handle window resizing
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            renderer.setSize(width, height);
            noiseShader.uniforms.resolution.value.set(width, height); // Update shader resolution
        };

        window.addEventListener('resize', handleResize);

        // Cleanup on component unmount
        return () => {
            // Clean up the world and scene on unmount
            sandParticlesRef.current.forEach(mesh => scene.remove(mesh));
            renderer.dispose();
        };
    }, [width, height, particleCount]);

    return <canvas ref={canvasRef} className="galaxial-animation" />;
};

export default NoiseShader;
