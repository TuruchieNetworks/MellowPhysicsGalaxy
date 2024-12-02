import React, { useEffect, useRef, useState } from 'react';
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
import { useBox, useMultiBox } from '../hooks/UseBoxGeometry';
import { useCannonGround, useCannonUnderground } from '../hooks/UseCannonGround';
import NeverChange from '../../galaxy_imgs/stars.jpg';
// Images
// import monkeyUrl from '../../GLTFs/monkey.glb';
import sun from '../../galaxy_imgs/sun.jpg';
import stars from '../../galaxy_imgs/stars.jpg';
import nebula from '../../galaxy_imgs/nebula.jpg';
import { GUI } from 'dat.gui';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import blue_concert from '../../img/blue_concert.jpg';
import Plane from '../graphics/Plane';

const PlayerScene = ({ height = window.innerHeight, width = window.innerWidth, particleCount = 600 }) => {
    const { randomHexColor } = useColorUtils();
    const [randomColor, setRandomColor] = useState(randomHexColor())
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

    const params = {
        red: 1.0,
        green: 1.0,
        blue: 1.0,
        threshold: 0.5,
        strength: 0.5,
        radius: 0.8
    }

    let time = Date.now();
    const timeStep = 1 / 60;

    useEffect(() => {
        const scene = sceneRef.current;
        const world = worldRef.current;

        // const sceneManager = new SceneManager(scene, world, canvasRef.current, width, height, randomHexColor());
        // // sceneManager.init();
        // const camera = sceneManager.camera;
        // const renderer = sceneManager.renderer;
        // const textureLoader = sceneManager.textureLoader;
        // const cubeTextureLoader = sceneManager.cubeTextureLoader;
        // sceneManager.loadCubeTextures(true);

        // Set up camera
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.set(-8, 3, 28); 

        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(nebula);

        // Cube Scene Textures
        const cubeTextureLoader = new THREE.CubeTextureLoader();

        const shader = new Shaders(width, height, timeStep, 0.1, 50, cubeTextureLoader, 0.1, 2, 1, true, 0.2);
        scene.background = cubeTextureLoader.load([
            stars,
            blue_concert,
            sun,
            sun,
            blue_concert,
            nebula,
        ]);
            
        // new THREE.ShaderMaterial(shader.shaderMaterials().explosiveMaterial),
        // new THREE.ShaderMaterial(shader.shaderMaterials().convolutionMaterial),
        // new THREE.ShaderMaterial(shader.shaderMaterials().noiseMaterial),
        // new THREE.ShaderMaterial(shader.shaderMaterials().sawMaterial),
        // new THREE.ShaderMaterial(shader.shaderMaterials().sawMaterial)

        // scene.background = new THREE.ShaderMaterial(shader.shaderMaterials().sawMaterial)

        // Set up renderer
        const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
        renderer.setSize(width, height);
        renderer.shadowMap.enabled = true; // Enable shadow mapping
        renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Optional: set shadow type

        renderer.outputColorSpace = THREE.SRGBColorSpace;
        
        const renderScene = new RenderPass(scene, camera);
        
        const bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height));
        bloomPass.threshold = params.threshold;
        bloomPass.strength = params.strength;
        bloomPass.radius = params.radius;

        const bloomComposer = new EffectComposer(renderer);
        bloomComposer.addPass(renderScene);
        bloomComposer.addPass(bloomPass);
        
        const outputPass = new OutputPass();
        bloomComposer.addPass(outputPass);
        const uniforms = {
            u_time: {type: 'f', value: 0.0},
            u_frequency: {type: 'f', value: 0.0},
            u_red: {type: 'f', value: 1.0},
            u_green: {type: 'f', value: 1.0},
            u_blue: {type: 'f', value: 1.0}
        }
        
        const mat = shader.shaderMaterials().explosiveMaterial
        
        const geo = new THREE.IcosahedronGeometry(3.6, 30);
        const icoMesh = new THREE.Mesh(geo, mat);
        scene.add(icoMesh);
        // icoMesh.material.wireframe = true;
        icoMesh.position.y = 5;
        
        const listener = new THREE.AudioListener();
        camera.add(listener);
        
        const sound = new THREE.Audio(listener);
        
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load(NeverChange, function(buffer) {
            sound.setBuffer(buffer);
            window.addEventListener('click', function() {
                sound.play();
            });
        });
        
        const analyser = new THREE.AudioAnalyser(sound, 32);
        
        const gui = new GUI();
        
        const colorsFolder = gui.addFolder('Colors');
        colorsFolder.add(params, 'red', 0, 1).onChange(function(value) {
            uniforms.u_frequency.value = Number(value);
        });
        colorsFolder.add(params, 'green', 0, 1).onChange(function(value) {
            uniforms.u_frequency.value = Number(value);
        });
        colorsFolder.add(params, 'blue', 0, 1).onChange(function(value) {
            uniforms.u_time.value = Number(value);
        });
        
        // const colorsFolder = gui.addFolder('Colors');
        // colorsFolder.add(params, 'red', 0, 1).onChange(function(value) {
        //     uniforms.u_red.value = Number(value);
        // });
        // colorsFolder.add(params, 'green', 0, 1).onChange(function(value) {
        //     uniforms.u_green.value = Number(value);
        // });
        // colorsFolder.add(params, 'blue', 0, 1).onChange(function(value) {
        //     uniforms.u_blue.value = Number(value);
        // });
        const bloomFolder = gui.addFolder('Bloom');
        bloomFolder.add(params, 'threshold', 0, 1).onChange(function(value) {
            bloomPass.threshold = Number(value);
        });
        bloomFolder.add(params, 'strength', 0, 3).onChange(function(value) {
            bloomPass.strength = Number(value);
        });
        bloomFolder.add(params, 'radius', 0, 1).onChange(function(value) {
            bloomPass.radius = Number(value);
        });

        // Fog
        scene.fog = new THREE.Fog(0xFFFFFF, 0, 200);
        scene.fog = new THREE.FogExp2(randomColor, 0.01);
        // Pass both scene and camera to the FontMaker constructor
        // const fontMaker = new FontMaker(scene, camera, navigate);


        // Add the plane geometry to the scene

        const planeGeometry = new THREE.PlaneGeometry(30, 30, 30, 30);
        const planeMat = shader.shaderMaterials().sawMaterial;
        // const planePad = new Plane(scene, 30, 30, randomColor, 1, THREE.DoubleSide, 'explosiveMaterial');
        // planePad.createPlane();
        const plane = new THREE.Mesh(planeGeometry, planeMat);
        scene.add(plane);
        plane.rotation.x = -0.5 * Math.PI;
        plane.receiveShadow = true;

        // const sphereUtils = new SphereUtils(scene, world, camera, textureLoader, plane);
        // sphereUtils.createCannonSphere({ r: 10, w: 50, h: 50 }, randomHexColor(), { x: -10, y: 20, z: -80 }, 10.1, shader.shaderMaterials().explosiveMaterial);
        // const sandParticles = new SandParticles(scene, world, shader.shaderMaterials().noiseMaterial, 100);
        // sandParticles.createDarkFlashNoiseParticles(60, 1.4, shader.shaderMaterials().sawMaterial);
        const light = new Lighting(scene, camera, 5, renderer);
        light.initializeLightAndHelpers()

        box.position.y = 4;
        // box.material = mat;
        multiBox.position.y = 4;

        scene.add(box);
        scene.add(multiBox);

        // Create MediaPlayer instance
        //const mediaPlayer = new MediaPlayer(scene, camera, renderer, canvasRef.current, width, height);

        // Set up GUI and controls
        // mediaPlayer.loadMedia();
        // mediaPlayer.createIcosahedron();
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
        // window.addEventListener('mousemove', onMouseMove);

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

            // Update font size only if it differs from the current size
            // if (fontMaker.textMesh && fontMaker.textMesh.geometry.parameters.size !== newSize) {
            //     // Remove the existing text mesh
            //     scene.remove(fontMaker.textMesh);

            //     // Re-create the text mesh with the updated size
            //     fontMaker.createTextMesh('Falling Ghoasts Rush: Shoot Or Die!!!', {
            //         color: 0xff0000,
            //         size: newSize,
            //         height: 0.3,
            //         position: { x: -10, y: -15, z: 0 },
            //     });
            // }
        };

        // Add window resize listener
        window.addEventListener('resize', handleWindowResize);

        const clock = new THREE.Clock();

        // Animation loop
        const animate = () => {

            icoMesh.rotation.x += 0.1;
            icoMesh.rotation.y += 0.1;
            icoMesh.rotation.z += 0.1;

            setRandomColor(randomHexColor());
            

            // Step the physics world
            world.step(timeStep);

            // Update media player
            // mediaPlayer.update();

            shader.update();
            // sphereUtils.update();
            // shader.shaderMaterials().icoMaterial.uniforms.u_time.value = (Math.sin(time) * 0.5) + 0.5;sss
            shader.shaderMaterials().sawMaterial.uniforms.time.value = time * 0.002;
            shader.shaderMaterials().explosiveMaterial.uniforms.shapeFactor = time * Math.sin(0.001 + time);
            shader.shaderMaterials().explosiveMaterial.uniforms.explodeIntensity.value = 0.5 + (time * Math.sin(0.01 + time));	
            shader.shaderMaterials().explosiveMaterial.uniforms.time.value = time + clock.getElapsedTime();
            shader.shaderMaterials().explosiveMaterial.uniforms.u_frequency.value = analyser.getAverageFrequency();
            bloomComposer.render();

            // Render the scene
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        };
        animate();

        return () => {

            // Dispose of font maker resources
            // fontMaker.dispose();
            // mediaPlayer.cleanup();

            // Clean up renderer to release WebGL context
            renderer.dispose();

            console.log('Cleaned up PlayerScene resources.');
        };
    }, [width, height, particleCount]);

    return <canvas ref={canvasRef} className="galaxial-animation">
        {/* <Biography/> */}
    </canvas>;
};

export default PlayerScene;