import * as THREE from 'three';

export class Bullet {
    constructor(position, direction, speed = 5) {
        this.position = position || new THREE.Vector3();
        this.direction = direction || new THREE.Vector3(0, 0, -1); // Default direction
        this.speed = speed; // Speed of the bullet

        // Create bullet mesh
        this.geometry = new THREE.SphereGeometry(0.1, 8, 8); // Geometry for the bullet
        this.material = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Material for the bullet
        this.mesh = new THREE.Mesh(this.geometry, this.material); // Create a mesh
        this.mesh.position.copy(this.position); // Set the initial position

        // Create a bounding box for collision detection
        this.boundingBox = new THREE.Box3().setFromObject(this.mesh);
    }

    // Update bullet position and bounding box
    update(delta) {
        const scaledDirection = new THREE.Vector3().copy(this.direction).multiplyScalar(this.speed * delta);
        this.position.add(scaledDirection);
        this.mesh.position.copy(this.position); // Update the mesh position

        // Update bounding box
        this.boundingBox.setFromObject(this.mesh);
    }

    // Add the bullet to the scene
    addToScene(scene) {
        scene.add(this.mesh);
    }

    // Check for collision with another object
    checkCollision(otherObject) {
        return this.boundingBox.intersectsBox(otherObject.boundingBox);
    }
}

// Shooting function
export function shoot(scene, from, to) {
    const bullet = new Bullet();
    bullet.position.copy(from.position); // Start from the position of the shooter

    if (to) {
        bullet.direction = to.position.clone().sub(from.position).normalize(); // Aim at the target
    } else {
        bullet.direction = new THREE.Vector3(0, 0, -1).applyEuler(from.rotation); // Default direction if no target
    }

    bullet.addToScene(scene); // Add the bullet to the scene
    return bullet; // Return the bullet instance for further control if needed
}
