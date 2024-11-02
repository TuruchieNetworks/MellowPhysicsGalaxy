import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import PolynomialSurfaceShader from "./PolynomialSurfaceShader";

const FluidScene = () => {
  // Define states for shader coefficients
  const [a00, setA00] = useState(2.0);
  const [ak, setAk] = useState(1.2);
  const [a_k_n, setAKN] = useState(-0.8);
  const [a_k_m, setAKM] = useState(0.6);
  const [a_k_i, setAKI] = useState(0.3);
  const [a_m_1, setAM1] = useState(-0.4);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <PolynomialSurfaceShader
          a00={a00}
          ak={ak}
          a_k_n={a_k_n}
          a_k_m={a_k_m}
          a_k_i={a_k_i}
          a_m_1={a_m_1}
        />
        <OrbitControls />
      </Canvas>

      {/* Controls */}
      <div style={{ position: "absolute", top: 10, left: 10 }}>
        <h2>Polynomial Surface Controls</h2>
        <label>
          a00:
          <input
            type="range"
            min="-10"
            max="10"
            step="0.1"
            value={a00}
            onChange={(e) => setA00(parseFloat(e.target.value))}
          />
        </label>
        <label>
          ak:
          <input
            type="range"
            min="-10"
            max="10"
            step="0.1"
            value={ak}
            onChange={(e) => setAk(parseFloat(e.target.value))}
          />
        </label>
        <label>
          a_k_n:
          <input
            type="range"
            min="-10"
            max="10"
            step="0.1"
            value={a_k_n}
            onChange={(e) => setAKN(parseFloat(e.target.value))}
          />
        </label>
        <label>
          a_k_m:
          <input
            type="range"
            min="-10"
            max="10"
            step="0.1"
            value={a_k_m}
            onChange={(e) => setAKM(parseFloat(e.target.value))}
          />
        </label>
        <label>
          a_k_i:
          <input
            type="range"
            min="-10"
            max="10"
            step="0.1"
            value={a_k_i}
            onChange={(e) => setAKI(parseFloat(e.target.value))}
          />
        </label>
        <label>
          a_m_1:
          <input
            type="range"
            min="-10"
            max="10"
            step="0.1"
            value={a_m_1}
            onChange={(e) => setAM1(parseFloat(e.target.value))}
          />
        </label>
      </div>
    </div>
  );
};

export default FluidScene;