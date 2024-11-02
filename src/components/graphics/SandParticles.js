import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class SandParticles {
    constructor(particleCount = 100, scene, world, randomColor ) {
        this.particles = [];
        this.scene = scene;
        this.world = world;
        this.particleCount = particleCount;
        this.randomColor = randomColor || 0xffffff; // Default color if not specified
    }

    // Initialization method to set up dependencies and particles
    initialize({ particleCount = 100, scene, world, randomColor }) {
        this.scene = scene;
        this.world = world;
        this.particleCount = particleCount;
        this.randomColor = randomColor;

        this.createParticles();
    }

    // Method to create particles and add them to the scene and physics world
    createParticles() {
        for (let i = 0; i < this.particleCount; i++) {
            const x = (Math.random() - 0.5) * 10;
            const y = Math.random() * 10 + 10;
            const z = (Math.random() - 0.5) * 10;

            // Three.js particle (instanced)
            const geometry = new THREE.SphereGeometry(0.2, 16, 16);
            const material = new THREE.MeshStandardMaterial({ color: this.randomColor });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(x, y, z);
            this.scene.add(mesh);

            // Cannon.js particle body
            const shape = new CANNON.Sphere(0.2);
            const body = new CANNON.Body({
                mass: 0.1,
                position: new CANNON.Vec3(x, y, z),
            });
            body.addShape(shape);
            this.world.addBody(body);

            // Store both mesh and body for updating
            this.particles.push({ mesh, body });
        }
    }

    // Sync each Three.js mesh with its corresponding Cannon.js body position
    update() {
        this.particles.forEach(({ mesh, body }) => {
            mesh.position.copy(body.position);
        });
    }

    // Optional method to retrieve the particles if needed externally
    getParticles() {
        return this.particles;
    }




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

}

export default SandParticles;
