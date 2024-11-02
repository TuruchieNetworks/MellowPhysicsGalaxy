import React from 'react';
import { Canvas } from '@react-three/fiber';
import PerlinClouds from './PerlinClouds';
import PerlinTerrain from './PerlinTerrain';
import PerlinTsunami from './PerlinTsunami';


const PerlinScene = () => {
    return (
        <div id="showcase">
        <Canvas>
          <ambientLight />
          <pointLight position={[10, 10, 10]} />
          <PerlinClouds />
          <PerlinTerrain />
          <PerlinTsunami />
        </Canvas>
        </div>
    );
};

export default PerlinScene;
