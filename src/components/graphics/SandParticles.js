import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import Shaders from './Shaders';
import ImageUtils from './ImageUtils';

export class SandParticles {
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

        // Initializes an empty array to hold the particle meshes
        this.sandParticles = [];
        this.noiseParticles = []; 

        // Initializes an empty array to hold the Cannon.js bodies for particles
        this.particleBodies = [];
        this.noiseParticleBodies = [];

        this.ghostParticles = [];
        this.ghostBodies = [];

        this.randomForce = this.addRandomForce();
    }

    randomHexColor() {
        return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    }

    createRandomPoints() {    
        const x = (Math.random() - 0.5) * 10;
        const y = Math.random() * 10 + 10;
        const z = (Math.random() - 0.5) * 10;
        return {x, y, z}
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
            const x = (Math.random() - 0.5) * 10;
            const y = Math.random() * 10 + 10; // Start above the ground
            const z = (Math.random() - 0.5) * 10;
            mesh.position.set(x, y, z);
    
            this.sandParticles.push(mesh);
            this.scene.add(mesh);
    
            // Create Cannon.js body
            const shape = new CANNON.Sphere(0.2);
            const particleBody = new CANNON.Body({
                mass: 0.5, // Adjust mass for better fall behavior
                position: new CANNON.Vec3(x, y, z),
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

    // Method to create the particles
    createNoiseParticles(count = this.particleCount, radius = 1.6, mat = this.shader.shaderMaterials().sawMaterial, defMat = this.material) {
        for (let i = 0; i < count; i++) {
            // Create Three.js particle
            let material;
            const geometry = new THREE.SphereGeometry(radius, 16, 16);
            i % 2 === 0 ? 
                material = defMat:
                material = mat
            ;

            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;

            const pos = this.createRandomPoints();

            // Set random position
            mesh.position.set(pos.x, pos.y, pos.z);

            // const intersects = this.raycaster.intersectObjects(this.scene.children);
            // if (intersects.length > 0 && intersects[0].object.userData.clickable) {
            //     document.body.style.cursor = 'pointer';
        
            // //   // Check if textMesh exists and has a material before setting it
            // //   if (mesh && mesh.material) { // !== this.shader.shaderMaterials().noiseMaterial) {
            // //     mesh.material = this.shader.shaderMaterials().noiseMaterial;
            // //   }
            // } else {
            //     document.body.style.cursor = 'default';
            // //   if (mesh) {
            // //     mesh.material = new THREE.MeshPhongMaterial({ map: this.textureLoader.load(this.textureURL) });
            // //   }
            // }

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

    // Method to create the particles
    createDarkFlashNoiseParticles(count = this.particleCount, radius = 1.6, mat = this.shader.shaderMaterials().wrinkledMaterial) {
        for (let i = 0; i < count; i++) {
            // Create Three.js particle
            let material;
            const geometry = new THREE.SphereGeometry(radius, 16, 16);

            i % 2 === 0 ? 
                material = this.material:
                material = mat
            ;

            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;

            const pos = this.createRandomPoints();

            // Set random position
            mesh.position.set(pos.x, pos.y, pos.z);

            // const intersects = this.raycaster.intersectObjects(this.scene.children);
            // if (intersects.length > 0 && intersects[0].object.userData.clickable) {
            //     document.body.style.cursor = 'pointer';
        
            // //   // Check if textMesh exists and has a material before setting it
            // //   if (mesh && mesh.material) { // !== this.shader.shaderMaterials().noiseMaterial) {
            // //     mesh.material = this.shader.shaderMaterials().noiseMaterial;
            // //   }
            // } else {
            //     document.body.style.cursor = 'default';
            // //   if (mesh) {
            // //     mesh.material = new THREE.MeshPhongMaterial({ map: this.textureLoader.load(this.textureURL) });
            // //   }
            // }

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

    // Method to create the particles
    createFlashParticles(count = this.particleCount, radius = 1.6, mat = this.shader.shaderMaterials().explosiveMaterial) {
        for (let i = 0; i < count; i++) {
            // Create Three.js particle
            let material;
            const geometry = new THREE.SphereGeometry(radius, 16, 16);
            if (i % 2 === 1) {
                material = this.material;
            } else {
                material = mat;
            } 

            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;

            const pos = this.createRandomPoints();

            // Set random position
            mesh.position.set(pos.x, pos.y, pos.z);

            // const intersects = this.raycaster.intersectObjects(this.scene.children);
            // if (intersects.length > 0 && intersects[0].object.userData.clickable) {
            //     document.body.style.cursor = 'pointer';
        
            // //   // Check if textMesh exists and has a material before setting it
            // //   if (mesh && mesh.material) { // !== this.shader.shaderMaterials().noiseMaterial) {
            // //     mesh.material = this.shader.shaderMaterials().noiseMaterial;
            // //   }
            // } else {
            //     document.body.style.cursor = 'default';
            // //   if (mesh) {
            // //     mesh.material = new THREE.MeshPhongMaterial({ map: this.textureLoader.load(this.textureURL) });
            // //   }
            // }

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

    // Create ghost particles in the scene and physics world
    createGhosts(ghostCount = 60) {
        for (let i = 0; i < ghostCount; i++) {
            // Create Three.js ghost particle
            const geometry = new THREE.SphereGeometry(0.2, 16, 16);
            const material = new THREE.MeshStandardMaterial({ color: this.randomHexColor() });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(
                (Math.random() - 0.5) * 10,
                Math.random() * 10 + 10,
                (Math.random() - 0.5) * 10
            );

            this.scene.add(mesh);
            this.ghostParticles.push(mesh);

            // Create corresponding Cannon.js body for the ghost
            const shape = new CANNON.Sphere(0.2);
            const ghostBody = new CANNON.Body({
                mass: 0,  // Ghosts have no physics interactions
                position: new CANNON.Vec3(mesh.position.x, mesh.position.y, mesh.position.z),
            });
            ghostBody.addShape(shape);
            this.world.addBody(ghostBody);
            this.ghostBodies.push(ghostBody);
        }
    }

    // Call this method to initialize raycast listeners
    enableRaycast() {
        window.addEventListener('click', this.onMouseClick, false);
        window.addEventListener('mousemove', this.onMouseMove, false); // Add mousemove event listener
    }

    // Call this method to disable raycast listeners (e.g., on cleanup)
    disableRaycast() {
        window.removeEventListener('click', this.onMouseClick, false);
        window.removeEventListener('mousemove', this.onMouseMove, false); // Remove mousemove event listener
    }

    // Helper method for setting up raycaster
    setRaycasterFromMouse(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camera);
    }

    // Handle mouse move to change cursor style and material
    onMouseMove(event) {
        this.setRaycasterFromMouse(event);

        const intersects = this.raycaster.intersectObjects(this.scene.children);
        if (intersects.length > 0 && intersects[0].object.userData.clickable) {
        document.body.style.cursor = 'pointer';

        // Check if textMesh exists and has a material before setting it
        if (this.textMesh && this.textMesh.material !== this.shader.shaderMaterials().noiseMaterial) {
            this.textMesh.material = this.shader.shaderMaterials().noiseMaterial;
        }
        } else {
        document.body.style.cursor = 'default';
        if (this.textMesh) {
            this.textMesh.material = new THREE.MeshPhongMaterial({ map: this.textureLoader.load(this.textureURL) });
        }
        }
    }

    updateNoiseCannon() {
        if (this.noiseParticles.length === this.noiseParticleBodies.length) {
            for (let i = 0; i < this.noiseParticles.length; i++) {
                const mesh = this.noiseParticles[i];
                const body = this.noiseParticleBodies[i];
                mesh.position.copy(body.position); 
            }
        }
    }

    updateShaderRotation() {
        if (this.noiseParticles.length === this.noiseParticleBodies.length) {
            for (let i = 0; i < this.noiseParticles.length; i++) {
                if (this.noiseParticles[i].material === this.shader.shaderMaterials().noiseMaterial) {
                    const mesh = this.noiseParticles[i];
                    mesh.rotation.x += 0.1;
                    mesh.rotation.y += 0.1;
                    mesh.rotation.z += 0.2;
                }
        
            /* 
            const body = this.noiseParticleBodies[i];
             mesh.position.copy(body.position);  // Sync mesh with physics body position
            */
            }
        }
    }

    updateNoiseRotation() {
        if (this.noiseParticles.length === this.noiseParticleBodies.length) {
            for (let i = 0; i < this.noiseParticles.length; i++) {
            const mesh = this.noiseParticles[i];
            mesh.rotation.x += 0.1;
            mesh.rotation.y += 0.1;
            mesh.rotation.z += 0.2;
        
            /* 
            const body = this.noiseParticleBodies[i];
             mesh.position.copy(body.position);  // Sync mesh with physics body position
            */
            }
        }
    }

    update() {
        if (this.sandParticles.length === this.particleBodies.length) {
            this.sandParticles.forEach((mesh, index) => {
                mesh.rotation.x += 0.1;
                mesh.rotation.y += 0.1;
                mesh.rotation.z += 0.2;
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

        if (this.noiseParticles.length === this.noiseParticleBodies.length) {
            for (let i = 0; i < this.noiseParticles.length; i++) {
                const mesh = this.noiseParticles[i];
                mesh.rotation.x += 0.1;
                mesh.rotation.y += 0.1;
                mesh.rotation.z += 0.2;

                const body = this.noiseParticleBodies[i];
            
                mesh.position.copy(body.position);  // Sync mesh with physics body position
            }
        }

        if (this.ghostParticles.length === this.ghostBodies.length) {
            this.ghostParticles.forEach((mesh, i) => {
                mesh.rotation.x += 0.1;
                mesh.rotation.y += 0.1;
                mesh.rotation.z += 0.2;

                const body = this.ghostBodies[i];
                mesh.position.copy(body.position);
                mesh.quaternion.copy(body.quaternion);
            });
        }
    }

    // Cleanup method to remove all particles and bodies from the scene and world
    cleanup() {
        // Remove sand particles and their Cannon bodies
        this.sandParticles.forEach((mesh) => this.scene.remove(mesh));
        this.particleBodies.forEach((body) => this.world.removeBody(body));

        // Remove ghost particles and their Cannon bodies
        this.ghostParticles.forEach((mesh) => this.scene.remove(mesh));
        this.ghostBodies.forEach((body) => this.world.removeBody(body));

        // Dispose of materials and geometries if needed
        this.sandParticles.forEach((mesh) => {
            mesh.geometry.dispose();
            mesh.material.dispose();
        });

        this.ghostParticles.forEach((mesh) => {
            mesh.geometry.dispose();
            mesh.material.dispose();
        });
    }

    // Optional method to retrieve the sand particles if needed externally
    getSandParticles() {
        return this.sandParticles;
    }

    // Optional method to retrieve the ghost particles if needed externally
    getGhostParticles() {
        return this.ghostParticles;
    }

    // Optional method to retrieve the Cannon.js bodies for sand particles
    getParticleBodies() {
        return this.particleBodies;
    }

    // Optional method to retrieve the Cannon.js bodies for ghost particles
    getGhostBodies() {
        return this.ghostBodies;
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
