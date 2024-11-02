import * as THREE from 'three';

export class SceneManager {
    constructor(width, height) {
        // Initialize scene, camera, and renderer
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        
        // Set renderer size and append to the specified container
        this.renderer.setSize(width, height);
    }

    getScene() {
        return this.scene; // Return the scene
    }

    getCamera() {
        return this.camera; // Return the camera
    }

    getRenderer() {
        return this.renderer; // Return the renderer
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

    cleanup() {
        // Clean up the renderer from the DOM
        this.renderer.dispose();
    }
}
