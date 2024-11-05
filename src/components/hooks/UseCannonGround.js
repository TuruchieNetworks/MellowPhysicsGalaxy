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
import blue_stage from '../../img/blue_stage_entrance.avif';
import guitar_boy from '../../img/dark-greece.avif';
import concert_lights from '../../img/bright-concert-lights.avif';

export const useCannonGround = () => {
  return useMemo(() => {
    // Create a CANNON plane body
    const groundShape = new CANNON.Plane();
    const groundBody = new CANNON.Body({
      mass: 0, // Static body
      position: new CANNON.Vec3(0, -1, 0)
    });
    groundBody.addShape(groundShape);
    groundBody.position.set(0, 0, 0);

    // Create a THREE.js plane mesh
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x00aa00 * Math.random(0x00aa00) });
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.rotation.x = -Math.PI / 2; // Rotate to horizontal
    groundMesh.position.y = 0; // Adjust position to align with physics
    groundMesh.receiveShadow = true; // Enable shadows for the ground

    const groundPhysMat = new CANNON.Material();
    const spherePhysMat = new CANNON.Material();

    const groundSphereContactMat = new CANNON.ContactMaterial(
        groundPhysMat,
        spherePhysMat,
        { restitution: 0.9 }
    );


    return { groundBody, groundMesh, groundSphereContactMat };
  }, []);
};

export const useCannonUnderground = () => {
  return useMemo(() => {
    // Create a CANNON plane body
    const groundShape = new CANNON.Plane();
    const underGroundBody = new CANNON.Body({
      mass: 0, // Static body
      position: new CANNON.Vec3(0, -1, 0)
    });
    underGroundBody.addShape(groundShape);
    // underGroundBody.position.set(0, 0, 0);

    // Create a THREE.js plane mesh
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x00aa00 * Math.random(0x00aa00) });
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.rotation.x = -Math.PI / 2; // Rotate to horizontal
    groundMesh.position.y = 2; // Adjust position to align with physics
    groundMesh.receiveShadow = true; // Enable shadows for the ground

    const groundPhysMat = new CANNON.Material();
    const spherePhysMat = new CANNON.Material();

    const groundSphereContactMat = new CANNON.ContactMaterial(
        groundPhysMat,
        spherePhysMat,
        { restitution: 0.9 }
    );


    return { underGroundBody, groundMesh, groundSphereContactMat };
  }, []);
};

export const useCannonGroundPlane = () => {
  return useMemo(() => {
    const mass = 1;
    const position = [
      Math.random() * 2 - 1, // x: random between -1 and 1
      Math.random() * 5 + 3, // y: random between 3 and 8
      Math.random() * 2 - 1  // z: random between -1 and 1
    ];
    const size = [30, 30, 30]
    // CANNON physics ground body (static)
    const groundBody = new CANNON.Body({
      mass: 0, // Static body
      position: new CANNON.Vec3(...position),
    });
    groundBody.addShape(new CANNON.Plane());
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);

    // THREE.js visual ground mesh
    const groundGeo = new THREE.PlaneGeometry(...size);
    const groundMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      wireframe: true,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.set(...position);

    return { groundBody, groundMesh };
  }, []);
};


// Hook for creating a ground material and setting up ground-box contact material
export const useGroundBoxContactMaterial = (world) => {
  return useMemo(() => {
    const groundPhysMat = new CANNON.Material();
    const boxPhysMat = new CANNON.Material();
    
    const groundBoxContactMat = new CANNON.ContactMaterial(
      groundPhysMat,
      boxPhysMat,
      { friction: 0.04 } // Low friction for sliding effect
    );
    
    world.addContactMaterial(groundBoxContactMat);
    return { groundPhysMat, boxPhysMat, groundBoxContactMat };
  }, [world]);
};

// Hook for creating a sphere material and setting up ground-sphere contact material
export const useGroundSphereContactMaterial = (world, restitution = 0.9) => {
  return useMemo(() => {
    const groundPhysMat = new CANNON.Material();
    const spherePhysMat = new CANNON.Material();
    
    const groundSphereContactMat = new CANNON.ContactMaterial(
      groundPhysMat,
      spherePhysMat,
      { restitution } // High restitution for bouncy effect
    );

    world.addContactMaterial(groundSphereContactMat);
    return { groundPhysMat, spherePhysMat, groundSphereContactMat };
  }, [world, restitution]);
};

