import * as THREE from 'three';

export class Shaders {
  constructor(width = window.innerWidth,
    height = window.innerHeight,
    deltaTime = 1 / 60,
    time = 0.1,
    shapeFactor = 0.5,
    cubeTexture = null,
    explodeIntensity = 0.1,
    side = THREE.DoubleSide,
    thickness = 1,
    flatShading = true,
    u_frequency = 0.0) {
    this.width = width;
    this.height = height;
    this.time = time;
    this.u_frequency = u_frequency;
    this.thickness = thickness;
    this.explodeIntensity = explodeIntensity;
    this.flatShading = flatShading;
    this.deltaTime = deltaTime;
    this.shapeFactor = shapeFactor;
    this.cubeTexture = cubeTexture;
    this.mousePosition = new THREE.Vector2(0, 0);

    this.addMouseHover();
    this.addMouseListener();
    this.initializeShaders();
    this.createRandomHexColor();
  }

  initializeShaders() {
    this.northStar = this.useNorthStar();
    this.sawShader = this.useSawShader();
    this.icoShader = this.useIcoShader();
    this.boidRender = this.useBoidRender();
    this.noiseShader = this.useNoiseShader();
    this.musicShader = this.useMusicShader();
    this.axialSawShader = this.createSawShader();
    this.boidShaders = this.useBoidComputeShaders();
    this.darkNoiseShader = this.useDarkNoiseShader();
    this.starryShader = this.useStarryBackgrounds();
    this.powderShader = this.useCyclicPowderShader();
    this.wrinkledShader = this.useWrinkledShader();
    this.explosiveShader = this.useExplosiveShader();
    this.convolutionShader = this.useConvolutionShader();
    this.frequencyShader = this.useFrequencyShader();
  }

  createRandomHexColor = () => {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
  }

  useStarryBackgrounds() {
    const starryShader = {
      uniforms: {
        hovered: { value: 0.0 },
        time: { value: this.time },
        explodeIntensity: { value: 0.1 },
        backgroundTexture: { value: this.cubeTexture },
        mousePosition: { value: new THREE.Vector2(0.0, 0.0) },
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
        return fract(sin(dot(pos.xyz * sin(time), vec3(12.9898, 78.233, 54.53))) * 43758.5453);
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
    const darkNoiseShader = {
      uniforms: {
        time: { value: this.time },
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
    return darkNoiseShader;
  }

  useIcoShader() {
    const shader = {
      uniforms: {
        u_time: { value: this.time },                // Time for animation (used for Perlin animation)
        u_red: { value: 1.0 },
        u_green: { value: 1.0 },
        u_blue: { value: 1.0 },
        u_frequency: { value: this.u_frequency },           // Current frequency value from the audio analysis
        u_freqBands: { value: new THREE.Vector3(0.0, 0.0, 0.0) }, // Frequency bands (bass, mid, treble)
        u_ampFactor: { value: 1.0 },           // Amplitude factor to scale frequency effects
        u_perlinScale: { value: new THREE.Vector2(50.0, 20000.0) }, // Frequency scale for Perlin noise (50Hz to 20,000Hz)
        u_resolution: { value: new THREE.Vector2(this.width, this.height) }, // Resolution (screen size)
      },

      vertexShader: `
        uniform float u_time;

        vec3 mod289(vec3 x)
        {
          return x - floor(x * (1.0 / 289.0)) * 289.0;
        }
        
        vec4 mod289(vec4 x)
        {
          return x - floor(x * (1.0 / 289.0)) * 289.0;
        }
        
        vec4 permute(vec4 x)
        {
          return mod289(((x*34.0)+10.0)*x);
        }
        
        vec4 taylorInvSqrt(vec4 r)
        {
          return 1.79284291400159 - 0.85373472095314 * r;
        }
        
        vec3 fade(vec3 t) {
          return t*t*t*(t*(t*6.0-15.0)+10.0);
        }

        // Classic Perlin noise, periodic variant
        float pnoise(vec3 P, vec3 rep)
        {
          vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period
          vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period
          Pi0 = mod289(Pi0);
          Pi1 = mod289(Pi1);
          vec3 Pf0 = fract(P); // Fractional part for interpolation
          vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
          vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
          vec4 iy = vec4(Pi0.yy, Pi1.yy);
          vec4 iz0 = Pi0.zzzz;
          vec4 iz1 = Pi1.zzzz;

          vec4 ixy = permute(permute(ix) + iy);
          vec4 ixy0 = permute(ixy + iz0);
          vec4 ixy1 = permute(ixy + iz1);

          vec4 gx0 = ixy0 * (1.0 / 7.0);
          vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
          gx0 = fract(gx0);
          vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
          vec4 sz0 = step(gz0, vec4(0.0));
          gx0 -= sz0 * (step(0.0, gx0) - 0.5);
          gy0 -= sz0 * (step(0.0, gy0) - 0.5);

          vec4 gx1 = ixy1 * (1.0 / 7.0);
          vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
          gx1 = fract(gx1);
          vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
          vec4 sz1 = step(gz1, vec4(0.0));
          gx1 -= sz1 * (step(0.0, gx1) - 0.5);
          gy1 -= sz1 * (step(0.0, gy1) - 0.5);

          vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
          vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
          vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
          vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
          vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
          vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
          vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
          vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

          vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
          g000 *= norm0.x;
          g010 *= norm0.y;
          g100 *= norm0.z;
          g110 *= norm0.w;
          vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
          g001 *= norm1.x;
          g011 *= norm1.y;
          g101 *= norm1.z;
          g111 *= norm1.w;

          float n000 = dot(g000, Pf0);
          float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
          float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
          float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
          float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
          float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
          float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
          float n111 = dot(g111, Pf1);

          vec3 fade_xyz = fade(Pf0);
          vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
          vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
          float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
          return 2.2 * n_xyz;
        }

        uniform float u_frequency;

        void main() {
            float noise = 3.0 * pnoise(position + u_time, vec3(10.0));
            float displacement = (u_frequency + u_time / 30.) * (noise / 10.);
            vec3 newPosition = position + normal * displacement;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform float u_time;
        uniform float u_red;
        uniform float u_blue;
        uniform float u_green;
        void main() {
            gl_FragColor = vec4(vec3(u_red, 0.0 + u_time, u_blue), 1. );
        }`

    }
    return shader
  }

  useMusicShader(
    u_frequency = 0.0,) {
    const shader = {
      uniforms: {
        u_time: { value: this.time },                // Time for animation (used for Perlin animation)
        u_frequency: { value: u_frequency },           // Current frequency value from the audio analysis
        u_freqBands: { value: new THREE.Vector3(0.0, 0.0, 0.0) }, // Frequency bands (bass, mid, treble)
        u_ampFactor: { value: 1.0 },           // Amplitude factor to scale frequency effects
        u_perlinScale: { value: new THREE.Vector2(50.0, 20000.0) }, // Frequency scale for Perlin noise (50Hz to 20,000Hz)
        u_resolution: { value: new THREE.Vector2(this.width, this.height) }, // Resolution (screen size)
      },

      vertexShader: `#version 300 es
        precision highp float;
    
        in vec3 position;
        in vec3 normal;
    
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float u_time;
        uniform vec3 u_freqBands;
        uniform vec2 u_perlinScale;
        uniform vec2 u_resolution;
    
        out vec3 vPosition;
  
        // Classic Perlin noise functions
        vec3 mod289(vec3 x) {
            return x - floor(x * (1.0 / 289.0)) * 289.0;
        }
    
        vec4 mod289(vec4 x) {
            return x - floor(x * (1.0 / 289.0)) * 289.0;
        }
    
        vec4 permute(vec4 x) {
            return mod289(((x * 34.0) + 10.0) * x);
        }
    
        vec4 taylorInvSqrt(vec4 r) {
            return 1.79284291400159 - 0.85373472095314 * r;
        }
    
        vec3 fade(vec3 t) {
            return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
        }
    
        float pnoise(vec3 P, vec3 rep) {
          vec3 Pi0 = mod(floor(P), rep);
          vec3 Pi1 = mod(Pi0 + vec3(1.0), rep);
          Pi0 = mod289(Pi0);
          Pi1 = mod289(Pi1);
          vec3 Pf0 = fract(P);
          vec3 Pf1 = Pf0 - vec3(1.0);

          vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
          vec4 iy = vec4(Pi0.yy, Pi1.yy);
          vec4 iz0 = Pi0.zzzz;
          vec4 iz1 = Pi1.zzzz;

          vec4 ixy = permute(permute(ix) + iy);
          vec4 ixy0 = permute(ixy + iz0);
          vec4 ixy1 = permute(ixy + iz1);

          vec4 gx0 = ixy0 * (1.0 / 7.0);
          vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
          gx0 = fract(gx0);
          vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
          vec4 sz0 = step(gz0, vec4(0.0));
          gx0 -= sz0 * (step(0.0, gx0) - 0.5);
          gy0 -= sz0 * (step(0.0, gy0) - 0.5);

          vec4 gx1 = ixy1 * (1.0 / 7.0);
          vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
          gx1 = fract(gx1);
          vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
          vec4 sz1 = step(gz1, vec4(0.0));
          gx1 -= sz1 * (step(0.0, gx1) - 0.5);
          gy1 -= sz1 * (step(0.0, gy1) - 0.5);

          vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);
          vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);
          vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);
          vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);
          vec3 g001 = vec3(gx1.x, gy1.x, gz1.x);
          vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);
          vec3 g011 = vec3(gx1.z, gy1.z, gz1.z);
          vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);

          vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
          g000 *= norm0.x;
          g010 *= norm0.y;
          g100 *= norm0.z;
          g110 *= norm0.w;

          vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
          g001 *= norm1.x;
          g011 *= norm1.y;
          g101 *= norm1.z;
          g111 *= norm1.w;

          float n000 = dot(g000, Pf0);
          float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
          float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
          float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
          float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
          float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
          float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
          float n111 = dot(g111, Pf1);

          vec3 fade_xyz = fade(Pf0);
          vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
          vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
          float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
          return 2.2 * n_xyz;
        }
    
        void main() {
          // Modify noise based on current frequency data (bass, mid, treble) and time
          float noise = 3.0 * pnoise(position + u_time, vec3(10.0)); 

          // Normalize frequency bands to influence displacement
          float frequencyEffect = u_freqBands.x * 0.5 + u_freqBands.y * 0.3 + u_freqBands.z * 0.2;

          // Scale displacement by screen resolution for dynamic scaling
          float resolutionScale = u_resolution.x * u_resolution.y;

          /* Final displacement, now influenced by both time, frequency, and screen resolution
          */

          float displacement = (u_frequency / 30.0) * (noise / 10.0) * frequencyEffect * resolutionScale * u_ampFactor;

          // Apply displacement to vertex positions
          vec3 newPosition = position + normal * displacement;

          // Set the final vertex position
          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
      `,

      fragmentShader: `
        #version 300 es
        precision highp float;
    
        out vec4 fragColor;
    
        uniform vec3 u_freqBands;      // Frequency data (bass, mid, treble)
        uniform float u_time;          // Time to animate the shader
        uniform vec2 u_resolution;     // Resolution of the screen
    
        void main() {
          // Simple color effect based on the frequency bands
          vec3 color = vec3(u_freqBands.x * 0.3, u_freqBands.y * 0.5, u_freqBands.z * 0.2);

          // Time-based effect to animate the color
          color.r += sin(u_time * 0.1) * 0.1;
          color.g += sin(u_time * 0.2) * 0.1;
          color.b += sin(u_time * 0.3) * 0.1;

          fragColor = vec4(color, 1.0);
        }
      `
    };

    return shader;
  }

  useFrequencyShader() {
    const shader = {
      uniforms: {
        u_time: { value: 0.0 },                // Time for animation (used for Perlin animation)
        u_frequency: { value: 0.0 },           // Current frequency value from the audio analysis
        u_freqBands: { value: new THREE.Vector3(0.0, 0.0, 0.0) }, // Frequency bands (bass, mid, treble)
        u_ampFactor: { value: 1.0 },           // Amplitude factor to scale frequency effects
        u_perlinScale: { value: new THREE.Vector2(50.0, 20000.0) }, // Frequency scale for Perlin noise (50Hz to 20,000Hz)
        u_resolution: { value: new THREE.Vector2(this.width, this.height) }, // Resolution (screen size)
      },

      vertexShader: `#version 300 es
        precision highp float;
        in vec3 position;
        in vec3 normal;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float u_time;
        uniform vec3 u_freqBands;
        uniform vec2 u_perlinScale;
        out vec3 vPosition;
        out vec3 vColor;
  
        // Function to generate Perlin noise based on input frequency
        float perlinNoise(vec3 position) {
            // Placeholder Perlin noise generation (adjust as per your library)
            return fract(sin(dot(position.xyz ,vec3(12.9898,78.233,151.7182))) * 43758.5453);
        }
  
        void main() {
          // Generate Perlin noise based on time and position, scaled by frequency data
          float noise = perlinNoise(position + u_time * 0.1); // Using time to animate noise
  
          // Map the noise value to the desired frequency range (50Hz to 20,000Hz)
          float frequencyEffect = mix(u_perlinScale.x, u_perlinScale.y, noise);
  
          // Adjust displacement based on frequency bands (bass, mid, treble)
          // Bass, mid, and treble frequencies are weighted for more dynamic effects
          float bassEffect = u_freqBands.x * 0.5;   // Bass (low frequencies)
          float midEffect = u_freqBands.y * 0.3;    // Mid (mid-range frequencies)
          float trebleEffect = u_freqBands.z * 0.2; // Treble (high frequencies)
  
          // The final displacement is based on the frequency bands and the Perlin noise scale
          float displacement = (bassEffect + midEffect + trebleEffect) * frequencyEffect * u_ampFactor;
  
          // Apply displacement to vertex positions
          vec3 newPosition = position + normal * displacement;
  
          // Compute color based on frequency bands
          // Bass frequencies will be red, mid frequencies green, and treble frequencies blue
          vec3 bassColor = vec3(1.0, 0.0, 0.0);    // Red for bass
          vec3 midColor = vec3(0.0, 1.0, 0.0);     // Green for mid
          vec3 trebleColor = vec3(0.0, 0.0, 1.0);  // Blue for treble
  
          // Combine the colors based on frequency bands
          vec3 color = bassColor * bassEffect + midColor * midEffect + trebleColor * trebleEffect;
  
          // Set the final vertex position and color
          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
          vColor = color; // Pass the color to the fragment shader
        }
      `,

      fragmentShader: `#version 300 es
        precision highp float;
        in vec3 vColor;  // The color passed from the vertex shader
        out vec4 FragColor;
  
        void main() {
          // Output the color of the fragment (vertex color)
          FragColor = vec4(vColor, 1.0); // Set alpha to 1.0 for full opacity
        }
      `,
    };
    return shader;
  }

  useExplosiveShader() {
    const explosiveShader = {
      uniforms: {               // Time for animation (used for Perlin animation)
        u_red: { value: 1.0 },
        u_green: { value: 1.0 },
        u_blue: { value: 1.0 },
        u_frequency: { value: this.u_frequency },           // Current frequency value from the audio analysis
        u_freqBands: { value: new THREE.Vector3(0.0, 0.0, 0.0) }, // Frequency bands (bass, mid, treble)
        u_ampFactor: { value: 1.0 },           // Amplitude factor to scale frequency effects
        u_perlinScale: { value: new THREE.Vector2(50.0, 20000.0) }, // Frequency scale for Perlin noise (50Hz to 20,000Hz)
        u_resolution: { value: new THREE.Vector2(this.width, this.height) }, // Resolution (screen size)
        time: { value: this.time },
        shapeFactor: { value: this.shapeFactor },
        mousePosition: { value: new THREE.Vector2(0.0, 0.0) },
        hovered: { value: 0.0 },
        explodeIntensity: { value: this.explodeIntensity },
        backgroundTexture: { value: this.cubeTexture },
        side: { value: this.side }, // Retain the side parameter
        flatShading: { value: this.flatShading }, // Retain flat shading
        color: { value: new THREE.Color() }
      },

      vertexShader: `
        uniform float time;
        uniform float hovered;
        uniform vec2 mousePosition;
        uniform float explodeIntensity;
        uniform float u_frequency;
        uniform float shapeFactor;
        varying vec2 vUv;

        float trapezoid(float x, float height, float width) {
            float slope = height / (width * 0.5);
            return smoothstep(0.0, slope, height - abs(x));
        }
  
        float noise(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }
    
        void main() {
          vUv = uv;
          vec3 pos = position;

          // Apply noise based on UV coordinates and time
          float n = noise(vUv * 10.0 + time * 0.1 + u_frequency);
  
          // Calculate distance to mouse position
          float dist = distance(mousePosition, vec2(pos.x, pos.y));
          // float effect = hovered * smoothstep(0.2, 0.0, dist) * noise(pos.xy * 10.0 + sin(time));
          float effect = hovered * smoothstep(0.2, (0.0 + sin(shapeFactor) + time), dist) * noise(pos.xy * 10.0 + sin(time + shapeFactor));
  
          // Apply explode effect
          pos += normal * effect * (explodeIntensity + sin(time));
  
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          //gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x, sin(position.z + (n * time)) + cos(position.y * time), cos(position.z + (n * time)), 1.0);// Flat Bird
        }
      `,

      fragmentShader: `
        uniform float time;
        varying vec2 vUv;
  
        // Simple 2D noise function
        float noise(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }
  
        void main() {
          float value = 0.0;

          // Apply noise based on UV coordinates and time
          float n = noise(vUv * 10.0 + time * 0.1);
  
          // Modify the color with noise
          vec3 color = vec3(vUv.x + sin(n * 0.2), vUv.y + n * 0.2, 1.0); // Adds noise to the x and y UV-based color
  
          gl_FragColor = vec4(color, 1.0);
        }
      `
    };

    return explosiveShader;
  }

  useCyclicPowderShader() {
    const powderShader = {
      uniforms: {
        time: { value: 0.0 },
        mousePosition: { value: new THREE.Vector2(0.0, 0.0) },
        hovered: { value: 0.0 },
        explodeIntensity: { value: 0.1 }
      },

      vertexShader: `
        uniform float time;
        uniform float hovered;
        uniform vec2 mousePosition;
        uniform float explodeIntensity;
        varying vec2 vUv;

        float noise(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }

        void main() {
          vUv = uv;
          vec3 pos = position;
  
          // Calculate distance to mouse position
          float dist = distance(mousePosition, vec2(pos.x, pos.y));
          float effect = hovered * smoothstep(0.2, 0.0, dist) * noise(pos.xy * 10.0 + time);
  
          // Apply explode effect
          pos += normal * effect * explodeIntensity;
  
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,

      fragmentShader: `
        uniform float time;
        varying vec2 vUv;
  
        // Cyclic noise function with smooth oscillations
        float cyclicNoise(vec2 p) {
          float angle = sin(p.x * 5.0 + time * 0.5) + cos(p.y * 5.0 + time * 0.5);
          return fract(sin(dot(p + angle, vec2(12.9898, 78.233))) * 43758.5453);
        }
  
        void main() {
          // Apply cyclic noise based on UV coordinates and time
          float n = cyclicNoise(vUv * 10.0);
  
          // Create a color pattern with oscillating noise
          vec3 color = vec3(0.5 + 0.5 * sin(n + time), 0.5 + 0.5 * cos(n + time), 1.0);
  
          gl_FragColor = vec4(color, 1.0);
        }
      `
    };

    return powderShader;
  }

  // Noise Plane
  useSawShader() {
    const sawShader = {
      uniforms: {
        time: { value: this.time },
        resolution: { value: new THREE.Vector2(this.width, this.height) },
        shapeFactor: { value: this.shapeFactor }, // Control for trapezoidal shape
        u_frequency: { value: this.u_frequency },           // Current frequency value from the audio analysis
        u_freqBands: { value: new THREE.Vector3(0.0, 0.0, 0.0) }, // Frequency bands (bass, mid, treble)
        u_ampFactor: { value: 1.0 },           // Amplitude factor to scale frequency effects
        u_perlinScale: { value: new THREE.Vector2(50.0, 20000.0) }, // Frequency scale for Perlin noise (50Hz to 20,000Hz)
        u_resolution: { value: new THREE.Vector2(this.width, this.height) }, // Resolution (screen size)
        shapeFactor: { value: this.shapeFactor },
        mousePosition: { value: new THREE.Vector2(0.0, 0.0) },
        hovered: { value: 0.0 },
        explodeIntensity: { value: this.explodeIntensity },
        backgroundTexture: { value: this.cubeTexture },
        side: { value: this.side }, // Retain the side parameter
        flatShading: { value: this.flatShading }, // Retain flat shading
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
        uniform float shapeFactor;
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

          float burst = noise(x + shapeFactor, z);
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
    const darkNoiseShader = {
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
    return darkNoiseShader;
  };

  useWrinkledShader() {
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
        uniform float shapeFactor;
        varying vec2 vUv;
  
        // Noise function based on hash
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }
  
        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }
  
        // Signed distance function for a circle
        float sdfCircle(vec2 p, float radius) {
          return length(p) - radius;
        }
  
        // Function to create a smooth gradient with noise and SDFs
        void main() {
          vec2 uv = vUv * shapeFactor * 3.0; // Scale UV for finer details
          vec2 p = uv - 0.5; // Center the UV coordinates
  
          // Animate noise with time and add it to coordinates
          float n = noise(uv * 10.0 + time * 0.1);
          float sdf = sdfCircle(p, 0.3 + 0.1 * sin(time)); // Dynamic radius
  
          // Mix colors based on noise and SDF results
          vec3 color1 = vec3(0.1, 0.4, 0.7);
          vec3 color2 = vec3(1.0, 0.6, 0.2);
          vec3 color3 = vec3(0.8, 0.2, 0.4);
          
          vec3 color = mix(color1, color2, smoothstep(0.0, 0.5, sdf));
          color = mix(color, color3, n);
  
          gl_FragColor = vec4(color, 1.0);
        }
      `
    };
  }

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
  // createSawShader() {
  //   return {
  //     uniforms: {
  //       time: { value: this.time },
  //       resolution: { value: new THREE.Vector2(this.width, this.height) },
  //       shapeFactor: { value: this.shapeFactor },
  //       u_red: { value: 1.0 },
  //       u_green: { value: 1.0 },
  //       u_blue: { value: 1.0 },
  //       u_frequency: { value: this.u_frequency },           // Current frequency value from the audio analysis
  //       u_freqBands: { value: new THREE.Vector3(0.0, 0.0, 0.0) }, // Frequency bands (bass, mid, treble)
  //       u_ampFactor: { value: 1.0 },           // Amplitude factor to scale frequency effects
  //       u_perlinScale: { value: new THREE.Vector2(50.0, 20000.0) }, // Frequency scale for Perlin noise (50Hz to 20,000Hz)
  //       mousePosition: { value: new THREE.Vector2(0.0, 0.0) },
  //       hovered: { value: 0.0 },
  //       explodeIntensity: { value: this.explodeIntensity },
  //       backgroundTexture: { value: this.cubeTexture },
  //       side: { value: this.side }, // Retain the side parameter
  //       flatShading: { value: this.flatShading }, // Retain flat shading
  //       color: { value: new THREE.Color() }
  //     },
  //     vertexShader: `
  //       varying vec2 vUv;
  //       uniform float time;
  //       uniform float hovered;
  //       uniform vec2 mousePosition;
  //       uniform float explodeIntensity;
  //       uniform float u_frequency;
  //       uniform float shapeFactor;

  //       float trapezoid(float x, float height, float width) {
  //           float slope = height / (width * 0.5);
  //           return smoothstep(0.0, slope, height - abs(x));
  //       }
  
  //       float noise(vec2 p) {
  //         return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  //       }

  //       void main() {
  //         vUv = uv;
  //         vec3 pos = position;

  //         // Apply noise based on UV coordinates and time
  //         float n = noise(vUv * 10.0 + time * 0.1 + u_frequency);
  
  //         // Calculate distance to mouse position
  //         float dist = distance(mousePosition, vec2(pos.x, pos.y));
  //         // float effect = hovered * smoothstep(0.2, 0.0, dist) * noise(pos.xy * 10.0 + sin(time));
  //         float effect = hovered * smoothstep(0.2, (0.0 + sin(shapeFactor) + time), dist) * noise(pos.xy * 10.0 + sin(time + shapeFactor));
  
  //         // Apply explode effect
  //         pos += normal * effect * (explodeIntensity + time);
  
  //         gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  //         //gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x, sin(position.z + (n * time)) + cos(position.y * time), cos(position.z + (n * time)), 1.0);// Flat Bird
  //         //gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  //       }
  //     `,
  //     fragmentShader: `
  //       uniform float time;
  //       uniform float shapeFactor; // Now we can adjust this dynamically
  //       varying vec2 vUv;

  //       float noise(float x, float z) {
  //         return fract(sin(dot(vec2(x, z) + time, vec2(12.9898, 78.233))) * 43758.5453);
  //       }

  //       float S(float t) {
  //         return smoothstep(0.0, 1.0, t);
  //       }
  
  //       // Simple 2D noise function
  //       float noise(vec2 p) {
  //         return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  //       }

  //       void main() {
  //         vec2 uv = vUv * 10.0 * shapeFactor; // Scale UV based on shapeFactor
  //         float x = uv.x;
  //         float z = uv.y;

  //         // Apply noise based on UV coordinates and time
  //         float n = noise(vUv * 10.0 + time * 0.1);
  
  //         float burst = noise(x, z);
  //         float value = 0.2;

  //         for (int i = -1; i <= 1; i++) {
  //           for (int j = -1; j <= 1; j++) {
  //             float aij = 0.0;
  //             float bij = 1.0;
  //             float cij = 0.51;
  //             float dij = 0.33;

  //             value += aij + (bij - aij) * S(x - float(i)) + (aij - bij - cij + dij) * S(x - float(i)) * S(z - float(j));
  //           }
  //         }

  //         //vec3 color = vec3((0.65 + (vUv.x + sin(n * 0.2))), (0.85 + (vUv.y + n * 0.2)), 1.0); // Blue color

  //         // Modify the color with noise
  //         vec3 color = vec3(vUv.x + sin(n * 0.2) + burst, (vUv.y + n * 0.2 + value), (1.0 + burst + value)); // Adds noise to the x and y UV-based color
  
  //         gl_FragColor = vec4(color, 1.0);
        
  //         vec3 noiseColor = vec3(burst, value, burst + value);
  //         gl_FragColor = vec4(color, 1.0);
  //       }
  //     `
  //   };
  // }

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
    const sawMaterial = new THREE.ShaderMaterial(this.sawShader);
    const icoMaterial = new THREE.ShaderMaterial(this.icoShader)
    const noiseMaterial = new THREE.ShaderMaterial(this.noiseShader);
    const northStarMaterial = new THREE.ShaderMaterial(this.northStar);
    const starryMaterial = new THREE.ShaderMaterial(this.starryShader);
    const boidsMaterial = new THREE.ShaderMaterial(this.boidShaders);
    const boidsRender = new THREE.ShaderMaterial(this.boidRenderShader);
    const axialSawMaterial = new THREE.ShaderMaterial(this.axialSawShader);
    const darkNoiseMaterial = new THREE.ShaderMaterial(this.darkNoiseShader);
    const convolutionMaterial = new THREE.ShaderMaterial(this.convolutionShader);
    const wrinkledMaterial = new THREE.ShaderMaterial(this.wrinkledShader);
    const explosiveMaterial = new THREE.ShaderMaterial(this.explosiveShader);
    const powderMaterial = new THREE.ShaderMaterial(this.powderShader);
    const musicMaterial = new THREE.ShaderMaterial(this.musicShader);
    const frequencyMaterial = new THREE.ShaderMaterial(this.frequencyShader)

    return {
      sawMaterial,
      icoMaterial,
      noiseMaterial,
      darkNoiseMaterial,
      axialSawMaterial,
      convolutionMaterial,
      boidsRender,
      boidsMaterial,
      northStarMaterial,
      starryMaterial,
      wrinkledMaterial,
      explosiveMaterial,
      powderMaterial,
      musicMaterial,
      frequencyMaterial
    };
  }

  shaderConfigs() {
    return {
      sawShader: this.sawShader,
      noiseShader: this.noiseShader,
      northStar: this.northStar,
      starryShader: this.starryShader,
      boidShaders: this.boidShaders,
      boidRenderShader: this.boidRenderShader,
      axialSawShader: this.axialSawShader,
      darkNoiseShader: this.darkNoiseShader,
      convolutionShader: this.convolutionShader,
      wrinkledShader: this.wrinkledShader,
      explosiveShader: this.explosiveShader,
      powderShader: this.powderShader,
      musicShader: this.musicShader,
      frequencyShader: this.frequencyShader,
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
    // console.log(`Random click event: Boid Speed: ${randomSpeed}, Color Shift: ${randomColor}`);
  }

  addMouseHover(renderer = null) {
    window.addEventListener('mousemove', (event) => {
      if (renderer !== null) {
        const rect = renderer.domElement.getBoundingClientRect();
        this.mousePosition.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mousePosition.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      }
    });
  }

  handleHoverEffect() {
    // Update the shader with the current mouse position and toggle the effect
    this.explosiveShader.uniforms.mousePosition.value = this.mousePosition;
    this.explosiveShader.uniforms.hovered.value = 1.0;
  }

  updateVisualizr() {
    // Update the time value for animation in the shader
    this.frequencyShader.uniforms.u_time.value = this.clock.getElapsedTime();

    // Get the average frequency for the shader (already used)
    const averageFrequency = this.analyser.getAverageFrequency();
    this.frequencyShader.uniforms.u_frequency.value = averageFrequency;

    // Update frequency bands (bass, mid, treble) for more granular control
    const frequencyBands = this.analyser.getFrequencyBands(); // This could be an array or object
    const bass = frequencyBands[0];    // Bass frequencies
    const mid = frequencyBands[1];     // Mid frequencies
    const treble = frequencyBands[2];  // Treble frequencies

    // Pass the frequency bands to the shader
    this.frequencyShader.uniforms.u_freqBands.value.set(bass, mid, treble);

    // You can adjust the amplitude factor if needed based on frequency response
    // Example: If the bass is dominant, increase the amplitude factor
    const ampFactor = Math.max(bass, mid, treble); // Just an example, adjust based on your needs
    this.frequencyShader.uniforms.u_ampFactor.value = ampFactor;
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
    this.sawShader.uniforms.time.value = this.time;
    this.axialSawShader.uniforms.time.value = (Math.sin(this.time) * 0.5) + 0.5;
    this.powderShader.uniforms.time.value = (Math.sin(this.time) * 0.5) + 0.5 + Math.cos(0.1 + this.time);
    this.wrinkledShader.uniforms.time.value = (Math.sin(this.time) * 0.5) + 0.5 + Math.cos(0.1 + this.time);
    this.darkNoiseShader.uniforms.time.value = (Math.sin(this.time) * 0.5) + 0.5 + Math.cos(0.1 + this.time);
    this.explosiveShader.uniforms.time.value = (Math.sin(this.time) * 0.5) + 0.5 + Math.cos(0.1 + this.time);
    this.explosiveShader.uniforms.explodeIntensity.value = (Math.sin(this.time) * 0.5) + 0.5 + Math.cos(0.1 + this.time);
    this.noiseShader.uniforms.time.value = (Math.cos(this.time) * 0.5) + 0.5;
    this.starryShader.uniforms.time.value = Math.sin(this.time) + 0.1;
    this.starryShader.uniforms.explodeIntensity.value = Math.sin(this.time) + Math.cos(0.1 + this.time);
    this.handleHoverEffect();
  }

  // dispose() {
  //   if (this.northStar) this.northStar.dispose();
  //   if (this.sawShader) this.sawShader.dispose();
  //   if (this.boidRender) this.boidRender.dispose();
  //   if (this.axialSawShader) this.axialSawShader.dispose();
  //   if (this.boidShaders) this.boidShaders.dispose();
  //   if (this.noiseShader) this.noiseShader.dispose();
  //   if (this.darkNoiseShader) this.darkNoiseShader.dispose();
  //   if (this.starryBackground) this.starryBackground.dispose();
  //   if (this.convolutionShader) this.convolutionShader.dispose();
  //   // Additional cleanups if you have any textures, geometries, or materials

  //   // Remove event listeners if added
  //   window.removeEventListener('mousemove', this.handleMouseMove);
  // }
}
export default Shaders