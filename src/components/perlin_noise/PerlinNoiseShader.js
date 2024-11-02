// PerlinNoiseShader.js
import React, { forwardRef } from 'react';
import { useFrame } from '@react-three/fiber';

const PerlinNoiseShader = forwardRef(({ hovered }, ref) => {
  useFrame(({ clock }) => {
    ref.current.uniforms.time.value = clock.getElapsedTime();
    ref.current.uniforms.hovered.value = hovered ? 1.0 : 0.0;
  });

  return (
    <shaderMaterial
      ref={ref}
      uniforms={{
        time: { value: 0 },
        hovered: { value: 0 },
      }}
      // vertexShader={/* Vertex Shader Code Here */}
      fragmentShader={`
        uniform float time;
        uniform float hovered;
        varying vec2 vUv;

        float perlin(float x, float z) {
          // Implement Perlin noise algorithm here
          return fract(sin(dot(vec2(x, z) + time, vec2(12.9898, 78.233))) * 43758.5453);
        }

        void main() {
          vec2 uv = vUv * 10.0;
          float x = uv.x;
          float z = uv.y;

          float burst = perlin(x, z);
          float effect = hovered > 0.0 ? burst * 1.5 : burst;

          gl_FragColor = vec4(vec3(effect), 1.0);
        }
      `}
    />
  );
});

export default PerlinNoiseShader;