import * as THREE from 'three';
import randomHexColor from '../hooks/UseColorUtils';
import stars from '../../galaxy_imgs/stars.jpg';
import nebula from '../../galaxy_imgs/nebula.jpg';

class Scene {
    constructor(canvas) {
        this.scene = new THREE.Scene();

        // Set up background textures for the cube environment
        this.starTextures = [stars, stars, stars, stars, nebula, nebula];
        this.cubeTextureLoader = new THREE.CubeTextureLoader();
        this.scene.background = this.cubeTextureLoader.load(this.starTextures);

        // Load nebula texture
        this.textureLoader = new THREE.TextureLoader();
        this.loadNebulaTexture(nebula, true); // true to set as background
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

    mountScene() {
      return this.scene
    }
    addObject(object) {
        this.scene.add(object);
    }

}

export default Scene;
