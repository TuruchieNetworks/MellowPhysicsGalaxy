import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import Shaders from './Shaders';

export class SandParticles {
    constructor(scene, world, material = new Shaders(), particleCount = 100) {
        this.scene = scene;
        this.world = world; 
        this.material = material;
        this.particleCount = particleCount;

        // Initializes an empty array to hold the particle meshes
        this.sandParticles = [];
        this.noiseParticles = []; 

        // Initializes an empty array to hold the Cannon.js bodies for particles
        this.particleBodies = [];
        this.noiseParticleBodies = []; 

        // Initialize particles when the class is instantiated
        //this.addParticles();  // Calls the method to create and add particles to the scene and physics world
    }

    randomHexColor() {
        return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    }

    // Method to create particles and add them to the scene and physics world
    addParticles() {
        for (let i = 0; i < this.particleCount; i++) {
            // Create Three.js mesh
            const geometry = new THREE.SphereGeometry(0.2, 16, 16);
            const material = new THREE.MeshStandardMaterial({ color: this.randomHexColor() });
            const mesh = new THREE.Mesh(geometry, material);
            const x = (Math.random() - 0.5) * 10;
            const y = Math.random() * 10 + 10; // Start above the ground
            const z = (Math.random() - 0.5) * 10;
            mesh.position.set(x, y, z);

            this.sandParticles.push(mesh);
            this.scene.add(mesh);

            // Create Cannon.js body
            const shape = new CANNON.Sphere(0.2);
            const particleBody = new CANNON.Body({
                mass: 1.0, // Adjust mass for proper falling behavior
                position: new CANNON.Vec3(x, y, z),
                linearDamping: 0.5, // Damping to simulate air resistance
            });

            particleBody.allowSleep = true;  // Allow particles to sleep when at rest
            particleBody.sleepSpeedLimit = 3.1; // Lower speed threshold for sleeping
            particleBody.sleepTimeLimit = 3;  //

            particleBody.addShape(shape);
            this.particleBodies.push(particleBody);
            this.world.addBody(particleBody);
        }
    }

    // Method to create the particles
    createNoiseParticles(radius = 1.6) {
        for (let i = 0; i < this.particleCount; i++) {
            // Create Three.js particle
            const geometry = new THREE.SphereGeometry(radius, 16, 16);
            const material = this.material;
            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;

            // Set random position
            mesh.position.set(
                (Math.random() - 0.5) * 10,
                Math.random() * 10 + 10,
                (Math.random() - 0.5) * 10
            );

            // Add particle mesh to the scene
            this.scene.add(mesh);
            this.noiseParticles.push(mesh);

            // Create Cannon.js physics body
            const body = new CANNON.Sphere(1.6);
            const particleBody = new CANNON.Body({
                mass: 13.1,
                position: new CANNON.Vec3(mesh.position.x, mesh.position.y, mesh.position.z),
            });

            particleBody.addShape(body);
            particleBody.allowSleep = true;  // Allow particles to sleep when at rest
            particleBody.sleepSpeedLimit = 3.1; // Lower speed threshold for sleeping
            particleBody.sleepTimeLimit = 3;  // Time required to enter sleep state

            // Add the particle body to the world
            this.world.addBody(particleBody);
            this.noiseParticleBodies.push(particleBody);
        }
    }

    // Sync each Three.js mesh with its corresponding Cannon.js body position
    update() {
        if (this.sandParticles.length === this.particleBodies.length) {
            this.sandParticles.forEach((mesh, index) => {
                const body = this.particleBodies[index]; // Get the corresponding Cannon body
                if (body) {
                    // Only copy position if body is defined
                    mesh.position.copy(body.position);
                    mesh.quaternion.copy(body.quaternion); // Sync rotation as well if needed
                } else {
                    console.warn(`Cannon body not found for mesh at index ${index}`);
                }
            });
        } else {
            console.warn("Mismatch in the number of sand particles and particle bodies");
        }

        for (let i = 0; i < this.noiseParticles.length; i++) {
          const mesh = this.noiseParticles[i];
          const body = this.noiseParticleBodies[i];
    
          mesh.position.copy(body.position);  // Sync mesh with physics body position
        }
    }

    // Optional method to retrieve the particles if needed externally
    getParticles() {
        return this.sandParticles;
    }

    // Optional method to retrieve the Cannon Bodies if needed externally
    getParticleBodies() {
        return this.particleBodies;
    }
}

export default SandParticles;





















    // // Initialization method to set up dependencies and particles
    // initialize({ particleCount = 100, scene, world, randomColor }) {
    //     this.scene = scene;
    //     this.world = world;
    //     this.particleCount = particleCount;
    //     this.randomColor = randomColor;

    //     this.createParticles();
    // }
    // constructor() { 
    //     const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);  
        
    //     const scene = new THREE.Scene();
    //     const world = new CANNON.World(); 

    //     // Generate random position within the specified range
    //     const x = (Math.random() - 0.5) * 10;
    //     const y = Math.random() * 10 + 10;
    //     const z = (Math.random() - 0.5) * 10;

    //     // Three.js particle (instanced)
    //     const geometry = new THREE.SphereGeometry(0.2, 16, 16);
    //     const material = new THREE.MeshStandardMaterial({ color: randomColor });

    //     this.mesh = new THREE.Mesh(geometry, material);
    //     this.mesh.position.set(x, y, z);
    //     scene.add(this.mesh);

    //     // Cannon.js particle body
    //     const shape = new CANNON.Sphere(0.2);
    //     this.body = new CANNON.Body({
    //         mass: 0.1,
    //         position: new CANNON.Vec3(x, y, z),
    //     });
    //     this.body.addShape(shape);
    //     world.addBody(this.body);
    // }

    // // Sync the Three.js mesh with the Cannon.js body position
    // update() {
    //     this.mesh.position.copy(this.body.position);
    // }
