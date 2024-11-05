import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';

const useSandParticles = ({ width, height, particleCount }) => {
    const canvasRef = useRef(null);
    const sandParticlesRef = useRef([]);
    const particleBodiesRef = useRef([]);
    const renderer = new THREE.WebGLRenderer();
    const scene = new THREE.Scene();
    const world = new CANNON.World();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

    const randomHexColor = () => `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    const timeStep = 1 / 60;
    const cameraPathPoints = []; // Define or load camera path points here
    const noiseShader = {}; // Define or load your noise shader here

    useEffect(() => {
        renderer.setSize(width, height);
        canvasRef.current.appendChild(renderer.domElement);

        for (let i = 0; i < particleCount; i++) {
            const geometry = new THREE.SphereGeometry(0.2, 16, 16);
            const material = new THREE.MeshStandardMaterial({ color: randomHexColor() });
            const mesh = new THREE.Mesh(geometry, material);
            const x = (Math.random() - 0.5) * 10;
            const y = Math.random() * 10 + 10;
            const z = (Math.random() - 0.5) * 10;
            mesh.position.set(x, y, z);
            scene.add(mesh);
            sandParticlesRef.current.push(mesh);

            const shape = new CANNON.Sphere(0.2);
            const particleBody = new CANNON.Body({
                mass: 13.1,
                position: new CANNON.Vec3(x, y, z),
            });
            particleBody.addShape(shape);
            world.addBody(particleBody);
            particleBodiesRef.current.push(particleBody);
        }

        const startTime = Date.now();

        const animate = (time) => {
            requestAnimationFrame(animate);
            const elapsedTime = (Date.now() - startTime) / 1000;
            const speed = 5;
            const totalPoints = cameraPathPoints.length;

            world.step(timeStep);

            sandParticlesRef.current.forEach((mesh, i) => {
                const body = particleBodiesRef.current[i];
                mesh.position.copy(body.position);
                mesh.quaternion.copy(body.quaternion);
            });

            const pointIndex = Math.floor(elapsedTime / speed) % totalPoints;
            const nextPointIndex = (pointIndex + 1) % totalPoints;
            const t = (elapsedTime % speed) / speed;
            const currentPoint = cameraPathPoints[pointIndex];
            const nextPoint = cameraPathPoints[nextPointIndex];
            camera.position.lerpVectors(currentPoint, nextPoint, t);
            camera.lookAt(scene.position);

            noiseShader.uniforms.time.value = time * 0.001;

            renderer.render(scene, camera);
        };
        animate();

        return () => {
            sandParticlesRef.current.forEach(mesh => scene.remove(mesh));
            renderer.dispose();
        };
    }, [width, height, particleCount]);

    return <canvas ref={canvasRef} className="galaxial-animation" />;
};

export default useSandParticles;
