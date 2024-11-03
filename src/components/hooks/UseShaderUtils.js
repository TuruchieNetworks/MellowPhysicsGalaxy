import * as THREE from 'three';
import { useCallback } from 'react';

const useShaderUtils = () => {
  const starryBackgrounds = useCallback(() => {
    const starryShader = {
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform samplerCube backgroundTexture;
        varying vec3 vWorldPosition;

        // Simple random noise function
        float randomNoise(vec3 pos) {
            return fract(sin(dot(pos.xyz, vec3(12.9898, 78.233, 54.53))) * 43758.5453);
        }

        void main() {
            vec4 texColor = textureCube(backgroundTexture, vWorldPosition);
            float noise = randomNoise(vWorldPosition * 0.1);
            vec3 color = mix(texColor.rgb, vec3(1.0, 0.8, 0.6), noise * 0.2); // Adding subtle noise effect
            gl_FragColor = vec4(color, 1.0);
        }
      `
    };
    return starryShader;
  }, []);

  // Noise Plane
  const noisePlane = useCallback(() => {
    const noiseShader = {
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
              float value = 0.3;

              for (int i = -1; i <= 1; i++) {
                  for (int j = -1; j <= 1; j++) {
                      float aij = 0.13; // base value
                      float bij = 1.7; // variation
                      float cij = 0.51; // adjust
                      float dij = 0.33; // noise contribution

                      value += aij + (bij - aij) * S(x - float(i)) + (aij - bij - cij + dij) * S(x - float(i)) * S(z - float(j));
                  }
              }

              gl_FragColor = vec4(vec3(value + burst), 1.0); // Change the color based on the shader output
          }
      `,
    };
    return noiseShader;
  }, []);
  // Noise Plane
  const sawPlane = useCallback(() => {
    const sawShader = {
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
                      float cij = 0.51; // adjust
                      float dij = 0.33; // noise contribution

                      value += aij + (bij - aij) * S(x - float(i)) + (aij - bij - cij + dij) * S(x - float(i)) * S(z - float(j));
                  }
              }

              gl_FragColor = vec4(vec3(value + burst), 1.0); // Change the color based on the shader output
          }
      `,
    };
    return sawShader;
  }, []);

  
  const convolutionPlane = useCallback(() => {
    const noiseShader = {
      uniforms: {
          time: { value: 0.0 },
          resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
          shapeFactor: { value: 0.5 }, // Control for trapezoidal shape
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
          uniform vec2 resolution;
          uniform float shapeFactor;
          varying vec2 vUv;

          float trapezoid(float x, float height, float width) {
              float slope = height / (width * 0.5);
              return smoothstep(0.0, slope, height - abs(x));
          }

          float noise(float x, float z) {
              return fract(sin(dot(vec2(x, z) + time, vec2(12.9898, 78.233))) * 43758.5453);
          }

          void main() {
              vec2 uv = vUv * 10.0; // Scale the UV coordinates
              float value = 0.0;

              // Create the convolution shape effect
              for (int i = -11; i <= 11; i++) {
                  for (int j = -5; j <= 5; j++) {
                      float xOffset = float(i) * shapeFactor; // Adjusting the shape dynamically
                      float zOffset = float(j) * shapeFactor;
                      float burst = noise(uv.x + xOffset, uv.y + zOffset);
                      float trapValue = trapezoid(uv.x - xOffset, 1.0, shapeFactor); // Trapezoidal shape
                      value += burst * trapValue; // Combine noise with the trapezoid shape
                  }
              }

              // Apply a wave effect to color based on the value
              vec3 color = vec3(value * 0.3 + 0.5); // Modulate color based on the calculated value
              gl_FragColor = vec4(color, 0.9); // Final output color
          }
      `,
    };
    return noiseShader;
  }, []);

  return { starryBackgrounds, convolutionPlane, noisePlane, sawPlane };
};

export default useShaderUtils;
