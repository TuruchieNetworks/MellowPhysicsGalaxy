import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from "three";
import * as CANNON from "cannon-es"; // Import Cannon.js here
import useColorUtils from '../hooks/UseColorUtils';
import Shaders from "../graphics/Shaders";
import MediaPlayer from "../graphics/MediaPlayer";
import FontMaker from "../graphics/FontMaker";
import SphereUtils from "../graphics/SphereUtils";
import { SceneManager } from '../graphics/SceneManager';
import { Lighting } from '../graphics/Lighting';
import { useBox, useMultiBox } from '../../components/hooks/UseBoxGeometry';
import { useCannonGround, useCannonUnderground } from '../hooks/UseCannonGround';
import NeverChange from '../../galaxy_imgs/stars.jpg';
// Images
import monkeyUrl from '../../GLTFs/monkey.glb';
import sun from '../../galaxy_imgs/sun.jpg';
import stars from '../../galaxy_imgs/stars.jpg';
import nebula from '../../galaxy_imgs/nebula.jpg';
import blue_concert from '../../img/blue_concert.jpg';
import { GUI } from 'dat.gui';

const MusicPlayerScene = ({ height = window.innerHeight, width = window.innerWidth, particleCount = 600, speed = 0.5}) => {
    const { randomHexColor } = useColorUtils();
    const canvasRef = useRef();
    const sceneRef = useRef(new THREE.Scene());
    const worldRef = useRef(new CANNON.World());
    const sandParticlesRef = useRef([]);
    const sphereBodiesRef = useRef([]);
    const sphereMeshRef = useRef([]);
    const particleBodiesRef = useRef([]);
    const navigate = useNavigate();
    const box = useBox();
    const multiBox = useMultiBox();
    // Access the Cannon.js ground
    const { groundBody } = useCannonGround();
    const { underGroundBody } = useCannonUnderground();
    // const { cannonBox, boxMesh } = useCannonBox();

    const timeStep = 1 / 60;

    useEffect(() => {
        const scene = sceneRef.current;
        const world = worldRef.current;
        const canvas = canvasRef.current;

        // const sceneManager = new SceneManager(scene, world, canvasRef.current, width, height, randomHexColor());
        // // sceneManager.init();
        // const camera = sceneManager.camera;
        // const renderer = sceneManager.renderer;
        // const textureLoader = sceneManager.textureLoader;
        // const cubeTextureLoader = sceneManager.cubeTextureLoader;
        // sceneManager.loadCubeTextures(true);

        // Set up camera
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.set(-5, 3, 38);

        // Set up renderer
        const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
        renderer.setSize(width, height);
        renderer.shadowMap.enabled = true; // Enable shadow mapping
        renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Optional: set shadow type
        renderer.outputColorSpace = THREE.SRGBColorSpace;

        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(nebula);

        // Cube Scene Textures
        const cubeTextureLoader = new THREE.CubeTextureLoader();
        scene.background = cubeTextureLoader.load([
            stars,
            blue_concert,
            blue_concert,
            blue_concert,
            blue_concert,
            nebula
        ]);

        // Fog
        scene.fog = new THREE.Fog(0xFFFFFF, 0, 200);
        scene.fog = new THREE.FogExp2(randomHexColor(), 0.01);

        // Create MediaPlayer instance
        const gui = new GUI();

        // Set up GUI and controls
        // mediaPlayer.loadMedia();
        //mediaPlayer.createIcosahedron();

        // Pass both scene and camera to the FontMaker constructor
        const fontMaker = new FontMaker(scene, camera, navigate);
        const shader = new Shaders(width, height, timeStep, 0.1, 50, cubeTextureLoader, 0.1, 2, 1, true, 0.3);
        const mediaPlayer = new MediaPlayer(scene, camera, renderer, gui, canvasRef.current, width, height, shader);

        // Add the plane geometry to the scene
        const planeGeometry = new THREE.PlaneGeometry(40, 40, 40, 40);
        const plane = new THREE.Mesh(planeGeometry, shader.shaderMaterials().sawMaterial);
        plane.material.side = THREE.DoubleSide;
        plane.material.flatShading = true;

        plane.geometry.attributes.position.array[0] -= 10 * Math.random();
        plane.geometry.attributes.position.array[1] -= 10 * Math.random();
        plane.geometry.attributes.position.array[2] -= 10 * Math.random();
        const lastPointZ = plane.geometry.attributes.position.array.length - 1;
        plane.geometry.attributes.position.array[lastPointZ] -= 10 * Math.random();

        scene.add(plane);
        plane.rotation.x = -0.5 * Math.PI;
        plane.receiveShadow = true;
        // const sphereUtils = new SphereUtils(scene, world, camera, textureLoader, plane);
        // sphereUtils.createCannonSphere({ r: 10, w: 50, h: 50 }, randomHexColor(), { x: -10, y: 20, z: -80 }, 10.1, shader.shaderMaterials().explosiveMaterial);
        // const sandParticles = new SandParticles(scene, world, shader.shaderMaterials().noiseMaterial, 100);
        // sandParticles.createDarkFlashNoiseParticles(60, 1.4, shader.shaderMaterials().sawMaterial);

        const light = new Lighting(scene, camera, speed, renderer);
        light.initializeLightAndHelpers()

        let time = Date.now();

        box.position.y = 4;
        multiBox.position.y = 4;

        box.castShadow = true;
        box.receiveShadow = true;
        multiBox.castShadow = true;
        multiBox.receiveShadow = true;

        scene.add(box);
        scene.add(multiBox);
        // window.addEventListener('click', mediaPlayer.playTrack());
        // mediaPlayer.setControls('first'); // Default control
        
        // Handle resize
        // mediaPlayer.resizeBloom();

        // Load the font and create the text mesh
        // fontMaker.loadFont(() => {
        //     fontMaker.createTextMesh('We need to update musiclist to give us origginal file name, artist nd a few  but lets fix this first', {
        //         color: 0xff0000,
        //         size: 3.6,
        //         height: 5.3,
        //         position: { x: -10, y: -15, z: 10 }
        //     });

        //     // Optionally enable raycasting for click detection
        //     fontMaker.enableRaycast();
        // });

        // Event listeners for mouse movements and clicks
        //const onMouseMove = (event) => fontMaker.onMouseMove(event);
        // const onMouseClick = (event) => fontMaker.onMouseClick(event, '/FallingFlashes');

        // Attach event listeners
        // window.addEventListener('click', onMouseClick);
        //window.addEventListener('mousemove', onMouseMove);

        // Handle clicks to create spheres
        window.addEventListener('click', () => {
            if(mediaPlayer.isPlaying === false) {
                mediaPlayer.loadMedia();
            }
        });

        // Handle window resizing and adjust font size based on screen width
        const handleWindowResize = () => {
            // Update camera and renderer on window resize
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            // if (mediaPlayer.isPlaying === true && mediaPlayer.composer !== null) {
            //     mediaPlayer.composer.setSize(window.innerWidth, window.innerHeight);
            // }

            // resizeBloom() {
            //   if (!this.resizeHandler) {
            //     // Define a single resize handler to prevent multiple listeners
            //     this.resizeHandler = () => {
            //       // this.camera.aspect = this.width / this.height;
            //       // this.camera.updateProjectionMatrix();
            //       // this.renderer.setSize(this.width, this.height);
            //       this.composer.setSize(this.width, this.height);
            //     };
            
            //     // Add the event listener
            //     window.addEventListener('resize', this.resizeHandler);
            //   }
            // }

            // Determine new font size based on window width
            const newSize = window.innerWidth <= 700 ? 1.4 : 1.6;

            //Update font size only if it differs from the current size
            if (fontMaker.textMesh && fontMaker.textMesh.geometry.parameters.size !== newSize) {
                // Remove the existing text mesh
                scene.remove(fontMaker.textMesh);

                // Re-create the text mesh with the updated size
                fontMaker.createTextMesh('Falling Ghoasts Rush: Shoot Or Die!!!', {
                    color: 0xff0000,
                    size: newSize,
                    height: 0.3,
                    position: { x: -10, y: -15, z: 0 },
                });
            }
        };

        // Add window resize listener
        window.addEventListener('resize', handleWindowResize());

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);

            // Step the physics world
            world.step(timeStep);

            // Update media player
            // light.update();
            mediaPlayer.update();

            shader.update();
            // sphereUtils.update();
            // shader.shaderMaterials().icoMaterial.uniforms.u_time.value = (Math.sin(time) * 0.5) + 0.5;sssYZ

            // Render the scene
            renderer.render(scene, camera);
        };
        animate();

        return () => {

            // Dispose of font maker resources
            fontMaker.dispose();
            mediaPlayer.cleanup();

            // Clean up renderer to release WebGL context
            renderer.dispose();

            console.log('Cleaned up MusicPlayerScene resources.');
        };
    }, [width, height, particleCount]);

    return <canvas ref={canvasRef} className="galaxial-animation">
        {/* <Biography/> */}
    </canvas>;
};

export default MusicPlayerScene;