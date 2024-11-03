import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import nebula from '../../galaxy_imgs/nebula.jpg';
import stars from '../../galaxy_imgs/stars.jpg';
import crowd_angle from '../../img/angle_outdoor_concerts.jpg';
import concert_lights from '../../img/bright-concert-lights.avif';
import landing_dj from '../../img/landing_dj.jpg';
import globe_concert from '../../img/globe_concert.jpg';
import metal_blocks from '../../img/metal_blocks.jpg';

export class Geometry {
    constructor(scene, { numBoxes = 5, numSpheres = 5, numGLTFModels = 0, numFBXModels = 0 } = {}) {
        this.scene = scene;
        this.spheres = [];
        this.boxes = [];
        this.gltfModels = [];
        this.fbxModels = [];

        this.textureLoader = new THREE.TextureLoader();
        this.textures = {
            nebula: this.textureLoader.load(nebula),
            stars: this.textureLoader.load(stars),
            crowd_angle: this.textureLoader.load(crowd_angle),
            concert_lights: this.textureLoader.load(concert_lights),
            landing_dj: this.textureLoader.load(landing_dj),
            globe_concert: this.textureLoader.load(globe_concert),
            metal_blocks: this.textureLoader.load(metal_blocks),
        };

        this.createInitialGeometries(numBoxes, numSpheres);
        // Optionally, load models here if URLs are provided
        this.loadGLTFModels(numGLTFModels);
        this.loadFBXModels(numFBXModels);
    }

    createInitialGeometries(numBoxes, numSpheres) {
        this.createMultiBoxes(numBoxes);
        this.createSpheres(numSpheres);
    }

    createBox({ width = 1, height = 1, depth = 1, position = new THREE.Vector3(0, 0, 0), color = 0xff7700 } = {}) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshStandardMaterial({ color });
        const box = new THREE.Mesh(geometry, material);

        box.position.copy(position);
        box.castShadow = box.receiveShadow = true;
        this.scene.add(box);
        this.boxes.push(box);
        return box; // return box for further manipulations if needed
    }

    createMultiBox({ width = 1, height = 1, depth = 1, position = new THREE.Vector3(0, 0, 0), materials = [] } = {}) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const multiBoxMaterial = materials.length > 0 ? materials : [
            new THREE.MeshStandardMaterial({ map: this.textureLoader.load(nebula) }),
            new THREE.MeshStandardMaterial({ map: this.textureLoader.load(stars) }),
            new THREE.MeshStandardMaterial({ map: this.textureLoader.load(crowd_angle) }),
            new THREE.MeshStandardMaterial({ map: this.textureLoader.load(concert_lights) }),
            new THREE.MeshStandardMaterial({ map: this.textureLoader.load(landing_dj) }),
            new THREE.MeshStandardMaterial({ map: this.textureLoader.load(metal_blocks) }),
            new THREE.MeshStandardMaterial({ map: this.textureLoader.load(globe_concert) })
        ];
        
        const multiBox = new THREE.Mesh(geometry, multiBoxMaterial);
        multiBox.position.copy(position);
        multiBox.castShadow = multiBox.receiveShadow = true;
        this.scene.add(multiBox);
        return multiBox; // return multiBox for further manipulations if needed
    }

    createMultiBoxes(count) {
        for (let i = 0; i < count; i++) {
            const position = new THREE.Vector3(Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5);
            this.createMultiBox({ position });
        }
    }

    createSphere({ radius = 1, position = new THREE.Vector3(0, 0, 0), color = Math.random() * 0xffffff } = {}) {
        const geometry = new THREE.SphereGeometry(radius, 32, 32);
        const material = new THREE.MeshStandardMaterial({ color });
        const sphere = new THREE.Mesh(geometry, material);

        sphere.position.copy(position);
        sphere.castShadow = sphere.receiveShadow = true;
        this.scene.add(sphere);
        this.spheres.push(sphere);
        return sphere; // return sphere for further manipulations if needed
    }

    createSpheres(count) {
        for (let i = 0; i < count; i++) {
            const position = new THREE.Vector3(Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5);
            this.createSphere({ position });
        }
    }

    createBoxes(count) {
        for (let i = 0; i < count; i++) {
            const position = new THREE.Vector3(Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5);
            this.createBox({ position });
        }
    }

    loadGLTFModels(count) {
        const loader = new GLTFLoader();
        for (let i = 0; i < count; i++) {
            // Example model URL; replace with actual URLs as needed
            const url = `path/to/model${i}.gltf`; // Add your model URL logic here
            loader.load(url, (gltf) => {
                const model = gltf.scene;
                model.position.set(Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5);
                model.castShadow = model.receiveShadow = true;
                this.scene.add(model);
                this.gltfModels.push(model);
            });
        }
    }

    loadFBXModels(count) {
        const loader = new FBXLoader();
        for (let i = 0; i < count; i++) {
            // Example model URL; replace with actual URLs as needed
            const url = `path/to/model${i}.fbx`; // Add your model URL logic here
            loader.load(url, (fbx) => {
                fbx.position.set(Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5);
                fbx.castShadow = fbx.receiveShadow = true;
                this.scene.add(fbx);
                this.fbxModels.push(fbx);
            });
        }
    }

    update() {
        this.spheres.forEach(sphere => {
            sphere.rotation.x += 0.01;
            sphere.rotation.y += 0.01;
        });

        this.boxes.forEach(box => {
            box.rotation.x += 0.01;
            box.rotation.y += 0.01;
        });

        [...this.gltfModels, ...this.fbxModels].forEach(model => {
            model.rotation.y += 0.01;
        });
    }
}