import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import ImageUtils from './ImageUtils';
import Shaders from '../graphics/Shaders';

export default class FontMaker {
  constructor(scene,
    camera,
    color = new THREE.Color(Math.random(), Math.random(), Math.random()),
    fontPath = 'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',
    defaultText = 'Falling Ghosts Rush: Shoot Or Die!!!',
    textureURL = null,  // No default URL; loaded dynamically via ImageUtils if needed
    shader = null) {

    this.scene = scene;
    this.camera = camera;
    this.color = color;
    this.fontPath = fontPath;
    this.defaultText = defaultText;
    this.font = null;
    this.shader = shader || new Shaders();  // Allow for custom shader or default to Shaders class
    this.loader = new FontLoader();
    this.textMesh = null;

    // Initialize ImageUtils, texture loader, and raycasting
    this.imageUtils = new ImageUtils();
    this.textureURL = textureURL || this.imageUtils.getRandomImage('concerts');  // Assign texture URL if not provided
    this.textureLoader = new THREE.TextureLoader();
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Bind mouse events to maintain context
    this.onMouseClick = this.onMouseClick.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);

    // Load the font on instantiation
    this.loadFont();
  }

  loadFont() {
    this.loader.load(this.fontPath, (font) => {
      this.font = font;
      this.createTextMesh(this.defaultText);
    }, undefined, (error) => {
      console.error('Error loading font:', error);
    });
  }

  // Primary method to create the text mesh with specified material option
  createTextMesh(text = this.defaultText, mat = 'texturedURL', options = {}) {
    if (!this.font) return;

    const {
      size = 1.6,
      height = 0.4,
      color = this.color,
      position = { x: 0, y: -10, z: 0 },
      rotation = { x: 0, y: 0, z: 0 },
      bevelEnabled = true,
      bevelThickness = 0.1,
      bevelSize = 0.1,
      bevelSegments = 5
    } = options;

    const textGeometry = new TextGeometry(text, {
      font: this.font,
      size,
      height,
      bevelEnabled,
      bevelThickness,
      bevelSize,
      bevelSegments
    });

    // Select material based on specified `mat` type
    let textMaterial;
    switch (mat) {
      case 'noiseMaterial':
        textMaterial = this.shader.shaderMaterials().noiseMaterial;  // Noise shader example
        break;
      case 'sawMaterial':
        textMaterial = this.shader.shaderMaterials().sawMaterial;  // Saw shader example
        break;
      case 'texturedURL':
        textMaterial = new THREE.MeshStandardMaterial({ map: this.textureLoader.load(this.textureURL) });
        break;
      case 'randomHexColor':
        textMaterial = new THREE.MeshStandardMaterial({ color: new THREE.Color(`#${Math.floor(Math.random()*16777215).toString(16)}`) });
        break;
      default:
        textMaterial = new THREE.MeshStandardMaterial({ color });
        break;
    }

    // Create and configure mesh
    this.textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textGeometry.computeBoundingBox();
    const xMid = -0.5 * (textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x);
    const yMid = -0.5 * (textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y);
    textGeometry.translate(xMid, yMid, 0);

    this.textMesh.position.set(position.x, position.y, position.z);
    this.textMesh.rotation.set(rotation.x, rotation.y, rotation.z);
    this.textMesh.castShadow = true;
    this.textMesh.receiveShadow = true;
    this.textMesh.userData.clickable = true;

    this.scene.add(this.textMesh);

    return this.textMesh;
  }

  enableRaycast() {
    window.addEventListener('click', this.onMouseClick, false);
    window.addEventListener('mousemove', this.onMouseMove, false);
  }

  disableRaycast() {
    window.removeEventListener('click', this.onMouseClick, false);
    window.removeEventListener('mousemove', this.onMouseMove, false);
  }

  onMouseMove(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children);

    if (intersects.length > 0 && intersects[0].object.userData.clickable) {
      document.body.style.cursor = 'pointer';
    } else {
      document.body.style.cursor = 'default';
    }
  }

  onMouseClick(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children);

    if (intersects.length > 0 && intersects[0].object.userData.clickable) {
      const noiseMaterial = this.shader.shaderMaterials().noiseMaterial;
      this.textMesh.material = noiseMaterial;  // Switch to noise shader on click
    }
  }

  rotatePhrase() {
    if (this.textMesh) this.textMesh.rotation.y += 0.01;
  }

  rotateText() {
    if (this.textMesh) this.textMesh.rotation.x += 0.005;
  }

  update() {
    this.rotatePhrase();
    this.rotateText();
  }
}





////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////







// import * as THREE from 'three';
// import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
// import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
// import ImageUtils from './ImageUtils';
// import Shaders from '../graphics/Shaders';

// export default class FontMaker {
//   constructor(scene, camera, color = new THREE.Color(Math.random(), Math.random(), Math.random()), fontPath = 'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', defaultText = 'Falling Ghosts Rush: Shoot Or Die!!!', shader = null, ) {
//     this.scene = scene;
//     this.camera = camera;
//     this.fontPath = fontPath;
//     this.defaultText = defaultText;
//     this.font = null;
//     this.color = color;  // Set color as a THREE.Color object
//     this.shader = shader || new Shaders();  // Allow passing a custom shader
//     this.loader = new FontLoader();  // FontLoader instance
//     this.textMesh = null;

//     // Initialize ImageUtils and raycaster
//     this.imageUtils = new ImageUtils();
//     this.textureURL = this.imageUtils.getRandomImage('concerts'); // Default category
//     this.textureLoader = new THREE.TextureLoader();  // Defined texture loader here
//     this.raycaster = new THREE.Raycaster();
//     this.mouse = new THREE.Vector2();

//     // Bind the click event to this instance for proper context
//     this.onMouseClick = this.onMouseClick.bind(this);
//     this.onMouseMove = this.onMouseMove.bind(this); // Bind onMouseMove

//     // Load the font
//     this.loadFont();  // Load font on initialization
//   }

//   // Load the font asynchronously
//   loadFont() {
//     this.loader.load(this.fontPath, (font) => {
//       this.font = font;
//       console.log('Font loaded:', font);  // Check the font object here
//       this.createTextMesh(this.defaultText);
//     }, undefined, (error) => {
//       console.error('Error loading font:', error);
//     });
//   }

//   // Method to create the text mesh once the font is loaded
//   createTextMesh(text = this.defaultText, options = {}) {
//     if (!this.font) {
//       console.error('Font not loaded. Font is null.');
//       return;
//     }

//     const {
//       size = 1.6,
//       height = 0.4,
//       color = this.color, // Use the color passed in the constructor
//       position = { x: 0, y: -10, z: 0 },
//       rotation = { x: 0, y: 0, z: 0 },
//       bevelEnabled = true,
//       bevelThickness = 0.1,
//       bevelSize = 0.1,
//       bevelSegments = 5,
//       textureURL = this.textureURL,
//       customShader = this.shader // Allow custom shader to be passed in
//     } = options;

//     // Create the text geometry
//     const textGeometry = new TextGeometry(text, {
//       font: this.font,
//       size,
//       height,
//       bevelEnabled,
//       bevelThickness,
//       bevelSize,
//       bevelSegments,
//     });

//     // Determine if a shader or color should be used for the material
//     let textMaterial;
//     if (customShader) {
//       // Use custom shader (e.g., noise shader)
//       textMaterial = customShader.shaderMaterials().noiseMaterial;
//     } else if (textureURL && textureURL !== '') {
//       // Use texture if a texture URL is provided
//       textMaterial = new THREE.MeshStandardMaterial({ map: this.textureLoader.load(this.textureURL) });
//     } else {
//       // Use default color if no shader or texture is provided
//       textMaterial = new THREE.MeshStandardMaterial({ color });
//     }

//     // Create the mesh with geometry and material
//     this.textMesh = new THREE.Mesh(textGeometry, textMaterial);

//     // Center the text geometry
//     textGeometry.computeBoundingBox();
//     const boundingBox = textGeometry.boundingBox;
//     const xMid = -0.5 * (boundingBox.max.x - boundingBox.min.x);
//     const yMid = -0.5 * (boundingBox.max.y - boundingBox.min.y);
//     textGeometry.translate(xMid, yMid, 0); // Center the geometry

//     // Set position, rotation, and other properties
//     this.textMesh.castShadow = true;
//     this.textMesh.receiveShadow = true;
//     this.textMesh.position.set(position.x, position.y, position.z);
//     this.textMesh.rotation.set(rotation.x, rotation.y, rotation.z);
//     this.textMesh.userData.clickable = true;

//     // Add the mesh to the scene
//     this.scene.add(this.textMesh);

//     console.log('Text Mesh created:', this.textMesh);

//     return this.textMesh;
//   }

//   // Call this method to initialize raycast listeners
//   enableRaycast() {
//     window.addEventListener('click', this.onMouseClick, false);
//     window.addEventListener('mousemove', this.onMouseMove, false); // Add mousemove event listener
//   }

//   // Call this method to disable raycast listeners (e.g., on cleanup)
//   disableRaycast() {
//     window.removeEventListener('click', this.onMouseClick, false);
//     window.removeEventListener('mousemove', this.onMouseMove, false); // Remove mousemove event listener
//   }

//   // Handle the mouse move event to change cursor style
//   onMouseMove(event) {
//     // Normalize mouse coordinates
//     this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
//     this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

//     // Update the raycaster with the camera and mouse position
//     // this.raycaster.update();  // Ensure the raycaster is updated with the camera view matrix
//     this.raycaster.setFromCamera(this.mouse, this.camera);  // Set the ray's origin and direction from the camera

//     // Check for intersections with all the objects in the scene
//     const intersects = this.raycaster.intersectObjects(this.scene.children);

//     // Change cursor to pointer if hovering over the text mesh
//     if (intersects.length > 0 && intersects[0].object.userData.clickable) {
//       this.textMesh = intersects[0].object;
//       document.body.style.cursor = 'pointer';
//     } else {
//       document.body.style.cursor = 'default';
//     }
//   }

//   // Handle the mouse click event
//   onMouseClick(event) {
//     // Normalize mouse coordinates
//     this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
//     this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

//     // Update the raycaster with the camera and mouse position
//     // this.raycaster.update();  // Ensure the raycaster is updated with the camera view matrix
//     this.raycaster.setFromCamera(this.mouse, this.camera);  // Set the ray's origin and direction from the camera

//     // Check for intersections with all the objects in the scene
//     const intersects = this.raycaster.intersectObjects(this.scene.children);

//     // Check if we intersect the textMesh and ensure it is clickable
//     if (intersects.length > 0 && intersects[0].object.userData.clickable) {
//       console.log('Text clicked!');
//       document.body.style.cursor = 'pointer';

//       // If a shader is provided, apply it to the text mesh
//       const noiseMaterial = this.shader.shaderMaterials().noiseMaterial;  // Example shader material
//       this.textMesh.material = noiseMaterial;  // Change the text mesh material to noise shader
//     }
//   }

//   // Method to rotate the phrase (can be called separately)
//   rotatePhrase() {
//     if (this.textMesh) {
//       this.textMesh.rotation.y += 0.01; // Slow rotation on Y axis
//     }
//   }

//   // Method to handle rotation updates for other rotations (if needed)
//   rotateText() {
//     if (this.textMesh) {
//       this.textMesh.rotation.x += 0.005; // Optional rotation on X-axis
//     }
//   }

//   // Update method that calls both rotation methods
//   update() {
//     this.rotatePhrase();  // Calls rotation for the phrase
//     this.rotateText();    // Calls rotation for text on X-axis
//   }
// }














// import * as THREE from 'three';
// import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
// import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'; 
// import ImageUtils from './ImageUtils';
// import Shaders from './Shaders';

// export default class FontMaker {
//   constructor(scene, camera, color = Math.floor(Math.random() * 16777215).toString(16), fontPath = 'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', defaultText = 'Falling Ghosts Rush: Shoot Or Die!!!') {
//     this.scene = scene;
//     this.camera = camera;
//     this.fontPath = fontPath;
//     this.defaultText = defaultText;
//     this.font = null;
//     this.color = color;
//     this.shader = new Shaders();
//     this.loader = new FontLoader();  // FontLoader instance
//     this.textMesh = null;

//     // Initialize ImageUtils and raycaster
//     this.imageUtils = new ImageUtils();
//     this.textureURL = this.imageUtils.getRandomImage('concerts'); // Default category
//     this.textureLoader = new THREE.TextureLoader();  // Defined texture loader here
//     this.raycaster = new THREE.Raycaster();
//     this.mouse = new THREE.Vector2();

//     // Bind the click event to this instance for proper context
//     this.onMouseClick = this.onMouseClick.bind(this);
//     this.onMouseMove = this.onMouseMove.bind(this); // Bind onMouseMove

//     // Load the font
//     this.loadFont();  // Load font on initialization
//   }

// // Create shader materials
// // createShadeMaterials() {
// //   const sawMaterial = this.shader.shaderMaterials().sawMaterial;
// //   const noiseMaterial = this.shader.shaderMaterials().noiseMaterial;
// //   const boidMaterial = this.shader.shaderMaterials().boidsMaterial;
// //   const starryMaterial = this.shader.shaderMaterials().starryMaterial;
// //   const convolutionMaterial = this.shader.shaderMaterials().convolutionMaterial;

// //   return {
// //     sawMaterial,
// //     noiseMaterial,
// //     boidMaterial,
// //     starryMaterial,
// //     convolutionMaterial,
// //   };
// // }

//   // Load the font asynchronously
//   loadFont() {
//     this.loader.load(this.fontPath, (font) => {
//       this.font = font;
//       console.log('Font loaded:', font);  // Check the font object here
//       this.createTextMesh(this.defaultText);
//     }, undefined, (error) => {
//       console.error('Error loading font:', error);
//     });
//   }

//   // Method to create the text mesh once the font is loaded
//   createTextMesh(text = this.defaultText, options = {}) {
//     if (!this.font) {
//       console.error('Font not loaded. Font is null.');
//       return;
//     }

//     const {
//       size = 1.6,
//       height = 0.4,
//       color = 0xffaa00,
//       position = { x: 0, y: -10, z: 0 },
//       rotation = { x: 0, y: 0, z: 0 },
//       bevelEnabled = true,
//       bevelThickness = 0.1,
//       bevelSize = 0.1,
//       bevelSegments = 5,
//       textureURL = this.textureURL
//     } = options;

//     // Create the text geometry
//     const textGeometry = new TextGeometry(text, {
//       font: this.font,
//       size,
//       height,
//       bevelEnabled,
//       bevelThickness,
//       bevelSize,
//       bevelSegments,
//     });

//     // Check if textureURL is valid and then load it
//     const textureLoader = new THREE.TextureLoader();
//     const textMaterial = textureURL && textureURL !== '' 
//       ? new THREE.MeshStandardMaterial({ map: textureLoader.load(textureURL) }) 
//       : new THREE.MeshStandardMaterial({ color });

//     // Create the mesh with geometry and material
//     this.textMesh = new THREE.Mesh(textGeometry, textMaterial);

//     // Center the text geometry
//     textGeometry.computeBoundingBox();
//     const boundingBox = textGeometry.boundingBox;
//     const xMid = -0.5 * (boundingBox.max.x - boundingBox.min.x);
//     const yMid = -0.5 * (boundingBox.max.y - boundingBox.min.y);
//     textGeometry.translate(xMid, yMid, 0); // Center the geometry

//     // Set position, rotation, and other properties
//     this.textMesh.castShadow = true;
//     this.textMesh.receiveShadow = true;
//     this.textMesh.position.set(position.x, position.y, position.z);
//     this.textMesh.rotation.set(rotation.x, rotation.y, rotation.z);
//     this.textMesh.userData.clickable = true;

//     // Add the mesh to the scene
//     this.scene.add(this.textMesh);

//     console.log('Text Mesh created:', this.textMesh);

//     return this.textMesh;
//   }

//   // Call this method to initialize raycast listeners
//   enableRaycast() {
//     window.addEventListener('click', this.onMouseClick, false);
//     window.addEventListener('mousemove', this.onMouseMove, false); // Add mousemove event listener
//   }

//   // Call this method to disable raycast listeners (e.g., on cleanup)
//   disableRaycast() {
//     window.removeEventListener('click', this.onMouseClick, false);
//     window.removeEventListener('mousemove', this.onMouseMove, false); // Remove mousemove event listener
//   }

//   // Handle the mouse move event to change cursor style
//   onMouseMove(event) {
//     // Normalize mouse coordinates
//     this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
//     this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

//     // Update the raycaster with the camera and mouse position
//     this.raycaster.update();  // Ensure the raycaster is updated with the camera view matrix
//     this.raycaster.setFromCamera(this.mouse, this.camera);  // Set the ray's origin and direction from the camera

//     // Check for intersections with all the objects in the scene
//     const intersects = this.raycaster.intersectObjects(this.scene.children);

//     // Change cursor to pointer if hovering over the text mesh
//     if (intersects.length > 0 && intersects[0].object.userData.clickable) {
//       this.textMesh = //// i was goin to call the noise shader but you may have
//       document.body.style.cursor = 'pointer';
//     } else {
//       document.body.style.cursor = 'default';
//     }
//   }

//   // Handle the mouse click event
//   onMouseClick(event) {
//     // Normalize mouse coordinates
//     this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
//     this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

//     // Update the raycaster with the camera and mouse position
//     this.raycaster.update();  // Ensure the raycaster is updated with the camera view matrix
//     this.raycaster.setFromCamera(this.mouse, this.camera);  // Set the ray's origin and direction from the camera

//     // Check for intersections with all the objects in the scene
//     const intersects = this.raycaster.intersectObjects(this.scene.children);

//     // Check if we intersect the textMesh and ensure it is clickable
//     if (intersects.length > 0 && intersects[0].object.userData.clickable) {
//       console.log('Text clicked!');
//       // Handle the click event, such as triggering an animation or navigating
//       window.location.href = '/FallingGhoasts';  // Navigate to the desired route
//     }
//   }

//   // Method to rotate the phrase (can be called separately)
//   rotatePhrase() {
//     if (this.textMesh) {
//       this.textMesh.rotation.y += 0.01; // Slow rotation on Y axis
//     }
//   }

//   // Method to handle rotation updates for other rotations (if needed)
//   rotateText() {
//     if (this.textMesh) {
//       this.textMesh.rotation.x += 0.005; // Optional rotation on X-axis
//     }
//   }

//   // Update method that calls both rotation methods
//   update() {
//     this.rotatePhrase();  // Calls rotation for the phrase
//     this.rotateText();    // Calls rotation for text on X-axis
//   }
// }











/*import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import ImageUtils from './ImageUtils';
import Shaders from '../graphics/Shaders';

export default class FontMaker {
  constructor(scene,
    camera,
    color = new THREE.Color(Math.random(), Math.random(), Math.random()),
    fontPath = 'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',
    defaultText = 'Falling Ghosts Rush: Shoot Or Die!!!',
    textureURL = null,  // No default URL; loaded dynamically via ImageUtils if needed
    shader = null) {
    this.scene = scene;
    this.camera = camera;
    this.fontPath = fontPath;
    this.defaultText = defaultText;
    this.font = null;
    this.color = color;  // Set color as a THREE.Color object
    this.shader = shader || new Shaders();  // Allow passing a custom shader
    this.loader = new FontLoader();  // FontLoader instance
    this.textMesh = null;

    // Initialize ImageUtils and raycaster
    this.imageUtils = new ImageUtils();
    this.textureURL = textureURL || this.imageUtils.getRandomImage('concerts');  // Assign texture URL if not provided
    this.textureLoader = new THREE.TextureLoader();  // Defined texture loader here
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Bind the click event to this instance for proper context
    this.onMouseClick = this.onMouseClick.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this); // Bind onMouseMove

    // Load the font
    this.loadFont();  // Load font on initialization
  }

  // Load the font asynchronously
  loadFont() {
    this.loader.load(this.fontPath, (font) => {
      this.font = font;
      console.log('Font loaded:', font);  // Check the font object here
      this.createTextMesh(this.defaultText);
    }, undefined, (error) => {
      console.error('Error loading font:', error);
    });
  }

  // Method to create the text mesh once the font is loaded
  createTextMesh(text = this.defaultText, mat = 'texturedURL', options = {}) {
    if (!this.font) {
      console.error('Font not loaded. Font is null.');
      return;
    }

    const {
      size = 1.6,
      height = 0.4,
      color = this.color, // Use the color passed in the constructor
      position = { x: 0, y: -10, z: 0 },
      rotation = { x: 0, y: 0, z: 0 },
      bevelEnabled = true,
      bevelThickness = 0.1,
      bevelSize = 0.1,
      bevelSegments = 5,
      texturedURL = this.textureURL,
      customShader = this.shader // Allow custom shader to be passed in
    } = options;

    // Create the text geometry
    const textGeometry = new TextGeometry(text, {
      font: this.font,
      size,
      height,
      bevelEnabled,
      bevelThickness,
      bevelSize,
      bevelSegments,
      texturedURL,
      customShader
    });

    // Select material based on specified `mat` type
    let textMaterial;
    switch (mat) {
      case 'noiseMaterial':
        textMaterial = this.shader.shaderMaterials().noiseMaterial;  // Noise shader example
        break;
      case 'sawMaterial':
        textMaterial = this.shader.shaderMaterials().sawMaterial;  // Saw shader example
        break;
      case 'texturedURL':
        textMaterial = new THREE.MeshStandardMaterial({ map: this.textureLoader.load(this.textureURL) });
        break;
      case 'randomHexColor':
        textMaterial = new THREE.MeshStandardMaterial({ color: new THREE.Color(`#${Math.floor(Math.random()*16777215).toString(16)}`) });
        break;
      default:
        textMaterial = new THREE.MeshStandardMaterial({ color });
        break;
    }

    // Create the mesh with geometry and material
    this.textMesh = new THREE.Mesh(textGeometry, textMaterial);

    // Center the text geometry
    textGeometry.computeBoundingBox();
    const boundingBox = textGeometry.boundingBox;
    const xMid = -0.5 * (boundingBox.max.x - boundingBox.min.x);
    const yMid = -0.5 * (boundingBox.max.y - boundingBox.min.y);
    textGeometry.translate(xMid, yMid, 0); // Center the geometry

    // Set position, rotation, and other properties
    this.textMesh.castShadow = true;
    this.textMesh.receiveShadow = true;
    this.textMesh.position.set(position.x, position.y, position.z);
    this.textMesh.rotation.set(rotation.x, rotation.y, rotation.z);
    this.textMesh.userData.clickable = true;

    // Add the mesh to the scene
    this.scene.add(this.textMesh);

    console.log('Text Mesh created:', this.textMesh);

    return this.textMesh;
  }

  // Call this method to initialize raycast listeners
  enableRaycast() {
    window.addEventListener('click', this.onMouseClick, false);
    window.addEventListener('mousemove', this.onMouseMove, false); // Add mousemove event listener
  }

  // Call this method to disable raycast listeners (e.g., on cleanup)
  disableRaycast() {
    window.removeEventListener('click', this.onMouseClick, false);
    window.removeEventListener('mousemove', this.onMouseMove, false); // Remove mousemove event listener
  }

  // Handle the mouse move event to change cursor style
  onMouseMove(event) {
    // Normalize mouse coordinates
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the raycaster with the camera and mouse position
    // this.raycaster.update();  // Ensure the raycaster is updated with the camera view matrix
    this.raycaster.setFromCamera(this.mouse, this.camera);  // Set the ray's origin and direction from the camera

    // Check for intersections with all the objects in the scene
    const intersects = this.raycaster.intersectObjects(this.scene.children);

    // Change cursor to pointer if hovering over the text mesh
    if (intersects.length > 0 && intersects[0].object.userData.clickable) {
      this.textMesh = intersects[0].object;
      document.body.style.cursor = 'pointer';
      this.textMesh.material = this.shader.shaderMaterials().noiseMaterial;
    } else {
      document.body.style.cursor = 'default';
    }
  }

  // Handle the mouse click event
  onMouseClick(event) {
    // Normalize mouse coordinates
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the raycaster with the camera and mouse position
    // this.raycaster.update();  // Ensure the raycaster is updated with the camera view matrix
    this.raycaster.setFromCamera(this.mouse, this.camera);  // Set the ray's origin and direction from the camera

    // Check for intersections with all the objects in the scene
    const intersects = this.raycaster.intersectObjects(this.scene.children);

    // Check if we intersect the textMesh and ensure it is clickable
    if (intersects.length > 0 && intersects[0].object.userData.clickable) {
      console.log('Text clicked!');
      document.body.style.cursor = 'pointer';

      // If a shader is provided, apply it to the text mesh
      const noiseMaterial = this.shader.shaderMaterials().noiseMaterial;  // Example shader material
      this.textMesh.material = noiseMaterial;  // Change the text mesh material to noise shader
    }
  }

  // Method to rotate the phrase (can be called separately)
  rotatePhrase() {
    if (this.textMesh) {
      this.textMesh.rotation.y += 0.01; // Slow rotation on Y axis
    }
  }

  // Method to handle rotation updates for other rotations (if needed)
  rotateText() {
    if (this.textMesh) {
      this.textMesh.rotation.x += 0.005; // Optional rotation on X-axis
    }
  }

  // Update method that calls both rotation methods
  update() {
    this.rotatePhrase();  // Calls rotation for the phrase
    this.rotateText();    // Calls rotation for text on X-axis
  }
}
*/