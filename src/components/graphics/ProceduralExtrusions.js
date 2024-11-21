import * as THREE from 'three';
import * as CANNON from "cannon-es";
import ImageUtils from './ImageUtils';
import Shaders from './Shaders';
import GaussianDistribution from './GaussianDistribution'; 
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils';

class ProceduralExtrusions {
  constructor(scene, world, camera, textureLoader, cubeSize, plane, sceneMeshes = []) {
    this.scene = scene;
    this.world = world;
    this.camera = camera;
    this.textureLoader = textureLoader || new THREE.TextureLoader();

    // Initialize GaussianDistribution for mass and velocity generation
    this.gaussianDistribution = new GaussianDistribution();

    // Initialize Utils
    this.shader = new Shaders();
    this.imageUtils = new ImageUtils();
    this.textureLoader = new THREE.TextureLoader();

    // Intersection, raycasting, and hover preview
    this.mouse = new THREE.Vector2();
    this.intersectionPoint = new THREE.Vector3();
    this.rayCaster = new THREE.Raycaster();
    this.planeNormal = new THREE.Vector3();
    this.interactionPlane = new THREE.Plane();
    this.plane = plane;

    // Spheres and animations
    this.spheres = [];
    this.geometries = [];

    // Physics
    this.gravityEnabled = true;
    this.gravity = new THREE.Vector3(0, -9.81, 0); // Gravity vector
    this.cubeSize = cubeSize; //|| 100; // Default cube size for wall collision boundary
    this.sceneMeshes = sceneMeshes; // Additional meshes in the scene for collision detection

    this.initializePreview();

    this.generateRandomIndex(3);

    this.initializeShadowCasting();

    this.pos = this.createRandomPoints();

    this.randomColor = this.createRandomHexColor();

    this.pencil = pencil; // The pencil instance to pull coordinates from
  }

  // Pull points from the pencil and convert them into 3D vertices for extrusion
  createVerticesFromPencil() {
    const coordinates = this.pencil.getCoordinates();

    // If there are less than two points, we cannot create a valid extrusion
    if (coordinates.length < 2) {
      console.error('Not enough points to create extrusion vertices.');
      return [];
    }

    // Convert 2D points (x, y) to 3D points (x, y, z)
    const vertices = [];
    coordinates.forEach((point, index) => {
      // Extrude along the Z-axis to give the points depth (this will create vertices in 3D)
      const x = point.x;
      const y = point.y;
      const z = index * 10; // Example: extrude by 10 units along the Z-axis for each point
      vertices.push(new THREE.Vector3(x, y, z));
    });

    // Optionally, add more points or adjust the extrusion logic here

    return vertices;
  }

  // Example method to create geometry from the vertices
  createGeometryFromPencil() {
    const vertices = this.createVerticesFromPencil();
    
    if (vertices.length === 0) return null;

    const geometry = new THREE.BufferGeometry();
    geometry.setFromPoints(vertices); // Set vertices to the geometry
    geometry.computeBoundingSphere();

    return geometry;
  }

  initializePreview() {
    this.previewSphere = this.createPreviewSphere();
    this.scene.add(this.previewSphere);
  }

  initializeShadowCasting() {
    this.scene.traverse(object => {
      if (object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });
  }

  generateRandomIndex(index = 3) {
    return Math.random(index) * index
  }

  createRandomHexColor = () => {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
  }

  createRandomPoints() {
    const x = (Math.random() - 0.5) * 10;
    const y = Math.random() * 10 + 10;
    const z = (Math.random() - 0.5) * 10;
    return { x, y, z }
  }

  createCustomVertices() {
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      0, 0, 0,
      0, 100, 0,
      0, 0, 100
    ]);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.computeBoundingSphere();
    return geometry;
  }

  createRandomVertices() {
    const { x, y, z } = this.createRandomPoints();
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      x, y, z,
      x, y * 100, z,
      x, y, z * 100
    ]);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.computeBoundingSphere();
    return geometry;
  }

  extrude2DVerticesTo3D() {
    const shape = new THREE.Shape([
      new THREE.Vector2(0, 50),
      new THREE.Vector2(50, 50),
      new THREE.Vector2(50, 0)
    ]);
    const geometry = new THREE.ExtrudeGeometry(shape, {
      bevelEnabled: true,
      depth: 30
    });
    return geometry;
  }

  createMaterial() {
    const createMaterial = (color) => new THREE.MeshStandardMaterial({ color });
    this.materialCache = {}; // Cache materials
    const getMaterial = (color) => {
      if (!this.materialCache[color]) {
        this.materialCache[color] = createMaterial(color);
      }
      return this.materialCache[color];
    };
  }

  createFloor() {
    const geometry = new THREE.PlaneGeometry(2000, 2000);
    const material = new THREE.MeshBasicMaterial({ color: this.randomColor });
    const floor = new THREE.Mesh(geometry, material);
    floor.rotation.x = -Math.PI / 2;
    this.scene.add(floor);
  }

  createRandomBuildings() {
    const geometries = [];
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(`hsl(${Math.random() * 360}, 50%, 50%)`),
      roughness: 0.7,
      metalness: 0.3
    });

    for (let i = 0; i < 500; i++) {
      const geo = new THREE.BoxGeometry(
        Math.random() * 50 + 10, // width
        Math.random() * 50 + 10, // height
        Math.random() * 50 + 10  // depth
      );
      geo.translate(
        Math.random() * 100 - 50, // x position
        Math.random() * 50,       // y position (elevated)
        Math.random() * 100 - 50  // z position
      );
      geometries.push(geo);
    }

    if (geometries.length > 0) {
      const mergedGeo = mergeBufferGeometries(geometries);
      const city = new THREE.Mesh(mergedGeo, material);
      this.scene.add(city);
    } else {
      console.warn("No geometries to merge for buildings.");
    }
  }

  createMultiFacedVertices(geometry) {
    // Create an array of materials
    const materials = [
      new THREE.MeshPhongMaterial({ color: this.randomColor }),
      new THREE.MeshPhongMaterial({ color: this.randomColor }),
      new THREE.MeshPhongMaterial({ color: this.randomColor }),
      new THREE.MeshPhongMaterial({ color: this.randomColor }),
      new THREE.MeshPhongMaterial({ color: this.randomColor }),
      new THREE.ShaderMaterial({ uniforms: this.shader.shaderMaterials().sawMaterial }),
      new THREE.ShaderMaterial({ uniforms: this.shader.shaderMaterials().axialSawMaterial }),
      new THREE.ShaderMaterial({ uniforms: this.shader.shaderMaterials().explosiveMaterial }),
      new THREE.ShaderMaterial({ uniforms: this.shader.shaderMaterials().wrinkledMaterial }),
      new THREE.ShaderMaterial({ uniforms: this.shader.shaderMaterials().convolutionMaterial }),
    ];

    // Split the geometry into groups for each material
    const faceCount = geometry.index ? geometry.index.count / 3 : geometry.attributes.position.count / 3;
    for (let i = 0; i < faceCount; i++) {
      const materialIndex = i % materials.length;
      geometry.addGroup(i * 3, 3, materialIndex);
    }

    // Create a mesh with the geometry and the array of materials
    const mesh = new THREE.Mesh(geometry, materials);
    this.scene.add(mesh);

    return mesh;
  }

  extrudeCanvasDrawing(points) {
    if (points.length < 2) return;

    // Convert 2D points to THREE.Vector2 for Shape
    const shapePoints = points.map((p) => new THREE.Vector2(p.x, -p.y)); // Invert y for Three.js
    const shape = new THREE.Shape(shapePoints);

    // Extrude the shape
    const extrudeSettings = {
      depth: 30,
      bevelEnabled: false,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    // Create a material and mesh
    const material = new THREE.MeshPhongMaterial({ color: this.randomColor });
    const mesh = new THREE.Mesh(geometry, material);
    return mesh;
  }

  createCanvas3DCharacter() {
    const mesh = this.extrudeCanvasDrawing();
    mesh.position.set(0, 1, 0);
    this.scene.add(mesh);
  }

  createMultifacedBox() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const mesh = this.createMultiFacedVertices(geometry);
    mesh.position.set(0, 1, 0);
    this.scene.add(mesh);
  }

  generatePointsFromFunction(func, range, step = 0.1) {
    const f = compile(func);
    const points = [];
    for (let x = range[0]; x <= range[1]; x += step) {
      const y = f.evaluate({ x });
      points.push(new THREE.Vector2(x, y));
    }
    return points;
  }

  setMathPointsToScene() {
    const shapePoints = generatePointsFromFunction(poly, [0, 4]);
    const shape = new THREE.Shape(shapePoints);

    // Extrude the shape
    const extrudeSettings = { depth: 30, bevelEnabled: false };
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    // Create a mesh
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
  }

}
export default ProceduralExtrusions;














  // createFloor() {
  //   const geo = new THREE.PlaneGeometry(2000, 2000, 20, 20);
  //   const mat = new THREE.MeshBasicMaterial({
  //     color: this.randomColor,
  //     overdraw: true,
  //     roughness: 0.9,
  //     metalness: 0.1
  //   });
  //   const floor = new THREE.Mesh(geo, mat);
  //   floor.rotation.x = -90 * Math.PI / 180;
  //   this.scene.add(floor)
  // }


  // createRandomBuildings() {
  //   const geometries = [];
  //   for (let i = 0; i < 500; i++) {
  //     const geo = new THREE.BoxGeometry(
  //       Math.random() * 50 + 10,
  //       Math.random() * 50 + 10,
  //       Math.random() * 50 + 10
  //     );
  //     geo.translate(
  //       Math.random() * 100 - 50,
  //       Math.random() * 50,
  //       Math.random() * 100 - 50
  //     );
  //     geometries.push(geo);
  //   }
  //   const mergedGeo = mergeBufferGeometries(geometries);
  //   const material = new THREE.MeshStandardMaterial({ color: 0x555555 });
  //   const city = new THREE.Mesh(mergedGeo, material);
  //   this.scene.add(city);
  // }