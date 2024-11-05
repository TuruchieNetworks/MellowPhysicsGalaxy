import * as THREE from 'three';
import GaussianDistribution from '../graphics/GaussianDistribution';
import ImageUtils from './ImageUtils';
// import Plane from './Plane';

class SphereUtils {
    constructor(scene, camera, textureLoader, cubeSize, sceneMeshes = [], plane) {
        this.scene = scene;
        this.camera = camera;
        this.textureLoader = textureLoader;

        // Initialize GaussianDistribution for mass and velocity generation
        this.gaussianDistribution = new GaussianDistribution();

        // Initialize Images From Image Utils
        this.imageUtils = new ImageUtils();

        // Intersection, raycasting, and hover preview
        this.mouse = new THREE.Vector2();
        this.intersectionPoint = new THREE.Vector3();
        this.rayCaster = new THREE.Raycaster();
        this.planeNormal = new THREE.Vector3();
        this.interactionPlane = new THREE.Plane();
        this.plane = plane;

        // Preview sphere for hover effect
        this.previewSphere = this.createPreviewSphere();
        this.scene.add(this.previewSphere);

        // Spheres and animations
        this.spheres = [];
        this.gravityEnabled = false;
        this.gravity = new THREE.Vector3(0, -9.81, 0); // Gravity vector
        this.cubeSize = cubeSize; //|| 100; // Default cube size for wall collision boundary
        this.sceneMeshes = sceneMeshes; // Additional meshes in the scene for collision detection
        // /this.scenePlane = scenePlane; 



        // Random Colors
        // this.createRandomHexColor = this.createRandomHexColor();
    }

    createRandomHexColor = () => {
        return '#' + Math.floor(Math.random() * 16777215).toString(16);
    }

    // Get a random image from the ImageUtils
    // getRandomImage(category) {
    //     const randomIndex = Math.floor(Math.random() * this.imageUtils.images.length);
    //     return this.imageUtils.getRandomImage(category);//this.imageUtils.images[randomIndex];
    // }

    createPreviewSphere() {
        const geometry = new THREE.SphereGeometry(2, 20, 20);
        const material = new THREE.MeshPhongMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.5,
        });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.visible = false;
        return sphere;
    }

    updateHover(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.planeNormal.copy(this.camera.position).normalize();
        this.interactionPlane.setFromNormalAndCoplanarPoint(this.planeNormal, this.scene.position);
        this.rayCaster.setFromCamera(this.mouse, this.camera);

        if (this.rayCaster.ray.intersectPlane(this.interactionPlane, this.intersectionPoint)) {
            this.previewSphere.position.copy(this.intersectionPoint);
            this.previewSphere.visible = true;
        }
    }

    hideHover() {
        this.previewSphere.visible = false;
    }

    handleClick() {
        // Use GaussianDistribution to generate mass and velocity
        const mass = this.gaussianDistribution.getMass();
        const velocity = this.gaussianDistribution.getVelocity();

        // Get a random image for the sphere texture
        const textureURL = this.imageUtils.getRandomImage('concerts'); // Corrected category name

        const newSphere = this.createSphere(textureURL, mass, velocity);
        this.spheres.push(newSphere);

        // Set a timeout to remove the sphere after 30 seconds
        const timeoutId = setTimeout(() => {
            this.scene.remove(newSphere.mesh); // Remove the sphere from the scene
            this.spheres = this.spheres.filter(s => s.sphereId !== newSphere.sphereId); // Clean up from array
        }, 30000); // 30 seconds

        // Store the timeout ID in the sphere object to clear it later if necessary
        newSphere.timeoutId = timeoutId;
    }


    createSphere(textureURL, mass, velocity) {
        const geometry = new THREE.SphereGeometry(2, 20, 20);
        const material = new THREE.MeshPhongMaterial({
            color: this.createRandomHexColor(),
            metalness: 0,
            roughness: 0,
        });

        const sphereMesh = new THREE.Mesh(geometry, material);
        sphereMesh.material.map = this.textureLoader.load(textureURL);
        sphereMesh.castShadow = true;
        sphereMesh.receiveShadow = true;
        sphereMesh.position.copy(this.intersectionPoint);

        this.scene.add(sphereMesh);

        return {
            mass,
            velocity,
            mesh: sphereMesh,
            radius: geometry.parameters.radius,
            position: sphereMesh.position.clone(),
            sphereId: sphereMesh.id,
            timeoutId: null, // Store timeout ID
        };
    }

    checkWallCollision(sphere) {
        const halfCube = this.cubeSize / 2;
        const { x, y, z } = sphere.mesh.position;

        // Check collisions in each axis and reverse velocity if collision occurs
        if (x - sphere.radius < -halfCube || x + sphere.radius > halfCube) {
            sphere.velocity.x *= -1;
        }
        if (y - sphere.radius < -halfCube || y + sphere.radius > halfCube) {
            sphere.velocity.y *= -1;
        }
        if (z - sphere.radius < -halfCube || z + sphere.radius > halfCube) {
            sphere.velocity.z *= -1;
        }
    }

    // Adjust the ground collision method to reflect velocity and include bounce damping
    checkGroundCollision(sphere) {
        // Assuming ground plane is at y = 0
        if (sphere.mesh.position.y - sphere.radius <= 0) {
            sphere.mesh.position.y = sphere.radius; // Set sphere above the ground
            sphere.velocity.y *= -0.8; // Reflect velocity on collision with ground (bounce)
            // Apply damping to simulate energy loss
            sphere.velocity.x *= 0.98; // Damping factor for x velocity
            sphere.velocity.z *= 0.98; // Damping factor for z velocity
        }
    }

    handleSphereCollision(sphereA, sphereB) {
        const posA = sphereA.mesh.position;
        const posB = sphereB.mesh.position;
        const distVec = new THREE.Vector3().subVectors(posA, posB);
        const distance = distVec.length();

        // Calculate minimum distance for collision (sum of radii)
        const minDistance = sphereA.radius + sphereB.radius;

        if (distance < minDistance) {
            distVec.normalize();
            const overlap = minDistance - distance;

            // Push spheres apart to resolve overlap
            posA.add(distVec.clone().multiplyScalar(overlap / 2));
            posB.sub(distVec.clone().multiplyScalar(overlap / 2));

            // Calculate and apply impulse to simulate collision response
            const relVel = new THREE.Vector3().subVectors(sphereA.velocity, sphereB.velocity);
            const velAlongDist = relVel.dot(distVec);

            if (velAlongDist > 0) return; // Prevent spheres moving apart from colliding again

            const impulse = (2 * velAlongDist) / (sphereA.mass + sphereB.mass);
            sphereA.velocity.sub(distVec.clone().multiplyScalar(impulse * sphereB.mass));
            sphereB.velocity.add(distVec.clone().multiplyScalar(impulse * sphereA.mass));
        }
    }

    handleSceneMeshCollision(sphere) {
        this.sceneMeshes.forEach(mesh => {
            const meshPos = mesh.position;
            const distVec = new THREE.Vector3().subVectors(sphere.mesh.position, meshPos);
            const distance = distVec.length();

            const combinedRadius = sphere.radius + mesh.geometry.boundingSphere.radius;

            if (distance < combinedRadius) {
                distVec.normalize();
                const overlap = combinedRadius - distance;

                sphere.mesh.position.add(distVec.clone().multiplyScalar(overlap));
                sphere.velocity.reflect(distVec);
            }
        });
    }

    handlePlaneCollision(sphere) {
        if (!this.plane) return;

        // Get the plane's normal and a point on the plane
        const planeNormal = this.plane.getNormal(); // Assuming getNormal() method
        const planePoint = this.plane.getPoint();   // Assuming getPoint() returns a point on the plane

        // Vector from the sphere to the plane point
        const sphereToPlane = new THREE.Vector3().subVectors(sphere.mesh.position, planePoint);
        const distanceToPlane = sphereToPlane.dot(planeNormal);

        // If the sphere is within its radius from the plane, treat it as a collision
        if (Math.abs(distanceToPlane) < sphere.radius) {
            // Adjust the position to prevent penetration and reflect the velocity
            sphere.mesh.position.addScaledVector(planeNormal, sphere.radius - distanceToPlane);
            sphere.velocity.reflect(planeNormal);
        }
    }

    updateSpheres() {
        this.spheres.forEach(sphere => {
            sphere.mesh.rotation.x += 0.12;
            sphere.mesh.rotation.y += 0.14;
            sphere.mesh.rotation.z += 0.16;
            sphere.mesh.position.y -= 0.16;
            // Apply gravity
            if (this.gravityEnabled) {
                sphere.velocity.add(this.gravity.clone().multiplyScalar(0.016));
            }

            // Update position based on velocity
            sphere.mesh.position.add(sphere.velocity.clone().multiplyScalar(0.016));

            // Check for collisions
            this.checkWallCollision(sphere);
            this.checkGroundCollision(sphere);
            this.spheres.forEach(otherSphere => {
                if (sphere !== otherSphere) {
                    this.handleSphereCollision(sphere, otherSphere);
                }
            });

            // Check collisions with other scene meshes
            this.handleSceneMeshCollision(sphere);
            this.handlePlaneCollision(sphere); // Handle plane collision
        });
    }

    // Central update method to be called each frame
    update() {
        this.updateSpheres();
    }

    // Toggle gravity on or off
    toggleGravity() {
        this.gravityEnabled = !this.gravityEnabled;
    }
}

export default SphereUtils;
