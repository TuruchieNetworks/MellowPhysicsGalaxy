// ShaderUtils.js
import * as THREE from 'three';
import { useMemo } from 'react';

export const UseNoiseShaderMaterial = () => {
    // Use useMemo to memoize the shader material to optimize performance
    return useMemo(() => {
        // Define and return the noise shader
        let noiseShader;
        const getNoiseShader = () => ({
            uniforms: {
                time: { value: 0.0 },
                resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
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
                    vec2 uv = vUv * 10.0; // Scale the UV coordinates
                    float x = uv.x;
                    float z = uv.y;

                    float burst = noise(x, z);
                    float value = 0.0;

                    for (int i = -1; i <= 1; i++) {
                        for (int j = -1; j <= 1; j++) {
                            float aij = 0.0; // base value
                            float bij = 1.0; // variation
                            float cij = 0.5; // adjust
                            float dij = 0.2; // noise contribution

                            value += aij + (bij - aij) * S(x - float(i)) + (aij - bij - cij + dij) * S(x - float(i)) * S(z - float(j));
                        }
                    }

                    gl_FragColor = vec4(vec3(value + burst), 1.0); // Change the color based on the shader output
                }
            `,
        });
        noiseShader = getNoiseShader()

        return noiseShader;
    }, []); // Empty dependency array means it only runs on mount
};

export const usePerlinNoiseShaderMaterial = () => { 
    // Use useMemo to memoize the shader material to optimize performance
    return useMemo(() => {
        // Define and return the Perlin shader
        const getPerlinShader = () => ({
            uniforms: {
                time: { value: 0.0 },
                resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
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

                // Simple Perlin noise function (placeholder for your actual implementation)
                float perlinNoise(vec2 uv) {
                    // Implement or import your Perlin noise algorithm here
                    return fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
                }

                void main() {
                    vec2 uv = vUv * 5.0; // Scale the UV coordinates
                    float value = perlinNoise(uv);
                    gl_FragColor = vec4(vec3(value), 1.0); // Set color based on Perlin noise value
                }
            `,
        });

        return getPerlinShader(); // Call the function to return the shader object
    }, []); // Empty dependency array means it only runs on mount
};




// export const UseShaderMaterials = {
//     getNoiseShader: () => ({
//         uniforms: {
//             time: { value: 0.0 },
//             resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
//         },
//         vertexShader: `
//             varying vec2 vUv;
//             void main() {
//                 vUv = uv;
//                 gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//             }
//         `,
//         fragmentShader: `
//             uniform float time;
//             varying vec2 vUv;

//             float noise(float x, float z) {
//                 return fract(sin(dot(vec2(x, z) + time, vec2(12.9898, 78.233))) * 43758.5453);
//             }

//             float S(float t) {
//                 return smoothstep(0.0, 1.0, t);
//             }

//             void main() {
//                 vec2 uv = vUv * 10.0; // Scale the UV coordinates
//                 float x = uv.x;
//                 float z = uv.y;

//                 float burst = noise(x, z);
//                 float value = 0.0;

//                 for (int i = -1; i <= 1; i++) {
//                     for (int j = -1; j <= 1; j++) {
//                         float aij = 0.0; // base value
//                         float bij = 1.0; // variation
//                         float cij = 0.5; // adjust
//                         float dij = 0.2; // noise contribution

//                         value += aij + (bij - aij) * S(x - float(i)) + (aij - bij - cij + dij) * S(x - float(i)) * S(z - float(j));
//                     }
//                 }

//                 gl_FragColor = vec4(vec3(value + burst), 1.0); // Change the color based on the shader output
//             }
//         `,
//     }),

//     // Example of another shader

//     // You can add more shader patterns like Boltzmann and convolution similarly
// };


// export default UseShaderMaterials;


