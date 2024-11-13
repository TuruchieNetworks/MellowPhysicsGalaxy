import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import * as CANNON from "cannon-es";
import stars from '../../galaxy_imgs/stars.jpg';
import nebula from '../../galaxy_imgs/nebula.jpg';
import useColorUtils from '../hooks/UseColorUtils';
// import useShaderUtils from '../hooks/UseShaderUtils';
import { LightAxisUtilHelper } from '../graphics/LightAxisUtilHelper';
import { Lighting } from '../graphics/Lighting';
import SphereUtils from '../graphics/SphereUtils';
import BoundingObjects from '../graphics/BoundingObjects';
import { useBox, useMultiBox } from '../../components/hooks/UseBoxGeometry';
import Shaders from '../graphics/Shaders';
import SandParticles from '../graphics/SandParticles';

const NoiseShader = ({ width = window.innerWidth, height = window.innerHeight, particleCount = 40 }) => {
    const canvasRef = useRef();
    const cameraRef = useRef();
    const backgroundRef = useRef();
    const sandParticlesRef = useRef([]);
    const particleBodiesRef = useRef([]);
    const sceneRef = useRef(new THREE.Scene());
    const worldRef = useRef(new CANNON.World());
    const { randomHexColor, randomRgbaColor } = useColorUtils();
    // const { starryBackgrounds, noisePlane, sawPlane, convolutionPlane } = useShaderUtils();
    const box = useBox();
    const multiBox = useMultiBox();

    let time = 0.1;
    let shapeFactor = 0.5;
    let deltaTime = 1 / 60;
    const timeStep = 1 / 60;

    const noiseShader = {
        uniforms: {
            time: { value: time },
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
            
            // https://iquilezles.org/articles/distfunctions2d/
            float sdfCircle(vec2 p, float r) {
            // note: sqrt(pow(p.x, 2.0) + pow(p.y, 2.0)) - r;
            return length(p) - r;
            }

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

                // vec2 uv = gl_FragCoord.xy / u_resolution;
                // uv = uv - 0.5;
                // uv = uv * u_resolution / 100.0;

                // note: set up basic colors
                vec3 black = vec3(0.0);
                vec3 white = vec3(1.0);
                vec3 red = vec3(1.0, 0.0, 0.0);
                vec3 blue = vec3(0.65, 0.85, 1.0);
                vec3 orange = vec3(0.9, 0.6, 0.3);
                vec3 color = black;
                color = vec3(uv.x, uv.y, 0.0);

                float burst = noise(x, z);
                float value = 0.0;

                for (int i = -1; i <= 1; i++) {
                    for (int j = -1; j <= 1; j++) {
                        float aij = 0.1; // base value
                        float bij = 1.7; // variation
                        float cij = 0.51; // adjust
                        float dij = 0.33; // noise contribution

                        value += aij + (bij - aij) * S(x - float(i)) + (aij - bij - cij + dij) * S(x - float(i)) * S(z - float(j));
                    }
                }

                vec3 noiseColor = vec3(value + burst);
                vec3 axialNoiseColor = vec3((value * value) + (burst + burst));
                
                // note: draw circle sdf
                float radius = 2.5;
                // radius = 3.0;
                vec2 center = vec2(0.0, 0.0);
                // center = vec2(sin(2.0 * time), 0.0);
                float distanceToCircle = sdfCircle(uv - center, radius);
                color = distanceToCircle > 0.0 ? noiseColor : axialNoiseColor;

                // note: adding a black outline to the circle
                // color = color * exp(distanceToCircle);
                // color = color * exp(2.0 * distanceToCircle);
                // color = color * exp(-2.0 * abs(distanceToCircle));
                color = color * (1.0 - exp(-2.0 * abs(distanceToCircle)));
                // color = color * (1.0 - exp(-5.0 * abs(distanceToCircle)));
                // color = color * (1.0 - exp(-5.0 * abs(distanceToCircle)));

                // note: adding waves
                // color = color * 0.8 + color * 0.2;
                // color = color * 0.8 + color * 0.2 * sin(distanceToCircle);
                // color = color * 0.8 + color * 0.2 * sin(50.0 * distanceToCircle);
                color = color * 0.8 + color * 0.2 * sin(50.0 * distanceToCircle - 4.0 * time);

                // note: adding white border to the circle
                // color = mix(white, color, step(0.1, distanceToCircle));
                // color = mix(white, color, step(0.1, abs(distanceToCircle)));
                //color = mix(white, color, smoothstep(0.0, 0.1, abs(distanceToCircle)));

                // note: thumbnail?
                // color = mix(white, color, abs(distanceToCircle));
                // color = mix(white, color, 2.0 * abs(distanceToCircle));
                // color = mix(white, color, 4.0 * abs(distanceToCircle));

                gl_FragColor = vec4(color, 1.0); // Change the color based on the shader output
            }
        `,
    };

    // Apply convolution shader as background material
    const shader = new Shaders(width, height, deltaTime, time, shapeFactor);
    // const noiseMaterial =shader.shaderMaterials().noiseMaterial; 
    const sawMaterial = shader.shaderMaterials().sawMaterial;
    const boidMaterial = shader.shaderMaterials().boidsMaterial;
    const convolutionMaterial = shader.shaderMaterials().convolutionMaterial;

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
        scene.background = cubeTextureLoader.load([stars, stars, stars, stars, nebula, convolutionMaterial]);

        // Apply starry shader as background material
        // const starryMaterial = new THREE.ShaderMaterial({
        //     uniforms: {
        //         backgroundTexture: { value: cubeTextureLoader }
        //     },
        //     vertexShader: starryBackgrounds().vertexShader,
        //     fragmentShader: starryBackgrounds().fragmentShader,
        //     side: THREE.BackSide // Inside of large sphere
        // });

        // Fog
        scene.fog = new THREE.Fog(0xFFFFFF, 0, 200);
        scene.fog = new THREE.FogExp2(randomHexColor(), 0.01);
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(nebula);
        // scene.background = textureLoader.load(stars);

        // Lighting setup
        const light = new Lighting(scene, camera);
        light.addAmbientLight({ color: randomHexColor(), intensity: 0.5, castShadow: true });
        light.addSpotLight({ color: randomRgbaColor(), intensity: 1, position: { x: -100, y: 100, z: 0 }, angle: 0.2, castShadow: true });
        light.addHemisphereLight({ skyColor: 0xFFFFFF, groundColor: 0x444444, intensity: 0.9, position: { x: 0, y: 50, z: 0 }, castShadow: true });
        light.addDirectionalLight({ color: randomHexColor(), intensity: 1, position: { x: 10, y: 20, z: 10 }, castShadow: true });
        light.addPointLight({ color: randomRgbaColor(), intensity: 0.8, position: { x: 20, y: 20, z: 20 }, castShadow: true });
        const directionalLight = light.addDirectionalLight({ color: randomHexColor(), intensity: 1, position: { x: 10, y: 20, z: 10 }, castShadow: true });

        // Optionally, add a path for an object or animation
        // const points = [new THREE.Vector3(0, 0, 0), ns
        light.createPath(light.oneCameraPath, randomHexColor());

        // Initialize helpers
        const helpers = new LightAxisUtilHelper(scene, camera, renderer);

        // // Add helpers to the scene
        helpers.addAxesHelper(); // Adds the axes helper to the scene automatically
        helpers.addGridHelper(); // Also adds the grid helper to the scene

        // helpers.addHemisphereLightHelper(light);
        helpers.addShadowCameraHelper(directionalLight);
        helpers.addDirectionalLightHelper(directionalLight);
        // helpers.addOrbitControls(); // Add orbit controls

        // Create plane geometry and material
        const geo = new THREE.PlaneGeometry(20, 20, 32, 32); // Increase the size of the plane
        const mat = shader.shaderMaterials().noiseMaterial;

        // const cplane = new Plane(scene, 60, 60, randomHexColor(), 1, THREE.DoubleSide); // The last parameter is thickness
        // cplane.setRotation(-0.5 * Math.PI, 0, 0);

        const plane = new THREE.Mesh(geo, sawMaterial, 1, THREE.DoubleSide); // Apply the shader material to the plane
        plane.rotation.x = -Math.PI / 2; // Rotate the plane to face upwards
        plane.receiveShadow = true;
        scene.add(plane); // Add the plane to the scene // Add the plane geometry to the scene

        const planeGeometry = new THREE.PlaneGeometry(60, 60, 60);
        const planeMaterial = new THREE.MeshPhongMaterial({
            color: randomHexColor(),
            side: THREE.DoubleSide
        });

        const planePad = new THREE.Mesh(planeGeometry, planeMaterial, 1, THREE.DoubleSide)
        planePad.rotation.x = -Math.PI / 2;
        planePad.receiveShadow = true;
        scene.add(planePad);

        const boxPhysMat = new CANNON.Material();
        // const groundPhysMat = new CANNON.Material();
        const canonBoxBody = new CANNON.Body({
            mass: 1,
            position: new CANNON.Vec3(1, 20, 0),
            material: boxPhysMat
        });

        canonBoxBody.addShape(new CANNON.Box(new CANNON.Vec3(1, 1, 1)));
        world.addBody(canonBoxBody);

        //   const groundMesh = new THREE.Mesh(groundGeo, groundMat);
        //   scene.add(groundMesh);

        // Instanced mesh setup
        // const particleGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        // const particleMaterial = new THREE.MeshStandardMaterial({ color: randomHexColor() });

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

        const boundingObjects = new BoundingObjects(scene, 50, 0.50, 50);
        // console.log('Bounding Objects:', boundingObjects);
        // console.log('Spheres:', clickedSpheres);

        // Now create objectsWithPhysics
        const objectsWithPhysics = boundingObjects.spheres?.map(sphereObj => ({
            mesh: sphereObj.mesh,
            velocity: sphereObj.velocity,
            mass: sphereObj.mass
        })) || [];
        scene.add(objectsWithPhysics)

        // Create the cube boundary
        // boundingObjects.createBoundaryBox()
        // // Step 4: Create an InstancedMesh for particles
        // const geometry = new THREE.SphereGeometry(0.2, 16, 16);
        // const material = new THREE.MeshStandardMaterial({ color: randomHexColor() });
        // const particlesMesh = new THREE.InstancedMesh(geometry, material, particleCount);
        // particlesMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        // scene.add(particlesMesh);
        boundingObjects.addSphere(3); // Initialize bounding objects
        scene.add(box);
        scene.add(multiBox);

        // Step 5: Create sand particles with assigned material and interaction properties
        for (let i = 0; i < particleCount; i++) {
            // Three.js particle
            const geometry = new THREE.SphereGeometry(1.6, 16, 16);
            const material = mat;
            // const material = new THREE.MeshStandardMaterial({ color: randomHexColor() });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.position.set(
                (Math.random() - 0.5) * 10,
                Math.random() * 10 + 10,
                (Math.random() - 0.5) * 10
            );
            const x = (Math.random() - 0.5) * 10;
            const y = Math.random() * 10 + 10;
            const z = (Math.random() - 0.5) * 10;

            scene.add(mesh);
            sandParticlesRef.current.push(mesh);

            // Cannon.js body for physics
            const body = new CANNON.Sphere(1.6);
            const particleBody = new CANNON.Body({
                mass: 13.1,
                position: new CANNON.Vec3(x, y, z),
                // mass: 0.1, // Small mass for realistic sand behavior
                // position: new CANNON.Vec3(mesh.position.x, mesh.position.y, mesh.position.z),
                // material: sandMaterial // Assign the sand material for particle interactions
            });

            particleBody.addShape(body);
            particleBody.allowSleep = true;  // Allow particles to sleep when at rest
            particleBody.sleepSpeedLimit = 3.1; // Lower speed threshold for sleeping
            particleBody.sleepTimeLimit = 3;  // Time required to enter sleep state
            world.addBody(particleBody);
            particleBodiesRef.current.push(particleBody);
        }


        // const sandParticles = new SandParticles(scene, world, mat, 40);
        // sandParticles.createNoiseParticles();

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
        const sphereUtils = new SphereUtils(scene, camera, textureLoader, plane);

        // Handle mouse movements
        window.addEventListener('mousemove', (event) => {
            sphereUtils.updateHover(event);
        });

        // Handle clicks to create spheres
        window.addEventListener('click', () => {
            sphereUtils.handleClick();
        });

        // Toggle gravity on key press (for example, "G" key)
        window.addEventListener('keydown', (event) => {
            if (event.key === 'a' || event.key === 'l') {
                sphereUtils.handleClick();
            }
            if (event.key === 'g') {
                sphereUtils.toggleGravity();
            }
        });

        let timeValue;
        const animate = (time) => {
            requestAnimationFrame(animate);

            time = time * 0.001 * Date.now();

            // Step the physics world forward
            world.step(timeStep);

            // Sync Three.js meshes with Cannon.js bodies
            sandParticlesRef.current.forEach((mesh, i) => {
                const body = particleBodiesRef.current[i];
                mesh.castShadow = true;
                mesh.position.copy(body.position);
                mesh.quaternion.copy(body.quaternion);
            });

            // sandParticles.update();

            startTime++;
            timeValue = 0.1;

            // Update Camera
            light.update()
            shader.update()

            // Update spheres in each frame
            sphereUtils.update();
            boundingObjects.updateSpheres();

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
