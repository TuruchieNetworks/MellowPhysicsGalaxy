import { useCallback } from 'react';
import * as THREE from 'three';

function useGaussianVelocity() {
  const gaussianVelocityWithDistribution = useCallback(() => {
    const mean = 0;
    const stdDev = 1.943;

    function randomGaussian() {
      let u = 0, v = 0;
      while (u === 0) u = Math.random();
      while (v === 0) v = Math.random();
      return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    }

    return new THREE.Vector3(
      mean + stdDev * randomGaussian(),
      mean + stdDev * randomGaussian(),
      mean + stdDev * randomGaussian()
    );
  }, []);

  return gaussianVelocityWithDistribution;
}

function useGaussianMass() {
  const gaussianMassWithDistribution = useCallback(() => {
    const mean = 2;
    const stdDev = 0.5;

    function randomGaussian() {
      let u = 0, v = 0;
      while (u === 0) u = Math.random();
      while (v === 0) v = Math.random();
      return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    }

    return Math.max(mean + stdDev * randomGaussian(), 0.1);
  }, []);

  return gaussianMassWithDistribution;
}

export { useGaussianVelocity, useGaussianMass };

// ERROR in [eslint]
// src\components\hooks\UseGaussianVelocity.js
//   Line 65:33:  'intersectionPoint' is not defined  no-undef

// Search for the keywords to learn more about each error.

// webpack compiled with 5 errors and 1 warning

// function YourComponent({ scene }) {
//   const generateVelocity = useGaussianVelocity();
//   const generateMass = useGaussianMass();
//   const [clickedSpheres, setClickedSpheres] = useState([]);
//   const handleClick = () => {
//     const newSphereGeo = new THREE.SphereGeometry(2.125, 30, 30);
//     const newSphereMat = new THREE.MeshPhongMaterial({
//       color: Math.random() * 0xFFFFFF,
//       metalness: 0,
//       roughness: 0,
//     });
//     const newSphereMesh = new THREE.Mesh(newSphereGeo, newSphereMat);

//     const velocity = generateVelocity();
//     const mass = generateMass();

//     newSphereMesh.castShadow = true;
//     newSphereMesh.receiveShadow = true;

//     // Assume intersectionPoint is already calculated based on click
//     newSphereMesh.position.copy(intersectionPoint);

//     // Add new sphere to scene
//     scene.add(newSphereMesh);

//     // Update state with the new sphere, including Gaussian mass
//     setClickedSpheres((prevSpheres) => [
//       ...prevSpheres,
//       {
//         sphere: newSphereMesh,
//         velocity,
//         mass, // Gaussian mass for momentum calculations
//         initialPosition: newSphereMesh.position.clone(),
//       },
//     ]);

//     const timeoutId = setTimeout(() => {
//       scene.remove(newSphereMesh);
//       setClickedSpheres((prevSpheres) => prevSpheres.filter(s => s.sphere !== newSphereMesh));
//     }, 30000);
//   };

//   return (
//     <div onClick={handleClick}>
//       {/* Additional UI elements */}
//     </div>
//   );
// }

// export default YourComponent;
