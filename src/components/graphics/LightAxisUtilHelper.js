import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class LightAxisUtilHelper {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;

        // Create initial helpers
        this.createInitialHelpers();
    }

    createInitialHelpers() {
        this.addAxesHelper(5); // Add axes helper with size 5
        this.addGridHelper(30, 30); // Add grid helper with size 30 and divisions 30
        this.addOrbitControls(); // Add orbit controls
    }

    // Add Axis Helper
    addAxesHelper(size = 5) {
        const axesHelper = new THREE.AxesHelper(size);
        this.scene.add(axesHelper);
    }

    // Add Grid Helper
    addGridHelper(size = 30, divisions = 30) {
        const gridHelper = new THREE.GridHelper(size, divisions);
        this.scene.add(gridHelper);
    }

    // Add helper for Directional Light
    addDirectionalLightHelper(directionalLight, size = 5) {
        const helper = new THREE.DirectionalLightHelper(directionalLight, size);
        this.scene.add(helper);
    }

    // Add helper for Camera
    addCameraHelper(camera) {
        const helper = new THREE.CameraHelper(camera);
        this.scene.add(helper);
    }

    // Add helper for Shadow Camera
    addShadowCameraHelper(light) {
        if (light.castShadow) {
            const helper = new THREE.CameraHelper(light.shadow.camera);
            this.scene.add(helper);
        }
    }

    // Add Ambient Light Helper
    addAmbientLightHelper(light) {
        if (!light) {
            console.error("Light object is undefined.");
            return;
        }
        
        const helperGeometry = new THREE.SphereGeometry(0.1, 8, 8); // Small sphere to represent ambient light
        const helperMaterial = new THREE.MeshBasicMaterial({ color: light.color });
        const helperMesh = new THREE.Mesh(helperGeometry, helperMaterial);
        
        // Default position if light.position is not set
        const position = light.position || new THREE.Vector3(0, 0, 0);
        helperMesh.position.copy(position); // Position it at the light's position
        this.scene.add(helperMesh);
    }

    // Add Spot Light Helper
    addSpotLightHelper(color = 0xffffff, intensity = 1, distance = 0, angle = Math.PI / 3, decay = 1) {
        const light = new THREE.SpotLight(color, intensity, distance, angle, decay);
        const spotLightHelper = new THREE.SpotLightHelper(light);
        this.scene.add(spotLightHelper);

        // Add Spot Light Shadow Helper
        const spotLightShadowHelper = new THREE.CameraHelper(light.shadow.camera);
        this.scene.add(spotLightShadowHelper);
    }

    // Add Hemisphere Light Helper
    addHemisphereLightHelper(light) {
        const skyGeometry = new THREE.SphereGeometry(5, 32, 32);
        const skyMaterial = new THREE.MeshBasicMaterial({ color: light.color, side: THREE.BackSide, opacity: 0.5, transparent: true });
        const skyMesh = new THREE.Mesh(skyGeometry, skyMaterial);
        skyMesh.position.set(0, 10, 0); // Position it above the scene
        this.scene.add(skyMesh);

        const groundGeometry = new THREE.SphereGeometry(5, 32, 32);
        const groundMaterial = new THREE.MeshBasicMaterial({ color: light.groundColor, side: THREE.BackSide, opacity: 0.5, transparent: true });
        const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
        groundMesh.position.set(0, 0, 0); // Position it at the ground level
        this.scene.add(groundMesh);
    }

    // Add Orbit Controls
    addOrbitControls() {
        this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
        this.orbitControls.enableDamping = true; // Enable damping for smooth controls
        this.orbitControls.dampingFactor = 0.25; // Damping factor for controls
        this.orbitControls.screenSpacePanning = false; // Disable screen space panning
        this.orbitControls.maxPolarAngle = Math.PI / 2; // Limit vertical rotation
        this.orbitControls.update(); // Call update initially
    }

    // Optional update method for the orbit controls
    update() {
        if (this.orbitControls) {
            this.orbitControls.update(); // Call update in your animation loop if needed
        }
    }
}
