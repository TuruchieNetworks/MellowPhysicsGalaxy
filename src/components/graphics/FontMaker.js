import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import ImageUtils from './ImageUtils';
import Shaders from '../graphics/Shaders';

export default class FontMaker {
  constructor(
    scene,
    camera,
    navigate,
    fontPath = 'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',
    defaultText = 'Falling Ghosts Rush: Shoot Or Get Hit!!!',
    color = new THREE.Color(Math.random(), Math.random(), Math.random()),
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
    this.navigate = navigate;

    // Bind the click event to this instance for proper context
    this.onMouseClick = this.onMouseClick.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this); // Bind onMouseMove


    // Load the font asynchronously
    this.initFont();
  }

  // Wrap font loading in a promise for async/await compatibility
  async loadFont() {
    return new Promise((resolve, reject) => {
      this.loader.load(this.fontPath,
        (font) => resolve(font),
        undefined,
        (error) => reject(error)
      );
    });
  }

  // Initialize font loading
  async initFont() {
    try {
      this.font = await this.loadFont();
      //console.log('Font loaded:', this.font);
      this.createTextMesh(this.defaultText);
      this.createTextMesh(this.defaultText);
    } catch (error) {
      console.error('Error loading font:', error);
    }
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
        textMaterial = new THREE.MeshStandardMaterial({ color: new THREE.Color(`#${Math.floor(Math.random() * 16777215).toString(16)}`) });
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

    ///sconsole.log('Text Mesh created:', this.textMesh);

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

  // Helper method for setting up raycaster
  setRaycasterFromMouse(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);
  }

  // Handle mouse move to change cursor style and material
  onMouseMove(event) {
    this.setRaycasterFromMouse(event);

    const intersects = this.raycaster.intersectObjects(this.scene.children);
    if (intersects.length > 0 && intersects[0].object.userData.clickable) {
      document.body.style.cursor = 'pointer';

      // Check if textMesh exists and has a material before setting it
      if (this.textMesh && this.textMesh.material !== this.shader.shaderMaterials().noiseMaterial) {
        this.textMesh.material = this.shader.shaderMaterials().noiseMaterial;
      }
    } else {
      document.body.style.cursor = 'default';
      if (this.textMesh) {
        this.textMesh.material = new THREE.MeshPhongMaterial({ map: this.textureLoader.load(this.textureURL) });
      }
    }
  }

  // Handle mouse click for navigation
  onMouseClick(event, path = '/FallingGhoasts') {
    this.setRaycasterFromMouse(event);
    const intersects = this.raycaster.intersectObjects(this.scene.children);

    if (intersects.length > 0 && intersects[0].object.userData.clickable) {
      // console.log('Text clicked!');
      this.navigate(path); // Use `navigate` from `useNavigate`
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

  adjustFontSize() {
    // Determine the font size based on window width
    const newSize = window.innerWidth <= 700 ? 0.8 : 1.6;
  
    // Only update the font size if it's different from the current size
    if (this.textMesh && this.textMesh.geometry.parameters.size !== newSize) {
      // Update the existing text mesh size
      this.textMesh.geometry = new TextGeometry(this.defaultText, {
        font: this.font,
        size: newSize,
        height: 0.3,
        bevelEnabled: true,
        bevelThickness: 0.1,
        bevelSize: 0.1,
        bevelSegments: 5,
        texturedURL: this.textureURL,
        customShader: this.shader
      });
      
      // Reposition the text to stay centered
      const textGeometry = this.textMesh.geometry;
      textGeometry.computeBoundingBox();
      const boundingBox = textGeometry.boundingBox;
      const xMid = -0.5 * (boundingBox.max.x - boundingBox.min.x);
      const yMid = -0.5 * (boundingBox.max.y - boundingBox.min.y);
      textGeometry.translate(xMid, yMid, 0); // Center the geometry
    }
  }

  // Update method that calls both rotation methods
  update() {
    this.rotateText();    // Calls rotation for text on X-axis
    this.rotatePhrase();  // Calls rotation for phrases on y-phrase
  }

  // Dispose method to clean up resources
  dispose() {
    // Remove text mesh from the scene
    if (this.textMesh) {
      this.scene.remove(this.textMesh);

      // Dispose geometry and material to free memory
      this.textMesh.geometry.dispose();
      if (this.textMesh.material.map) this.textMesh.material.map.dispose();
      this.textMesh.material.dispose();
      this.textMesh = null;
    }

    // Disable event listeners
    this.disableRaycast();

    // Optional: Clean up any additional resources, like textures or shaders
    if (this.shader) {
      Object.values(this.shader.shaderMaterials()).forEach(material => {
        if (material.dispose) material.dispose();
      });
    }

    console.log('FontMaker resources disposed.');
  }
}
