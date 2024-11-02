import React, { useCallback, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber'; // Use if using react-three-fiber

// Import the Gaussian velocity and mass functions
import { useGaussianVelocity, useGaussianMass } from '../../components/hooks/UseGaussianVelocity';

function PhysicsAnimationComponent() {
  const [clickedSpheres, setClickedSpheres] = useState([]);
  const generateVelocity = useGaussianVelocity();
  const generateMass = useGaussianMass();

  const gravity = new THREE.Vector3(0, -0.1, 0); // Gravity vector
  const dampingFactor = 0.99; // Damping factor for velocity

  // Handle mouse click
  const handleClick = () => {
    const newSphereGeo = new THREE.SphereGeometry(2.125, 30, 30);
    const newSphereMat = new THREE.MeshPhongMaterial({
      color: Math.random() * 0xFFFFFF,
      metalness: 0,
      roughness: 0,
    });
    const newSphereMesh = new THREE.Mesh(newSphereGeo, newSphereMat);

    newSphereMesh.castShadow = true;
    newSphereMesh.receiveShadow = true;

    const velocity = generateVelocity();
    const mass = generateMass();

    scene.add(newSphereMesh);
    newSphereMesh.position.copy(intersectionPoint);

    setClickedSpheres((prevSpheres) => [
      ...prevSpheres,
      {
        sphere: newSphereMesh,
        velocity,
        mass, // Gaussian mass for momentum calculations
        initialPosition: newSphereMesh.position.clone(),
      },
    ]);

    const timeoutId = setTimeout(() => {
      scene.remove(newSphereMesh);
      setClickedSpheres((prevSpheres) => prevSpheres.filter(s => s.sphere !== newSphereMesh));
    }, 30000);
  };

  // Update positions with gravity on each frame
  useFrame(() => {
    setClickedSpheres((prevSpheres) => 
      prevSpheres.map(({ sphere, velocity, mass }) => {
        // Apply gravity to velocity
        velocity.add(gravity.clone().multiplyScalar(mass));

        // Update position based on velocity
        sphere.position.add(velocity);

        // Apply damping to velocity
        velocity.multiplyScalar(dampingFactor);

        return { sphere, velocity, mass };
      })
    );
  });

  return <mesh onClick={handleClick} />;
}

export default PhysicsAnimationComponent;
