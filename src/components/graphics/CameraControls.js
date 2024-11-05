import * as THREE from "three";

class CameraControls {
    constructor(camera, speed, pathPoints) {
        this.camera = camera;
        this.speed = speed;
        this.pathPoints = pathPoints;
        this.startTime = Date.now();
    }

    update() {
        const elapsedTime = (Date.now() - this.startTime) / 1000; // Convert to seconds
        const totalPoints = this.pathPoints.length;

        const pointIndex = Math.floor(elapsedTime / this.speed) % totalPoints; 
        const nextPointIndex = (pointIndex + 1) % totalPoints;

        const t = (elapsedTime % this.speed) / this.speed; // Value between 0 and 1 over 'speed' seconds
        const currentPoint = this.pathPoints[pointIndex];
        const nextPoint = this.pathPoints[nextPointIndex];

        // Interpolate between the current and next point
        this.camera.position.lerpVectors(currentPoint, nextPoint, t);
        this.camera.lookAt(0, 0, 0); // Ensure the camera looks at the center of the scene
    }

    reset() {
        this.startTime = Date.now(); // Reset the timer to allow the path to restart
    }
}

export default CameraControls;
