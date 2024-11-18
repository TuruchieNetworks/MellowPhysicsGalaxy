import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import stars from '../../galaxy_imgs/stars.jpg';
import nebula from '../../galaxy_imgs/nebula.jpg';

import FontMaker from './FontMaker';
import ImageUtils from './ImageUtils';

export class SceneManager {
    constructor(scene, world, canvasRef, width = window.innerWidth, height = window.innerHeight, groundColor = 0x00ff00) {
        this.scene = scene;
        this.world = world;
        this.width = width;
        this.height = height;
        this.canvasRef = canvasRef;
        this.groundColor = groundColor;
        this.textureLoader = new THREE.TextureLoader();
        this.cubeTextureLoader = new THREE.CubeTextureLoader();

        // Initialize core components
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvasRef, antialias: true });
        this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000);

        // Initialize utilities
        this.imageUtils = new ImageUtils();
        this.fontMaker = new FontMaker(this.scene);

        this.meshes = [];
        this.materials = [];
        this.geometries = [];

        // this.init();
    }

    init() {
        this.addFog(); // Add fog to scene
        this.loadTextures(); // Load textures and set background
        this.adjustFontSize(); // Initial font adjustment
        this.initializeCamera();
        this.initializeRenderer();
        this.initializePhysics();
        // this.initializeGround();

        window.addEventListener('resize', this.onWindowResize);
    }

    // Initialize camera
    initializeCamera() {
        this.camera.position.set(-1, 0, 30);
        this.scene.add(this.camera);
    }

    // Initialize renderer
    initializeRenderer() {
        this.renderer.setSize(this.width, this.height);
        this.renderer.shadowMap.enabled = true; // Enable shadows
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    // Initialize physics world
    initializePhysics() {
        this.world.gravity.set(0, -9.81, 0);
        this.world.broadphase = new CANNON.NaiveBroadphase();
        this.world.solver.iterations = 10;
        this.physicsGround = this.createInvisiblePhysicsGround();
        this.world.addBody(this.physicsGround);
    }

    // Initialize ground with specified color
    initializeGround() {
        this.ground = this.createPlaneGround(this.groundColor);
        this.scene.add(this.ground);
    }

    // Loads galaxy textures and applies them to the environment
    loadTextures() {
        this.loadCubeTextures(true);
    }

    // Apply cube texture as background
    applyCubeTextures(textures) {
        const cubeTextureLoader = new THREE.CubeTextureLoader();
        this.scene.background = cubeTextureLoader.load(textures);
    }

    // Load nebula texture with option to set as background
    loadCubeTextures(setAsBackground = false) {
        const galaxyImages = this.imageUtils.getAllGalaxialImages();
        const nebulaTexture = galaxyImages.find(img => img.includes('nebula')) || nebula;
        const starsTexture = galaxyImages.find(img => img.includes('stars')) || stars;
            if (setAsBackground) { 
                this.scene.background = this.cubeTextureLoader.load([
                    starsTexture,
                    starsTexture,
                    starsTexture,
                    starsTexture,
                    nebulaTexture,
                    nebulaTexture
                ]);
            }
    }

    // Add fog to the scene
    addFog() {
        this.scene.fog = new THREE.FogExp2(this.randomHexColor(), 0.01);
    }

    randomHexColor() {
        return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    }

    createPlaneGround(color) {
        const groundGeometry = new THREE.PlaneGeometry(20, 20);
        const groundMaterial = new THREE.MeshStandardMaterial({ color });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -1;
        ground.receiveShadow = true;
        return ground;
    }

    createInvisiblePhysicsGround() {
        const groundBody = new CANNON.Body({
            mass: 0,
            position: new CANNON.Vec3(0, -1, 0),
            shape: new CANNON.Plane(),
        });
        groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        return groundBody;
    }

    onWindowResize = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        if (this.fontMaker !== null && this.fontMaker.textMesh) {
            this.adjustFontSize();
        }
    };

    adjustFontSize() {
        const width = window.innerWidth;
        const newSize = width <= 700 ? 1.0 : 1.6;
        if (this.fontMaker && this.fontMaker.textMesh) {
            this.scene.remove(this.fontMaker.textMesh); // Remove existing text if needed
            this.fontMaker.adjustFontSize(newSize);
        }
    }

    update() {
        // Step the physics world
        const timeStep = 1 / 60;
        this.world.step(timeStep);

        // // Update any additional elements, like fonts or shaders
        // if (this.fontMaker) this.fontMaker.update();
        // if (this.shader) this.shader.update();
        // Render the scene
        this.renderer.render(this.scene, this.camera);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    cleanup() {
        this.renderer.dispose();
        this.geometries.forEach(geometry => geometry.dispose());
        this.materials.forEach(material => material.dispose());
        this.meshes.forEach(mesh => this.scene.remove(mesh));
        this.geometries = [];
        this.materials = [];
        this.meshes = [];
        window.removeEventListener('resize', this.onWindowResize);
    }
}
