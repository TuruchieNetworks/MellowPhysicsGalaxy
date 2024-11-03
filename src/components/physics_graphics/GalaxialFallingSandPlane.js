import React, { useEffect, useState, useRef } from "react";
import * as THREE from "three";
import * as CANNON from "cannon-es"; // Import Cannon.js here
import stars from '../../galaxy_imgs/stars.jpg';
import nebula from '../../galaxy_imgs/nebula.jpg';
import useColorUtils from '../hooks/UseColorUtils';
import useShaderUtils from '../hooks/UseShaderUtils';
import { LightAxisUtilHelper } from '../graphics/LightAxisUtilHelper';
import { Lighting } from '../graphics/Lighting';
import { useCannonGround, useCannonUnderground } from '../hooks/UseCannonGround';


const GalaxialFallingSandPlane = ({ height = window.innerHeight, width = window.innerWidth, particleCount = 500 }) => {
    const { randomHexColor, randomRgbaColor } = useColorUtils();
    const canvasRef = useRef();
    const sceneRef = useRef(new THREE.Scene());
    const worldRef = useRef(new CANNON.World()); // Use CANNON.World()
    const sandParticlesRef = useRef([]);
    const sphereBodiesRef = useRef([]);
    const sphereMeshRef = useRef([]);
    const particleBodiesRef = useRef([]);
    // const box = useBox();
    // const multiBox = useMultiBox()
    const { groundBody } = useCannonGround();
    const { starryBackgrounds, noisePlane, sawPlane, convolutionPlane } = useShaderUtils();
    const backgroundRef = useRef();

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
                        float aij = 0.1; // base value
                        float bij = 1.7; // variation
                        float cij = 0.51; // adjust
                        float dij = 0.33; // noise contribution

                        value += aij + (bij - aij) * S(x - float(i)) + (aij - bij - cij + dij) * S(x - float(i)) * S(z - float(j));
                    }
                }

                gl_FragColor = vec4(vec3(value + burst), 1.0); // Change the color based on the shader output
            }
        `,
    };

    // Create a cube geometry
    // Apply convolution shader as background material
    const noiseMaterial = new THREE.ShaderMaterial({
        uniforms: noisePlane().uniforms,
        vertexShader: noisePlane().vertexShader,
        fragmentShader: noisePlane().fragmentShader,
    });

    const sawMaterial = new THREE.ShaderMaterial({
        uniforms: sawPlane().uniforms,
        vertexShader: sawPlane().vertexShader,
        fragmentShader: sawPlane().fragmentShader,
    });

    // Apply convolution shader as background material
    const convolutionMaterial = new THREE.ShaderMaterial({
        uniforms: convolutionPlane().uniforms,
        vertexShader: convolutionPlane().vertexShader,
        fragmentShader: convolutionPlane().fragmentShader,
    });

    // Create a camera path with yet another color
    const cameraPathPoints = [
        new THREE.Vector3(60, 5, -35),
        new THREE.Vector3(-10, 20, 30),
        new THREE.Vector3(-20, 30, -30),
    ];

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

        world.gravity.set(0, -9.81, 0); // Set gravity for the world

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

        groundBody.addShape(new CANNON.Plane()); // Add plane shape to ground body
        world.addBody(groundBody);
        groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);

        const boxPhysMat = new CANNON.Material();
        const groundPhysMat = new CANNON.Material();
        const canonBoxBody = new CANNON.Body({
            mass: 1,
            position: new CANNON.Vec3(1, 20, 0),
            material: boxPhysMat
        });
        canonBoxBody.addShape(new CANNON.Box(new CANNON.Vec3(1, 1, 1)));
        world.addBody(canonBoxBody);

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

        // Add the plane geometry to the scene
        const planeGeometry = new THREE.PlaneGeometry(30, 30, 30);
        const planeMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide
        });

        // Create plane geometry and material
        const geo = new THREE.PlaneGeometry(20, 20, 32, 32); // Increase the size of the plane
        const mat = new THREE.ShaderMaterial({
            uniforms: noiseShader.uniforms,
            vertexShader: noiseShader.vertexShader,
            fragmentShader: noiseShader.fragmentShader,
        });    

        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        scene.add(plane);
        plane.rotation.x = -0.5 * Math.PI;
        plane.receiveShadow = true;
        plane.receiveShadow = true;
        
        // const cplane = new Plane(scene, 60, 60, randomHexColor(), 1, THREE.DoubleSide); // The last parameter is thickness
        // cplane.setRotation(-0.5 * Math.PI, 0, 0);

        const starPlane = new THREE.Mesh(geo, mat); // Apply the shader material to the plane
        starPlane.rotation.x = -Math.PI / 2; // Rotate the plane to face upwards
        scene.add(starPlane); // Add the plane to the scene // Add the plane geometry to the scene
        // const starPlaneGeometry = new THREE.PlaneGeometry(60, 60, 60);
        // const starPlaneMaterial = new THREE.MeshPhongMaterial({
        //     color: randomHexColor(),
        //     side: THREE.DoubleSide
        // });

        const planePad = new THREE.Mesh(planeGeometry, sawMaterial)
        planePad.rotation.x = -Math.PI / 2;
        planePad.receiveShadow = true;
        scene.add(planePad);

        const gridHelper = new THREE.GridHelper(30);
        scene.add(gridHelper);

        const sphereGeometry = new THREE.SphereGeometry(4, 50, 50);
        const sphereMaterial = new THREE.MeshPhongMaterial({
            color: 0x0000FF,
            wireframe: false
        });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        scene.add(sphere);
        sphere.position.set(-10, 10, -80);
        sphere.castShadow = true;
        sphereMeshRef.current.push(sphere);

        // Cannon.js body for physics
        const sphbody = new CANNON.Sphere(0.2); // Use CANNON.Sphere()
        const sphParticleBody = new CANNON.Body({
            mass: 0.1, // Small mass for realistic sand behavior
            position: new CANNON.Vec3(sphere.position.x, sphere.position.y, sphere.position.z),
        });
        sphParticleBody.addShape(sphbody); // Add the sphere shape
        world.addBody(sphParticleBody);
        sphereBodiesRef.current.push(sphParticleBody);

        const ambientLight = new THREE.AmbientLight(0x333333);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
        scene.add(directionalLight);
        directionalLight.position.set(-30, 50, 0);
        directionalLight.castShadow = true;

        const dLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
        scene.add(dLightHelper);
        // Initialize helpers
        const helpers = new LightAxisUtilHelper(scene, camera, renderer);
        // // Add helpers to the scene
        helpers.addAxesHelper(); // Adds the axes helper to the 
        helpers.addGridHelper(); // Also adds the grid helper to the scene
        // helpers.addHemisphereLightHelper(light);
        helpers.addShadowCameraHelper(directionalLight);
        helpers.addDirectionalLightHelper(directionalLight);
        helpers.addOrbitControls(); // Add orbit controls

        // Instanced mesh setup
        const particleGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        const particleMaterial = new THREE.MeshStandardMaterial({ color: randomHexColor() });

        // const instancedMesh = new THREE.InstancedMesh(particleGeometry, particleMaterial, particleCount);
        // scene.add(instancedMesh);

        // Initialize matrix and Cannon bodies for each particle
        const tempMatrix = new THREE.Matrix4();
        // Create sand particles in both Three.js and Cannon.js
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
            const x = (Math.random() - 0.5) * 10;
            const y = Math.random() * 10 + 10;
            const z = (Math.random() - 0.5) * 10;

            // Set position in the instanced mesh matrix
            // tempMatrix.setPosition(x, y, z);
            // instancedMesh.setMatrixAt(i, tempMatrix);

            scene.add(mesh);
            sandParticlesRef.current.push(mesh);

            // Cannon.js body for physics
            // Create corresponding Cannon.js body
            const shape = new CANNON.Sphere(0.2);
            const particleBody = new CANNON.Body({
                mass: 13.1,
                position: new CANNON.Vec3(x, y, z),
                // type: CANNON.Body.STATIC
            });
            particleBody.addShape(shape);
            world.addBody(particleBody);
            particleBodiesRef.current.push(particleBody);
        }

        let startTime = Date.now(); // Move this outside `animate`

        const animate = (time) => {
            requestAnimationFrame(animate);
            const elapsedTime = (Date.now() - startTime) / 1000; // Convert to seconds
            const speed = 5; // Speed factor
            const totalPoints = cameraPathPoints.length;

            // Step the physics world forward
            world.step(timeStep);

            // Sync Three.js meshes with Cannon.js bodies
            sandParticlesRef.current.forEach((mesh, i) => {
                const body = particleBodiesRef.current[i];
                mesh.position.copy(body.position);
                mesh.quaternion.copy(body.quaternion);
            });

            // Sync Three.js meshes with Cannon.js bodies
            sphereMeshRef.current.forEach((mesh, i) => {
                const body = sphereBodiesRef.current[i];
                mesh.position.copy(body.position);
                mesh.quaternion.copy(body.quaternion);
            });

            // Calculate the index of the current point in the camera path
            const pointIndex = Math.floor(elapsedTime / speed) % totalPoints;
            const nextPointIndex = (pointIndex + 1) % totalPoints;

            // Interpolate between the current and next point
            const t = (elapsedTime % speed) / speed; // Value between 0 and 1 over 'speed' seconds
            const currentPoint = cameraPathPoints[pointIndex];
            const nextPoint = cameraPathPoints[nextPointIndex];
            camera.position.lerpVectors(currentPoint, nextPoint, t);
            camera.lookAt(scene.position); // Ensure the camera looks at the center of the scene

            // Update shader time
            noiseShader.uniforms.time.value = time * 0.001; // Update time uniform

            // Render the scene
            renderer.render(scene, camera);
        };
        animate();

        return () => {
            // Clean up the world and scene on unmount
            sandParticlesRef.current.forEach(mesh => scene.remove(mesh));
            renderer.dispose();
        };
    }, [width, height, particleCount]);

    return <canvas ref={canvasRef} className="galaxial-animation" />;
};

export default GalaxialFallingSandPlane;