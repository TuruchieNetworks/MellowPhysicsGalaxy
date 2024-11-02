import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";
import { extend } from "@react-three/fiber";

// Define shader material with props for coefficients
const PolynomialSurfaceMaterial = shaderMaterial(
  {
    a00: 2.0,
    ak: 1.2,
    a_k_n: -0.8,
    a_k_m: 0.6,
    a_k_i: 0.3,
    a_m_1: -0.4,
  },
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
    uniform float a00, ak, a_k_n, a_k_m, a_k_i, a_m_1;
    varying vec2 vUv;

    void main() {
      float x = (vUv.x - 0.5) * 10.0;
      float z = (vUv.y - 0.5) * 10.0;

      float y = a00 + (ak * x) + (a_k_n * x * x) + (a_k_m * z) + (a_k_i * x * z) + (a_m_1 * z * z * z);
      gl_FragColor = vec4(vec3(0.5 + 0.5 * y), 1.0);
    }
  `
);

extend({ PolynomialSurfaceMaterial });

const PolynomialSurfaceShader = (props) => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeBufferGeometry args={[10, 10, 64, 64]} />
      <polynomialSurfaceMaterial {...props} />
    </mesh>
  );
};

export default PolynomialSurfaceShader;
