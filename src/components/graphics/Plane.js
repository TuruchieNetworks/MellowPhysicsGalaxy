import * as THREE from 'three';
import Shaders from './Shaders';

export class Plane {
    constructor(
        scene, 
        width = 30, 
        height = 30, 
        color = '#' + Math.floor(Math.random() * 16777215).toString(16), 
        thickness = 1, 
        side = THREE.DoubleSide, 
        shaderName = 'explosiveMaterial' // Default shader
    ) {
        this.scene = scene;
        this.width = width;
        this.height = height;
        this.color = color;
        this.thickness = thickness;
        this.side = side;

        // Initialize shaders
        this.shader = new Shaders();

        // Create plane geometry and material
        this.createPlane(shaderName);

        // Create the sides of the plane
        this.createSides(this.width, this.thickness, this.color, this.side);
    }

    createPlane(shaderName) {
        this.geometry = new THREE.PlaneGeometry(this.width, this.height);

        // Fetch the shader material dynamically
        const shaders = this.shader.shaderMaterials();
        const selectedMaterial = shaders[shaderName];

        // Use the shader material if it exists, otherwise fallback to a default material
        this.material = selectedMaterial || new THREE.MeshPhongMaterial({
            color: this.color,
            side: this.side,
            flatShading: true,
        });

        // Create the mesh and add it to the scene
        this.planeMesh = new THREE.Mesh(this.geometry, this.material);
        this.planeMesh.rotation.x = -0.5 * Math.PI; // Rotate the plane to be horizontal
        this.planeMesh.receiveShadow = true; // Enable shadow receiving
        this.scene.add(this.planeMesh);
    }

    createSides(size, thickness, color, side) {
        // Create sides using BoxGeometry
        const sideGeometry = new THREE.BoxGeometry(size, thickness, size);
        const sideMaterial = new THREE.MeshPhongMaterial({
            color: color,
            side: side,
            flatShading: true,
        });

        // Create side mesh
        const sideMesh = new THREE.Mesh(sideGeometry, sideMaterial);
        sideMesh.position.y = thickness / 2; // Move the sides up to be in line with the plane
        sideMesh.receiveShadow = true; // Enable shadow receiving for sides
        this.scene.add(sideMesh);
    }

    // Method to dynamically update the shader material
    setShader(shaderName) {
        const shaders = this.shader.shaderMaterials();
        const newMaterial = shaders[shaderName];

        if (newMaterial) {
            this.planeMesh.material = newMaterial;
        } else {
            console.warn(`Shader '${shaderName}' not found. Material not updated.`);
        }
    }

    // Method to set the position of the plane
    setPosition(x, y, z) {
        this.planeMesh.position.set(x, y, z);
    }

    // Method to set the rotation of the plane
    setRotation(x, y, z) {
        this.planeMesh.rotation.set(x, y, z);
    }

    // Method to resize the plane
    setSize(width, height) {
        this.planeMesh.geometry.dispose(); // Dispose of old geometry
        this.geometry = new THREE.PlaneGeometry(width, height); // Create new geometry
        this.planeMesh.geometry = this.geometry; // Update mesh geometry
    }

    // Method to change the color of the plane's material
    setColor(color) {
        this.material.color.set(color);
    }
}
export default Plane;
