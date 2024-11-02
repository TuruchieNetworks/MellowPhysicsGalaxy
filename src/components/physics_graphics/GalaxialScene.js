import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
// import * as CANNON from 'cannon-es';
// import * as dat from 'dat.gui';

import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import sun from '../../galaxy_imgs/sun.jpg';
import stars from '../../galaxy_imgs/stars.jpg';
import mars from '../../galaxy_imgs/mars.jpg';
import earth from '../../galaxy_imgs/earth.jpg';
import nebula from '../../galaxy_imgs/nebula.jpg';
import jupiter from '../../galaxy_imgs/jupiter.jpg';
import monkeyUrl from '../../GLTFs/monkey.glb';
import DancingTwerk from '../../FBXs/DancingTwerk.fbx';
import blue_concert from '../../img/blue_concert.jpg';
import globe_concert from '../../img/globe_concert.jpg';
import metal_blocks from '../../img/metal_blocks.jpg';
import vasil_guitar from '../../img/vasil_guitar.jpg';
import crowd_angle from '../../img/angle_outdoor_concerts.jpg';
import bright_stage from '../../img/tube_concerts.avif';
import blue_stage from '../../img/blue_stage_entrance.avif';
import guitar_boy from '../../img/dark-greece.avif';
import concert_lights from '../../img/bright-concert-lights.avif';

// const images = [
//   globe_concert,
//   metal_blocks,
//   vasil_guitar,
//   concert_lights,
//   crowd_angle,
//   blue_stage,
//   guitar_boy,
//   blue_concert,
//   bright_stage,
//   sun,
//   stars,
//   mars,
//   earth,
//   nebula,
//   jupiter,
// ];

const GalaxialScene = () => {
  const containerRef = useRef();
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  const random_hex_color = () => {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
  }

  useEffect(() => {
    // Setup scene, camera, and renderer

  // Setup scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, dimensions.width / dimensions.height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(dimensions.width, dimensions.height);
    containerRef.current.appendChild(renderer.domElement);

    // axis
    const orbit = new OrbitControls(camera, renderer.domElement);

    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    camera.position.set(-10, 30, 30);
    orbit.update();

    // Light
    const ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
    scene.add(directionalLight);
    directionalLight.position.set(-30, 50, 0);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.bottom = -12;

    const dLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
    scene.add(dLightHelper);

    const dLightShadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
    scene.add(dLightShadowHelper);

    const spotLight = new THREE.SpotLight(0xFFFFFF);
    spotLight.position.set(-100, 100, 0);
    spotLight.castShadow = true;
    spotLight.angle = 0.2;
    scene.add(spotLight);

    const sLightHelper = new THREE.SpotLightHelper(spotLight);
    scene.add(sLightHelper);

    scene.fog = new THREE.Fog(0xFFFFFF, 0, 200);
    scene.fog = new THREE.FogExp2(0xFFFFFF, 0.01);

    renderer.setClearColor(0xFFEA00);

    // Plane
    const planeGeometry = new THREE.PlaneGeometry(30, 30);
    const planeMaterial = new THREE.MeshPhongMaterial({
      color: 0xF0FFFF,
      side: THREE.DoubleSide
    });

    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    scene.add(plane);
    plane.rotation.x = -0.5 * Math.PI;
    plane.receiveShadow = true;

    const gridHelper = new THREE.GridHelper(30);
    scene.add(gridHelper);

    //Texture Loaders
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(nebula);
    scene.background = textureLoader.load(stars);

    // Cube Textures
    const cubeTextureLoader = new THREE.CubeTextureLoader();
    scene.background = cubeTextureLoader.load([
      nebula,
      blue_stage,
      globe_concert,
      metal_blocks,
      blue_concert,
      stars
      // vasil_guitar,
      // concert_lights,
      // crowd_angle,
      // guitar_boy,
      // bright_stage
    ]);

    // Create spheres inside a bounding cube
    const spheres = [];
    const numSpheres = 50;
    const radius = 0.15;
    const cubeSize = 50;
    const gravity = new THREE.Vector3(0, -0.1, 0); // Gravity vector
    const dampingFactor = 0.99; // Damping factor for velocity

    for (let i = 0; i < numSpheres; i++) {
      const geometry = new THREE.SphereGeometry(radius, 32, 32);
      const material = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff });
      const sphere = new THREE.Mesh(geometry, material);

      const mass = Math.random() * 2 + 1;  // Mass between 1 and 3
      const velocity = new THREE.Vector3(Math.random(), Math.random(), Math.random()).multiplyScalar(0.01);

      sphere.position.set(
        (Math.random() - 0.5) * cubeSize,
        (Math.random() - 0.5) * cubeSize,
        (Math.random() - 0.5) * cubeSize
      );

      spheres.push({ mesh: sphere, velocity: velocity, mass: mass });
      scene.add(sphere);

      const boxGeometry = new THREE.BoxGeometry(6, 8, 10);
      const boxMaterial = new THREE.MeshStandardMaterial({
        color: 0x00FF00,
        map: textureLoader.load(nebula)
      });

      const boxMultiMaterial = [
        new THREE.MeshPhongMaterial({ map: textureLoader.load(bright_stage) }),
        new THREE.MeshPhongMaterial({ map: textureLoader.load(stars) }),
        new THREE.MeshPhongMaterial({ map: textureLoader.load(nebula) }),
        new THREE.MeshPhongMaterial({ map: textureLoader.load(crowd_angle) }),
        new THREE.MeshPhongMaterial({ map: textureLoader.load(nebula) }),
        new THREE.MeshPhongMaterial({ map: textureLoader.load(concert_lights) })
      ];

      const box = new THREE.Mesh(boxGeometry, boxMaterial);
      const multiBox = new THREE.Mesh(boxGeometry, boxMultiMaterial);

      box.castShadow = true;
      boxGeometry.castShadow = true;
      boxGeometry.receiveShadow = true;
      multiBox.castShadow = true;

      scene.add(box);
      scene.add(multiBox);
      box.position.set(10, 5, 10);
      multiBox.position.set(-10, 5, 10);
      box.material.map = textureLoader.load(nebula);
      // Create a sphere geometry and initial material (basic white)
      const sphereGeometry = new THREE.SphereGeometry(3.6, 82, 32);
      const randomSphereMaterial = new THREE.MeshStandardMaterial({ color: `${random_hex_color()}` });

      const imgMaterial = new THREE.MeshBasicMaterial({
        map: textureLoader.load(nebula)
      });

      const mainSphere = new THREE.Mesh(sphereGeometry, imgMaterial);
      const axialSphere = new THREE.Mesh(sphereGeometry, randomSphereMaterial);

      box.castShadow = true;
      boxGeometry.castShadow = true;
      boxGeometry.receiveShadow = true;
      multiBox.castShadow = true;

      scene.add(mainSphere);
      scene.add(axialSphere);

      mainSphere.position.set(25, 15, 70);
      axialSphere.position.set(-10, -5, -40);

      // Monkey Mesh Texture
      const monkeyGeometry = new THREE.SphereGeometry(1, 32, 32);
      const monkeyTextureLoader = new THREE.TextureLoader();
      const monkeyMaterial = new THREE.MeshBasicMaterial({ map: monkeyTextureLoader.load(monkeyUrl) });
      const monkeyMesh = new THREE.Mesh(monkeyGeometry, monkeyMaterial);
      scene.add(monkeyMesh);

      // Load GLTF model
      const assetLoader = new GLTFLoader();
      let mixer;

      assetLoader.load(monkeyUrl, function (gltf) {
        const model = gltf.scene;
        scene.add(model);
        model.position.set(-12, 4, 10);

        // Create an AnimationMixer, and get the list of AnimationClip instances
        // mixer = new THREE.AnimationMixer(model);
        // const clips = gltf.animations;

        // // Play all animations
        // clips.forEach((clip) => {
        //   mixer.clipAction(clip).play();
        // });

      }, undefined, function (error) {
        console.error(error);
      });

      // const fbxLoader = new FBXLoader();
      // let fbxMixer;
      // fbxLoader.load(DancingTwerk, function (fbx) {
      //   const fbxModel = fbx.scene;
      //   scene.add(fbxModel);
      //   fbxModel.position.set(-12, 4, 10);

      //   // Create an AnimationMixer, and get the list of AnimationClip instances
      //   fbxMixer = new THREE.AnimationMixer(fbxModel);
      //   const fbxClips = fbx.animations;

      //   // Play all animations
      //   fbxClips.forEach((clip) => {
      //     fbxMixer.clipAction(clip).play();
      //   });

      // }, undefined, function (error) {
      //   console.error(error);
      // });

      // // Function to load FBX model
      // const loadFBXModel = () => {
      //   const fbxLoader = new FBXLoader();
      //   fbxLoader.load(DancingTwerk, (fbx) => {
      //     fbx.position.set(-12, -14, 10); // Set the position of your model
      //     scene.add(fbx);
      //   }, undefined, (error) => {
      //     console.error('An error happened while loading FBX:', error);
      //   });
      // };

      // // Load models
      // // loadGLTFModel();
      // loadFBXModel();
    }

    // Create the cube boundary
    const boundaryGeom = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    const boundaryMat = new THREE.MeshBasicMaterial({
      color: 0x888888,
      wireframe: true,
    });
    const boundary = new THREE.Mesh(boundaryGeom, boundaryMat);
    scene.add(boundary);

    camera.position.z = 10;

    // Function to handle sphere collision using mass and velocity
    const handleCollision = (sphereA, sphereB) => {
      const posA = sphereA.mesh.position;
      const posB = sphereB.mesh.position;

      const distVec = new THREE.Vector3().subVectors(posA, posB);
      const distance = distVec.length();
      const minDistance = radius * 2;

      if (distance < minDistance) {
        const overlap = minDistance - distance;

        // Normalize the distance vector
        distVec.normalize();

        // Relative velocity
        const relVel = new THREE.Vector3().subVectors(sphereA.velocity, sphereB.velocity);

        // Velocity along the line of collision
        const velAlongDist = relVel.dot(distVec);

        if (velAlongDist > 0) return;  // They are moving apart, no need for collision response

        // Calculate impulse scalar
        const impulse = (2 * velAlongDist) / (sphereA.mass + sphereB.mass);

        // Update velocities based on mass and impulse
        sphereA.velocity.sub(distVec.clone().multiplyScalar(impulse * sphereB.mass));
        sphereB.velocity.add(distVec.clone().multiplyScalar(impulse * sphereA.mass));
      }
    };

    // Function to handle wall collision
    const checkWallCollision = (sphere) => {
      const pos = sphere.mesh.position;
      const v = sphere.velocity;

      // Check for collisions with the walls
      if (pos.x - radius < -cubeSize / 2 || pos.x + radius > cubeSize / 2) {
        v.x *= -1;  // Reverse velocity in X
      }
      if (pos.y - radius < -cubeSize / 2 || pos.y + radius > cubeSize / 2) {
        v.y *= -1;  // Reverse velocity in Y
      }
      if (pos.z - radius < -cubeSize / 2 || pos.z + radius > cubeSize / 2) {
        v.z *= -1;  // Reverse velocity in Z
      }
    };

    // Function to apply gravity, update positions and apply damping
    const applyGravityAndUpdatePositions = (deltaTime) => {
      for (const sphere of spheres) {
        // Apply gravity
        sphere.velocity.add(gravity);

        // Dampen the velocity
        sphere.velocity.multiplyScalar(dampingFactor);

        // Update position based on velocity
        sphere.mesh.position.add(sphere.velocity.clone().multiplyScalar(deltaTime));

        // Check for wall collisions
        checkWallCollision(sphere);
      }
    };

    // Update function with substeps and momentum
    const updatePhysics = (deltaTime, substeps) => {
      const timeStep = deltaTime / substeps;

      for (let step = 0; step < substeps; step++) {
        // Check collisions and apply repulsion for all pairs of spheres
        for (let i = 0; i < spheres.length; i++) {
          for (let j = i + 1; j < spheres.length; j++) {
            handleCollision(spheres[i], spheres[j]);
          }
        }

        applyGravityAndUpdatePositions(timeStep);
      }
    };

    const animate = () => {
      requestAnimationFrame(animate);

      const deltaTime = 0.016; // Approx. 60 FPS
      const substeps = 10; // Increase for more precision

      updatePhysics(deltaTime, substeps);

      renderer.render(scene, camera);
    };

    animate();

    // Current value of containerRef in a variable
    const currentContainer = containerRef.current;
    currentContainer.appendChild(renderer.domElement);
    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;

      setDimensions({ width: newWidth, height: newHeight });

      // Adjust the camera and renderer dimensions directly
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);

      // Trigger immediate render
      renderer.render(scene, camera);
    };

    window.addEventListener('resize', handleResize);

    // Call resize once to set initial state accurately
    handleResize();

    // Cleanup on unmount
    return () => {
      // Remove event listener
      window.removeEventListener('resize', handleResize);

      // Cleanup renderer
      while (currentContainer.firstChild) {
        currentContainer.removeChild(currentContainer.firstChild);
      }
    };
  }, [containerRef]);

  return <div ref={containerRef} style={{ width: '100%', height: '100vh' }} />;
};

export default GalaxialScene;
