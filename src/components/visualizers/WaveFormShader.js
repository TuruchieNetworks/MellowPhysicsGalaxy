import * as THREE from 'three';
import { useRef, useEffect } from 'react';

const WaveformShader = () => {
    const sceneRef = useRef();
    const waveformDataRef = useRef(new Float32Array(2048));
    const uniformsRef = useRef();

    useEffect(() => {
        // Set up the scene, camera, and renderer
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        // Audio Setup
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 2048;
        const waveformData = waveformDataRef.current;

        // Generate Audio Data
        const oscillator = audioCtx.createOscillator();
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(220, audioCtx.currentTime); // Example frequency
        oscillator.connect(analyser);
        analyser.connect(audioCtx.destination);
        oscillator.start();

        // Create Shader Material with GLSL
        uniformsRef.current = {
            uWaveformData: { value: waveformData },
            uTime: { value: 0.0 }
        };

        const material = new THREE.ShaderMaterial({
            uniforms: uniformsRef.current,
            vertexShader: vertexShader(),
            fragmentShader: fragmentShader(),
        });

        // Create Geometry and Mesh
        const geometry = new THREE.PlaneGeometry(10, 3, 1024, 1);
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // Animation Loop
        const animate = () => {
            requestAnimationFrame(animate);
            
            // Get waveform data
            analyser.getFloatTimeDomainData(waveformData);
            
            // Update uniforms
            uniformsRef.current.uTime.value += 0.05;
            renderer.render(scene, camera);
        };
        animate();

        // Cleanup on unmount
        return () => {
            oscillator.stop();
            audioCtx.close();
            document.body.removeChild(renderer.domElement);
        };
    }, []);

    return null;
};
export default WaveformShader;

function vertexShader() {
    return `
        varying float vAmplitude;
        attribute float waveform;
        uniform float uTime;
        void main() {
            vAmplitude = waveform;
            vec3 newPosition = position;
            newPosition.y += waveform * 0.2;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
    `;
}

function fragmentShader() {
    return `
        varying float vAmplitude;
        uniform float uTime;

        void main() {
            // Color based on amplitude
            vec3 color = vec3(0.5 + 0.5 * cos(uTime + vAmplitude * 5.0), 0.3, 0.8 * vAmplitude);
            gl_FragColor = vec4(color, 1.0);
        }
    `;
}