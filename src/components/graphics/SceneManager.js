import * as THREE from 'three';

export class SceneManager {
    constructor() {
        // Initialize scene, camera, and renderer
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        
        // Set renderer size and append to document body
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
    }

    update() {
        // Render the scene with the camera
        this.renderer.render(this.scene, this.camera);
    }

    resize() {
        // Handle window resizing
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;

        this.camera.aspect = newWidth / newHeight; // Update camera aspect
        this.camera.updateProjectionMatrix(); // Update projection matrix
        this.renderer.setSize(newWidth, newHeight); // Set new renderer size
    }

    cleanup() {
        // Clean up the renderer from the DOM
        document.body.removeChild(this.renderer.domElement);
    }
}