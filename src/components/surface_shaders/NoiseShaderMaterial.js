// NoiseShaderMaterial.js
import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";

// Define the shader material
const NoiseShaderMaterial = shaderMaterial(
  { time: 0 },
  // Vertex Shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
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

        gl_FragColor = vec4(vec3(value + burst), 1.0);
    }
  `
);

export default NoiseShaderMaterial;


// extend({ NoiseShaderMaterial });

// const NoisePlane = () => {
//   const materialRef = useRef();

//   useEffect(() => {
//     const animate = () => {
//       if (materialRef.current) {
//         materialRef.current.time += 0.05; // Update time for animation
//       }
//       requestAnimationFrame(animate);
//     };
//     animate();
//   }, []);

//   return (
//     <mesh rotation={[-Math.PI / 2, 0, 0]}>
//       <planeBufferGeometry args={[10, 10, 64, 64]} />
//       <noiseShaderMaterial ref={materialRef} />
//     </mesh>
//   );
// };

// export default function App() {
//   return (
//     <Canvas>
//       <ambientLight />
//       <pointLight position={[10, 10, 10]} />
//       <NoisePlane />
//     </Canvas>
//   );
// }