import * as THREE from 'three';
import { Geometry } from '../animation-graphics/Geometry';

class SceneManager {
    constructor(width = window.innerWidth, height = window.innerHeight, groundColor = 0x00aa00) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(width, height);
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);

        // Initialize Geometry
        this.geometry = new Geometry(this.scene);

        // Camera positioning
        this.camera.position.z = 30;

        // Set up the ground with a configurable color
        this.ground = this.createGround(groundColor);
        this.scene.add(this.ground);

        // Optional grid helper (remove or comment if not needed)
        this.gridHelper = new THREE.GridHelper(20, 20);
        this.scene.add(this.gridHelper);

        // Handle resizing
        window.addEventListener('resize', this.onWindowResize);
    }

    createGround(color) {
        const groundGeometry = new THREE.PlaneGeometry(20, 20);
        const groundMaterial = new THREE.MeshStandardMaterial({ color });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -1;
        ground.receiveShadow = true;
        return ground;
    }

    onWindowResize = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    };

    getRenderer() {
        return this.renderer;
    }

    getScene() {
        return this.scene;
    }

    getCamera() {
        return this.camera;
    }

    animate = () => {
        requestAnimationFrame(this.animate);

        // Update geometries
        this.geometry.update();

        this.renderer.render(this.scene, this.camera);
    };

    start() {
        this.animate();
    }
}

export default SceneManager;