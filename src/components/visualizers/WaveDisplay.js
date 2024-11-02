import React, { useRef, useEffect } from 'react';
import { useState } from 'react';
import * as THREE from 'three';

function WaveDisplay({ waveType }) {
    const canvasRef = useRef();
    const [renderer, setRenderer] = useState(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
        camera.position.z = 1;

        const waveShader = new THREE.ShaderMaterial({
            uniforms: {
                uWaveMix: { value: waveType },
                uTime: { value: 0 },
                uFrequency: { value: 2.0 },
                uAmplitude: { value: 0.3 },
            },
            vertexShader: `
                void main() {
                    gl_Position = vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float uWaveMix;
                uniform float uTime;
                uniform float uFrequency;
                uniform float uAmplitude;

                float sineWave(float time) {
                    return sin(uFrequency * time);
                }

                float sawWave(float time) {
                    return 2.0 * (time * uFrequency - floor(0.5 + time * uFrequency));
                }

                float squareWave(float time) {
                    return sign(sin(uFrequency * time));
                }

                float interpolateWaves(float time) {
                    if (uWaveMix < 1.0) {
                        return mix(sineWave(time), sawWave(time), uWaveMix);
                    } else {
                        return mix(sawWave(time), squareWave(time), uWaveMix - 1.0);
                    }
                }

                void main() {
                    float time = gl_FragCoord.x / 500.0 + uTime;
                    float waveValue = interpolateWaves(time) * uAmplitude;
                    vec3 color = vec3(0.5 + 0.5 * waveValue, 0.3, 1.0 - abs(waveValue));
                    gl_FragColor = vec4(color, 1.0);
                }
            `,
        });

        const plane = new THREE.PlaneGeometry(2, 2);
        const mesh = new THREE.Mesh(plane, waveShader);
        scene.add(mesh);

        const animate = (time) => {
            waveShader.uniforms.uTime.value = time / 1000;
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        };

        const initRenderer = new THREE.WebGLRenderer({ canvas });
        initRenderer.setSize(500, 200);
        setRenderer(initRenderer);

        animate(0);

        return () => {
            renderer && renderer.dispose();
        };
    }, [renderer, waveType]);

    return <canvas ref={canvasRef} width="500" height="200"></canvas>;
}

export default WaveDisplay;