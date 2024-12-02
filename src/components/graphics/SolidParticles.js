import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'; import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import Shaders from './Shaders';
import ImageUtils from './ImageUtils';

export class SolidParticles {
  constructor(scene, world, material = new Shaders().shaderMaterials().convolutionMaterial, particleCount = 100) {
    this.scene = scene;
    this.world = world;
    this.material = material;
    this.shader = new Shaders();
    this.particleCount = particleCount;

    // Initialize ImageUtils and raycaster
    this.imageUtils = new ImageUtils();
    this.textureURL = this.imageUtils.getRandomImage('concerts');
    this.textureLoader = new THREE.TextureLoader();
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Instanced Meshes and Transporter
    this.gltfMesh = null;
    this.gltfMaterial = null;
    this.instancedMesh = null;
    this.matrix = new THREE.Matrix4();
    this.transporter = new THREE.Object3D();
    this.gtlfTransporter = new THREE.Object3D();


    this.gltfLoader = new GLTFLoader();
    this.rgbeLoader = new RGBELoader();

    // Initializes an empty array to hold the particle meshes
    this.particleMeshes = [];

    // Initializes an empty array to hold the Cannon.js bodies for particleMeshes
    this.particleBodies = [];

    this.randomForce = this.addRandomForce();
  }

  randomHexColor() {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  }

  randomFloat32ArrayColor(count) {
    const colors = new Float32Array(count * 3); // RGB for each instance
    for (let i = 0; i < count; i++) {
      colors[i * 3] = Math.random();      // R
      colors[i * 3 + 1] = Math.random();  // G
      colors[i * 3 + 2] = Math.random();  // B
    }
    return colors;
  }

  generateRandomColors(count, min = 0, max = 1) {
    const colors = new Float32Array(count * 3); // RGB for each instance
    for (let i = 0; i < count; i++) {
      colors[i * 3] = Math.random() * (max - min) + min;      // R
      colors[i * 3 + 1] = Math.random() * (max - min) + min;  // G
      colors[i * 3 + 2] = Math.random() * (max - min) + min;  // B
    }
    return colors;
  }

  createRandomPoints() {
    const x = (Math.random() - 0.5) * 10;
    const y = Math.random() * 10 + 10;
    const z = (Math.random() - 0.5) * 10;
    return { x, y, z }
  }

  createRandomRotationValues() {
    const x = Math.random() * 2 * Math.PI;
    const y = Math.random() * 2 * Math.PI;
    const z = Math.random() * 2 * Math.PI;
    return { x, y, z }
  }

  addRandomForce() {
    const randomForce = new CANNON.Vec3(
      Math.random() * 5 - 2.5,
      Math.random() * 5 + 10,
      Math.random() * 5 - 2.5
    );

    return randomForce;
  }

  addParticles(count = this.particleCount) {
    for (let i = 0; i < count; i++) {
      // Create Three.js mesh
      const geometry = new THREE.SphereGeometry(0.2, 16, 16);
      const material = new THREE.MeshStandardMaterial({ color: this.randomHexColor() });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;

      // Set random position
      const pos = this.createRandomPoints();
      mesh.position.set(pos.x, pos.y, pos.z);

      this.particleMeshes.push(mesh);
      this.scene.add(mesh);

      // Create Cannon.js body
      const shape = new CANNON.Sphere(0.2);
      const particleBody = new CANNON.Body({
        mass: 0.5, // Adjust mass for better fall behavior
        position: new CANNON.Vec3(mesh.position.x, mesh.position.y, mesh.position.z),
        linearDamping: 0.1, // Reduced damping for more natural fall
      });
      const randomForce = this.randomForce;
      particleBody.applyForce(randomForce, particleBody.position);

      // Allow sleep with adjusted limits
      particleBody.allowSleep = true;
      particleBody.sleepSpeedLimit = 1.0;  // Adjust sleeping speed
      particleBody.sleepTimeLimit = 5;    // 1; // Allow sleep to take a bit longer
      particleBody.addShape(shape);

      this.particleBodies.push(particleBody);
      this.world.addBody(particleBody);
    }
  }

  addInstancedParticles(count = 1000) {
    const geometry = new THREE.IcosahedronGeometry();
    let material;
    if (i % 2 === 1) {
      material = this.material;
    } else {
      material = new THREE.MeshPhongMaterial({
        color: this.randomHexColor()
      });
    };
    // Create Instance Of Instanced Mesh Geo Mat and Number Of Particles
    this.instancedMesh = new THREE.InstancedMesh(geometry, material, count);
    this.scene.add(this.instancedMesh); // Scene Should Reveal 10000 Particles Stacked On top Of Each Other Seaming like ONE.

    for (let i = 0; i < count; i++) {
      const pos = this.createRandomPoints();
      this.transporter.position.set(pos.x, pos.y, pos.z);

      const rot = this.createRandomRotationValues();
      this.transporter.rotation.set(rot.x, rot.y, rot.z);

      this.transporter.scale.setScalar(Math.random()); // Uniform random scaling

      this.transporter.updateMatrix();
      this.instancedMesh.setMatrixAt(i, this.transporter.matrix);

      // Update color
      this.instancedMesh.setColorAt(i, new THREE.Color(this.randomHexColor()));

      /*/ Optionally
      const float32Colors = this.randomFloat32ArrayColor();
      geometry.setAttribute('color', new THREE.InstancedBufferAttribute(float32Colors, 3));
      const material = new THREE.MeshPhongMaterial({
          vertexColors: true,
      });
      */
    }

    this.instancedMesh.instanceMatrix.needsUpdate = true;
    return this.instancedMesh;
  }

  addCannonInstancedParticles(count = 1000) {
    const geometry = new THREE.IcosahedronGeometry(0.2, 4, 4);
    const material = this.material || new THREE.MeshPhongMaterial({ color: this.randomHexColor() });

    // Create instanced mesh
    this.instancedMesh = new THREE.InstancedMesh(geometry, material, count);
    this.scene.add(this.instancedMesh);

    // Initialize physics bodies and instanced matrix updates
    for (let i = 0; i < count; i++) {
      // Set random positions and rotations
      const pos = this.createRandomPoints();
      const rot = this.createRandomRotationValues();

      // Create a physics body for Cannon.js
      const shape = new CANNON.Sphere(0.2); // Match geometry size
      const body = new CANNON.Body({
        mass: 0.5, // Adjust for desired physics behavior
        position: new CANNON.Vec3(pos.x, pos.y, pos.z),
      });
      body.addShape(shape);
      body.quaternion.setFromEuler(rot.x, rot.y, rot.z);

      // Apply random force for motion
      // const randomForce = new CANNON.Vec3(
      //   (Math.random() - 0.5) * 10,
      //   (Math.random() - 0.5) * 10,
      //   (Math.random() - 0.5) * 10
      // );
      const randomForce = this.randomForce
      body.applyForce(randomForce, body.position);

      // Add physics body to world and store it
      this.world.addBody(body);
      this.particleBodies.push(body);

      // Set initial transformation in the instanced mesh
      this.transporter.position.set(pos.x, pos.y, pos.z);
      this.transporter.rotation.set(rot.x, rot.y, rot.z);
      this.transporter.updateMatrix();
      this.instancedMesh.setMatrixAt(i, this.transporter.matrix);

      // Optionally update color
      this.instancedMesh.setColorAt(i, new THREE.Color(this.randomHexColor()));
    }

    this.instancedMesh.instanceMatrix.needsUpdate = true; // Ensure changes reflect visually
  }

  addInstancedGLTFs() {
    // Load HDR environment texture
    this.rgbeLoader.load('/rosendal_plains_1_1k.hdr', (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      this.scene.environment = texture; // Ensure this refers to the instance
  
      // Load GLTF model
      this.gltfLoader.load('/monkeyUrl.glb', (glb) => {
        // Extract Mesh
        const mesh = glb.scene.getObjectByName('monkeyUrl');
  
        if (!mesh) {
          console.error('Mesh with name "monkeyUrl" not found in GLTF file.');
          return;
        }
  
        // Extract Geometry and Clone
        const geometry = mesh.geometry.clone();
  
        // Extract Material
        this.gltfMaterial = mesh.material;
  
        // Create Instanced Mesh
        this.gltfMesh = new THREE.InstancedMesh(geometry, this.gltfMaterial, 10000);
        this.scene.add(this.gltfMesh);
  
        // Initialize instanced mesh with random transformations
        for (let i = 0; i < 10000; i++) {
          const pos = this.createRandomPoints();
          const rot = this.createRandomRotationValues();
  
          this.gtlfTransporter.position.set(pos.x, pos.y, pos.z);
          this.gtlfTransporter.rotation.set(rot.x, rot.y, rot.z);
  
          // Apply random scaling
          const scale = 0.04 * Math.random();
          this.gtlfTransporter.scale.set(scale, scale, scale);
  
          // Update matrix and apply to instanced mesh
          this.gtlfTransporter.updateMatrix();
          this.gltfMesh.setMatrixAt(i, this.gtlfTransporter.matrix);
  
          // Optionally set a random color
          this.gltfMesh.setColorAt(i, new THREE.Color(this.randomHexColor()));
        }
  
        // Mark the instance matrix for an update
        this.gltfMesh.instanceMatrix.needsUpdate = true;
      });
    });
  }

  addInstancedCannonGLTFs(url, count = 10000) {
    this.gltfLoader.load(url, (gltf) => {
      const baseMesh = gltf.scene.children[0]; // Assume first child is the relevant mesh
      const geometry = baseMesh.geometry.clone(); // Clone geometry
      const material = baseMesh.material.clone(); // Clone material
  
      // Create an InstancedMesh for visual representation
      this.gltfMesh = new THREE.InstancedMesh(geometry, material, count);
      this.scene.add(this.gltfMesh);
  
      // Create Cannon.js bodies for physics simulation
      for (let i = 0; i < count; i++) {
        const pos = this.createRandomPoints();
        const rot = this.createRandomRotationValues();
  
        // Create a Cannon.js body
        const shape = new CANNON.Box(new CANNON.Vec3(0.1, 0.1, 0.1)); // Match approximate size
        const body = new CANNON.Body({
          mass: 0.5, // Adjust for desired physics
          position: new CANNON.Vec3(pos.x, pos.y, pos.z),
        });
        body.addShape(shape);
        body.quaternion.setFromEuler(rot.x, rot.y, rot.z);
  
        // Apply a random initial force
        const randomForce = new CANNON.Vec3(
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10
        );
        body.applyForce(randomForce, body.position);
  
        // Store the body and set up initial transformations for InstancedMesh
        this.world.addBody(body);
        this.gltfBodies.push(body);
  
        const tempObject = new THREE.Object3D();
        tempObject.position.copy(pos);
        tempObject.rotation.set(rot.x, rot.y, rot.z);
        tempObject.scale.setScalar(0.2); // Example scaling
        tempObject.updateMatrix();
  
        this.gltfMesh.setMatrixAt(i, tempObject.matrix); // Set initial transformation
        this.gltfMesh.setColorAt(i, new THREE.Color(this.randomHexColor())); // Optionally set a random color
      }
  
      this.gltfMesh.instanceMatrix.needsUpdate = true; // Reflect initial changes
    });
  }

  //   const matrix = new THREE.Matrix4();
  //   function animate(time) {
  //     if (this.gltfMesh) {
  //       for (let i = 0; i < 10000; i++) {
  //         this.gltfMesh.getMatrixAt(i, matrix);
  //         matrix.decompose(this.gtlfTransporter.position, this.gtlfTransporter.rotation, this.gtlfTransporter.scale);
    
  //         this.gtlfTransporter.rotation.x = ((i / 10000) * time) / 1000;
  //         this.gtlfTransporter.rotation.y = ((i / 10000) * time) / 500;
  //         this.gtlfTransporter.rotation.z = ((i / 10000) * time) / 1200;
    
  //         this.gtlfTransporter.updateMatrix();
  //         this.gltfMesh.setMatrixAt(i, this.gtlfTransporter.matrix);
  //       }
  //       this.gltfMesh.instanceMatrix.needsUpdate = true;
    
  //       this.gltfMesh.rotation.y = time / 10000;
  //     }
  // }
  // Optional method to retrieve the sand particleMeshes if needed externally
  getParticles() {
    return this.particleMeshes;
  }

  // Optional method to retrieve the Cannon.js bodies for sand particleMeshes
  getParticleBodies() {
    return this.particleBodies;
  }

  updateCannonParticles(deltaTime, count = this.particleBodies.length) {
    for (let i = 0; i < count; i++) {
      // Get the corresponding physics body
      const body = this.particleBodies[i];

      // Sync Three.js transporter with Cannon.js body position and rotation
      this.transporter.position.copy(body.position); // Update position
      this.transporter.quaternion.copy(body.quaternion); // Update rotation

      // Update the instance matrix for rendering
      this.transporter.updateMatrix();
      this.instancedMesh.setMatrixAt(i, this.transporter.matrix);

      // Optionally reset position if it goes out of bounds
      if (body.position.y < -10) {
        body.position.set(
          (Math.random() - 0.5) * 20, // Randomize x within range
          10,                         // Reset y to the top
          (Math.random() - 0.5) * 20  // Randomize z within range
        );
        body.velocity.set(0, 0, 0); // Reset velocity
        body.angularVelocity.set(0, 0, 0); // Reset angular velocity
      }
    }

    // Notify Three.js of updated instance matrices
    this.instancedMesh.instanceMatrix.needsUpdate = true;

    // Step the physics world
    this.world.step(1 / 60, deltaTime, 3); // Adjust step parameters as needed
  }
  
  updateGTLFs(deltaTime) {
    if (!this.gltfMesh || this.particleBodies.length === 0) return;
  
    const tempMatrix = new THREE.Matrix4(); // Temporary matrix for transformations
    const tempObject = new THREE.Object3D(); // Temporary Object3D for syncing
  
    for (let i = 0; i < this.gltfBodies.length; i++) {
      const body = this.particleBodies[i];
  
      // Sync position and rotation from Cannon.js body
      tempObject.position.copy(body.position);
      tempObject.quaternion.copy(body.quaternion);
  
      // Apply transformations to the InstancedMesh
      tempObject.updateMatrix();
      tempMatrix.copy(tempObject.matrix);
  
      this.gltfMesh.setMatrixAt(i, tempMatrix); // Update instance matrix
    }
  
    this.gltfMesh.instanceMatrix.needsUpdate = true; // Notify Three.js of changes
  
    // Step the Cannon.js world
    this.world.step(1 / 60, deltaTime, 10);
  }

  updatePhysics(deltaTime, mesh, bodies, resetY = -10, resetHeight = 10, resetRange = 20) {
    if (!mesh || bodies.length === 0) return;
  
    const tempMatrix = new THREE.Matrix4();
    const tempObject = new THREE.Object3D();
  
    for (let i = 0; i < bodies.length; i++) {
      const body = bodies[i];
  
      // Sync position and rotation
      tempObject.position.copy(body.position);
      tempObject.quaternion.copy(body.quaternion);
  
      // Apply transformations to the mesh
      tempObject.updateMatrix();
      tempMatrix.copy(tempObject.matrix);
      mesh.setMatrixAt(i, tempMatrix);
  
      // Optional: Reset out-of-bounds bodies
      if (body.position.y < resetY) {
        body.position.set(
          (Math.random() - 0.5) * resetRange, // Randomize x
          resetHeight,                       // Reset y
          (Math.random() - 0.5) * resetRange // Randomize z
        );
        body.velocity.set(0, 0, 0); // Reset velocity
        body.angularVelocity.set(0, 0, 0); // Reset angular velocity
      }
    }
  
    // Notify Three.js of updates
    mesh.instanceMatrix.needsUpdate = true;
  
    // Step the physics world
    this.world.step(1 / 60, deltaTime, 3);
  }

  updateCannonPhysics(deltaTime) {
    this.updatePhysics(deltaTime, this.instancedMesh, this.particleBodies);
  }

  updateGTLFPhysics(deltaTime) {
    this.updatePhysics(deltaTime, this.gltfMesh, this.gltfBodies);
  }

  update(time, count) {
    for (let i = 0; i < count; i++) {
      // Retrieve the matrix of the current instance
      this.instancedMesh.getMatrixAt(i, this.matrix);

      // Decompose the matrix into position, rotation, and scale
      this.matrix.decompose(this.transporter.position, this.transporter.rotation, this.transporter.scale);

      // Update rotation dynamically
      this.transporter.rotation.x += (i / count) * (time / 1000); // Incremental rotation
      this.transporter.rotation.y += (i / count) * (time / 500);
      this.transporter.rotation.z += (i / count) * (time / 1200);

      // Apply movement (e.g., simulate gravity or sinking effect)
      this.transporter.position.y -= 0.01;

      // Handle boundaries (e.g., reset position if it goes out of view)
      if (this.transporter.position.y < -10) {
        this.transporter.position.y = 10; // Reset to top
      }

      // Recalculate the instance matrix
      this.transporter.updateMatrix();
      this.instancedMesh.setMatrixAt(i, this.transporter.matrix);
    }

    // Notify Three.js that the instance matrices have been updated
    this.instancedMesh.instanceMatrix.needsUpdate = true;
  }

  // Cleanup method to remove all particleMeshes and bodies from the scene and world
  cleanup() {
    // Remove sand particleMeshes and their Cannon bodies
    this.particleMeshes.forEach((mesh) => this.scene.remove(mesh));
    this.particleBodies.forEach((body) => this.world.removeBody(body));

    // Dispose of materials and geometries if needed
    this.particleMeshes.forEach((mesh) => {
      mesh.geometry.dispose();
      mesh.material.dispose();
    });
  }
}

export default SolidParticles;



















// const renderer = new THREE.WebGLRenderer({ antialias: true });
// renderer.setSize(window.innerWidth, window.innerHeight);
// document.body.appendChild(renderer.domElement);

// // Sets the color of the background.
// renderer.setClearColor(0xfefefe);

// const scene = new THREE.Scene();
// const camera = new THREE.PerspectiveCamera(
//   45,
//   window.innerWidth / window.innerHeight,
//   0.1,
//   1000
// );

// // Sets orbit control to move the camera around.
// const orbit = new OrbitControls(camera, renderer.domElement);

// // Camera positioning.
// camera.position.set(6, 8, 14);
// // Has to be done everytime we update the camera position.
// orbit.update();

// const ambientLight = new THREE.AmbientLight(0x333333);
// scene.add(ambientLight);

// const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
// directionalLight.position.set(0, 10, 10);
// scene.add(directionalLight);

// const geometry = new THREE.IcosahedronGeometry();
// const material = new THREE.MeshPhongMaterial();
// const mesh = new THREE.InstancedMesh(geometry, material, 10000);
// scene.add(mesh);

