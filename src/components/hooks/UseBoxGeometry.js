import { useMemo } from 'react';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Galaxial Images
import stars from '../../galaxy_imgs/stars.jpg';
import nebula from '../../galaxy_imgs/nebula.jpg';
// Concert Images
import bright_stage from '../../img/tube_concerts.avif';
import concert_lights from '../../img/bright-concert-lights.avif';
import crowd_angle from '../../img/angle_outdoor_concerts.jpg';
import DancingTwerk from '../../FBXs/DancingTwerk.fbx';
import monkeyUrl from '../../GLTFs/monkey.glb';
// import sun from '../../galaxy_imgs/sun.jpg';
// import mars from '../../galaxy_imgs/mars.jpg';
// import earth from '../../galaxy_imgs/earth.jpg';
// import saturn from '../../galaxy_imgs/saturn.jpg';
// import venus from '../../galaxy_imgs/venus.jpg';
// import jupiter from '../../galaxy_imgs/jupiter.jpg';
// import blue_concert from '../../img/blue_concert.jpg';
// import landing_dj from '../../img/landing_dj.jpg';
// import globe_concert from '../../img/globe_concert.jpg';
// import metal_blocks from '../../img/metal_blocks.jpg';
// import vasil_guitar from '../../img/vasil_guitar.jpg';
// import blue_stage from '../../img/blue_stage_entrance.avif';
// import guitar_boy from '../../img/dark-greece.avif';

const textureLoader = new THREE.TextureLoader();
// Hook to create a single-material box with shadows
export const useBox = () => {
  return useMemo(() => {
    const boxGeometry = new THREE.BoxGeometry(6, 8, 10);
    const boxMaterial = new THREE.MeshPhongMaterial({
      color: 0x00FF00,
      map: textureLoader.load(nebula),
    });

    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    //box.position.set(10, 5, -10);
    box.position.set(10, 5, -8);
    box.castShadow = true;
    box.receiveShadow = true;

    const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
    const obj = new THREE.Object3D();
    obj.add(boxMesh);

    return box;
  }, []);
};

// Hook to create a multi-material box with shadows
export const useMultiBox = () => {
  return useMemo(() => {
    const boxGeometry = new THREE.BoxGeometry(6, 8, 10);
    const boxMultiMaterial = [
      new THREE.MeshPhongMaterial({ map: textureLoader.load(bright_stage) }),
      new THREE.MeshPhongMaterial({ map: textureLoader.load(stars) }),
      new THREE.MeshPhongMaterial({ map: textureLoader.load(nebula) }),
      new THREE.MeshPhongMaterial({ map: textureLoader.load(crowd_angle) }),
      new THREE.MeshPhongMaterial({ map: textureLoader.load(nebula) }),
      new THREE.MeshPhongMaterial({ map: textureLoader.load(concert_lights) }),
    ];

    const multiBox = new THREE.Mesh(boxGeometry, boxMultiMaterial);
    multiBox.position.set(-10, 5, -8);
    multiBox.castShadow = true;
    multiBox.receiveShadow = true;

    const boxMesh = new THREE.Mesh(boxGeometry, boxMultiMaterial);
    const obj = new THREE.Object3D();
    obj.add(boxMesh);

    return multiBox;
  }, []);
};

// // Hook to create a multi-material box with shadows
export const useGLTF = (url = monkeyUrl) => {
  return useMemo(() => {
    const loader = new GLTFLoader();
        loader.load(url, (gltf) => {
            const model = gltf.scene;
            //model.position.set(Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5);
            model.position.set(-12, 4, 10);
            model.castShadow = model.receiveShadow = true;
            this.scene.add(model);
            this.gltfModels.push(model);
        }, undefined, function (error) {
            console.error(error);
          });

    return loader;
  }, []);
};



export const loadFBXModel = (url = DancingTwerk) => {
    const loader = new FBXLoader();
    loader.load(url, (fbx) => {
        fbx.position.set(Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5);
        fbx.castShadow = fbx.receiveShadow = true;
        this.scene.add(fbx);
        this.fbxModels.push(fbx);
    });
    return loader;    
}
