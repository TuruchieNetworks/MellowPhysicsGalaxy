// useShaderManager.js
import * as THREE from "three";
import useShaderUtils from '../hooks/UseShaderUtils';

const useShaderManager = (noisePlane, sawPlane, convolutionPlane, starryBackgrounds) => {    
    const shaderMaterials = {
        noise: createShaderMaterial(noisePlane),
        saw: createShaderMaterial(sawPlane),
        convolution: createShaderMaterial(convolutionPlane),
        starryBackgrounds: createShaderMaterial(starryBackgrounds),
    };

    const createShaderMaterial = (shader) => {
        return new THREE.ShaderMaterial({
            uniforms: shader.uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader,
        });
    }

    const updateTime = (time) => {
        for (const key in shaderMaterials) {
            if (shaderMaterials[key].uniforms.time) {
                shaderMaterials[key].uniforms.time.value = time;
            }
        }
    }

    return {
        shaderMaterials,
        updateTime,
    };
};

export default useShaderManager;
