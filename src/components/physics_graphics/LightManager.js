import * as THREE from 'three';

class LightManager {
    constructor(scene) {
        this.scene = scene;
        this.addLights();
    }

    addLights() {
        const ambientLight = new THREE.AmbientLight(0x333333);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
        this.scene.add(directionalLight);
        directionalLight.position.set(-30, 50, 0);
        directionalLight.castShadow = true;
    }
}

export default LightManager;
