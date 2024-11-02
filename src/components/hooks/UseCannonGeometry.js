import { useMemo } from 'react';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';

import sun from '../../galaxy_imgs/sun.jpg';
import stars from '../../galaxy_imgs/stars.jpg';
import mars from '../../galaxy_imgs/mars.jpg';
import earth from '../../galaxy_imgs/earth.jpg';
import saturn from '../../galaxy_imgs/saturn.jpg';
import venus from '../../galaxy_imgs/venus.jpg';
import nebula from '../../galaxy_imgs/nebula.jpg';
import jupiter from '../../galaxy_imgs/jupiter.jpg';
import monkeyUrl from '../../GLTFs/monkey.glb';
import DancingTwerk from '../../FBXs/DancingTwerk.fbx';
import blue_concert from '../../img/blue_concert.jpg';
import landing_dj from '../../img/landing_dj.jpg';
import globe_concert from '../../img/globe_concert.jpg';
import metal_blocks from '../../img/metal_blocks.jpg';
import vasil_guitar from '../../img/vasil_guitar.jpg';
import crowd_angle from '../../img/angle_outdoor_concerts.jpg';
import bright_stage from '../../img/tube_concerts.avif';
import concert_lights from '../../img/bright-concert-lights.avif';

const textureLoader = new THREE.TextureLoader();

// Hook to create a single-material box with shadows
export const useCannonBox = () => {
  return useMemo(() => {
    const mass = 1;
    const position = [
      Math.random() * 2 - 1, // x: random between -1 and 1
      Math.random() * 5 + 3, // y: random between 3 and 8
      Math.random() * 2 - 1  // z: random between -1 and 1
    ];
    const boxShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
    const cannonBox = new CANNON.Body({
      mass,
      position,
    });
    cannonBox.addShape(boxShape);
    return cannonBox;
  }, []);
};

export const useCannonThreeBox = (mass = 1, position = [1, 20, 0], size = [1, 1, 1]) => {
  return useMemo(() => {
    // CANNON physics box body
    const boxShape = new CANNON.Box(new CANNON.Vec3(size[0] / 2, size[1] / 2, size[2] / 2));
    const cannonBox = new CANNON.Body({
      mass,
      position: new CANNON.Vec3(...position),
    });
    cannonBox.addShape(boxShape);

    // THREE.js visual box mesh
    const boxGeometry = new THREE.BoxGeometry(...size);
    const boxMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      wireframe: true,
    });
    const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
    boxMesh.position.set(...position);

    return { cannonBox, boxMesh };
  }, [mass, position, size]);
};

// Hook to create a multi-material box with shadows
export const useMultiFacedCannonBox = (mass = 0.1, position = [-10, 5, -8], size = [2, 2, 2]) => {
  return useMemo(() => {
    // Define the CANNON physics box body
    const boxShape = new CANNON.Box(new CANNON.Vec3(size[0] / 2, size[1] / 2, size[2] / 2));
    const cannonBox = new CANNON.Body({
      mass: mass,
      position: new CANNON.Vec3(...position),
    });
    cannonBox.addShape(boxShape);

    // Define the multi-faced materials for each side of the box
    const boxMultiMaterial = [
      new THREE.MeshPhongMaterial({ map: textureLoader.load(bright_stage) }),
      new THREE.MeshPhongMaterial({ map: textureLoader.load(stars) }),
      new THREE.MeshPhongMaterial({ map: textureLoader.load(nebula) }),
      new THREE.MeshPhongMaterial({ map: textureLoader.load(crowd_angle) }),
      new THREE.MeshPhongMaterial({ map: textureLoader.load(nebula) }),
      new THREE.MeshPhongMaterial({ map: textureLoader.load(concert_lights) }),
    ];

    // Create the THREE.js box geometry with multi-material support
    const boxGeometry = new THREE.BoxGeometry(...size);
    const boxMesh = new THREE.Mesh(boxGeometry, boxMultiMaterial);
    boxMesh.position.set(...position);

    return { cannonBox, boxMesh };
  }, [mass, position, size]);
};

export const useCannonWithThreeBox = (mass = 0.1, position = [-10, 5, -8], size = [2, 2, 2], color = 0x00ff00) => {
  return useMemo(() => {
    // Create the CANNON physics box body
    const boxShape = new CANNON.Box(new CANNON.Vec3(size[0] / 2, size[1] / 2, size[2] / 2));
    const cannonBox = new CANNON.Body({
      mass: mass,
      position: new CANNON.Vec3(...position),
    });
    cannonBox.addShape(boxShape);

    // Create the THREE box mesh for visual representation
    const boxGeometry = new THREE.BoxGeometry(...size);
    const boxMaterial = new THREE.MeshBasicMaterial({ color, wireframe: true });
    const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
    boxMesh.position.set(...position);

    return { cannonBox, boxMesh };
  }, [mass, position, size, color]);
};

// Hook for setting up a sphere with the provided physics material
export const useCannonSphereParticle = (mass = 4, position = [0, 10, 0], radius = 1) => {
  return useMemo(() => {
    const spherePhysMat = new CANNON.Material();

    const canonSphereBody = new CANNON.Body({
      mass: mass,
      position: new CANNON.Vec3(...position),
      material: spherePhysMat,
    });
    canonSphereBody.addShape(new CANNON.Sphere(radius));
    // world.addBody(canonSphereBody);

    return { canonSphereBody, spherePhysMat };
  }, [mass, position, radius]);
};


// Hook for setting up a CANNON sphere with visual representation
export const useCannonSphere = (world, mass = 4, position = [0, 10, 0], radius = 4, color = 0x0000ff) => {
  return useMemo(() => {
    const spherePhysMat = new CANNON.Material();

    // CANNON physics body
    const cannonSphereBody = new CANNON.Body({
      mass: mass,
      position: new CANNON.Vec3(...position),
      material: spherePhysMat,
    });
    cannonSphereBody.addShape(new CANNON.Sphere(radius));
    world.addBody(cannonSphereBody);

    // THREE.js visual sphere mesh
    const sphereGeometry = new THREE.SphereGeometry(radius, 50, 50);
    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: color,
      wireframe: false,
    });

    const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphereMesh.position.set(...position);
    sphereMesh.castShadow = true;

    return { cannonSphereBody, sphereMesh, spherePhysMat };
  }, [world, mass, position, radius, color]);
};


// Hook to create a wireframe box
export const useCannonWiredBox = (mass = 0.1, position = [-10, 5, -8], size = [2, 2, 2]) => {
  return useMemo(() => {
    // CANNON physics box body
    const boxShape = new CANNON.Box(new CANNON.Vec3(size[0] / 2, size[1] / 2, size[2] / 2));
    const cannonBox = new CANNON.Body({
      mass: mass,
      position: new CANNON.Vec3(...position),
    });
    cannonBox.addShape(boxShape);

    // THREE.js visual box mesh (wireframe)
    const boxGeometry = new THREE.BoxGeometry(...size);
    const boxMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      wireframe: true,
    });
    const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
    boxMesh.position.set(...position);

    return { cannonBox, boxMesh };
  }, [mass, position, size]);
};

// Hook for setting up a sphere with the provided physics material
export const useCannonWiredSphere = (world, mass = 4, position = [0, 10, 0], radius = 1) => {
  return useMemo(() => {
    const spherePhysMat = new CANNON.Material();

    const canonSphereBody = new CANNON.Body({
      mass: mass,
      position: new CANNON.Vec3(...position),
      material: spherePhysMat,
    });
    canonSphereBody.addShape(new CANNON.Sphere(radius));
    world.addBody(canonSphereBody);

    // THREE.js visual sphere mesh (wireframe)
    const canonSphereGeo = new THREE.SphereGeometry(radius);
    const canonSphereMat = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      wireframe: true,
    });

    const canonSphereParticle = new THREE.Mesh(canonSphereGeo, canonSphereMat);
    canonSphereParticle.position.set(...position);

    return { canonSphereBody, canonSphereParticle, spherePhysMat };
  }, [world, mass, position, radius]);
};


// Hook for setting up the CANNON.js world
export const useCannonWorld = () => {
  return useMemo(() => {
    const world = new CANNON.World();
    world.gravity.set(0, -9.82, 0); // Earth's gravity in m/s²
    return world;
  }, []);
};

// Hook to create a textured CANNON box
export const useTexturedCannonBox = (world, mass = 1, position = [0, 5, 0], size = [2, 2, 2], textureUrl) => {
  return useMemo(() => {
    // CANNON physics body
    const boxShape = new CANNON.Box(new CANNON.Vec3(size[0] / 2, size[1] / 2, size[2] / 2));
    const cannonBox = new CANNON.Body({
      mass,
      position: new CANNON.Vec3(...position),
    });
    cannonBox.addShape(boxShape);
    world.addBody(cannonBox);

    // THREE.js visual box mesh with texture
    const texture = textureLoader.load(textureUrl);
    const boxGeometry = new THREE.BoxGeometry(...size);
    const boxMaterial = new THREE.MeshStandardMaterial({ map: texture });
    const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
    boxMesh.position.set(...position);
    boxMesh.castShadow = true;
    boxMesh.receiveShadow = true;

    return { cannonBox, boxMesh };
  }, [world, mass, position, size, textureUrl]);
};

// Hook to create a multi-faced CANNON box with different textures
export const useTexturedMultiFacedCannonBox = (world, mass = 1, position = [0, 5, 0], size = [2, 2, 2], textures) => {
  return useMemo(() => {
    // CANNON physics body
    const boxShape = new CANNON.Box(new CANNON.Vec3(size[0] / 2, size[1] / 2, size[2] / 2));
    const cannonBox = new CANNON.Body({
      mass,
      position: new CANNON.Vec3(...position),
    });
    cannonBox.addShape(boxShape);
    world.addBody(cannonBox);

    // THREE.js box geometry with multi-material support
    const boxGeometry = new THREE.BoxGeometry(...size);
    const materials = textures.map(textureUrl => new THREE.MeshPhongMaterial({ map: textureLoader.load(textureUrl) }));
    const boxMesh = new THREE.Mesh(boxGeometry, materials);
    boxMesh.position.set(...position);
    boxMesh.castShadow = true;
    boxMesh.receiveShadow = true;

    return { cannonBox, boxMesh };
  }, [world, mass, position, size, textures]);
};

// Hook to create a textured CANNON sphere
export const useTexturedCannonSphere = (world, mass = 4, position = [0, 10, 0], radius = 1, textureUrl) => {
  return useMemo(() => {
    // CANNON physics body
    const spherePhysMat = new CANNON.Material();

    const cannonSphereBody = new CANNON.Body({
      mass,
      position: new CANNON.Vec3(...position),
      material: spherePhysMat,
    });
    cannonSphereBody.addShape(new CANNON.Sphere(radius));
    world.addBody(cannonSphereBody);

    // THREE.js visual sphere mesh with texture
    const texture = textureLoader.load(textureUrl);
    const sphereGeometry = new THREE.SphereGeometry(radius, 50, 50);
    const sphereMaterial = new THREE.MeshStandardMaterial({ map: texture });
    const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphereMesh.position.set(...position);
    sphereMesh.castShadow = true;
    sphereMesh.receiveShadow = true;

    return { cannonSphereBody, sphereMesh, spherePhysMat };
  }, [world, mass, position, radius, textureUrl]);
};


