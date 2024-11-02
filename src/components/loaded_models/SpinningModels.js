import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export class SpinningModels {
    constructor(scene) {
        this.scene = scene;
        this.models = [];  // Array to hold models
        this.initCube();
        this.initSphere();
        this.loadGLTFModel();
        this.setupClickEvent();
    }

    initCube() {
        const geometry = new THREE.BoxGeometry();
        const materials = [
            new THREE.MeshBasicMaterial({ color: 0xff0000 }), // Red
            new THREE.MeshBasicMaterial({ color: 0x00ff00 }), // Green
            new THREE.MeshBasicMaterial({ color: 0x0000ff }), // Blue
            new THREE.MeshBasicMaterial({ color: 0xffff00 }), // Yellow
            new THREE.MeshBasicMaterial({ color: 0xff00ff }), // Magenta
            new THREE.MeshBasicMaterial({ color: 0x00ffff })  // Cyan
        ];

        const cube = new THREE.Mesh(geometry, materials);
        this.scene.add(cube);
        this.models.push(cube);
    }

    initSphere() {
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(3, 0, 0);
        this.scene.add(sphere);
        this.models.push(sphere);
    }

    loadGLTFModel() {
        const loader = new GLTFLoader();
        loader.load('path/to/your/model.glb', (gltf) => {
            const model = gltf.scene;
            model.position.set(-3, 0, 0);
            this.scene.add(model);
            this.models.push(model);
        });
    }

    setupClickEvent() {
        window.addEventListener('click', () => {
            this.createNewGLTFModel();
        });
    }

    createNewGLTFModel() {
        const loader = new GLTFLoader();
        loader.load('path/to/your/new/model.glb', (gltf) => {
            const newModel = gltf.scene;
            newModel.position.set(Math.random() * 5 - 2.5, Math.random() * 5 - 2.5, Math.random() * 5 - 2.5);
            this.scene.add(newModel);
            this.models.push(newModel);
        });
    }

    update(delta) {
        this.models.forEach(model => {
            model.rotation.x += delta;
            model.rotation.y += delta;
        });
    }
}