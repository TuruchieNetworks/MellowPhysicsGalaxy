import * as THREE from 'three';
import * as CANNON from "cannon-es";
import ImageUtils from './ImageUtils';
import Shaders from '../graphics/Shaders';
import GaussianDistribution from '../graphics/GaussianDistribution';
import { MomentumPhysics } from './MomentumPhysics';


class SphereUtils {
    constructor(scene, world = null, camera, textureLoader, cubeSize, plane, sceneMeshes = []) {
        this.scene = scene;
        this.world = world;
        this.camera = camera;
        this.textureLoader = textureLoader || new THREE.TextureLoader();

        // Initialize GaussianDistribution for mass and velocity generation
        this.gaussianDistribution = new GaussianDistribution();

        // Initialize Utils
        this.shader = new Shaders();
        this.imageUtils = new ImageUtils();
        this.textureLoader = new THREE.TextureLoader();

        // Intersection, raycasting, and hover preview
        this.mouse = new THREE.Vector2();
        this.intersectionPoint = new THREE.Vector3();
        this.rayCaster = new THREE.Raycaster();
        this.planeNormal = new THREE.Vector3();
        this.interactionPlane = new THREE.Plane();
        this.plane = plane;

        // Spheres and animations
        this.spheres = [];
        this.geometries = [];
        this.sphereMeshes = [];
        this.sphereBodies = [];

        this.generateRandomIndex(3);
        this.previewSphere = this.createPreviewSphere();
        this.scene.add(this.previewSphere);

        // Physics
        this.gravityEnabled = true;
        this.gravity = new THREE.Vector3(0, -9.81, 0); // Gravity vector
        this.cubeSize = cubeSize; //|| 100; // Default cube size for wall collision boundary
        this.sceneMeshes = sceneMeshes; // Additional meshes in the scene for collision detection
        // /this.scenePlane = scenePlane; 

        this.createRandomHexColor();
    }

    createRandomHexColor = () => {
        return '#' + Math.floor(Math.random() * 16777215).toString(16);
    }

    createCannonSphere(specs = { r: 4, w: 50, h: 50 }, color = this.createRandomHexColor(), position = { x: -10, y: 10, z: -80 }, mass = this.gaussianDistribution.getMass() * 50, shadedTexture = this.shader.shaderMaterials().northStarMaterial) {
        // Geometry and Material
        const sphereGeometry = new THREE.SphereGeometry(specs.r, specs.w, specs.h);
        const sphereMaterial = new THREE.MeshPhongMaterial({
            color,
            wireframe: false
        });

        // Mesh
        const sphere = new THREE.Mesh(sphereGeometry, shadedTexture || sphereMaterial);
        this.scene.add(sphere);
        sphere.position.set(position.x, position.y, position.z);
        sphere.castShadow = true;
        this.sphereMeshes.push(sphere);

        // Cannon.js body for physics
        const sphereShape = new CANNON.Sphere(specs.r);
        const sphereBody = new CANNON.Body({
            mass,
            position: new CANNON.Vec3(position.x, position.y, position.z),
            linearDamping: 0.1, // Add damping for more realistic inertia (slower stopping)
            angularDamping: 0.1, // Optional: If you want to dampen angular momentum too
        });

        // Set restitution (bounciness) and friction for realistic collisions
        sphereBody.material = new CANNON.Material();
        const contactMaterial = new CANNON.ContactMaterial(
            sphereBody.material,
            sphereBody.material,
            {
                friction: 0.1, // Adjust friction for realistic movement
                restitution: 0.6 // Adjust restitution for realistic bounciness
            }
        );

        if (this.world !== null) {
            this.world.addContactMaterial(contactMaterial);

            sphereBody.addShape(sphereShape);
            this.world.addBody(sphereBody);

            // Store references
            this.sphereBodies.push(sphereBody);
        }

        return { sphere, sphereBody }; // Return references if needed
    }

    createPreviewSphere() {
        // document.body.style.cursor = 'pointer';
        // Get a random image for the sphere texture
        const textureURL = this.imageUtils.getRandomImage('concerts'); // Corrected category name
        const geometry = new THREE.SphereGeometry(2, 20, 20);
        const material = new THREE.MeshPhongMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.5,
            map: this.textureLoader.load(textureURL)
        });

        const sphere = new THREE.Mesh(geometry, material);
        sphere.visible = false;
        // const sphere = new THREE.Mesh(geometry, this.Shaders.shaderMaterials().starryMaterial);
        // document.body.style.cursor = 'pointer';
        this.previewSphere = sphere;
        return sphere;
    }

    generateRandomIndex(index = 3) {
        return Math.random(index) * index
    }

    handleClick(mat = null) {
        // Use GaussianDistribution to generate mass and velocity
        const mass = this.gaussianDistribution.getMass() * 150;
        const velocity = this.gaussianDistribution.getVelocity();

        // Get a random image for the sphere texture
        const textureURL = this.imageUtils.getRandomImage('concerts'); // Corrected category name

        const newSphere = this.createSphere(textureURL, mass, velocity, mat);
        this.spheres.push(newSphere);

        // Set a timeout to remove the sphere after 30 seconds
        const timeoutId = setTimeout(() => {
            this.scene.remove(newSphere.mesh); // Remove the sphere from the scene
            this.spheres = this.spheres.filter(s => s.sphereId !== newSphere.sphereId); // Clean up from array
        }, 59999); // 30 seconds

        // Store the timeout ID in the sphere object to clear it later if necessary
        newSphere.timeoutId = timeoutId;
    }

    createSphere(textureURL, mass, velocity, mat = null) {
        const geometry = new THREE.SphereGeometry(2, 20, 20);
        let material;
        // const randomIndex = this.generateRandomIndex(2);
        if (mat === null) {
            material = new THREE.MeshPhongMaterial({
                color: this.createRandomHexColor(),
                metalness: 0,
                roughness: 0,
                map: this.textureLoader.load(textureURL)
            });
        } else {
            material = mat;
        }

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

    checkWallCollision() {
        const halfCube = this.cubeSize / 2;
        this.spheres.forEach(sphere => {
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
        });
    }

    // Adjust the ground collision method to reflect velocity and include bounce damping
    checkGroundCollision() {
        // Assuming ground plane is at y = 0
        this.spheres.forEach(sphere => {
            if (sphere.mesh.position.y - sphere.radius <= 0) {
                sphere.mesh.position.y = sphere.radius; // Set sphere above the ground
                sphere.velocity.y *= -0.8; // Reflect velocity on collision with ground (bounce)

                // Apply damping to simulate energy loss
                sphere.velocity.x *= 0.98; // Damping factor for x velocity
                sphere.velocity.z *= 0.98; // Damping factor for z velocity
            }
        });
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

            const impulse = (2.9 * velAlongDist) / (sphereA.mass + sphereB.mass);
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
        const planeNormal = this.plane.getNormal; // Assuming getNormal() method
        const planePoint = this.plane.getPoint;   // Assuming getPoint() returns a point on the plane

        // Vector from the sphere to the plane point
        const sphereToPlane = new THREE.Vector3().subVectors(sphere.mesh.position, planePoint);
        const distanceToPlane = sphereToPlane.dot(planeNormal);

        // If the sphere is within its radius from the plane, treat it as a collision
        if (Math.abs(distanceToPlane) < sphere.radius) {
            // Adjust the position to prevent penetration and reflect the velocity
            sphere.mesh.position.addScaledVector(planeNormal, sphere.radius - distanceToPlane);
            sphere.velocity.reflect(planeNormal);
            sphere.material = this.shader.shaderMaterials().explosiveMaterial;
        }
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

    updateSpheres() {
        if (this.previewSphere) {
            this.previewSphere.rotation.x += 0.12;
            this.previewSphere.rotation.y += 0.14;
            this.previewSphere.rotation.z += 0.16;
        }

        // Sync Three.js meshes with Cannon.js bodies
        this.sphereMeshes.forEach((mesh, i) => {
            mesh.rotation.x += 0.12;
            mesh.rotation.y += 0.24;
            mesh.rotation.z += 0.36;
            const body = this.sphereBodies[i];
            mesh.position.copy(body.position);
            mesh.quaternion.copy(body.quaternion);
        });

        if (this.spheres.length > 0) {
            this.spheres.forEach((sphere, i) => {
                if (sphere && sphere.mesh) {
                    sphere.mesh.rotation.x += 0.12;
                    sphere.mesh.rotation.y += 0.14;
                    sphere.mesh.rotation.z += 0.16;

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
                        if (sphere !== otherSphere && otherSphere.mesh) {
                            this.handleSphereCollision(sphere, otherSphere);
                        }
                    });

                    // ssthis.handlePlaneCollision(sphere); // Handle plane collision
                }
            });
        }
    }

    // Central update method to be called each frame
    update() {
        this.updateSpheres();
        // this.handlePlaneCollision();
    }

    // Toggle gravity on or off
    toggleGravity() {
        this.gravityEnabled = !this.gravityEnabled;
    }

    dispose() {
        // Remove and dispose of spheres
        this.spheres.forEach(sphere => {
            if (sphere.timeoutId) clearTimeout(sphere.timeoutId);
            this.scene.remove(sphere.mesh);
            sphere.mesh.geometry.dispose();
            if (sphere.mesh.material.map) sphere.mesh.material.map.dispose();
            sphere.mesh.material.dispose();
        });
        this.spheres = [];

        // this.sphereMeshes.forEach(sphere => {
        //     this.scene.remove(sphere.mesh); // Remove from the scene
        //     sphere.mesh.geometry.dispose(); // Dispose of the geometry
        //     sphere.mesh.material.dispose(); // Dispose of the material
        // });
        // this.sphereMeshes = []; // Clear the array

        // this.sphereBodies.forEach(sphere => {
        //     this.scene.remove(sphere.mesh); // Remove from the scene
        //     sphere.mesh.geometry.dispose(); // Dispose of the geometry
        //     sphere.mesh.material.dispose(); // Dispose of the material
        // });
        // this.sphereBodies = []; // Clear the array
        // Remove preview sphere
        // if (this.previewSphere) {
        //     this.scene.remove(this.previewSphere);
        //     this.previewSphere.geometry.dispose();
        //     if (this.previewSphere.material.map) this.previewSphere.material.map.dispose();
        //     this.previewSphere.material.dispose();
        //     this.previewSphere = null;
        // }

        // Clear references
        // this.mouse = null;
        // this.intersectionPoint = null;
        // this.rayCaster = null;
        // this.planeNormal = null;
        // this.interactionPlane = null;
        // this.gravity = null;
        // this.scene = null;
        // this.camera = null;
        // this.textureLoader = null;
        // this.plane = null;
        // this.sceneMeshes = [];
    }
}
export default SphereUtils;



























// Get a random image from the ImageUtils
// getRandomImage(category) {
//     const randomIndex = Math.floor(Math.random() * this.imageUtils.images.length);
//     return this.imageUtils.getRandomImage(category);//this.imageUtils.images[randomIndex];
// }


























// export default SphereUtils;
// import * as THREE from 'three';
// import * as CANNON from "cannon-es";
// import GaussianDistribution from '../graphics/GaussianDistribution';
// import ImageUtils from './ImageUtils';
// // import Plane from './Plane';

// class SphereUtils {
//     constructor(scene, camera, textureLoader, cubeSize, sceneMeshes = [], plane) {
//         this.scene = scene;
//         this.world = new CANNON.World();
//         this.camera = camera;
//         this.textureLoader = textureLoader;

//         // Initialize GaussianDistribution for mass and velocity generation
//         this.gaussianDistribution = new GaussianDistribution();

//         // Initialize Images From Image Utils
//         this.imageUtils = new ImageUtils();

//         // Intersection, raycasting, and hover preview
//         this.mouse = new THREE.Vector2();
//         this.intersectionPoint = new THREE.Vector3();
//         this.rayCaster = new THREE.Raycaster();
//         this.planeNormal = new THREE.Vector3();
//         this.interactionPlane = new THREE.Plane();
//         this.plane = plane;

//         // Preview sphere for hover effect
//         this.previewSphere = this.createPreviewSphere();
//         this.scene.add(this.previewSphere);

//         // Spheres and animations
//         this.spheres = [];
//         this.sphereBodies = [];
//         this.gravityEnabled = false;
//         this.gravity = new THREE.Vector3(0, -9.81, 0); // Gravity vector
//         this.cubeSize = cubeSize; //|| 100; // Default cube size for wall collision boundary
//         this.sceneMeshes = sceneMeshes; // Additional meshes in the scene for collision detection
//         // /this.scenePlane = scenePlane;



//         // Random Colors
//         // this.createRandomHexColor = this.createRandomHexColor();
//     }

//     createRandomHexColor = () => {
//         return '#' + Math.floor(Math.random() * 16777215).toString(16);
//     }

//     // Get a random image from the ImageUtils
//     // getRandomImage(category) {
//     //     const randomIndex = Math.floor(Math.random() * this.imageUtils.images.length);
//     //     return this.imageUtils.getRandomImage(category);//this.imageUtils.images[randomIndex];
//     // }

//     createPreviewSphere() {
//         const geometry = new THREE.SphereGeometry(2, 20, 20);
//         const material = new THREE.MeshPhongMaterial({
//             color: 0x00ff00,
//             transparent: true,
//             opacity: 0.5,
//         });
//         const sphere = new THREE.Mesh(geometry, material);
//         sphere.visible = false;
//         return sphere;
//     }

//     updateHover(event) {
//         this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
//         this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

//         this.planeNormal.copy(this.camera.position).normalize();
//         this.interactionPlane.setFromNormalAndCoplanarPoint(this.planeNormal, this.scene.position);
//         this.rayCaster.setFromCamera(this.mouse, this.camera);

//         if (this.rayCaster.ray.intersectPlane(this.interactionPlane, this.intersectionPoint)) {
//             this.previewSphere.position.copy(this.intersectionPoint);
//             this.previewSphere.visible = true;
//         }
//     }

//     hideHover() {
//         this.previewSphere.visible = false;
//     }

//     handleClick() {
//         // Use GaussianDistribution to generate mass and velocity
//         const mass = this.gaussianDistribution.getMass();
//         const velocity = this.gaussianDistribution.getVelocity();

//         // Get a random image for the sphere texture
//         const textureURL = this.imageUtils.getRandomImage('concerts'); // Corrected category name

//         const newSphere = this.createSphere(textureURL, mass, velocity);
//         this.spheres.push(newSphere);
//         // this.sphereMeshes.push(newSphere.mesh);

//         // Set a timeout to remove the sphere after 30 seconds
//         const timeoutId = setTimeout(() => {
//             this.scene.remove(newSphere.mesh); // Remove the sphere from the scene
//             this.spheres = this.spheres.filter(s => s.sphereId !== newSphere.sphereId); // Clean up from array
//         }, 30000); // 30 seconds

//         // Store the timeout ID in the sphere object to clear it later if necessary
//         newSphere.timeoutId = timeoutId;
//     }

//     createSphere(textureURL, mass, velocity) {
//         const geometry = new THREE.SphereGeometry(2, 20, 20);
//         const material = new THREE.MeshPhongMaterial({
//             color: this.createRandomHexColor(),
//             metalness: 0,
//             roughness: 0,
//         });

//         const sphereMesh = new THREE.Mesh(geometry, material);
//         sphereMesh.material.map = this.textureLoader.load(textureURL);
//         sphereMesh.castShadow = true;
//         sphereMesh.receiveShadow = true;
//         sphereMesh.position.copy(this.intersectionPoint);

//         // Cannon.js body for physics
//         const body = new CANNON.Sphere(2);
//         const sphereBody = new CANNON.Body({
//             mass: 13.1,
//             position: new CANNON.Vec3(sphereMesh.position.x, sphereMesh.position.y, sphereMesh.position.z)
//         });

//         sphereBody.addShape(body);
//         sphereBody.allowSleep = true;  // Allow spheres to sleep when at rest
//         sphereBody.sleepSpeedLimit = 3.1; // Lower speed threshold for sleeping
//         sphereBody.sleepTimeLimit = 3;  // Time required to enter sleep state
//         this.world.addBody(sphereBody);
//         this.sphereBodies.push(sphereBody);

//         this.scene.add(sphereMesh);

//         return {
//             mass,
//             velocity,
//             mesh: sphereMesh,
//             radius: geometry.parameters.radius,
//             position: sphereMesh.position.clone(),
//             sphereId: sphereMesh.id,
//             timeoutId: null, // Store timeout ID
//         };
//     }

//     checkWallCollision() {
//         const halfCube = this.cubeSize / 2;
//         this.spheres.forEach(sphere => {
//             const { x, y, z } = sphere.mesh.position;

//             // Check collisions in each axis and reverse velocity if collision occurs
//             if (x - sphere.radius < -halfCube || x + sphere.radius > halfCube) {
//                 sphere.velocity.x *= -1;
//             }
//             if (y - sphere.radius < -halfCube || y + sphere.radius > halfCube) {
//                 sphere.velocity.y *= -1;
//             }
//             if (z - sphere.radius < -halfCube || z + sphere.radius > halfCube) {
//                 sphere.velocity.z *= -1;
//             }
//         });
//     }

//     // Adjust the ground collision method to reflect velocity and include bounce damping
//     checkGroundCollision() {
//         // Assuming ground plane is at y = 0
//         this.spheres.forEach(sphere => {
//             if (sphere.mesh.position.y - sphere.radius <= 0) {
//                 sphere.mesh.position.y = sphere.radius; // Set sphere above the ground
//                 sphere.velocity.y *= -0.8; // Reflect velocity on collision with ground (bounce)
//                 // Apply damping to simulate energy loss
//                 sphere.velocity.x *= 0.98; // Damping factor for x velocity
//                 sphere.velocity.z *= 0.98; // Damping factor for z velocity
//             }
//         });
//     }

//     handleSphereCollision(sphereA, sphereB) {
//         const posA = sphereA.mesh.position;
//         const posB = sphereB.mesh.position;
//         const distVec = new THREE.Vector3().subVectors(posA, posB);
//         const distance = distVec.length();

//         // Calculate minimum distance for collision (sum of radii)
//         const minDistance = sphereA.radius + sphereB.radius;

//         if (distance < minDistance) {
//             distVec.normalize();
//             const overlap = minDistance - distance;

//             // Push spheres apart to resolve overlap
//             posA.add(distVec.clone().multiplyScalar(overlap / 2));
//             posB.sub(distVec.clone().multiplyScalar(overlap / 2));

//             // Calculate and apply impulse to simulate collision response
//             const relVel = new THREE.Vector3().subVectors(sphereA.velocity, sphereB.velocity);
//             const velAlongDist = relVel.dot(distVec);

//             if (velAlongDist > 0) return; // Prevent spheres moving apart from colliding again

//             const impulse = (2 * velAlongDist) / (sphereA.mass + sphereB.mass);
//             sphereA.velocity.sub(distVec.clone().multiplyScalar(impulse * sphereB.mass));
//             sphereB.velocity.add(distVec.clone().multiplyScalar(impulse * sphereA.mass));
//         }
//     }

//     handleSceneMeshCollision(sphere) {
//         this.sceneMeshes.forEach(mesh => {
//             const meshPos = mesh.position;
//             const distVec = new THREE.Vector3().subVectors(sphere.mesh.position, meshPos);
//             const distance = distVec.length();

//             const combinedRadius = sphere.radius + mesh.geometry.boundingSphere.radius;

//             if (distance < combinedRadius) {
//                 distVec.normalize();
//                 const overlap = combinedRadius - distance;

//                 sphere.mesh.position.add(distVec.clone().multiplyScalar(overlap));
//                 sphere.velocity.reflect(distVec);
//             }
//         });
//     }

//     handlePlaneCollision(sphere) {
//         if (!this.plane) return;

//         // Get the plane's normal and a point on the plane
//         const planeNormal = this.plane.getNormal(); // Assuming getNormal() method
//         const planePoint = this.plane.getPoint();   // Assuming getPoint() returns a point on the plane

//         // Vector from the sphere to the plane point
//         const sphereToPlane = new THREE.Vector3().subVectors(sphere.mesh.position, planePoint);
//         const distanceToPlane = sphereToPlane.dot(planeNormal);

//         // If the sphere is within its radius from the plane, treat it as a collision
//         if (Math.abs(distanceToPlane) < sphere.radius) {
//             // Adjust the position to prevent penetration and reflect the velocity
//             sphere.mesh.position.addScaledVector(planeNormal, sphere.radius - distanceToPlane);
//             sphere.velocity.reflect(planeNormal);
//         }
//     }

//     updateSpheres() {
//         this.spheres.forEach((sphere, i) => {
//             sphere.mesh.rotation.x += 0.12;
//             sphere.mesh.rotation.y += 0.14;
//             sphere.mesh.rotation.z += 0.16;
//             sphere.mesh.position.y -= 0.16;
//             // Apply gravity
//             if (this.gravityEnabled) {
//                 sphere.velocity.add(this.gravity.clone().multiplyScalar(0.016));
//             }

//             // Sync Three.js meshes with Cannon.js bodies
//             const body = this.spheres[i].mesh;
//             sphere.mesh.castShadow = true;
//             sphere.mesh.position.copy(body.position);
//             sphere.mesh.quaternion.copy(body.quaternion);

//             // Update position based on velocity
//             sphere.mesh.position.add(sphere.velocity.clone().multiplyScalar(0.016));

//             // Check for collisions
//             this.checkWallCollision(sphere);
//             this.checkGroundCollision(sphere);
//             this.spheres.forEach(otherSphere => {
//                 if (sphere !== otherSphere) {
//                     this.handleSphereCollision(sphere, otherSphere);
//                 }
//             });

//             this.handlePlaneCollision(sphere); // Handle plane collision
//         });
//     }

//     // Central update method to be called each frame
//     update() {
//         this.updateSpheres();
//         this.handlePlaneCollision();
//     }

//     // Toggle gravity on or off
//     toggleGravity() {
//         this.gravityEnabled = !this.gravityEnabled;
//     }
// }

