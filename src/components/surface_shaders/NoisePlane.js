// NoisePlane.js
import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import NoiseShader from "./NoiseShader";

const NoisePlane = () => {
  // const materialRef = useRef();

  // // Update the material's time uniform every frame
  // useFrame(({ clock }) => {
  //   if (materialRef.current) {
  //     materialRef.current.time += clock.getDelta(); // Increment time for animation
  //   }
  // });

  return (
    <div>
      <NoiseShader />
    </div>
  );
};

export default function ShaderApp() {
  return (
    <Canvas>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <NoisePlane />
    </Canvas>
  );
}
