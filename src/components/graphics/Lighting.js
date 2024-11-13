import * as THREE from 'three';

export class Lighting {
    constructor(scene, camera, speed = 5) {
        this.scene = scene;
        this.speed = speed;
        this.camera = camera;
        this.cameraPathPoints = [
            new THREE.Vector3(60, 10, -135),
            new THREE.Vector3(-20, 2, 80),
            new THREE.Vector3(100, 20, -30),
            new THREE.Vector3(60, 44, -95),
            new THREE.Vector3(-20, 2, 80),
            new THREE.Vector3(100, 20, -30),
        ];
        // Create a camera path with yet another color
        this.oneCameraPath = [
            new THREE.Vector3(60, 5, -35),
            new THREE.Vector3(-10, 20, 30),
            new THREE.Vector3(-20, 30, -30),
        ];

        this.fogPathPoints = [
            new THREE.Vector3(60, 5, -135),
            new THREE.Vector3(-30, 2, 80),
            // new THREE.Vector3(-10, 20, 130),
            new THREE.Vector3(20, 13, -30),
        ];
        this.startTime = Date.now();
    }

    // Add an Ambient Light with customizable parameters
    addAmbientLight({ color = 0x333333, intensity = 1 } = {}) {
        const ambientLight = new THREE.AmbientLight(color, intensity);
        this.scene.add(ambientLight);
        return ambientLight; // Return the light for potential external use
    }

    // Add a Directional Light with customizable parameters
    addDirectionalLight({ color = 0xFFFFFF, intensity = 1, position = { x: 10, y: 20, z: 10 }, castShadow = true } = {}) {
        const directionalLight = new THREE.DirectionalLight(color, intensity);
        directionalLight.position.set(position.x, position.y, position.z);
        directionalLight.castShadow = castShadow;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        this.scene.add(directionalLight);
        return directionalLight; // Return the light for potential external use
    }

    // Add a Spot Light with customizable parameters
    addSpotLight({ color = 0xFFFFFF, intensity = 1, position = { x: 0, y: 10, z: 0 }, angle = 0.3, castShadow = true } = {}) {
        const spotLight = new THREE.SpotLight(color, intensity);
        spotLight.position.set(position.x, position.y, position.z);
        spotLight.angle = angle;
        spotLight.castShadow = castShadow;
        this.scene.add(spotLight);
        return spotLight;
    }

    // Add a Hemisphere Light with customizable parameters
    addHemisphereLight({ skyColor = 0xFFFFFF, groundColor = 0x080820, intensity = 0.6, position = { x: 0, y: 50, z: 0 } } = {}) {
        const hemiLight = new THREE.HemisphereLight(skyColor, groundColor, intensity);
        hemiLight.position.set(position.x, position.y, position.z);
        this.scene.add(hemiLight);
        return hemiLight;
    }

    // Add a Point Light with customizable parameters
    addPointLight({ color = 0xFFFFFF, intensity = 1, position = { x: 10, y: 10, z: 10 }, castShadow = true } = {}) {
        const pointLight = new THREE.PointLight(color, intensity);
        pointLight.position.set(position.x, position.y, position.z);
        pointLight.castShadow = castShadow;
        this.scene.add(pointLight);
        return pointLight;
    }

    // Method to create a path (for example, for a moving object)
    createPath(points, color = 0xff0000) {
        const pathGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const pathMaterial = new THREE.LineBasicMaterial({ color: color });
        const pathLine = new THREE.Line(pathGeometry, pathMaterial);
        this.scene.add(pathLine);
        return pathLine;
    }

    // Method to create a path (for example, for a moving object)
    createCameraPath(color = 0xff0000) {
        const pathGeometry = new THREE.BufferGeometry().setFromPoints(this.cameraPathPoints);
        const pathMaterial = new THREE.LineBasicMaterial({ color: color });
        const pathLine = new THREE.Line(pathGeometry, pathMaterial);
        this.scene.add(pathLine);
        return pathLine;
    }

    // Method to create a path (for example, for a moving object)
    createOneCameraPath(color = 0xff0000) {
        const pathGeometry = new THREE.BufferGeometry().setFromPoints(this.oneCameraPath);
        const pathMaterial = new THREE.LineBasicMaterial({ color: color });
        const pathLine = new THREE.Line(pathGeometry, pathMaterial);
        this.scene.add(pathLine);
        return pathLine;
    }

    // Method to create fog based on path coordinates
    createFogFromPath(points, density = 0.01, color = 0xffffff) {
        const fogColor = new THREE.Color(color);

        // Create fog based on path length
        const fogDistance = points.length * density; // Adjust this calculation based on your needs
        this.scene.fog = new THREE.FogExp2(fogColor, density);

        // Optionally, visualize fog path
        const pathGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const pathMaterial = new THREE.LineBasicMaterial({ color: fogColor.getHex(), opacity: 0.5, transparent: true });
        const fogPathLine = new THREE.Line(pathGeometry, pathMaterial);
        this.scene.add(fogPathLine);
    }

    createRandomHexColor = () => {
        return '#' + Math.floor(Math.random() * 16777215).toString(16);
    }

    createFog(){
            
        // Fog
        this.scene.fog = new THREE.Fog(0xFFFFFF, 0, 200);
        this.scene.fog = new THREE.FogExp2(this.createRandomHexColor(), 0.01);
    }

    update() {
        const elapsedTime = (Date.now() - this.startTime) / 1000; // Convert to seconds
        const totalPoints = this.cameraPathPoints.length;

        const pointIndex = Math.floor(elapsedTime / this.speed) % totalPoints; 
        const nextPointIndex = (pointIndex + 1) % totalPoints;

        const t = (elapsedTime % this.speed) / this.speed; // Value between 0 and 1 over 'speed' seconds
        const currentPoint = this.cameraPathPoints[pointIndex];
        const nextPoint = this.cameraPathPoints[nextPointIndex];

        // Interpolate between the current and next point
        this.camera.position.lerpVectors(currentPoint, nextPoint, t);
        this.camera.lookAt(0, 0, 0); // Ensure the camera looks at the center of the scene
    }

    reset() {
        this.startTime = Date.now(); // Reset the timer to allow the path to restart
    }
}
