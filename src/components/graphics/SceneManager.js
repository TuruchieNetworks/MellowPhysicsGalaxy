import * as THREE from 'three';
import * as CANNON from "cannon-es";import stars from '../../galaxy_imgs/stars.jpg';
import nebula from '../../galaxy_imgs/nebula.jpg';

export class SceneManager {
    constructor(width, height, groundColor = 0x00ff00) { // Default ground color can be passed
        // Initialize scene, camera, and renderer
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });

        // Set up background textures for the cube environment
        this.starTextures = [stars, stars, stars, stars, nebula, nebula];
        this.cubeTextureLoader = new THREE.CubeTextureLoader();
        this.scene.background = this.cubeTextureLoader.load(this.starTextures);

        // Load nebula texture
        this.textureLoader = new THREE.TextureLoader();
        this.loadNebulaTexture(nebula, true); // true to set as background

        // Set renderer size and append to the specified container
        this.renderer.setSize(width, height);

        // Physics world setup
        this.world = new CANNON.World();
        this.world.broadphase = new CANNON.NaiveBroadphase();
        this.world.solver.iterations = 10;

        // Add invisible ground to physics world
        this.physicsGround = this.createInvisiblePhysicsGround();
        this.world.addBody(this.physicsGround);

        // Set up the ground with a configurable color
        this.ground = this.createPlaneGround(groundColor);
        this.scene.add(this.ground);

        // Initialize arrays to keep track of resources for cleanup
        this.geometries = [];
        this.materials = [];
        this.meshes = [];

        // Custom Atr
        this.groundColor = groundColor; 

        // Handle resizing
        window.addEventListener('resize', this.onWindowResize);
    }

    loadNebulaTexture(texturePath, setAsBackground = false) {
        this.textureLoader.load(texturePath, (texture) => { 
            if (setAsBackground) {
                this.scene.background = texture;
            } else {
                // Apply texture to other objects or materials as needed
                const material = new THREE.MeshBasicMaterial({ map: texture });
                const skybox = new THREE.Mesh(new THREE.BoxGeometry(1000, 1000, 1000), material);
                this.scene.add(skybox);
            }
        });
    }

    // Plane Solid Ground
    createPlaneGround(color) {
        const groundGeometry = new THREE.PlaneGeometry(20, 20);
        const groundMaterial = new THREE.MeshStandardMaterial({ color });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -1;
        ground.receiveShadow = true;
        return ground;
    }

    // Physics Invisible Ground
    createInvisiblePhysicsGround() {
        const groundBody = new CANNON.Body({
            mass: 0, // Mass of 0 means it's static (invisible)
            position: new CANNON.Vec3(0, -1, 0), // Set its position in the physics world
            shape: new CANNON.Plane(), // Create a plane shape
        });
        groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2); // Rotate it
        return groundBody;
    }

    setGravity(x = 0, y = -9.82, z = 0) {
        this.world.gravity.set(x, y, z);
    }

    getScene() {
        return this.scene;
    }

    getCamera() {
        return this.camera;
    }

    getRenderer() {
        return this.renderer;
    }

    getWorld() {
        return this.world;
    }

    getPhysicsGround() {
        return this.physicsGround;
    }

    update() {
        // Render the scene with the camera
        this.renderer.render(this.scene, this.camera);
    }

    resize(width, height) {
        // Handle window resizing
        this.camera.aspect = width / height; // Update camera aspect
        this.camera.updateProjectionMatrix(); // Update projection matrix
        this.renderer.setSize(width, height); // Set new renderer size
    }

    onWindowResize = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    };

    cleanup() {
        // Dispose of renderer
        this.renderer.dispose();

        // Dispose of all geometries
        this.geometries.forEach(geometry => geometry.dispose());
        this.geometries = [];

        // Dispose of all materials
        this.materials.forEach(material => material.dispose());
        this.materials = [];

        // Remove all meshes from the scene
        this.meshes.forEach(mesh => this.scene.remove(mesh));
        this.meshes = [];

        // Remove event listener
        window.removeEventListener('resize', this.onWindowResize);

        // Clear references to the scene and camera
        this.scene = null;
        this.camera = null;
    }
}
