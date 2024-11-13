import * as THREE from 'three';
export class Shaders {
  constructor(width = window.innerWidth, height = window.innerHeight, deltaTime = 1 / 60, time = 0.1, shapeFactor = 0.5) {
    this.width = width;
    this.height = height;
    this.time = time;
    this.deltaTime = deltaTime;
    this.shapeFactor = shapeFactor;
    this.mousePosition = new THREE.Vector2(0, 0);

    this.addMouseListener();
    this.initializeShaders();
  }

  initializeShaders() {
    this.northStar = this.useNorthStar();
    this.sawShader = this.useSawShader();
    this.boidRender = this.useBoidRender();
    this.axialSawShader = this.createSawShader();
    this.boidShaders = this.useBoidComputeShaders();
    this.noiseShader = this.useNoiseShader();
    this.redNoiseShader = this.useDarkNoiseShader();
    this.starryBackground = this.useStarryBackgrounds()
    this.convolutionShader = this.useConvolutionShader();
  }

  useStarryBackgrounds() {
    const starryShader = {
      uniforms: {
        time: this.time,
        resolution: { value: new THREE.Vector2(this.width, this.height) },
      },

      vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,

      fragmentShader: `
      uniform samplerCube backgroundTexture;
      varying vec3 vWorldPosition;

      // Simple random noise function
      float randomNoise(vec3 pos) {
        return fract(sin(dot(pos.xyz, vec3(12.9898, 78.233, 54.53))) * 43758.5453);
      }

      void main() {
          vec4 texColor = textureCube(backgroundTexture, vWorldPosition);
          float noise = randomNoise(vWorldPosition * 0.1);
          vec3 color = mix(texColor.rgb, vec3(1.0, 0.8, 0.6), noise * 0.2); // Adding subtle noise effect
          gl_FragColor = vec4(color, 1.0);
        }
      `
    };
    return starryShader;
  }

  useNoiseShader() {
    const noiseShader = {
      uniforms: {
        time: { value: this.time },
        resolution: { value: new THREE.Vector2(this.width, this.height) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            //gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x, sin(position.z) + cos(position.y), cos(position.z), 1.0);// Flat Bird
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec2 vUv;

        // https://iquilezles.org/articles/distfunctions2d/
        float sdfCircle(vec2 p, float r) {
        // note: sqrt(pow(p.x, 2.0) + pow(p.y, 2.0)) - r;
          return length(p) - r;
        }

        float noise(float x, float z) {
          return fract(sin(dot(vec2(x, z) + time, vec2(12.9898, 78.233))) * 43758.5453);
        }

        float S(float t) {
          return smoothstep(0.0, 1.0, t);
        }

        void main() {
          vec2 uv = vUv * 10.0; // Scale the UV coordinates
          float x = uv.x;
          float z = uv.y;

          // vec2 uv = gl_FragCoord.xy / u_resolution;
          // uv = uv - 0.5;
          // uv = uv * u_resolution / 100.0;

          // note: set up basic colors
          vec3 black = vec3(0.0);
          vec3 white = vec3(1.0);
          vec3 red = vec3(1.0, 0.0, 0.0);
          vec3 blue = vec3(0.65, 0.85, 1.0);
          vec3 orange = vec3(0.9, 0.6, 0.3);
          vec3 color = black;
          color = vec3(uv.x, uv.y, 0.0);

          float burst = noise(x, z);
          float value = 0.0;

          for (int i = -1; i <= 1; i++) {
            for (int j = -1; j <= 1; j++) {
              float aij = 0.1; // base value
              float bij = 1.7; // variation
              float cij = 0.51; // adjust
              float dij = 0.33; // noise contribution

              value += aij + (bij - aij) * S(x - float(i)) + (aij - bij - cij + dij) * S(x - float(i)) * S(z - float(j));
            }
          }

          vec3 noiseColor = vec3(value + burst);
          vec3 axialNoiseColor = vec3((value * value) + (burst + burst));

          // note: draw circle sdf
          float radius = 2.5;
          // radius = 3.0;
          vec2 center = vec2(0.0, 0.0);
          // center = vec2(sin(2.0 * time), 0.0);
          float distanceToCircle = sdfCircle(uv - center, radius);
          color = distanceToCircle > 0.0 ? noiseColor : axialNoiseColor;

          // note: adding a black outline to the circle
          // color = color * exp(distanceToCircle);
          // color = color * exp(2.0 * distanceToCircle);
          // color = color * exp(-2.0 * abs(distanceToCircle));
          color = color * (1.0 - exp(-2.0 * abs(distanceToCircle)));
          // color = color * (1.0 - exp(-5.0 * abs(distanceToCircle)));
          // color = color * (1.0 - exp(-5.0 * abs(distanceToCircle)));

          // note: adding waves
          // color = color * 0.8 + color * 0.2;
          // color = color * 0.8 + color * 0.2 * sin(distanceToCircle);
          // color = color * 0.8 + color * 0.2 * sin(50.0 * distanceToCircle);
          color = color * 0.8 + color * 0.2 * sin(50.0 * distanceToCircle - 4.0 * ${this.time});

          // note: adding white border to the circle
          // color = mix(white, color, step(0.1, distanceToCircle));
          // color = mix(white, color, step(0.1, abs(distanceToCircle)));
          //color = mix(white, color, smoothstep(0.0, 0.1, abs(distanceToCircle)));

          // note: thumbnail?
          // color = mix(white, color, abs(distanceToCircle));
          // color = mix(white, color, 2.0 * abs(distanceToCircle));
          // color = mix(white, color, 4.0 * abs(distanceToCircle));

          gl_FragColor = vec4(color, 1.0); // Change the color based on the shader output
        }
      `,
    };

    return noiseShader;
  }

  useDarkNoiseShader() {
    const redNoiseShader = {
      uniforms: {
        time: this.time,
        resolution: { value: new THREE.Vector2(this.width, this.height) },
      },

      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,

      fragmentShader: `
      uniform float time;
      varying vec2 vUv;

      float noise(float x, float z) {
          return fract(sin(dot(vec2(x, z) + time, vec2(12.9898, 78.233))) * 43758.5453);
      }

      float S(float t) {
          return smoothstep(0.0, 1.0, t);
      }

      void main() {
          vec2 uv = vUv * 10.0; // Scale the UV coordinates
          float x = uv.x;
          float z = uv.y;

          float burst = noise(x, z);
          float value = 0.3;

          for (int i = -1; i <= 1; i++) {
              for (int j = -1; j <= 1; j++) {
                  float aij = 0.13; // base value
                  float bij = 1.7; // variation
                  float cij = 0.51; // adjust
                  float dij = 0.33; // noise contribution

                  value += aij + (bij - aij) * S(x - float(i)) + (aij - bij - cij + dij) * S(x - float(i)) * S(z - float(j));
              }
          }

          //   gl_FragColor = vec4(vec3(value + burst), 1.0); // Change the color based on the shader output

          vec3 noiseColor = vec3(burst, value, 0.0);

          // gl_FragColor = vec4(vec3(value + burst), 1.0); // Change the color based on the shader output 
          gl_FragColor = vec4(noiseColor, 1.0);
        }
      `,
    };
    return redNoiseShader;
  }

  // Noise Plane
  useSawShader() {
    const sawShader = {
      uniforms: {
        time: { value: this.time },
        resolution: { value: new THREE.Vector2(this.width, this.height) },
        shapeFactor: { value: 0.5 }, // Control for trapezoidal shape
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
      `,

      fragmentShader: `
        uniform float time;
        varying vec2 vUv;

        float noise(float x, float z) {
          return fract(sin(dot(vec2(x, z) + time, vec2(12.9898, 78.233))) * 43758.5453);
        }

        float S(float t) {
          return smoothstep(0.0, 1.0, t);
        }

        void main() {
          vec2 uv = vUv * 10.0; // Scale the UV coordinates
          float x = uv.x;
          float z = uv.y;

          // note: set up basic colors
          vec3 black = vec3(0.0);
          vec3 white = vec3(1.0);
          vec3 red = vec3(${this.time}, 0.0, 0.0);
          vec3 blue = vec3(0.65, 0.85, 1.0);
          vec3 orange = vec3(0.9, 0.6, 0.3);
          vec3 color = red;

          float burst = noise(x, z);
          float value = 0.2;

          // color = vec3(uv, 0.0);

          /*vec2 uv = gl_FragCoord.xy / vUv;
            uv = uv - 0.5;
            uv = uv * vUv / 100.0;
          */

          for (int i = -1; i <= 1; i++) {
            for (int j = -1; j <= 1; j++) {
              float aij = 0.0; // base value
              float bij = 1.0; // variation
              float cij = 0.51; // adjust
              float dij = 0.33; // noise contribution

              value += aij + (bij - aij) * S(x - float(i)) + (aij - bij - cij + dij) * S(x - float(i)) * S(z - float(j));
            }
          }
          vec3 noiseColor = vec3(burst, value, burst + value);

          // gl_FragColor = vec4(vec3(value + burst), 1.0); // Change the color based on the shader output 
          gl_FragColor = vec4(noiseColor, ${this.time});
        }
      `,
    };
    return sawShader;
  };


  // gl_FragColor = vec4(vec3(value + burst), 1.0); // Change the color based on the shader output

  useConvolutionShader() {
    const redNoiseShader = {
      uniforms: {
        time: { value: 0.0 },
        resolution: { value: new THREE.Vector2(this.width, this.height) },
        shapeFactor: { value: 0.5 }, // Control for trapezoidal shape
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
      fragmentShader: `
        uniform float time;
        uniform vec2 resolution;
        uniform float shapeFactor;
        varying vec2 vUv;

        float trapezoid(float x, float height, float width) {
            float slope = height / (width * 0.5);
            return smoothstep(0.0, slope, height - abs(x));
        }

        float noise(float x, float z) {
            return fract(sin(dot(vec2(x, z) + time, vec2(12.9898, 78.233))) * 43758.5453);
        }

        void main() {
            vec2 uv = vUv * 10.0; // Scale the UV coordinates
            float value = 0.0;

            // Create the convolution shape effect
            for (int i = -11; i <= 11; i++) {
                for (int j = -5; j <= 5; j++) {
                    float xOffset = float(i) * shapeFactor; // Adjusting the shape dynamically
                    float zOffset = float(j) * shapeFactor;
                    float burst = noise(uv.x + xOffset, uv.y + zOffset);
                    float trapValue = trapezoid(uv.x - xOffset, 1.0, shapeFactor); // Trapezoidal shape
                    value += burst * trapValue; // Combine noise with the trapezoid shape
                }
            }

            // Apply a wave effect to color based on the value
            vec3 color = vec3(value * 0.3 + 0.5); // Modulate color based on the calculated value
            gl_FragColor = vec4(color, 0.9); // Final output color
        }
    `,
    };
    return redNoiseShader;
  };

  createSawShader() {
    return {
      uniforms: {
        time: { value: this.time },
        resolution: { value: new THREE.Vector2(this.width, this.height) },
        shapeFactor: { value: this.shapeFactor },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float shapeFactor; // Now we can adjust this dynamically
        varying vec2 vUv;

        float noise(float x, float z) {
          return fract(sin(dot(vec2(x, z) + time, vec2(12.9898, 78.233))) * 43758.5453);
        }

        float S(float t) {
          return smoothstep(0.0, 1.0, t);
        }

        void main() {
          vec2 uv = vUv * 10.0 * shapeFactor; // Scale UV based on shapeFactor
          float x = uv.x;
          float z = uv.y;

          vec3 color = vec3(0.65, 0.85, 1.0); // Blue color
          float burst = noise(x, z);
          float value = 0.2;

          for (int i = -1; i <= 1; i++) {
            for (int j = -1; j <= 1; j++) {
              float aij = 0.0;
              float bij = 1.0;
              float cij = 0.51;
              float dij = 0.33;

              value += aij + (bij - aij) * S(x - float(i)) + (aij - bij - cij + dij) * S(x - float(i)) * S(z - float(j));
            }
          }

          vec3 noiseColor = vec3(burst, value, burst + value);
          gl_FragColor = vec4(noiseColor, 1.0);
        }
      `
    };
  }

  useNorthStar() {
    // Custom Shader Material with Noise
    const northStar = {
      uniforms: {
        time: this.time,
        resolution: { value: new THREE.Vector2(this.width, this.height) },
      },

      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,

      fragmentShader: `
        #define PI 3.14159265359
        varying vec3 vNormal;
        varying vec3 vPosition;

        // Simplex noise or Perlin noise can be implemented or you can use an external noise library
        float random(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }

        void main() {
          float noiseValue = random(vPosition.xz) * 0.5 + 0.5; // Noise effect based on position
          vec3 color = vec3(noiseValue, noiseValue * 0.5, noiseValue * 0.25); // Color based on noise
          
          // You can use the normal to add shading effects here if you like
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.DoubleSide,
      wireframe: false,
    };
    return northStar;
  }

  // Extend the boid shaders with additional uniforms
useBoidComputeShaders() {
  const boidShaders = {
    uniforms: {
      time: { value: 0.0 },
      resolution: { value: new THREE.Vector2(this.width, this.height) },
      mousePosition: { value: new THREE.Vector3(0, 0, 0) },
      deltaTime: { value: this.deltaTime },
      separationDistance: { value: 1.0 },
      alignmentDistance: { value: 2.0 },
      cohesionDistance: { value: 3.0 },
      boidSpeed: { value: 1.0 },            // Speed of boids
      fieldStrength: { value: 1.0 },        // Strength of field effects
      noiseFactor: { value: 0.5 },          // Random noise influence on boid movement
      attractorStrength: { value: 1.0 },    // Strength of attractor forces
      colorShift: { value: 0.1 },           // Shift color over time for visual effect
    },

    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform float deltaTime;
      uniform vec2 resolution;
      uniform vec3 mousePosition;
      uniform float separationDistance;
      uniform float alignmentDistance;
      uniform float cohesionDistance;
      uniform float boidSpeed;
      uniform float fieldStrength;
      uniform float noiseFactor;
      uniform float attractorStrength;
      uniform float colorShift;
      varying vec2 vUv;

      void main() {
        // Calculate noise-influenced position update based on time and noiseFactor
        vec3 direction = normalize(mousePosition - vec3(gl_FragCoord.xy / resolution.xy, 0.0)) * attractorStrength;
        direction += vec3(noiseFactor * sin(time), noiseFactor * cos(time), 0.0);

        // Color shift effect
        vec3 color = vec3(abs(sin(time * colorShift)), abs(cos(time * colorShift)), 1.0 - abs(sin(time * colorShift)));
        gl_FragColor = vec4(color, 1.0);
      }
    `
  };
  return boidShaders;
}

  useBoidRender() {
    const boidRenderShader = {
      uniforms: {
        time: { value: 0.0 },
        resolution: { value: new THREE.Vector2(this.width, this.height) },
        positionTexture: { value: null }, // Position data from the compute shader
      },
      vertexShader: `
        uniform sampler2D positionTexture;
        uniform vec2 resolution;
        varying vec3 color;
    
        void main() {
          vec2 uv = gl_FragCoord.xy / resolution;
          vec3 boidPosition = texture2D(positionTexture, uv).xyz;
    
          gl_Position = projectionMatrix * modelViewMatrix * vec4(boidPosition, 1.0);
          color = vec3(0.5, 0.8, 1.0); // Example color for each boid
        }
      `,
      fragmentShader: `
        varying vec3 color;
        void main() {
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    };
    return boidRenderShader;
  }

  shaderMaterials() {
    const noiseMaterial = new THREE.ShaderMaterial(this.noiseShader);
    const redNoiseMaterial = new THREE.ShaderMaterial(this.redNoiseShader);
    const sawMaterial = new THREE.ShaderMaterial(this.sawShader);
    const northStarMaterial = new THREE.ShaderMaterial(this.northStar);
    const starryMaterial = new THREE.ShaderMaterial(this.starryBackground);
    const axialSawMaterial = new THREE.ShaderMaterial(this.axialSawShader);
    const boidsMaterial = new THREE.ShaderMaterial(this.boidShaders);
    const boidsRender = new THREE.ShaderMaterial(this.boidRenderShader);
    const convolutionMaterial = new THREE.ShaderMaterial(this.convolutionShader);

    return {
      noiseMaterial,
      redNoiseMaterial,
      sawMaterial,
      axialSawMaterial,
      convolutionMaterial,
      boidsMaterial,
      northStarMaterial,
      starryMaterial,
      boidsRender
    };
  }

  // Convert mouse coordinates from screen space to normalized device coordinates
  convertMouseToNDC(event) {
    const x = (event.clientX / window.innerWidth) * 2 - 1; // Normalize X between -1 and 1
    const y = -(event.clientY / window.innerHeight) * 2 + 1; // Normalize Y between -1 and 1
    this.mousePosition.set(x, y); // Set the normalized mouse position
  }

  // Set up the mouse move event listener
  addMouseListener() {
    window.addEventListener('mousemove', (event) => this.convertMouseToNDC(event), false);

    // Adding random click event listener
    window.addEventListener('click', this.handleRandomClick.bind(this), false);
  }

  // Remove the mouse event listeners
  removeMouseListener() {
    window.removeEventListener('mousemove', (event) => this.convertMouseToNDC(event), false);
    window.removeEventListener('click', this.handleRandomClick.bind(this), false);
  }

  // Handle random click events
  handleRandomClick() {
    // Randomly change the speed and color shift for the boid shader
    const randomSpeed = Math.random() * 2 + 0.5; // Speed between 0.5 and 2.5
    const randomColor = Math.random(); // Color shift between 0 and 1
    this.boidShaders.uniforms.boidSpeed.value = randomSpeed;
    this.boidShaders.uniforms.colorShift.value = randomColor;
    console.log(`Random click event: Boid Speed: ${randomSpeed}, Color Shift: ${randomColor}`);
  }

  // Update method for shader uniforms and dynamic behavior
  update() {
    this.addMouseListener()
    this.time += this.deltaTime; // Update time for animation
    this.boidShaders.uniforms.time.value = this.time;
    this.boidShaders.uniforms.deltaTime.value = this.deltaTime;
    this.boidShaders.uniforms.mousePosition.value = this.mousePosition; // Add interactivity
    this.boidShaders.uniforms.boidSpeed.value = Math.sin(this.time * 0.5) * 0.5 + 1.0; // Oscillate speed
    this.boidShaders.uniforms.colorShift.value = (Math.cos(this.time) * 0.5) + 0.5; // Dynamic color
    // Update other uniforms if necessary
  }
}
export default Shaders