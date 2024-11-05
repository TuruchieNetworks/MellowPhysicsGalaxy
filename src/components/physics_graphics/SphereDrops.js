import React, { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
// import * as dat from 'dat.gui';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { updatePhysicsField } from '../hooks/UseSphereCollision';
import { useBox, useMultiBox } from '../hooks/UseBoxGeometry';
import { useGaussianVelocity, useGaussianMass } from '../hooks/UseGaussianVelocity';

import sun from '../../galaxy_imgs/sun.jpg';
import stars from '../../galaxy_imgs/stars.jpg';
import mars from '../../galaxy_imgs/mars.jpg';
import earth from '../../galaxy_imgs/earth.jpg';
import saturn from '../../galaxy_imgs/saturn.jpg';
import venus from '../../galaxy_imgs/venus.jpg';
import nebula from '../../galaxy_imgs/nebula.jpg';
import jupiter from '../../galaxy_imgs/jupiter.jpg';
import sceneGLTF from '../../GLTFs/scene.gltf';
import monkeyUrl from '../../GLTFs/monkey.glb';
import DancingTwerk from '../../FBXs/DancingTwerk.fbx';
import blue_concert from '../../img/blue_concert.jpg';
import landing_dj from '../../img/landing_dj.jpg';
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
import { Mixer } from '../graphics/Mixer';
import { Plane } from '../graphics/Plane';
import { Gravity } from '../graphics/Gravity';
import { MomentumPhysics } from '../graphics/MomentumPhysics';
import { BoundingObjects } from '../graphics/BoundingObjects';
import SphereUtils from '../graphics/SphereUtils'; // Import your SphereUtils class
import { Lighting } from '../graphics/Lighting';
import { LightAxisUtilHelper } from '../graphics/LightAxisUtilHelper';
import { SceneManager } from '../graphics/SceneManager';
import { Geometry } from '../graphics/Geometry';
import { Animation } from '../graphics/Animation';
import { Controls } from '../graphics/Controls';
import { OrbitingObjects } from '../graphics/OrbitingObjects';

const SphereDrops = () => {
  const containerRef = useRef(null);
  const sceneMeshesRef = useRef([]);
  const box = useBox();
  const multiBox = useMultiBox();
  const generateMass = useGaussianMass();
  const generateVelocity = useGaussianVelocity();
  const [mixers, setMixers] = useState({});
  const [clickedSpheres, setClickedSpheres] = useState([]);
  const [gravity, setGravity] = useState(new THREE.Vector3(0, -0.1, 0));
  // Define points for the light's path
  const [lightPathPoints, setLightPoints] = useState([
    new THREE.Vector3(-10, 10, -10),
    new THREE.Vector3(0, 15, 0),
    new THREE.Vector3(10, 10, 10),
    new THREE.Vector3(0, 5, 0),
  ]);

  const fogPathPoints = [
    new THREE.Vector3(-5, 5, -5),
    new THREE.Vector3(0, 10, 0),
    new THREE.Vector3(5, 5, 5),
  ];

  // Create a camera path with yet another color
  const cameraPathPoints = [
    new THREE.Vector3(0, 5, 10),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(10, 0, -10),
  ];

  const dampingFactor = 0.99; // Damping factor for velocity
  const [angle, setAngle] = useState((1 / 120) * Math.PI * 5);
  const [mousePosition, setMousePosition] = useState({
    x: 0,
    y: 0
  });

  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  const [monkey, setMonkey] = useState({
    model: null
  });

  // const [sceneGLTF, setSceneGLTF] = useState({
  //   model: null
  // });

  const random_hex_color = () => {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
  }     
  
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
  const random_bg_color = () => `#${Math.floor(Math.random() * 16777215).toString(16)}`;

  // Variables for animation
  let lightT = 0;
  // let scene, camera, renderer, directionalLight, orbitControls;s

  useEffect(() => {
    // Setup scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, dimensions.width / dimensions.height, 0.1, 1000);
    camera.position.set(-1, 3, 30);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(dimensions.width, dimensions.height);
    renderer.shadowMap.enabled = true; // Enable shadow mapping
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Optional: set shadow type

    // Append renderer to the DOM element referred by containerRef
    if (containerRef.current) {
      containerRef.current.appendChild(renderer.domElement);
    }

    // Fog
    scene.fog = new THREE.Fog(0xFFFFFF, 0, 200);
    scene.fog = new THREE.FogExp2(random_hex_color(), 0.01);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(nebula);
    // scene.background = textureLoader.load(stars);

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

    // Lighting setup
    const light = new Lighting(scene);
    const ambientLight = light.addAmbientLight({ color: 0x222222, intensity: 0.5, castShadow: true });
    const spotLight = light.addSpotLight({ color: 0xFFFFFF, intensity: 1, position: { x: -100, y: 100, z: 0 }, angle: 0.2, castShadow: true });
    light.addHemisphereLight({ skyColor: 0xFFFFFF, groundColor: 0x444444, intensity: 0.9, position: { x: 0, y: 50, z: 0 }, castShadow: true });
    const pointLight = light.addPointLight({ color: 0xff0000, intensity: 0.8, position: { x: 20, y: 20, z: 20 }, castShadow: true });
    const directionalLight = light.addDirectionalLight({ color: 0xFFFFFF, intensity: 1, position: { x: 10, y: 20, z: 10 }, castShadow: true });

    // Optionally, add a path for an object or animation
    const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(10, 0, 0)];
    light.createPath(points, random_bg_color())
    light.createPath(fogPathPoints, random_hex_color());

    // Initialize helpers
    const helpers = new LightAxisUtilHelper(scene, camera, renderer);

    // // Add helpers to the scene
    helpers.addAxesHelper(); // Adds the axes helper to the scene automatically
    helpers.addGridHelper(); // Also adds the grid helper to the scene
    // helpers.addHemisphereLightHelper(light);
    helpers.addShadowCameraHelper(directionalLight);
    helpers.addDirectionalLightHelper(directionalLight);
    helpers.addOrbitControls(); // Add orbit controls

    // // Fog
    // scene.fog = new THREE.Fog(0xFFFFFF, 0, 200);
    // scene.fog = new THREE.FogExp2(random_hex_color(), 0.01);

    // Load GLTF model
    const assetLoader = new GLTFLoader();

    assetLoader.load(monkeyUrl, function (gltf) {
      const gltfModel = gltf.scene;
      setMonkey(gltfModel)
      scene.add(gltfModel);
      gltfModel.position.set(-12, 4, 10);

    }, undefined, function (error) {
      console.error(error);
    });

    //const boundingObjects = new BoundingObjects(scene);// Update the number of spheres and their radius

    // Create bounding objects
    const boundingObjects = new BoundingObjects(scene, 50, 0.25, 50);
    boundingObjects.updateProperties(100, 0.2); // Update to 100 spheres with a radius of 0.2
    // console.log('Bounding Objects:', boundingObjects);
    // console.log('Spheres:', clickedSpheres);

    // Now create objectsWithPhysics
    const objectsWithPhysics = boundingObjects.spheres?.map(sphereObj => ({
      mesh: sphereObj.mesh,
      velocity: sphereObj.velocity,
      mass: sphereObj.mass
    })) || [];

    // const clickedObjectsWithPhysics = clickedSpheres?.map(sphereObj => ({
    //   mesh: sphereObj.mesh,
    //   velocity: sphereObj.velocity,
    //   mass: sphereObj.mass
    // })) || [];

    // // If you need to dynamically add spheres later

    boundingObjects.addSphere(3);// Initialize bounding objects
    // const gravityInstance = new Gravity(new THREE.Vector3(0, -0.1, 0));

    // Create physics with gravity instance

    //const gravity = new THREE.Vector3(0, -0.1, 0); // Gravity vector
    ///const dampingFactor = 0.99; // Damping factor for velocity

    // Plane
    // Create an instance of the Plane class

    const plane = new Plane(scene, 30, 30, random_hex_color(), 1, THREE.DoubleSide); // The last parameter is thickness
    plane.setRotation(-0.5 * Math.PI, 0, 0);  
    
    // Add meshes to the scene and track them for collisions
    scene.add(box);
    sceneMeshesRef.current.push(box); // Track box in collision list
    
    scene.add(multiBox);
    sceneMeshesRef.current.push(multiBox); // Track multiBox

    // // Create spheres inside a bounding cube
    const spheres = [];
    const cubeSize = 50;

    // const numSpheres = 50;
    // const radius = 0.15;
    // const cubeSize = 50;
    // const gravity = new THREE.Vector3(0, -0.1, 0); // Gravity vector
    // const dampingFactor = 0.99; // Damping factor for velocity

    // for (let i = 0; i < numSpheres; i++) {
    //   const geometry = new THREE.SphereGeometry(radius, 32, 32);
    //   const material = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff });
    //   const sphere = new THREE.Mesh(geometry, material);

    //   const mass = Math.random() * 2 + 1;  // Mass between 1 and 3
    //   const velocity = new THREE.Vector3(Math.random(), Math.random(), Math.random()).multiplyScalar(0.01);

    //   sphere.position.set(
    //     (Math.random() - 0.5) * cubeSize,
    //     (Math.random() - 0.5) * cubeSize,
    //     (Math.random() - 0.5) * cubeSize
    //   );

    //   spheres.push({ mesh: sphere, velocity: velocity, mass: mass });
    //   scene.add(sphere);
    // }

    // scene.add(box);
    // scene.add(multiBox);
    // box.position.set(10, 5, 10);
    // multiBox.position.set(-10, 5, 10);
    // box.material.map = textureLoader.load(nebula);

    // Create the cube boundary
    const boundaryGeom = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    const boundaryMat = new THREE.MeshPhongMaterial({
      color: random_hex_color(),
      wireframe: true,
    });
    const boundary = new THREE.Mesh(boundaryGeom, boundaryMat);
    scene.add(boundary);

    // camera.position.z = 10;
    // Create a keyframe track for galaxial motion
    const bpm = 120;
    const times = [];
    const values = [];
    const tanValues = [];
    const angle = new THREE.Vector3(); // Used for angle calculations

    // Function to set angle
    function setAngle(value) {
      angle.set(value, 0, 0);
    }

    // Create keyframe tracks for positions
    for (let i = 0; i <= 180; i++) {
      setAngle((i / 120) * Math.PI * 5);
      const time = i / 10;
      times.push(time);
      values.push(Math.sin(angle.x) * (bpm / 12)); // x position
      values.push(0); // y position
      values.push(Math.cos(angle.x) * (bpm / 8)); // z position

      tanValues.push(Math.sin(angle.x) * (bpm / 12)); // x position
      tanValues.push(Math.sin(angle.x / Math.PI) * Math.cos(angle.x * (11 / angle.x))); // y position
      tanValues.push(Math.tan(angle.x) * (bpm / 8)); // z position
    }

    // Create animated frame for track
    const positionTrack = new THREE.VectorKeyframeTrack('.position', times, values);
    const tanPositionTrack = new THREE.VectorKeyframeTrack('.position', times, tanValues);

    // Create animation clips from keyframe tracks
    const clip = new THREE.AnimationClip('CircularMotion', -1, [positionTrack]);
    const tangentClip = new THREE.AnimationClip('TangentMotion', -1, [tanPositionTrack]);

    // Create instances of Mixer for each object
    const boxMixer = new Mixer(box); // Replace 'box' with your actual object
    const multiBoxMixer = new Mixer(multiBox); // Replace 'multiBox' with your actual object

    // Set up actions
    const action = boxMixer.createAction(clip);
    const tanAction = multiBoxMixer.createAction(tangentClip);

    // new vector obj on mouse click
    const mouse = new THREE.Vector2();
    const intersectionPoint = new THREE.Vector3();

    // Plane To be created when we change cursor
    const planeNormal = new THREE.Vector3();
    const newPlane = new THREE.Plane();
    const mousePosition = new THREE.Vector2();

    const rayCaster = new THREE.Raycaster();
    // camera.position.set(-10, 30, 30);

    // Handle mouse movement
    const handleMouseMove = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // Set plane normal and update raycaster
      planeNormal.copy(camera.position).normalize();
      newPlane.setFromNormalAndCoplanarPoint(planeNormal, scene.position);
      rayCaster.setFromCamera(mouse, camera);
      rayCaster.ray.intersectPlane(newPlane, intersectionPoint);
    };

    // Handle mouse click
    const newClickedSpheres = [];
    const radius = 0.15;
    const mass = generateMass();
    const velocity = generateVelocity();

 
  //   const handleClick = () => {
  //     const geo = new THREE.SphereGeometry(2, 20, 20);
  //     const mat = new THREE.MeshPhongMaterial({
  //         color: random_hex_color(),
  //         metalness: 0,
  //         roughness: 0,
  //     });

  //     const mesh = new THREE.Mesh(geo, mat);
  //     mesh.material.map = textureLoader.load(blue_concert);
  //     mesh.castShadow = true;
  //     mesh.receiveShadow = true;
  //     mesh.position.copy(intersectionPoint);

  //     const mass = generateMass();
  //     const velocity = generateVelocity();
  //     const radius = 0.15; // Assuming you want to keep the radius here

  //     // Update state with the new sphere, including its id
  //     setClickedSpheres((prevSpheres) => [
  //         ...prevSpheres,
  //         { 
  //             mesh, 
  //             mass, 
  //             velocity, 
  //             radius, 
  //             position: mesh.position.clone(),
  //             sphereId: mesh.id // Store the unique sphereId
  //         },
  //     ]);
  //     const boxMesh = new THREE.Mesh(geo, mat);
  //     const obj = new THREE.Object3D();
  //     obj.add(boxMesh);

  //     // Create and store the new mixer
  //     const newMixer = new THREE.AnimationMixer(mesh);
  //     const action = newMixer.clipAction(clip); // Ensure 'clip' is defined
  //     action.play();

  //     // Set the mixer in the global state
  //     setMixers((prevMixers) => ({
  //         ...prevMixers,
  //         [mesh.id]: newMixer, // Use mesh ID as the key
  //     }));

  //     // Add the new sphere to the scene
  //     scene.add(mesh);

  //     // Clean up after a timeout
  //     const timeoutId = setTimeout(() => {
  //         scene.remove(mesh);
  //         setClickedSpheres((prev) => prev.filter(s => s.mesh !== mesh));
  //         setMixers((prev) => {
  //             const { [mesh.id]: _, ...rest } = prev; // Remove the mixer safely
  //             return rest;
  //         });
  //     }, 30000);
  // };

    // for (let i = 0; i < newClickedSpheres.length; i++) {
    //   const geometry = new THREE.SphereGeometry(radius, 32, 32);
    //   const material = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff });
    //   const sphere = new THREE.Mesh(geometry, material);

    //   const mass = Math.random() * 2 + 1;  // Mass between 1 and 3
    //   const velocity = new THREE.Vector3(Math.random(), Math.random(), Math.random()).multiplyScalar(0.01);

    //   sphere.position.set(
    //     (Math.random() - 0.5) * cubeSize,
    //     (Math.random() - 0.5) * cubeSize,
    //     (Math.random() - 0.5) * cubeSize
    //   );

    //   spheres.push({ mesh: sphere, velocity: velocity, mass: mass });
    //   scene.add(sphere);
    // }

    // window.addEventListener('mousemove', handleMouseMove);
    // window.addEventListener('click', handleClick);

    // // Function to handle sphere collision using mass and velocity
    // const handleCollision = (sphereA, sphereB) => {
    //   const posA = sphereA.mesh.position;
    //   const posB = sphereB.mesh.position;

    //   const distVec = new THREE.Vector3().subVectors(posA, posB);
    //   const distance = distVec.length();
    //   const minDistance = radius * 2;

    //   if (distance < minDistance) {
    //     const overlap = minDistance - distance;

    //     // Normalize the distance vector
    //     distVec.normalize();

    //     // Relative velocity
    //     const relVel = new THREE.Vector3().subVectors(sphereA.velocity, sphereB.velocity);

    //     // Velocity along the line of collision
    //     const velAlongDist = relVel.dot(distVec);

    //     if (velAlongDist > 0) return;  // They are moving apart, no need for collision response

    //     // Calculate impulse scalar
    //     const impulse = (2 * velAlongDist) / (sphereA.mass + sphereB.mass);

    //     // Update velocities based on mass and impulse
    //     sphereA.velocity.sub(distVec.clone().multiplyScalar(impulse * sphereB.mass));
    //     sphereB.velocity.add(distVec.clone().multiplyScalar(impulse * sphereA.mass));
    //   }
    // };

    // // Function to handle wall collision
    // const checkWallCollision = (sphere) => {
    //   const pos = sphere.mesh.position;
    //   const v = sphere.velocity;

    //   // Check for collisions with the walls
    //   if (pos.x - radius < -cubeSize / 2 || pos.x + radius > cubeSize / 2) {
    //     v.x *= -1;  // Reverse velocity in X
    //   }
    //   if (pos.y - radius < -cubeSize / 2 || pos.y + radius > cubeSize / 2) {
    //     v.y *= -1;  // Reverse velocity in Y
    //   }
    //   if (pos.z - radius < -cubeSize / 2 || pos.z + radius > cubeSize / 2) {
    //     v.z *= -1;  // Reverse velocity in Z
    //   }
    // };

    // // Function to apply gravity, update positions and apply damping
    // const applyGravityAndUpdatePositions = (deltaTime) => {
    //   for (const sphere of spheres) {
    //     // Apply gravity
    //     sphere.velocity.add(gravity);

    //     // Dampen the velocity
    //     sphere.velocity.multiplyScalar(dampingFactor);

    //     // Update position based on velocity
    //     sphere.mesh.position.add(sphere.velocity.clone().multiplyScalar(deltaTime));

    //     // Check for wall collisions
    //     checkWallCollision(sphere);
    //   }
    // };

    // // Update function with substeps and momentum
    // const updatePhysics = (deltaTime, substeps) => {
    //   const timeStep = deltaTime / substeps;

    //   for (let step = 0; step < substeps; step++) {
    //     // Check collisions and apply repulsion for all pairs of spheres
    //     for (let i = 0; i < spheres.length; i++) {
    //       for (let j = i + 1; j < spheres.length; j++) {
    //         handleCollision(spheres[i], spheres[j]);
    //       }
    //     }

    //     applyGravityAndUpdatePositions(timeStep);
    //   }
    // };



    // In your animation loop
    const clock = new THREE.Clock();  // Define the clock
    const deltaTime = clock.getDelta();

    const physics = new MomentumPhysics(objectsWithPhysics, 50, gravity, dampingFactor);
    const clickedPhysics = new MomentumPhysics(clickedSpheres, clickedSpheres.length, gravity, dampingFactor);

    // // clickedPhysics.checkWallCollision()
    // clickedPhysics.applyGravityAndDamping(deltaTime);

    // clickedSpheres.forEach((sphereData) => {
    //   const { sphere, velocity } = sphereData;

    //   // Apply gravity to velocity
    //   velocity.add(gravity.clone().multiplyScalar(deltaTime));

    //   // Update position based on velocity
    //   sphere.position.add(velocity.clone().multiplyScalar(deltaTime));
    // });

    // const substeps = 10; // Increase for more precision

  //   const animateMeshedObjects = (obj, t) => {
  //     // Update sphere position based on velocity and gravity
  //     obj.velocity.add(gravity.clone().multiplyScalar(t)); // Apply gravity
  //     obj.mesh.position.add(obj.velocity.clone().multiplyScalar(t)); // Update position

  //     // Check for boundary conditions
  //     if (!isWithinBoxBoundary(obj.mesh.position, boxBoundary)) {
  //         // Reflect the velocity on collision with box boundary
  //         obj.velocity.x *= -1; // Reverse x velocity
  //         obj.velocity.y *= -1; // Reverse y velocity (optional)
  //         obj.velocity.z *= -1; // Reverse z velocity
  //         keepWithinBoxBoundary(obj.mesh.position, boxBoundary);
  //     }

  //     if (!isWithinSphereBoundary(obj.mesh.position, sphereBoundary)) {
  //         // Reflect the velocity on collision with sphere boundary
  //         const direction = obj.mesh.position.clone().sub(sphereBoundary.center).normalize();
  //         obj.velocity.reflect(direction); // Reflect the velocity off the sphere
  //         keepWithinSphereBoundary(obj.mesh.position, sphereBoundary);
  //     }

  //     // Rotate the object along its own axis
  //     obj.mesh.rotation.x += 0.01;
  //     obj.mesh.rotation.y += 0.01;
  //     obj.mesh.rotation.z += 0.01;

  //     // Optional: Implement collision detection with ground
  //     if (obj.mesh.position.y <= 0) {
  //         obj.velocity.y *= -0.7; // Reverse velocity for bounce effect
  //         obj.mesh.position.y = 0; // Keep mesh on ground
  //     }
  // };

  // const isWithinBoxBoundary = (position, boundary) => {
  //     return (
  //         position.x >= boundary.min.x &&
  //         position.x <= boundary.max.x &&
  //         position.y >= boundary.min.y &&
  //         position.y <= boundary.max.y &&
  //         position.z >= boundary.min.z &&
  //         position.z <= boundary.max.z
  //     );
  //   };

  //   const keepWithinBoxBoundary = (position, boundary) => {
  //       position.x = Math.max(boundary.min.x, Math.min(boundary.max.x, position.x));
  //       position.y = Math.max(boundary.min.y, Math.min(boundary.max.y, position.y));
  //       position.z = Math.max(boundary.min.z, Math.min(boundary.max.z, position.z));
  //   };

  //   const isWithinSphereBoundary = (position, boundary) => {
  //       return position.distanceTo(boundary.center) <= boundary.radius;
  //   };

  //   const keepWithinSphereBoundary = (position, boundary) => {
  //       const direction = position.clone().sub(boundary.center).normalize();
  //       position.copy(boundary.center).add(direction.multiplyScalar(boundary.radius));
  //   };



// Initialize SphereUtils

    const sphereUtils = new SphereUtils(scene, camera, textureLoader, plane);

    const animate = () => {
      requestAnimationFrame(animate);
      // const deltaTime = clock.getDelta();
      const deltaTime = clock.getDelta();

      // box.rotation.x += 0.01;
      // box.rotation.z += 0.03;
      // multiBox.rotation.x -= 1;
      // multiBox.rotation.z -= 2;
      // box.mesh.rotateX(0.03);
      // multiBox.mesh.rotateY(0.032);
  

      physics.updatePhysics(deltaTime, 15);
    
      // Update spheres in each frame
      sphereUtils.update();

      // clickedPhysics.updatePhysics(deltaTime, 11); 
      // updatePhysics
      // Example: 5 substeps for smoother simulation
      // clickedSpheres.forEach((meshData) => {
      //   const { mesh, velocity } = meshData;

      //   // Apply gravity to velocity
      //   velocity.add(gravity.clone().multiplyScalar(deltaTime));

      //   // Update position based on velocity
      //   mesh.position.add(velocity.clone().multiplyScalar(deltaTime));
      // });
      // Update each sphere's position based on velocity and gravity
      // Update each sphere's position based on velocity and gravity
      
      // setClickedSpheres((spheres) =>
      //   spheres.map((sphereData) => {
      //     const { mesh, velocity } = sphereData;
      //     mesh.rotation.x += 0.1;
      //     mesh.rotateZ += 0.1;

      //     // Apply gravity effect
      //     velocity.add(gravity.clone().multiplyScalar(deltaTime));

      //     // Update position based on velocity
      //     mesh.position.add(velocity.clone().multiplyScalar(deltaTime));

      //     // Collision detection and bounce
      //     if (mesh.position.y <= 0) {
      //       velocity.y *= -0.7; // Apply damping on bounce
      //       mesh.position.y = 0; // Reset position to ground level if below
      //     }
      //     return sphereData;
      //   })
      // );

      // Update all spheres
      // clickedSpheres.forEach((obj, index) => {
      //   const { mesh } = obj;
      //   const orbitRadius = (Math.LN2 * index) + ((index * Math.PI2) + (index * Math.E / Math.SQRT1_2));
        
      //   // Calculate the new positions for galaxial motion
      //   mesh.position.x = Math.sin(Date.now() * 0.001 + index) * orbitRadius;
      //   mesh.position.z = Math.cos(Date.now() * 0.001 + index) * orbitRadius;
      //   //animateMeshedObjects(obj, deltaTime);
      // });

      // Update all mixers
      Object.values(mixers).forEach(mixer => mixer.update(deltaTime));
      renderer.render(scene, camera);
    };

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
        if (event.key === 'g') {
            sphereUtils.toggleGravity();
        }
    });

    animate();


      // if (spheres.length > 0) { // Ensure spheres array is not empty
      //   spheres.forEach(({ mesh, velocity }) => {
      //     if (mesh) { // Check if mesh is defined
      //       // Rotate the mesh
      //       mesh.rotation.x += 0.01;
      //       mesh.rotation.y += 0.01;
      //       mesh.rotation.z += 0.03;
      //       physics.handleCollision(mesh, mesh);

      //       // Galactic movement effect using velocity
      //       mesh.position.x += velocity.x;
      //       mesh.position.z += velocity.z;

      //       // Optional: Update the velocity based on some logic if needed
      //       // For example, you could add some randomness:
      //       velocity.x += (Math.random() - 0.5) * 0.001;
      //       velocity.z += (Math.random() - 0.5) * 0.001;
      //     } else {
      //       console.warn("Mesh is undefined in spheres array.");
      //     }
      //   });
      // }

      //const deltaTime = 0.016; // Approx. 60 FPS
      // physics.updatePhysics(deltaTime, substeps);


 

    // Current value of containerRef in a variable
    const currentContainer = containerRef.current;
    currentContainer.appendChild(renderer.domElement);

    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;

      setDimensions({ width: newWidth, height: newHeight });

      // Adjust the camera and renderer dimensions directly
      camera.aspect = dimensions.width / dimensions.height;
      camera.updateProjectionMatrix();
      renderer.setSize(dimensions.width, dimensions.height);

      // Trigger immediate render
      renderer.render(scene, camera);
    };

    window.addEventListener('resize', handleResize);

    // Call resize once to set initial state accurately
    handleResize();


    // Cleanup on unmount
    return () => {
      if (containerRef.current) { // Check if current is not null
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        }
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('click', 
        sphereUtils.handleClick());
    };
  }, [dimensions.width, dimensions.height, angle, box, multiBox]) //, angle, box, multiBox]); // Dependency array ensures useEffect runs on dimensions change

  return <div ref={containerRef} className="galaxial-animation" style={{ width: '100vw', height: '100vh' }} />
  //:  'Content Loading...'
};

export default SphereDrops;