// PerlinTsunami.js
import React, { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import PerlinNoiseShader from './PerlinNoiseShader';

const PerlinTsunami = () => {
  const materialRef = useRef();
  const [hovered, setHovered] = useState(false);

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <planeBufferGeometry args={[10, 10, 64, 64]} />
      <PerlinNoiseShader ref={materialRef} hovered={hovered} />
    </mesh>
  );
};

export default PerlinTsunami;