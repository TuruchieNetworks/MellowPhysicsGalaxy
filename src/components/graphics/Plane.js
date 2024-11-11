import * as THREE from 'three';

export class Plane {
    constructor(scene, width = 30, height = 30, color = 0xF0FFFF, thickness = 1, side = THREE.DoubleSide) {
        this.scene = scene;

        // Create plane geometry and material
        this.geometry = new THREE.PlaneGeometry(width, height);
        this.material = new THREE.MeshPhongMaterial({
            color: color,
            side: side, // Use the side parameter
            flatShading: true, // Optional: Use flat shading for a different look
        });

        // Create the mesh and add it to the scene
        this.planeMesh = new THREE.Mesh(this.geometry, this.material);
        this.planeMesh.rotation.x = -0.5 * Math.PI; // Rotate the plane to be horizontal
        this.planeMesh.receiveShadow = true; // Enable shadow receiving
        this.scene.add(this.planeMesh);

        // Create the sides of the plane
        this.createSides(width, thickness, color, side);
    }

    createSides(size, thickness, color, side) {
        // Create sides using BoxGeometry
        const sideGeometry = new THREE.BoxGeometry(size, thickness, size);
        const sideMaterial = new THREE.MeshPhongMaterial({
            color: color,
            side: side, // Use the side parameter for the sides
            flatShading: true,
        });

        // Create side mesh
        const sideMesh = new THREE.Mesh(sideGeometry, sideMaterial);
        sideMesh.position.y = thickness / 2; // Move the sides up to be in line with the plane
        sideMesh.receiveShadow = true; // Enable shadow receiving for sides
        this.scene.add(sideMesh);
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
// export default Plane