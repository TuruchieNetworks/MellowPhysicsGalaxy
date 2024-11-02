import React from 'react';
import { Canvas } from '@react-three/fiber';
import { useGeometry } from './useGeometry';

const BasicGeometries = () => {
  useGeometry(); // Initialize geometries

  return (
    <Canvas style={{ width: '100vw', height: '100vh' }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 20, 10]} intensity={1} />
    </Canvas>
  );
};

export default BasicGeometries;
