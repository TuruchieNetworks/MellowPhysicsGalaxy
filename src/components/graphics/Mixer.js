import * as THREE from 'three';

export class Mixer {
    constructor(object) {
        this.object = object; // The 3D object to animate
        this.mixer = new THREE.AnimationMixer(object); // Create an AnimationMixer
    }

    createAction(clip) {
        const action = this.mixer.clipAction(clip); // Create an action from the animation clip
        action.play(); // Start playing the action
        return action; // Return the action for further manipulation
    }

    update(deltaTime) {
        this.mixer.update(deltaTime); // Update the mixer with the time delta
    }
}