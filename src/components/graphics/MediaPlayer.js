import * as THREE from "three";
import { GUI } from 'dat.gui';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
import shader, { Shaders } from './Shaders';
import neverChange from '../../media/NeverChange.mp3';

class MediaPlayer {
  constructor(scene, camera, renderer, gui, canvas, width = window.innerWidth, height = window.innerHeight, shader) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.canvas = canvas;
    this.width = width;
    this.height = height;
    this.gui = gui;

    this.shader = shader || new Shaders();

    this.clock = new THREE.Clock();

    this.analyser = null;
    this.composer = null;
    this.isPlaying = false;
    this.params = this.loadParams();

    // Initialize UnrealBloomPass (if you're using bloom)
    this.bloomPass = this.loadBloomPass();

    // Initialize the renderer with the provided canvas
    this.loadRenderer();

    // Default parameters
    this.step = 0;
    this.firstControls = new OrbitControls(this.camera, this.canvas);  // Ensure this is set to the DOM element (canvas)
    this.secondControls = new TrackballControls(this.camera, this.canvas);  // Same here

    this.time = this.clock.getElapsedTime();
    // this.data = 0.0;

    // Setup the audio listener and sound
    // this.setupGUI();s
    this.loadMedia();
    this.setControls();
    this.loadColorFolder();
    this.loadBloomFolder();
    this.icoMesh = this.createIcosahedron();
    //   this.loadAudioListeners();
    // }

    // loadAudioListeners() {
  }

  loadBloomPass() {
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(this.width, this.height),
      this.params.strength,  // Strength
      this.params.radius,  // Radius
      this.params.threshold  // Threshold
    );
    this.bloomPass = bloomPass;
    return bloomPass;
  }

  loadParams() {
    const params = {
      red: 1.0,
      green: 0.3,
      blue: 1.0,
      threshold: 0.5,
      strength: 0.5,
      radius: 0.8
    };
    this.params = params;
    return params;
  }

  loadColorFolder() {
    // Create folders for parameters
    this.colorsFolder = this.gui.addFolder('Colors');
    this.colorsFolder.add(this.params, 'red', 0, 1).onChange(e => {
      this.shader.shaderMaterials().explosiveMaterial.uniforms.explodeIntensity.value = Number(e);
    });
    this.colorsFolder.add(this.params, 'green', 0, 1).onChange(e => {
      this.shader.shaderMaterials().explosiveMaterial.uniforms.time.value = Number(e);
    });
    this.colorsFolder.add(this.params, 'blue', 0, 1).onChange(e => {
      this.shader.shaderMaterials().explosiveMaterial.uniforms.shapeFactor.value = Number(e);
    });
  }

  loadBloomFolder() {
    this.bloomFolder = this.gui.addFolder('Bloom');
    this.bloomFolder.add(this.params, 'threshold', 0, 1).onChange(() => this.updateBloomEffect());
    this.bloomFolder.add(this.params, 'strength', 0, 3).onChange(() => this.updateBloomEffect());
    this.bloomFolder.add(this.params, 'radius', 0, 1).onChange(() => this.updateBloomEffect());
  }
  // useIcoShader() {
  //   const params = this.loadParams();
  //   const shader = {
  //     uniforms: {
  //       u_time: { value: this.time }, 
  //       u_red: { value: params.red }, 
  //       u_green: { value: params.green }, 
  //       u_blue: { value: params.blue},                // Time for animation (used for Perlin animation)
  //       u_frequency: { value: this.u_frequency },           // Current frequency value from the audio analysis
  //       u_freqBands: { value: new THREE.Vector3(0.0, 0.0, 0.0) }, // Frequency bands (bass, mid, treble)
  //       u_ampFactor: { value: 1.0 },           // Amplitude factor to scale frequency effects
  //       u_perlinScale: { value: new THREE.Vector2(50.0, 20000.0) }, // Frequency scale for Perlin noise (50Hz to 20,000Hz)
  //       u_resolution: { value: new THREE.Vector2(this.width, this.height) }, // Resolution (screen size)
  //     },

  //     vertexShader: `
  //       uniform float u_time;

  //       vec3 mod289(vec3 x)
  //       {
  //         return x - floor(x * (1.0 / 289.0)) * 289.0;
  //       }

  //       vec4 mod289(vec4 x)
  //       {
  //         return x - floor(x * (1.0 / 289.0)) * 289.0;
  //       }

  //       vec4 permute(vec4 x)
  //       {
  //         return mod289(((x*34.0)+10.0)*x);
  //       }

  //       vec4 taylorInvSqrt(vec4 r)
  //       {
  //         return 1.79284291400159 - 0.85373472095314 * r;
  //       }

  //       vec3 fade(vec3 t) {
  //         return t*t*t*(t*(t*6.0-15.0)+10.0);
  //       }

  //       // Classic Perlin noise, periodic variant
  //       float pnoise(vec3 P, vec3 rep)
  //       {
  //         vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period
  //         vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period
  //         Pi0 = mod289(Pi0);
  //         Pi1 = mod289(Pi1);
  //         vec3 Pf0 = fract(P); // Fractional part for interpolation
  //         vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  //         vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  //         vec4 iy = vec4(Pi0.yy, Pi1.yy);
  //         vec4 iz0 = Pi0.zzzz;
  //         vec4 iz1 = Pi1.zzzz;

  //         vec4 ixy = permute(permute(ix) + iy);
  //         vec4 ixy0 = permute(ixy + iz0);
  //         vec4 ixy1 = permute(ixy + iz1);

  //         vec4 gx0 = ixy0 * (1.0 / 7.0);
  //         vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
  //         gx0 = fract(gx0);
  //         vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  //         vec4 sz0 = step(gz0, vec4(0.0));
  //         gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  //         gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  //         vec4 gx1 = ixy1 * (1.0 / 7.0);
  //         vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
  //         gx1 = fract(gx1);
  //         vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  //         vec4 sz1 = step(gz1, vec4(0.0));
  //         gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  //         gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  //         vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  //         vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  //         vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  //         vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  //         vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  //         vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  //         vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  //         vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

  //         vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  //         g000 *= norm0.x;
  //         g010 *= norm0.y;
  //         g100 *= norm0.z;
  //         g110 *= norm0.w;
  //         vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  //         g001 *= norm1.x;
  //         g011 *= norm1.y;
  //         g101 *= norm1.z;
  //         g111 *= norm1.w;

  //         float n000 = dot(g000, Pf0);
  //         float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  //         float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  //         float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  //         float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  //         float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  //         float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  //         float n111 = dot(g111, Pf1);

  //         vec3 fade_xyz = fade(Pf0);
  //         vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  //         vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  //         float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
  //         return 2.2 * n_xyz;
  //       }

  //       uniform float u_frequency;

  //       void main() {
  //           float noise = 3.0 * pnoise(position + u_time, vec3(10.0));
  //           float displacement = (u_frequency / 30.) * (noise / 10.);
  //           vec3 newPosition = position + normal * displacement;
  //           gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  //       }
  //     `,
  //     fragmentShader: `
  //       uniform float u_red;
  //       uniform float u_blue;
  //       uniform float u_green;
  //       void main() {
  //           gl_FragColor = vec4(vec3(u_red, u_green, u_blue), 1. );
  //       }`
  //   }
  //   return shader;
  // }

  createIcosahedron() {
    // Create geometry and material
    const geo = new THREE.IcosahedronGeometry(3, 30);
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(this.params.red, this.params.green,
        this.params.blue
      ),
      // wireframe: trues
    });
    const shaderMat = this.shader.shaderMaterials().explosiveMaterial;
    this.mesh = new THREE.Mesh(geo, shaderMat);
    this.mesh.material.wireframe = true;
    this.mesh.position.y = 6;
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.scene.add(this.mesh);
    const mesh = this.mesh;
    return mesh;
  }

  setControls(control = '') {
    if (control === '') {
      this.firstControls.enabled = true;
      this.secondControls.enabled = true;
    } else
      if (control === 'first') {
        this.firstControls.enabled = true;
        this.secondControls.enabled = false;
      } else {
        this.firstControls.enabled = false;
        this.secondControls.enabled = true;
      }
  }

  setupGUI() {
    // // Create the GUI only once in the constructor
    // if (this.gui) {
    //   this.gui.destroy(); // Clean up any existing GUI if it already exists
    // }

    // this.gui = new GUI();

    this.params = this.loadParams();

    // this.loadColorFolder();
    // this.loadBloomFolder();

    // // Open the folders by default
    // this.colorsFolder.open();
    // this.bloomFolder.open();
  }

  loadRenderer() {
    // this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
    // this.renderer.setSize(window.innerWidth, window.innerHeight);
    // this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Initialize the render pass
    this.renderScene = new RenderPass(this.scene, this.camera);

    // Initialize the effect composer for post-processing (like bloom)
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(this.renderScene);

    // this.params = this.loadParams();
    // this.bloomPass = this.loadBloomPass();
    this.composer.addPass(this.bloomPass);

    // Add OutputPass to render the final result
    this.outputPass = new OutputPass();
    this.composer.addPass(this.outputPass);
  }

  loadMedia() {
    this.audioLoader = new THREE.AudioLoader();
    this.listener = new THREE.AudioListener();
    this.camera.add(this.listener);
    this.sound = new THREE.Audio(this.listener);
    this.audioLoader.load(neverChange, (buffer) => {
      if (!this.sound) {
        console.error("Sound object is not initialized!");
        return;
      }
      this.sound.setBuffer(buffer);

      this.analyser = new THREE.AudioAnalyser(this.sound, 32);
      this.data = this.analyser.getFrequencyData();

      this.data = this.analyser.getFrequencyData();

      // Add event listener to play the track on click
      if (this.isPlaying === false) {
        window.addEventListener('click', this.playTrack());
      } else {
        window.addEventListener('click', this.pauseTrack());
      }
      // this.playTrack()
    });
  }

  // Method to handle click event and play sound
  playTrack() {
    this.sound.play();
    this.isPlaying = true;
  }

  pauseTrack() {
    this.sound.pause();
    this.isPlaying = false;
  }


  // Method to handle click event and play sound
  // playTrack() {
  //   if (!this.sound.isPlaying) {
  //     this.sound.play();
  //     this.isPlaying = true;
  //   } else {
  //     this.sound.pause();
  //     this.isPlaying = false;
  //   }
  // }

  updateMaterial() {
    // Ensure material and color are properly defined
    if (this.material && this.material.color) {
      if (this.params?.red !== undefined && this.params?.green !== undefined && this.params?.blue !== undefined) {
        this.mesh.material.color.setRGB(this.params.red, this.params.green, this.params.blue);
      } else {
        console.warn('Color parameters (red, green, blue) are missing.');
      }
    } else {
      console.error('Material or color property is undefined.');
    }
  }

  updateBloomEffect() {
    // Update bloom effect based on params (if bloom is being used)
    if (this.bloomPass) {
      this.bloomPass.threshold = this.params.threshold;
      this.bloomPass.strength = this.params.strength;
      this.bloomPass.radius = this.params.radius;
    }
  }

  // Update the audio visualizer based on the analyser data
  updateAnalyzer(deltaTime) {
    if (this.analyser) {
      // Example: Update the mesh scale based on frequency data
      const scale = this.data[0] / 256; // Example: scale based on first frequency bin
      this.mesh.scale.set(scale, scale, scale);
    }

    // Render the scene with updated information
    // this.renderer.render(this.scene, this.camera);s
  }

  updateVisualizer() {
    if (this.analyser) {
      // Update the audio analyser to get current frequency data;
      const frequencyData = this.analyser.getFrequencyData()

      // Map frequency data to RGB color values using sin or other transformations
      const red = Math.abs(Math.sin(frequencyData[0] / 255.0));
      const green = Math.abs(Math.sin(frequencyData[1] / 255.0));
      const blue = Math.abs(Math.sin(frequencyData[2] / 255.0));

      // Update the material color based on the frequency data
      // this.mesh.material.color.setRGB(red, green, blue);

      // Optionally, adjust the bloom effect or other visual parameters
      this.bloomPass.strength = red * 3.0; // For example, adjust bloom strength dynamically based on the frequency
      this.bloomPass.radius = green * 1.0;  // Adjust bloom radius based on the frequency
      this.bloomPass.threshold = blue * 2.0;  // Adjust bloom radius based on the frequency

      // Render the scene with post-processing effects
    }
  }

  updateGUI() {
    this.firstControls.update();
    this.secondControls.update();
    // this.updateAudioVisualization();
    // this.composer.render();
  }

  // Method to update the scene in the animation loop
  update() {
    if (this.mesh && this.isPlaying === true) {
      this.mesh.rotation.x += 0.010;
      this.mesh.rotation.y += 0.010;
      this.mesh.rotation.z += 0.020;

      // this.shader.update();

      this.shader.shaderMaterials().explosiveMaterial.uniforms.time.value += this.time + this.clock.getElapsedTime();
      this.shader.shaderMaterials().explosiveMaterial.uniforms.explodeIntensity.value = this.time + this.analyser.getAverageFrequency();
      this.shader.shaderMaterials().explosiveMaterial.uniforms.shapeFactor.value = this.clock.getElapsedTime() + Math.sin(this.clock.getElapsedTime());
      this.shader.shaderMaterials().explosiveMaterial.uniforms.u_frequency.value = this.analyser.getAverageFrequency() + this.time;

      this.composer.render();
    }
    // this.step += this.params.red;
    // this.step += this.params.green;
    // this.step += this.params.blue;
    // this.step += this.params.strength;
    // this.step += this.params.threshold;
  }

  // Method to update parameters dynamically
  updateParameters(newParams) {
    if (this.mesh) {
      this.params = { ...this.params, ...newParams };

      // Update material color with new parameters
      const newColor = new THREE.Color(this.params.red, this.params.green, this.params.blue);
      this.mesh.material.color.set(newColor);
    }
  }

  // // Method to start the animation loop
  // animate() {
  //   requestAnimationFrame(this.animate.bind(this));
  //   this.update();
  // }

  // Method to initialize the scene (for use in lifecycle methods)
  // init() {
  //   // Setup the click listener
  //   window.addEventListener('click', this.playTrack());

  //   // Start animation
  //   this.animate();
  // }

  // Cleanup method for when component is unmounted (optional)
  cleanup() {
    // Remove click event listener
    // window.removeEventListener('click', this.playTrack());

    // Dispose of the audio objects
    if (this.sound) {
      this.sound.stop();
      this.sound = null;
    }
    if (this.analyser) {
      this.analyser = null;
    }

    // Dispose of controls (if using OrbitControls or TrackballControls)
    if (this.firstControls) {
      this.firstControls.dispose();
      this.firstControls = null;
    }
    if (this.secondControls) {
      this.secondControls.dispose();
      this.secondControls = null;
    }

    // Dispose of any meshes (e.g., icosahedron or other objects)
    if (this.mesh) {
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
      this.mesh = null;
    }

    // Dispose of the bloom effect and composer
    if (this.bloomPass) {
      this.bloomPass.dispose();
      this.bloomPass = null;
    }
    if (this.composer) {
      this.composer.dispose();
      this.composer = null;
    }

    // Dispose of any shaders or materials
    if (this.material) {
      this.material.dispose();
      this.material = null;
    }

    // Cleanup renderer
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }

    // // Remove event listeners and clear referencess
  }

}

export default MediaPlayer;



































// import * as THREE from 'three';
// import {GUI} from 'dat.gui';
// import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer';
// import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass';
// import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass';
// import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass';

// const renderer = new THREE.WebGLRenderer({antialias: true});
// renderer.setSize(window.innerWidth, window.innerHeight);
// document.body.appendChild(renderer.domElement);
// //renderer.setClearColor(0x222222);

// const scene = new THREE.Scene();
// const camera = new THREE.PerspectiveCamera(
// 	45,
// 	window.innerWidth / window.innerHeight,
// 	0.1,
// 	1000
// );

// const params = {
// 	red: 1.0,
// 	green: 1.0,
// 	blue: 1.0,
// 	threshold: 0.5,
// 	strength: 0.5,
// 	radius: 0.8
// }

// renderer.outputColorSpace = THREE.SRGBColorSpace;

// const renderScene = new RenderPass(scene, camera);

// const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight));
// bloomPass.threshold = params.threshold;
// bloomPass.strength = params.strength;
// bloomPass.radius = params.radius;

// const bloomComposer = new EffectComposer(renderer);
// bloomComposer.addPass(renderScene);
// bloomComposer.addPass(bloomPass);

// const outputPass = new OutputPass();
// bloomComposer.addPass(outputPass);

// camera.position.set(0, -2, 14);
// camera.lookAt(0, 0, 0);

// const uniforms = {
// 	u_time: {type: 'f', value: 0.0},
// 	u_frequency: {type: 'f', value: 0.0},
// 	u_red: {type: 'f', value: 1.0},
// 	u_green: {type: 'f', value: 1.0},
// 	u_blue: {type: 'f', value: 1.0}
// }

// const mat = new THREE.ShaderMaterial({
// 	uniforms,
// 	vertexShader: document.getElementById('vertexshader').textContent,
// 	fragmentShader: document.getElementById('fragmentshader').textContent
// });

// const geo = new THREE.IcosahedronGeometry(4, 30 );
// const mesh = new THREE.Mesh(geo, mat);
// scene.add(mesh);
// mesh.material.wireframe = true;

// const listener = new THREE.AudioListener();
// camera.add(listener);

// const sound = new THREE.Audio(listener);

// const audioLoader = new THREE.AudioLoader();
// audioLoader.load('./assets/Beats.mp3', function(buffer) {
// 	sound.setBuffer(buffer);
// 	window.addEventListener('click', function() {
// 		sound.play();
// 	});
// });

// const analyser = new THREE.AudioAnalyser(sound, 32);

// const gui = new GUI();

// const colorsFolder = gui.addFolder('Colors');
// colorsFolder.add(params, 'red', 0, 1).onChange(function(value) {
// 	uniforms.u_red.value = Number(value);
// });
// colorsFolder.add(params, 'green', 0, 1).onChange(function(value) {
// 	uniforms.u_green.value = Number(value);
// });
// colorsFolder.add(params, 'blue', 0, 1).onChange(function(value) {
// 	uniforms.u_blue.value = Number(value);
// });

// const bloomFolder = gui.addFolder('Bloom');
// bloomFolder.add(params, 'threshold', 0, 1).onChange(function(value) {
// 	bloomPass.threshold = Number(value);
// });
// bloomFolder.add(params, 'strength', 0, 3).onChange(function(value) {
// 	bloomPass.strength = Number(value);
// });
// bloomFolder.add(params, 'radius', 0, 1).onChange(function(value) {
// 	bloomPass.radius = Number(value);
// });

// let mouseX = 0;
// let mouseY = 0;
// document.addEventListener('mousemove', function(e) {
// 	let windowHalfX = window.innerWidth / 2;
// 	let windowHalfY = window.innerHeight / 2;
// 	mouseX = (e.clientX - windowHalfX) / 100;
// 	mouseY = (e.clientY - windowHalfY) / 100;
// });

// const clock = new THREE.Clock();
// function animate() {
// 	camera.position.x += (mouseX - camera.position.x) * .05;
// 	camera.position.y += (-mouseY - camera.position.y) * 0.5;
// 	camera.lookAt(scene.position);
// 	uniforms.u_time.value = clock.getElapsedTime();
// 	uniforms.u_frequency.value = analyser.getAverageFrequency();
//     bloomComposer.render();
// 	requestAnimationFrame(animate);
// }
// animate();

// window.addEventListener('resize', function() {
//     camera.aspect = window.innerWidth / window.innerHeight;
//     camera.updateProjectionMatrix();
//     renderer.setSize(window.innerWidth, window.innerHeight);
// 	bloomComposer.setSize(window.innerWidth, window.innerHeight);
// });