import { useMemo } from 'react';
import * as THREE from 'three';

const useNoiseShader = (width, height) => {
    return useMemo(() => {
        return {
            uniforms: {
                time: { value: 0.0 },
                resolution: { value: new THREE.Vector2(width, height) },
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                varying vec2 vUv;

                float noise(float x, float z) {
                    return fract(sin(dot(vec2(x, z) + time, vec2(12.9898, 78.233))) * 43758.5453);
                }

                float S(float t) {
                    return smoothstep(0.0, 1.0, t);
                }

                void main() {
                    vec2 uv = vUv * 10.0; 
                    float x = uv.x;
                    float z = uv.y;

                    float burst = noise(x, z);
                    float value = 0.0;

                    for (int i = -1; i <= 1; i++) {
                        for (int j = -1; j <= 1; j++) {
                            value += S(x - float(i)) * S(z - float(j));
                        }
                    }

                    gl_FragColor = vec4(vec3(value + burst), 1.0); 
                }
            `,
        };
    }, [width, height]);
};

export default useNoiseShader;
