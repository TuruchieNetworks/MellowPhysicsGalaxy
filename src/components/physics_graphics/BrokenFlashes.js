import React, { useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import * as THREE from "three";
import * as CANNON from "cannon-es"; // Import Cannon.js here
import useColorUtils from '../hooks/UseColorUtils';
import stars from '../../galaxy_imgs/stars.jpg';
import nebula from '../../galaxy_imgs/nebula.jpg';

import { useCannonBox } from '../hooks/UseCannonGeometry';
import { useBox, useMultiBox } from '../hooks/UseBoxGeometry';
import { useCannonGround, useCannonUnderground } from '../hooks/UseCannonGround';
import { LightAxisUtilHelper } from '../graphics/LightAxisUtilHelper';
import { Plane } from '../graphics/Plane';
import Shaders from "../graphics/Shaders";
import SandParticles from "../graphics/SandParticles";
import FontMaker from "../graphics/FontMaker";
import SphereUtils from "../graphics/SphereUtils";


const BrokenFlashes = ({ height = window.innerHeight, width = window.innerWidth, particleCount = 300 }) => {
  const { randomHexColor, randomRgbaColor } = useColorUtils();
  const canvasRef = useRef();
  const sceneRef = useRef(new THREE.Scene());
  const worldRef = useRef(new CANNON.World());
  const sandParticlesRef = useRef([]);
  const sphereBodiesRef = useRef([]);
  const sphereMeshRef = useRef([]);
  const particleBodiesRef = useRef([]);
  const navigate = useNavigate();
  const box = useBox();
  const multiBox = useMultiBox();

  // Access the Cannon.js world and ground
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

  const createRandomPoints = () => {
    const x = (Math.random() - 0.5) * 10;
    const y = Math.random() * 10 + 10;
    const z = (Math.random() - 0.5) * 10;
    return { x, y, z }
  }

  const pos = createRandomPoints();

  const timeStep = 1 / 60;

  const time = Date.now();

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

    // Set up camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(-1, 5, 50);

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
    world.gravity.set(0, -9.81, 0); // Set gravity for the world

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

    // const planeMaterial = new THREE.MeshPhongMaterial({
    //     color: 0xffffff,
    //     side: THREE.DoubleSide
    // });
    const planeGeometry = new THREE.PlaneGeometry(30, 30, 30);
    const shader = new Shaders(width, height, timeStep, time, 50, cubeTextureLoader, 0.1, 2, 1, true);
    // const plane = new THREE.Mesh(planeGeometry, shader.shaderMaterials().sawMaterial);
    const plane = new Plane(scene, 30, 30, randomHexColor(), 2, 1, 'convolutionMaterial')

    // scene.add(plane);
    //plane.rotation.x = -0.5 * Math.PI; 
    plane.setRotation(-0.5 * Math.PI, 0, 0);
    plane.receiveShadow = true;

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
    // const particleGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    // const particleMaterial = new THREE.MeshStandardMaterial({ color: randomHexColor() });

    // const instancedMesh = new THREE.InstancedMesh(particleGeometry, particleMaterial, particleCount);
    // scene.add(instancedMesh);

    // Initialize matrix and Cannon bodies for each particle
    // const tempMatrix = new THREE.Matrix4();
    // Create sand particles in both Three.js and Cannon.js
    for (let i = 0; i < particleCount; i++) {
      // Three.js particle
      let material;
      const geometry = new THREE.SphereGeometry(0.2, 16, 16);

      i % 2 === 0 ?
        material = shader.shaderMaterials().sawMaterial :
        material = new THREE.MeshStandardMaterial({ color: randomHexColor() });
      ;
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(pos.x, pos.y, pos.z);

      // Set position in the instanced mesh matrix
      // tempMatrix.setPosition(x, y, z);
      // instancedMesh.setMatrixAt(i, tempMatrix);


      // Add a ground plane
      // const groundGeometry = new THREE.PlaneGeometry(20, 20);
      // const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x00aa00 });
      // const ground = new THREE.Mesh(groundGeometry, groundMaterial);
      // ground.rotation.x = -Math.PI / 2;
      // ground.position.y = 8;
      // scene.add(ground);
      scene.add(mesh);
      sandParticlesRef.current.push(mesh);

      // Cannon.js body for physics
      const shape = new CANNON.Sphere(0.2);
      const particleBody = new CANNON.Body({
        mass: 13.1,
        position: new CANNON.Vec3(pos.x, pos.y, pos.z),
        // type: CANNON.Body.STATIC
      });
      particleBody.addShape(shape);
      world.addBody(particleBody);
      particleBodiesRef.current.push(particleBody);
    }

    box.position.y = 4;
    box.position.x = -12;
    multiBox.position.y = 4;
    multiBox.position.x = 12;

    scene.add(box);
    scene.add(multiBox);

    const sphereUtils = new SphereUtils(scene, world, camera, textureLoader, plane);
    sphereUtils.createCannonSphere({ r: 10, w: 50, h: 50 }, randomHexColor(), { x: -10, y: 20, z: -80 }, 10.1, shader.shaderMaterials().sawMaterial);

    const sandParticles = new SandParticles(scene, world, shader.shaderMaterials().sawMaterial, 40);
    sandParticles.createNoiseParticles(60, 1.4);// Assuming you have access to both `scene` and `camera` objects

    // Pass both scene and camera to the FontMaker constructor
    const fontMaker = new FontMaker(scene, camera, navigate);

    // Load the font and create the text mesh
    fontMaker.loadFont(() => {
      fontMaker.createTextMesh('Falling Ghoasts Rush: Shoot Or Die!!!', {
        color: 0xff0000,
        size: 1.6,
        height: 0.3,
        position: { x: -10, y: -15, z: 40 }, // Adjust y-position to place text below main scene area
      });

      // Optionally enable raycasting for click detection
      fontMaker.enableRaycast();
    });

    // Event listeners for mouse movements and clicks
    const onMouseMove = (event) => fontMaker.onMouseMove(event);
    const onMouseClick = (event) => fontMaker.onMouseClick(event, '/Visuals');

    // Attach event listeners
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onMouseClick);

    // Handle mouse movements
    window.addEventListener('mousemove', (event) => {
      sphereUtils.updateHover(event);
    });

    // Handle clicks to create spheres
    window.addEventListener('click', () => {
      sphereUtils.handleClick(shader.shaderMaterials().wrinkledMaterial);
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

    // Handle window resizing and adjust font size based on screen width
    const handleWindowResize = () => {
      // Update camera and renderer on window resize
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);

      // Adjust font size based on the new window width
      fontMaker.adjustFontSize(fontMaker);
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

      shader.update();
      fontMaker.update();
      sphereUtils.update();
      sandParticles.update();
      shader.shaderMaterials().sawMaterial.uniforms.time.value = time + (Math.sin(time * 0.002));
      //shader.shaderMaterials().wrinkledMaterial.uniforms.time.value = time + (Math.sin(time * 0.002));
      shader.shaderMaterials().convolutionMaterial.uniforms.time.value = time + (Math.sin(time * 0.002));
      shader.time = time + (Math.sin(time * 0.002));
      shader.deltaTime = time + (Math.sin(time * 0.002));
      shader.explodeIntensity = time + (Math.sin(time * 0.002));

      // Render the scene
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      // Clean up the world and scene on unmount
      sandParticlesRef.current.forEach(mesh => scene.remove(mesh));
      renderer.dispose();
      fontMaker.dispose();
      sphereUtils.update();
      sandParticles.cleanup();
    };
  }, [width, height, particleCount]);

  return <canvas ref={canvasRef} className="galaxial-animation" />;
};

export default BrokenFlashes;