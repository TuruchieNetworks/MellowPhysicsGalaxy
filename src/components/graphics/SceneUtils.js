// import * as THREE from 'three';
// import randomHexColor from '../hooks/UseColorUtils';
// import stars from '../../galaxy_imgs/stars.jpg';
// import nebula from '../../galaxy_imgs/nebula.jpg';

// class SceneUtils {
//     constructor(scene, world, width, height, groundColor = 0x00ff00) {
//         this.scene = scene;
//         this.world = world;

//         // Set up background textures for the cube environment
//         this.starTextures = [stars, stars, stars, stars, nebula, nebula];
//         this.cubeTextureLoader = new THREE.CubeTextureLoader();
//         this.scene.background = this.cubeTextureLoader.load(this.starTextures);
//         this.renderer = new THREE.WebGLRenderer({ antialias: true });

//         // Set up background textures for the cube environment
//         this.starTextures = [stars, stars, stars, stars, nebula, nebula];
//         this.cubeTextureLoader = new THREE.CubeTextureLoader();
//         this.scene.background = this.cubeTextureLoader.load(this.starTextures);

//         // Load nebula texture
//         this.textureLoader = new THREE.TextureLoader();
//         this.loadNebulaTexture(nebula, true); // true to set as background

//         // Set renderer size and append to the specified container
//         this.renderer.setSize(width, height);

//         // Add invisible ground to physics world
//         this.physicsGround = this.createInvisiblePhysicsGround();
//         // this.world.addBody(this.physicsGround);

//         // // Physics world setup
//         // this.world = new CANNON.World();
//         // this.world.broadphase = new CANNON.NaiveBroadphase();
//         this.world.solver.iterations = 10;

//         // Set up the ground with a configurable color
//         this.ground = this.createPlaneGround(groundColor);
//         // this.scene.add(this.ground);

//         // // Load nebula texture
//         // this.textureLoader = new THREE.TextureLoader();
//         // this.loadNebulaTexture(nebula, true); // true to set as background
//     }

//     loadNebulaTexture(texturePath, setAsBackground = false) {
//         this.textureLoader.load(texturePath, (texture) => { 
//             if (setAsBackground) {
//                 this.scene.background = texture;
//             } else {
//                 // Apply texture to other objects or materials as needed
//                 const material = new THREE.MeshBasicMaterial({ map: texture });
//                 const skybox = new THREE.Mesh(new THREE.BoxGeometry(1000, 1000, 1000), material);
//                 this.scene.add(skybox);
//             }
//         });
//     }

//     // Plane Solid Ground
//     createPlaneGround(color) {
//         const groundGeometry = new THREE.PlaneGeometry(20, 20);
//         const groundMaterial = new THREE.MeshStandardMaterial({ color });
//         const ground = new THREE.Mesh(groundGeometry, groundMaterial);
//         ground.rotation.x = -Math.PI / 2;
//         ground.position.y = -1;
//         ground.receiveShadow = true;
//         return ground;
//     }

//     // Physics Invisible Ground
//     createInvisiblePhysicsGround() {
//         // const groundBody = new CANNON.Body({
//         //     mass: 0, // Mass of 0 means it's static (invisible)
//         //     position: new CANNON.Vec3(0, -1, 0), // Set its position in the physics world
//         //     shape: new CANNON.Plane(), // Create a plane shape
//         // });
//         // groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2); // Rotate it
//         // return groundBody;
//     }

//     setGravity(x = 0, y = -9.82, z = 0) {
//         this.world.gravity.set(x, y, z);
//     }

//     mountScene() {
//       return this.scene
//     }
//     addObject(object) {
//         this.scene.add(object);
//     }

// }

// export default SceneUtils;
