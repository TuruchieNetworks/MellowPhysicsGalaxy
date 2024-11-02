import * as THREE from 'three';

export class Animation {
    constructor(objects) {
        this.mixer = new THREE.AnimationMixer();
        this.objects = objects;

        this.initAnimations();
    }

    initAnimations() {
        // Initialize animations for objects
    }

    update(delta) {
        this.mixer.update(delta);
    }
}