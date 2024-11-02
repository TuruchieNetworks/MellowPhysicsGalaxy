import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import nebula from '../../galaxy_imgs/nebula.jpg';
import stars from '../../galaxy_imgs/stars.jpg';
import crowd_angle from '../../img/angle_outdoor_concerts.jpg';
import concert_lights from '../../img/bright-concert-lights.avif';
import landing_dj from '../../img/landing_dj.jpg';
import globe_concert from '../../img/globe_concert.jpg';
import metal_blocks from '../../img/metal_blocks.jpg';

export const useGeometries = () => {
  const { scene } = useThree();
  const spheres = useRef([]);
  const boxes = useRef([]);
  const fbxModels = useRef([]);
  const gltfModels = useRef([]);
  const textureLoader = useRef(new THREE.TextureLoader());

  useEffect(() => {
    createInitialGeometries();

    return () => {
      // Clean up on unmount if necessary
      spheres.current.forEach(sphere => scene.remove(sphere));
      boxes.current.forEach(box => scene.remove(box));
      gltfModels.current.forEach(model => scene.remove(model));
      fbxModels.current.forEach(model => scene.remove(model));
    };
  }, [scene]);

  const createInitialGeometries = () => {
    createMultiBoxes(5);
    createSpheres(5);
    createBoxes(5);
  };

  const createBox = ({ width = 1, height = 1, depth = 1, position = new THREE.Vector3(0, 0, 0), color = 0xff7700 }) => {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({ color });
    const box = new THREE.Mesh(geometry, material);

    box.position.copy(position);
    box.castShadow = box.receiveShadow = true;
    scene.add(box);
    boxes.current.push(box);
    return box;
  };

  const createMultiBox = ({ width = 1, height = 1, depth = 1, position = new THREE.Vector3(0, 0, 0), materials = [] }) => {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const multiBoxMaterial = materials.length > 0 ? materials : [
      new THREE.MeshStandardMaterial({ map: textureLoader.current.load(nebula) }),
      new THREE.MeshStandardMaterial({ map: textureLoader.current.load(stars) }),
      new THREE.MeshStandardMaterial({ map: textureLoader.current.load(crowd_angle) }),
      new THREE.MeshStandardMaterial({ map: textureLoader.current.load(concert_lights) }),
      new THREE.MeshStandardMaterial({ map: textureLoader.current.load(landing_dj) }),
      new THREE.MeshStandardMaterial({ map: textureLoader.current.load(metal_blocks) }),
      new THREE.MeshStandardMaterial({ map: textureLoader.current.load(globe_concert) })
    ];

    const multiBox = new THREE.Mesh(geometry, multiBoxMaterial);
    multiBox.position.copy(position);
    multiBox.castShadow = multiBox.receiveShadow = true;
    scene.add(multiBox);
    return multiBox;
  };

  const createMultiBoxes = (count) => {
    for (let i = 0; i < count; i++) {
      const position = new THREE.Vector3(Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5);
      createMultiBox({ position });
    }
  };

  const createSphere = ({ radius = 1, position = new THREE.Vector3(0, 0, 0), color = Math.random() * 0xffffff }) => {
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color });
    const sphere = new THREE.Mesh(geometry, material);

    sphere.position.copy(position);
    sphere.castShadow = sphere.receiveShadow = true;
    scene.add(sphere);
    spheres.current.push(sphere);
    return sphere;
  };

  const createSpheres = (count) => {
    for (let i = 0; i < count; i++) {
      const position = new THREE.Vector3(Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5);
      createSphere({ position });
    }
  };

  useFrame(() => {
    // Rotate spheres and boxes on each frame
    spheres.current.forEach(sphere => {
      sphere.rotation.x += 0.01;
      sphere.rotation.y += 0.01;
    });

    boxes.current.forEach(box => {
      box.rotation.x += 0.01;
      box.rotation.y += 0.01;
    });
  });

  return { createBox, createMultiBox, createSphere }; // Return these if you want external components to call them
};
