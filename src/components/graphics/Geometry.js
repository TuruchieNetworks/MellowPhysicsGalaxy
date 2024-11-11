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
import ImageUtils from './ImageUtils';
import monkeyUrl from '../../GLTFs/monkey.glb';
import DancingTwerk from '../../FBXs/DancingTwerk.fbx';
export class Geometry {
    constructor(scene) {
        this.scene = scene;
        this.spheres = [];
        this.boxes = [];
        this.gltfModels = [monkeyUrl];
        this.fbxModels = [DancingTwerk];
        this.textureLoader = new THREE.TextureLoader();
        this.imageUtils = new ImageUtils(); // Create an instance of ImageUtils

        this.geometries = []; 
    }

    // createInitialGeometries() {
    //     this.createMultiBoxes(5);
    //     this.createSpheres(5);
    //     this.createBoxes(5);
    // }

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

    loadGLTFModel(url = monkeyUrl) {
        const loader = new GLTFLoader();
        loader.load(url, (gltf) => {
            const model = gltf.scene;
            //model.position.set(Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5);
            model.position.set(-12, 4, 10);
            model.castShadow = model.receiveShadow = true;
            model.castShadow = true;
            model.receiveShadow = true;
            this.scene.add(model);
            this.gltfModels.push(model);
        }, undefined, function (error) {
            console.error(error);
        });
    }

    loadFBXModel(url = DancingTwerk) {
        const loader = new FBXLoader();
        loader.load(url, (fbx) => {
            fbx.position.set(Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5);
            fbx.castShadow = fbx.receiveShadow = true;
            this.scene.add(fbx);
            this.fbxModels.push(fbx);
        }, undefined, function (error) {
            console.error(error);
        });
    }

    loadMultipleGLTFModels(urls) {
        urls.forEach(url => this.loadGLTFModel(url));
    }

    loadMultipleFBXModels(urls) {
        const loader = new FBXLoader();
        urls.forEach(url => {
            loader.load(url, (fbx) => {
                fbx.position.set(Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5);
                fbx.castShadow = fbx.receiveShadow = true;
                this.scene.add(fbx);
                this.fbxModels.push(fbx);
            }, undefined, function (error) {
                console.error(error);
            });
        });
    }

    update() {
        // Only update spheres if any exist
        if (this.spheres.length > 0) {
            this.spheres.forEach(sphere => {
                sphere.rotation.x += 0.01;
                sphere.rotation.y += 0.01;
            });
        }
    
        // Only update boxes if any exist
        if (this.boxes.length > 0) {
            this.boxes.forEach(box => {
                box.rotation.x += 0.01;
                box.rotation.y += 0.01;
            });
        }
    
        // // Only update models (GLTF and FBX) if any exist
        // if (this.gltfModels.length > 0 || this.fbxModels.length > 0) {
        //     [...this.gltfModels, ...this.fbxModels].forEach(model => {
        //         model.rotation.y += 0.01;
        //     });
        // }
    }    

    // Implement other methods for creating geometries...
    dispose() {
        this.geometries.forEach(mesh => {
            this.scene.remove(mesh); // Remove from the scene
            mesh.geometry.dispose(); // Dispose of the geometry
            mesh.material.dispose(); // Dispose of the material
        });
        this.geometries = []; // Clear the array
    }
    
    meshDispose() {
        // Dispose of spheres
        this.spheres.forEach(sphere => {
            this.scene.remove(sphere);
            sphere.geometry.dispose();
            sphere.material.dispose();
        });
        this.spheres = [];
    
        // Dispose of boxes
        this.boxes.forEach(box => {
            this.scene.remove(box);
            box.geometry.dispose();
            box.material.dispose();
        });
        this.boxes = [];
    
        // Dispose of GLTF models
        this.gltfModels.forEach(model => {
            model.traverse(child => {
                if (child.isMesh) {
                    child.geometry.dispose();
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => mat.dispose());
                    } else if (child.material) {
                        child.material.dispose();
                    }
                }
            });
            this.scene.remove(model);
        });
        this.gltfModels = [];
    
        // Dispose of FBX models
        this.fbxModels.forEach(model => {
            model.traverse(child => {
                if (child.isMesh) {
                    child.geometry.dispose();
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => mat.dispose());
                    } else if (child.material) {
                        child.material.dispose();
                    }
                }
            });
            this.scene.remove(model);
        });
        this.fbxModels = [];
    
        // Dispose of textures loaded with TextureLoader
        this.textureLoader.cache.forEach(texture => {
            texture.dispose();
        });
        this.textureLoader.cache.clear();
    
        // Remove any additional references
        this.geometries.forEach(mesh => {
            this.scene.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
        });
        this.geometries = [];
    }
    
}