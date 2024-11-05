import { useMemo } from "react";
import * as THREE from "three";

const useCameraPath = () => {
    // Use useMemo to memoize the shader material to optimize performance
    return useMemo(() => {
        const paths = {
            defaultPath: [
                new THREE.Vector3(60, 5, -35),
                new THREE.Vector3(-10, 20, 30),
                new THREE.Vector3(-20, 30, -30),
            ],
            alternatePath: [
                new THREE.Vector3(30, 10, -50),
                new THREE.Vector3(10, 25, 20),
                new THREE.Vector3(-40, 15, -10),
            ],
            // Add more paths as needed
        };

        return paths; //[pathName] || paths.defaultPath;
        // noiseShader = getNoiseShader()

        // return noiseShader;
    }, []); // Empty dependency array means it only runs on mount
};
export default useCameraPath
