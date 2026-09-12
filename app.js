import * as THREE from "three";

import {
  OrbitControls
} from "three/addons/controls/OrbitControls.js";

import {
  PLYLoader
} from "three/addons/loaders/PLYLoader.js";

import {
  STLLoader
} from "three/addons/loaders/STLLoader.js";

import {
  OBJLoader
} from "three/addons/loaders/OBJLoader.js";


/* =====================================================
   DOM
===================================================== */

const $ = (id) => document.getElementById(id);

const viewer = $("viewer");

const materialFrictionInput = $("materialFriction");
const materialFrictionNumber = $("materialFrictionNumber");

const startVelocityInput = $("startVelocity");
const startVelocityNumber = $("startVelocityNumber");

const terrainResolutionInput = $("terrainResolution");
const terrainResolutionNumber = $("terrainResolutionNumber");

const modelScaleInput = $("modelScale");
const modelScaleNumber = $("modelScaleNumber");

const verticalScaleInput = $("verticalExaggeration");
const verticalScaleNumber = $("verticalExaggerationNumber");

const depthScaleInput = $("depthScale");
const depthScaleNumber = $("depthScaleNumber");

const sourceVolumeInput = $("sourceVolume");
const sourceVolumeNumber = $("sourceVolumeNumber");

const sourceFootprintInput = $("sourceFootprint");
const sourceFootprintNumber = $("sourceFootprintNumber");

const debrisDensityInput = $("debrisDensity");
const debrisDensityNumber = $("debrisDensityNumber");

const particleSizeInput = $("particleSize");
const particleSizeNumber = $("particleSizeNumber");

const particleVisualizationInput =
  $("particleVisualization");

const rotationXInput = $("rotationX");
const rotationXNumber = $("rotationXNumber");

const rotationYInput = $("rotationY");
const rotationYNumber = $("rotationYNumber");

const rotationZInput = $("rotationZ");
const rotationZNumber = $("rotationZNumber");

const playButton = $("playButton");
const resetButton = $("resetButton");
const addButton = $("addButton");
const terrainButton = $("terrainButton");
const resetOrientationButton =
  $("resetOrientationButton");

const statusElement = $("status");
const particleCountStatus =
  $("particleCountStatus");

const dropZone = $("dropZone");
const modelFileInput = $("modelFileInput");
const chooseModelButton =
  $("chooseModelButton");

function setStatus(text) {
  if (statusElement) {
    statusElement.textContent = text;
  }
}


/* =====================================================
   SCENE
===================================================== */

const scene = new THREE.Scene();

scene.background =
  new THREE.Color(0x000000);

const camera =
  new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000000
  );

camera.position.set(
  14,
  11,
  15
);

const renderer =
  new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance"
  });

renderer.setPixelRatio(
  Math.min(
    window.devicePixelRatio,
    2
  )
);

renderer.setSize(
  window.innerWidth,
  window.innerHeight
);

renderer.outputColorSpace =
  THREE.SRGBColorSpace;

viewer.appendChild(
  renderer.domElement
);


/* =====================================================
   CAMERA CONTROLS
===================================================== */

const controls =
  new OrbitControls(
    camera,
    renderer.domElement
  );

controls.target.set(
  0,
  0,
  0
);

controls.enableRotate = true;
controls.enablePan = true;
controls.enableZoom = true;
controls.enableDamping = true;

controls.dampingFactor = 0.08;
controls.screenSpacePanning = true;

controls.rotateSpeed = 0.7;
controls.panSpeed = 0.8;
controls.zoomSpeed = 0.9;

controls.minDistance = 0.5;
controls.maxDistance = 10000000;

controls.minPolarAngle = 0.05;
controls.maxPolarAngle =
  Math.PI * 0.49;

controls.mouseButtons = {
  LEFT: THREE.MOUSE.ROTATE,
  MIDDLE: THREE.MOUSE.PAN,
  RIGHT: THREE.MOUSE.PAN
};

controls.touches = {
  ONE: THREE.TOUCH.ROTATE,
  TWO: THREE.TOUCH.DOLLY_PAN
};


/* =====================================================
   LIGHTING
===================================================== */

scene.add(
  new THREE.HemisphereLight(
    0xffffff,
    0x222222,
    1.5
  )
);

const directionalLight =
  new THREE.DirectionalLight(
    0xffffff,
    2
  );

directionalLight.position.set(
  8,
  16,
  10
);

scene.add(
  directionalLight
);


/* =====================================================
   PARAMETERS
===================================================== */

const params = {
  materialFriction: 0.35,
  startVelocity: 1,

  terrainResolution: 256,

  modelScale: 1,
  verticalExaggeration: 1,
  depthScale: 1,

  sourceVolume: 8,
  sourceFootprint: 2,
  debrisDensity: 1,

  particleVisualization: "points",
  particleSize: 1,

  launchDuration: 2.5,
  minimumMovementSpeed: 0.12,

  running: false
};

const TERRAIN_SIZE = 18;
const MAX_RENDERED_PARTICLES = 60000;

let terrainSeed =
  Math.random() * 100000;

let terrainMesh = null;
let terrainWire = null;

let customTerrain = null;
let rawModelPoints = null;
let currentFileName = "";

const modelRotation = {
  x: 0,
  y: 0,
  z: 0
};

const sourceLocation =
  new THREE.Vector3(
    -TERRAIN_SIZE * 0.3,
    0,
    -TERRAIN_SIZE * 0.35
  );

let sourceMarker = null;
let sourceVolumeMesh = null;


/* =====================================================
   GENERAL HELPERS
===================================================== */

function clamp(
  value,
  min,
  max
) {
  return Math.max(
    min,
    Math.min(max, value)
  );
}

function formatNumber(value) {
  return Number(value)
    .toLocaleString("en-US");
}

function disposeObject(object) {
  if (!object) return;

  if (object.parent) {
    object.parent.remove(object);
  }

  object.traverse((child) => {
    if (child.geometry) {
      child.geometry.dispose();
    }

    if (child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach(
          (material) => {
            material.dispose();
          }
        );
      } else {
        child.material.dispose();
      }
    }
  });
}

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* =====================================================
   TERRAIN DIMENSIONS
===================================================== */

function getTerrainWidth() {
  const baseWidth = customTerrain
    ? customTerrain.width
    : TERRAIN_SIZE;

  return baseWidth *
    params.modelScale;
}

function getTerrainDepth() {
  const baseDepth = customTerrain
    ? customTerrain.depth
    : TERRAIN_SIZE;

  return baseDepth *
    params.modelScale *
    params.depthScale;
}


/* =====================================================
   PROCEDURAL TERRAIN
===================================================== */

function fract(value) {
  return value -
    Math.floor(value);
}

function smoothStep(value) {
  return value *
    value *
    (3 - 2 * value);
}

function hash2D(x, z) {
  const value =
    Math.sin(
      x * 127.1 +
      z * 311.7 +
      terrainSeed * 0.123
    ) *
    43758.5453123;

  return fract(value);
}

function valueNoise(x, z) {
  const x0 =
    Math.floor(x);

  const z0 =
    Math.floor(z);

  const x1 =
    x0 + 1;

  const z1 =
    z0 + 1;

  const tx =
    smoothStep(x - x0);

  const tz =
    smoothStep(z - z0);

  const a =
    hash2D(x0, z0);

  const b =
    hash2D(x1, z0);

  const c =
    hash2D(x0, z1);

  const d =
    hash2D(x1, z1);

  const top =
    THREE.MathUtils.lerp(
      a,
      b,
      tx
    );

  const bottom =
    THREE.MathUtils.lerp(
      c,
      d,
      tx
    );

  return THREE.MathUtils.lerp(
    top,
    bottom,
    tz
  );
}

function fractalNoise(
  x,
  z,
  octaves = 5
) {
  let frequency = 1;
  let amplitude = 0.5;

  let total = 0;
  let weight = 0;

  for (
    let i = 0;
    i < octaves;
    i++
  ) {
    total +=
      valueNoise(
        x * frequency,
        z * frequency
      ) *
      amplitude;

    weight += amplitude;

    frequency *= 2;
    amplitude *= 0.5;
  }

  return total / weight;
}

function proceduralTerrainHeight(
  x,
  z
) {
  const normalizedX =
    x / TERRAIN_SIZE +
    0.5;

  const normalizedZ =
    z / TERRAIN_SIZE +
    0.5;

  /*
    Domain warping makes the terrain
    less repetitive than stacked sine waves.
  */
  const warpX =
    (
      fractalNoise(
        normalizedX * 1.7 + 17,
        normalizedZ * 1.7 + 4,
        3
      ) -
      0.5
    ) *
    0.28;

  const warpZ =
    (
      fractalNoise(
        normalizedX * 1.7 + 31,
        normalizedZ * 1.7 + 11,
        3
      ) -
      0.5
    ) *
    0.28;

  const warpedX =
    normalizedX +
    warpX;

  const warpedZ =
    normalizedZ +
    warpZ;

  const broad =
    fractalNoise(
      warpedX * 2.2 + 3,
      warpedZ * 2.2 + 8,
      5
    );

  const medium =
    fractalNoise(
      warpedX * 5.5 + 21,
      warpedZ * 5.5 + 14,
      4
    );

  const detail =
    fractalNoise(
      warpedX * 13 + 42,
      warpedZ * 13 + 18,
      3
    );

  const basin =
    -Math.exp(
      -Math.pow(
        (normalizedX - 0.34) * 3.3,
        2
      ) -
      Math.pow(
        (normalizedZ - 0.57) * 2.5,
        2
      )
    ) *
    0.22;

  const ridge =
    Math.exp(
      -Math.pow(
        (normalizedX - 0.72) * 3.1,
        2
      ) -
      Math.pow(
        (normalizedZ - 0.33) * 2.8,
        2
      )
    ) *
    0.18;

  const combined =
    (broad - 0.5) * 0.95 +
    (medium - 0.5) * 0.16 +
    (detail - 0.5) * 0.035 +
    basin +
    ridge;

  /*
    Reduced amplitude produces
    gentler slopes by default.
  */
  return combined * 0.48;
}


/* =====================================================
   TERRAIN HEIGHT SAMPLING
===================================================== */

function sampleCustomTerrain(x, z) {
  const width =
    getTerrainWidth();

  const depth =
    getTerrainDepth();

  const normalizedX =
    clamp(
      x / width + 0.5,
      0,
      1
    );

  const normalizedZ =
    clamp(
      z / depth + 0.5,
      0,
      1
    );

  const resolution =
    customTerrain.resolution;

  const gridX =
    normalizedX *
    (resolution - 1);

  const gridZ =
    normalizedZ *
    (resolution - 1);

  const x0 =
    Math.floor(gridX);

  const z0 =
    Math.floor(gridZ);

  const x1 =
    Math.min(
      resolution - 1,
      x0 + 1
    );

  const z1 =
    Math.min(
      resolution - 1,
      z0 + 1
    );

  const tx =
    gridX - x0;

  const tz =
    gridZ - z0;

  const values =
    customTerrain.values;

  const a =
    values[
      z0 * resolution + x0
    ];

  const b =
    values[
      z0 * resolution + x1
    ];

  const c =
    values[
      z1 * resolution + x0
    ];

  const d =
    values[
      z1 * resolution + x1
    ];

  const top =
    THREE.MathUtils.lerp(
      a,
      b,
      tx
    );

  const bottom =
    THREE.MathUtils.lerp(
      c,
      d,
      tx
    );

  const normalizedHeight =
    THREE.MathUtils.lerp(
      top,
      bottom,
      tz
    );

  return normalizedHeight *
    customTerrain.height *
    params.modelScale *
    params.verticalExaggeration;
}

function terrainHeight(x, z) {
  if (!customTerrain) {
    const modelScale =
      Math.max(
        0.0001,
        params.modelScale
      );

    const depthScale =
      Math.max(
        0.0001,
        params.depthScale
      );

    const baseX =
      x / modelScale;

    const baseZ =
      z /
      modelScale /
      depthScale;

    return proceduralTerrainHeight(
      baseX,
      baseZ
    ) *
      modelScale *
      params.verticalExaggeration;
  }

  return sampleCustomTerrain(
    x,
    z
  );
}


/* =====================================================
   TERRAIN CREATION
===================================================== */

function createTerrain() {
  disposeObject(terrainMesh);
  disposeObject(terrainWire);

  terrainMesh = null;
  terrainWire = null;

  const resolution =
    clamp(
      Math.round(
        params.terrainResolution
      ),
      32,
      768
    );

  const geometry =
    new THREE.PlaneGeometry(
      getTerrainWidth(),
      getTerrainDepth(),
      resolution,
      resolution
    );

  const positions =
    geometry.attributes.position;

  for (
    let i = 0;
    i < positions.count;
    i++
  ) {
    const x =
      positions.getX(i);

    const z =
      -positions.getY(i);

    positions.setXYZ(
      i,
      x,
      terrainHeight(x, z),
      z
    );
  }

  positions.needsUpdate = true;

  geometry.computeVertexNormals();

  terrainMesh =
    new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.94,
        metalness: 0,
        side: THREE.DoubleSide
      })
    );

  scene.add(
    terrainMesh
  );

  /*
    Skip wireframe at very high resolutions
    to reduce memory and rendering cost.
  */
  if (resolution <= 512) {
    const wireGeometry =
      new THREE.WireframeGeometry(
        geometry
      );

    terrainWire =
      new THREE.LineSegments(
        wireGeometry,
        new THREE.LineBasicMaterial({
          color: 0x777777,
          transparent: true,
          opacity: 0.08
        })
      );

    scene.add(
      terrainWire
    );
  }

  updateSourceVisual();
}


/* =====================================================
   SOURCE VOLUME
===================================================== */

function getEffectiveSourceFootprint() {
  const terrainWidth =
    getTerrainWidth();

  const terrainDepth =
    getTerrainDepth();

  return Math.max(
    0.1,
    Math.min(
      params.sourceFootprint,
      terrainWidth * 0.9,
      terrainDepth * 0.9
    )
  );
}

function getSourcePileHeight() {
  const footprint =
    getEffectiveSourceFootprint();

  const area =
    footprint * footprint;

  return params.sourceVolume /
    area;
}

function createSourceVisuals() {
  disposeObject(sourceMarker);
  disposeObject(sourceVolumeMesh);

  sourceMarker =
    new THREE.Mesh(
      new THREE.RingGeometry(
        0.8,
        1,
        32
      ),
      new THREE.MeshBasicMaterial({
        color: 0x9bd7d0,
        transparent: true,
        opacity: 0.95,
        side: THREE.DoubleSide,
        depthTest: false
      })
    );

  sourceMarker.rotation.x =
    -Math.PI / 2;

  sourceMarker.renderOrder = 20;

  scene.add(
    sourceMarker
  );

  sourceVolumeMesh =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        1,
        1,
        1
      ),
      new THREE.MeshStandardMaterial({
        color: 0x54b8b3,
        emissive: 0x082323,
        roughness: 0.9,
        metalness: 0,
        transparent: true,
        opacity: 0.22,
        depthWrite: false
      })
    );

  sourceVolumeMesh.renderOrder = 10;

  scene.add(
    sourceVolumeMesh
  );

  updateSourceVisual();
}

function updateSourceVisual() {
  if (!terrainMesh) return;

  const footprint =
    getEffectiveSourceFootprint();

  const halfFootprint =
    footprint * 0.5;

  const terrainWidth =
    getTerrainWidth();

  const terrainDepth =
    getTerrainDepth();

  sourceLocation.x =
    clamp(
      sourceLocation.x,
      -terrainWidth * 0.5 +
        halfFootprint,
      terrainWidth * 0.5 -
        halfFootprint
    );

  sourceLocation.z =
    clamp(
      sourceLocation.z,
      -terrainDepth * 0.5 +
        halfFootprint,
      terrainDepth * 0.5 -
        halfFootprint
    );

  const surfaceY =
    terrainHeight(
      sourceLocation.x,
      sourceLocation.z
    );

  sourceLocation.y =
    surfaceY + 0.035;

  if (sourceMarker) {
    sourceMarker.position.copy(
      sourceLocation
    );

    /*
      The ring diameter represents
      the release footprint.
    */
    sourceMarker.scale.setScalar(
      Math.max(
        0.25,
        footprint * 0.5
      )
    );
  }

  if (sourceVolumeMesh) {
    const pileHeight =
      getSourcePileHeight();

    sourceVolumeMesh.position.set(
      sourceLocation.x,
      surfaceY +
        pileHeight * 0.5,
      sourceLocation.z
    );

    sourceVolumeMesh.scale.set(
      footprint,
      pileHeight,
      footprint
    );
  }
}


/* =====================================================
   PARTICLES
===================================================== */

let particles = [];

let particleGeometry = null;
let particleMaterial = null;
let particlePoints = null;
let particleMesh = null;

let particleCount = 0;
let parcelVolume = 0;
let parcelRadius = 0;

const particleDummy =
  new THREE.Object3D();

function getRequestedParticleCount() {
  return Math.max(
    1,
    Math.round(
      params.sourceVolume *
      params.debrisDensity
    )
  );
}

function getParticleCount() {
  return Math.min(
    MAX_RENDERED_PARTICLES,
    getRequestedParticleCount()
  );
}

function updateParticleCount() {
  if (!particleCountStatus) {
    return;
  }

  const requested =
    getRequestedParticleCount();

  const rendered =
    getParticleCount();

  const suffix =
    rendered < requested
      ? " · CAPPED"
      : "";

  particleCountStatus.textContent =
    `${formatNumber(rendered)} PARCELS${suffix}`;
}

function getProjectionScale() {
  const drawingBufferSize =
    new THREE.Vector2();

  renderer.getDrawingBufferSize(
    drawingBufferSize
  );

  return drawingBufferSize.y /
    (
      2 *
      Math.tan(
        THREE.MathUtils.degToRad(
          camera.fov * 0.5
        )
      )
    );
}

function createRandomParticle() {
  const particle = {
    x: 0,
    y: 0,
    z: 0,

    vx: 0,
    vy: 0,
    vz: 0,

    radius: parcelRadius,

    age: 0,
    launchAge: 0,
    deposited: false
  };

  placeParticleAtSource(
    particle
  );

  return particle;
}

function placeParticleAtSource(particle) {
  const footprint =
    getEffectiveSourceFootprint();

  const halfFootprint =
    footprint * 0.5;

  const x =
    sourceLocation.x +
    (
      Math.random() * 2 - 1
    ) *
    halfFootprint;

  const z =
    sourceLocation.z +
    (
      Math.random() * 2 - 1
    ) *
    halfFootprint;

  const baseHeight =
    terrainHeight(
      x,
      z
    );

  const pileHeight =
    getSourcePileHeight();

  const velocity =
    getDownhillVelocity(
      x,
      z
    );

  particle.x = x;
  particle.z = z;

  particle.y =
    baseHeight +
    Math.random() * pileHeight +
    parcelRadius;

  particle.vx =
    velocity.vx;

  particle.vy = 0;

  particle.vz =
    velocity.vz;

  particle.radius =
    parcelRadius;

  particle.age = 0;
  particle.launchAge = 0;
  particle.deposited = false;
}

function resetParticle(particle) {
  placeParticleAtSource(
    particle
  );
}

function createPointParticles() {
  const positions =
    new Float32Array(
      particleCount * 3
    );

  const radii =
    new Float32Array(
      particleCount
    );

  for (
    let i = 0;
    i < particleCount;
    i++
  ) {
    const particle =
      particles[i];

    positions[i * 3] =
      particle.x;

    positions[i * 3 + 1] =
      particle.y;

    positions[i * 3 + 2] =
      particle.z;

    radii[i] =
      particle.radius;
  }

  particleGeometry =
    new THREE.BufferGeometry();

  particleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(
      positions,
      3
    )
  );

  particleGeometry.setAttribute(
    "parcelRadius",
    new THREE.BufferAttribute(
      radii,
      1
    )
  );

  particleMaterial =
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,

      uniforms: {
        pointColor: {
          value:
            new THREE.Color(
              0x9bd7d0
            )
        },

        pointSize: {
          value:
            params.particleSize
        },

        projectionScale: {
          value:
            getProjectionScale()
        }
      },

      vertexShader: `
        uniform float pointSize;
        uniform float projectionScale;

        attribute float parcelRadius;

        void main() {
          vec4 modelPosition =
            modelViewMatrix *
            vec4(position, 1.0);

          gl_Position =
            projectionMatrix *
            modelPosition;

          float diameter =
            parcelRadius *
            2.0 *
            pointSize;

          gl_PointSize =
            max(
              1.0,
              diameter *
              projectionScale /
              max(1.0, -modelPosition.z)
            );
        }
      `,

      fragmentShader: `
        uniform vec3 pointColor;

        void main() {
          vec2 coordinate =
            gl_PointCoord -
            vec2(0.5);

          float distanceFromCenter =
            length(coordinate);

          if (distanceFromCenter > 0.5) {
            discard;
          }

          float alpha =
            1.0 -
            smoothstep(
              0.38,
              0.5,
              distanceFromCenter
            );

          gl_FragColor =
            vec4(
              pointColor,
              alpha
            );
        }
      `
    });

  particlePoints =
    new THREE.Points(
      particleGeometry,
      particleMaterial
    );

  particlePoints.frustumCulled =
    false;

  scene.add(
    particlePoints
  );
}

function createMeshSoup() {
  const geometry =
    new THREE.SphereGeometry(
      1,
      8,
      6
    );

  const material =
    new THREE.MeshStandardMaterial({
      color: 0x9bd7d0,
      roughness: 0.86,
      metalness: 0
    });

  particleMesh =
    new THREE.InstancedMesh(
      geometry,
      material,
      particleCount
    );

  particleMesh.instanceMatrix.setUsage(
    THREE.DynamicDrawUsage
  );

  particleMesh.frustumCulled =
    false;

  scene.add(
    particleMesh
  );
}

function syncParticleRenderData() {
  if (particlePoints) {
    const positions =
      particleGeometry
        .attributes
        .position
        .array;

    for (
      let i = 0;
      i < particleCount;
      i++
    ) {
      const particle =
        particles[i];

      positions[i * 3] =
        particle.x;

      positions[i * 3 + 1] =
        particle.y;

      positions[i * 3 + 2] =
        particle.z;
    }

    particleGeometry
      .attributes
      .position
      .needsUpdate = true;
  }

  if (particleMesh) {
    for (
      let i = 0;
      i < particleCount;
      i++
    ) {
      const particle =
        particles[i];

      particleDummy.position.set(
        particle.x,
        particle.y,
        particle.z
      );

      particleDummy.scale.setScalar(
        particle.radius
      );

      particleDummy.rotation.set(
        0,
        0,
        0
      );

      particleDummy.updateMatrix();

      particleMesh.setMatrixAt(
        i,
        particleDummy.matrix
      );
    }

    particleMesh.instanceMatrix.needsUpdate =
      true;
  }
}

function createParticles() {
  disposeObject(
    particlePoints
  );

  disposeObject(
    particleMesh
  );

  particlePoints = null;
  particleMesh = null;

  particleGeometry = null;
  particleMaterial = null;

  particleCount =
    getParticleCount();

  /*
    Each parcel represents a fixed
    portion of the selected source volume.
  */
  parcelVolume =
    params.sourceVolume /
    particleCount;

  /*
    Radius of a sphere with parcelVolume.
    The radius remains constant during movement.
  */
  parcelRadius =
    Math.cbrt(
      parcelVolume *
      3 /
      (4 * Math.PI)
    );

  particles = [];

  for (
    let i = 0;
    i < particleCount;
    i++
  ) {
    particles.push(
      createRandomParticle()
    );
  }

  if (
    params.particleVisualization ===
    "spheres"
  ) {
    createMeshSoup();
  } else {
    createPointParticles();
  }

  syncParticleRenderData();
  updateParticleCount();
}

function updatePointMaterial() {
  if (
    particleMaterial &&
    particleMaterial.uniforms
  ) {
    particleMaterial.uniforms
      .pointSize
      .value =
      params.particleSize;

    particleMaterial.uniforms
      .projectionScale
      .value =
      getProjectionScale();
  }
}


/* =====================================================
   SIMULATION
===================================================== */

function terrainGradient(x, z) {
  const distance =
    Math.max(
      0.08,
      Math.min(
        getTerrainWidth(),
        getTerrainDepth()
      ) /
      Math.max(
        64,
        params.terrainResolution
      )
    );

  const left =
    terrainHeight(
      x - distance,
      z
    );

  const right =
    terrainHeight(
      x + distance,
      z
    );

  const back =
    terrainHeight(
      x,
      z - distance
    );

  const front =
    terrainHeight(
      x,
      z + distance
    );

  return {
    dx:
      (right - left) /
      (2 * distance),

    dz:
      (front - back) /
      (2 * distance)
  };
}

function getDownhillVelocity(x, z) {
  const gradient =
    terrainGradient(
      x,
      z
    );

  let downhillX =
    -gradient.dx;

  let downhillZ =
    -gradient.dz;

  const length =
    Math.hypot(
      downhillX,
      downhillZ
    );

  if (length < 0.0001) {
    downhillX = 0.7;
    downhillZ = 0.7;
  } else {
    downhillX /=
      length;

    downhillZ /=
      length;
  }

  return {
    vx:
      downhillX *
      params.startVelocity,

    vz:
      downhillZ *
      params.startVelocity
  };
}

function updateSimulation(deltaTime) {
  if (!particles.length) {
    return;
  }

  const downhillForce = 2;

  const frictionFactor =
    Math.max(
      0,
      1 -
      params.materialFriction *
      2 *
      deltaTime
    );

  const settlingThreshold =
    0.035 +
    params.materialFriction *
    0.18;

  const terrainWidth =
    getTerrainWidth();

  const terrainDepth =
    getTerrainDepth();

  for (
    let i = 0;
    i < particles.length;
    i++
  ) {
    const particle =
      particles[i];

    particle.age +=
      deltaTime;

    particle.launchAge +=
      deltaTime;

    const gradient =
      terrainGradient(
        particle.x,
        particle.z
      );

    particle.vx +=
      -gradient.dx *
      downhillForce *
      deltaTime;

    particle.vz +=
      -gradient.dz *
      downhillForce *
      deltaTime;

    particle.vx *=
      frictionFactor;

    particle.vz *=
      frictionFactor;

    let speed =
      Math.hypot(
        particle.vx,
        particle.vz
      );

    if (
      particle.launchAge <
      params.launchDuration &&
      params.startVelocity > 0 &&
      speed <
      Math.max(
        params.startVelocity,
        params.minimumMovementSpeed
      )
    ) {
      const launchVelocity =
        getDownhillVelocity(
          particle.x,
          particle.z
        );

      const launchLength =
        Math.hypot(
          launchVelocity.vx,
          launchVelocity.vz
        );

      if (launchLength > 0) {
        const targetSpeed =
          Math.max(
            params.startVelocity,
            params.minimumMovementSpeed
          );

        particle.vx =
          launchVelocity.vx /
          launchLength *
          targetSpeed;

        particle.vz =
          launchVelocity.vz /
          launchLength *
          targetSpeed;
      }
    }

    particle.x +=
      particle.vx *
      deltaTime;

    particle.z +=
      particle.vz *
      deltaTime;

    speed =
      Math.hypot(
        particle.vx,
        particle.vz
      );

    if (
      particle.launchAge >=
      params.launchDuration &&
      speed < settlingThreshold
    ) {
      const settlingFactor =
        Math.max(
          0,
          1 -
          params.materialFriction *
          1.5 *
          deltaTime
        );

      particle.vx *=
        settlingFactor;

      particle.vz *=
        settlingFactor;

      particle.deposited = true;
    } else {
      particle.deposited = false;
    }

    /*
      The parcel radius never changes.
      Only its position changes.
    */
    particle.y =
      terrainHeight(
        particle.x,
        particle.z
      ) +
      particle.radius;

    const outside =
      particle.x <
      -terrainWidth * 0.58 ||

      particle.x >
      terrainWidth * 0.58 ||

      particle.z <
      -terrainDepth * 0.58 ||

      particle.z >
      terrainDepth * 0.58;

    if (
      outside ||
      particle.age > 45
    ) {
      resetParticle(
        particle
      );
    }
  }

  syncParticleRenderData();
}


/* =====================================================
   MODEL IMPORT
===================================================== */

function getFileExtension(name) {
  return name
    .split(".")
    .pop()
    .toLowerCase();
}

function getPointsFromGeometry(
  geometry,
  matrix = new THREE.Matrix4()
) {
  const points = [];

  if (
    !geometry ||
    !geometry.attributes ||
    !geometry.attributes.position
  ) {
    return points;
  }

  const attribute =
    geometry.attributes.position;

  const point =
    new THREE.Vector3();

  for (
    let i = 0;
    i < attribute.count;
    i++
  ) {
    point.fromBufferAttribute(
      attribute,
      i
    );

    point.applyMatrix4(
      matrix
    );

    if (
      Number.isFinite(point.x) &&
      Number.isFinite(point.y) &&
      Number.isFinite(point.z)
    ) {
      points.push({
        x: point.x,
        y: point.y,
        z: point.z
      });
    }
  }

  return points;
}

function getPointsFromObject(object) {
  const points = [];

  object.updateMatrixWorld(
    true
  );

  object.traverse((child) => {
    if (
      child.isMesh &&
      child.geometry
    ) {
      points.push(
        ...getPointsFromGeometry(
          child.geometry,
          child.matrixWorld
        )
      );
    }
  });

  return points;
}

function transformModelPoints(points) {
  const bounds =
    new THREE.Box3();

  for (const point of points) {
    bounds.expandByPoint(
      new THREE.Vector3(
        point.x,
        point.y,
        point.z
      )
    );
  }

  const center =
    new THREE.Vector3();

  bounds.getCenter(
    center
  );

  const rotation =
    new THREE.Euler(
      THREE.MathUtils.degToRad(
        modelRotation.x
      ),
      THREE.MathUtils.degToRad(
        modelRotation.y
      ),
      THREE.MathUtils.degToRad(
        modelRotation.z
      ),
      "XYZ"
    );

  const vector =
    new THREE.Vector3();

  const transformed = [];

  for (const point of points) {
    vector.set(
      point.x - center.x,
      point.y - center.y,
      point.z - center.z
    );

    vector.applyEuler(
      rotation
    );

    transformed.push({
      x: vector.x,
      y: vector.y,
      z: vector.z
    });
  }

  return transformed;
}

function fillRasterHoles(
  values,
  hasValue,
  resolution
) {
  const queue =
    new Int32Array(
      values.length
    );

  let head = 0;
  let tail = 0;

  for (
    let i = 0;
    i < hasValue.length;
    i++
  ) {
    if (hasValue[i]) {
      queue[tail++] = i;
    }
  }

  const directions = [
    [-1, -1],
    [0, -1],
    [1, -1],
    [-1, 0],
    [1, 0],
    [-1, 1],
    [0, 1],
    [1, 1]
  ];

  /*
    Efficient multi-source propagation
    for filling empty raster cells.
  */
  while (head < tail) {
    const index =
      queue[head++];

    const z =
      Math.floor(
        index / resolution
      );

    const x =
      index -
      z * resolution;

    for (const [dx, dz] of directions) {
      const nx =
        x + dx;

      const nz =
        z + dz;

      if (
        nx < 0 ||
        nx >= resolution ||
        nz < 0 ||
        nz >= resolution
      ) {
        continue;
      }

      const neighbour =
        nz * resolution +
        nx;

      if (hasValue[neighbour]) {
        continue;
      }

      values[neighbour] =
        values[index];

      hasValue[neighbour] = 1;

      queue[tail++] =
        neighbour;
    }
  }
}

function createTerrainFromPoints(points) {
  if (
    !points ||
    points.length < 3
  ) {
    setStatus(
      "MODEL HAS NO GEOMETRY"
    );

    return;
  }

  const transformedPoints =
    transformModelPoints(
      points
    );

  const bounds =
    new THREE.Box3();

  for (const point of transformedPoints) {
    bounds.expandByPoint(
      new THREE.Vector3(
        point.x,
        point.y,
        point.z
      )
    );
  }

  const width =
    bounds.max.x -
    bounds.min.x;

  const depth =
    bounds.max.z -
    bounds.min.z;

  const height =
    bounds.max.y -
    bounds.min.y;

  if (
    !Number.isFinite(width) ||
    !Number.isFinite(depth) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    depth <= 0 ||
    height <= 0
  ) {
    setStatus(
      "INVALID MODEL ORIENTATION"
    );

    return;
  }

  const resolution =
    clamp(
      Math.round(
        params.terrainResolution
      ),
      64,
      768
    );

  const values =
    new Float32Array(
      resolution *
      resolution
    );

  const hasValue =
    new Uint8Array(
      resolution *
      resolution
    );

  for (const point of transformedPoints) {
    /*
      X and Z are normalized independently.
      This prevents depth distortion.
    */
    const normalizedX =
      (
        point.x -
        bounds.min.x
      ) /
      width;

    const normalizedZ =
      (
        point.z -
        bounds.min.z
      ) /
      depth;

    const normalizedY =
      (
        point.y -
        bounds.min.y
      ) /
      height;

    if (
      normalizedX < 0 ||
      normalizedX > 1 ||
      normalizedZ < 0 ||
      normalizedZ > 1
    ) {
      continue;
    }

    const gridX =
      clamp(
        Math.floor(
          normalizedX *
          (resolution - 1)
        ),
        0,
        resolution - 1
      );

    const gridZ =
      clamp(
        Math.floor(
          normalizedZ *
          (resolution - 1)
        ),
        0,
        resolution - 1
      );

    const index =
      gridZ *
      resolution +
      gridX;

    if (
      !hasValue[index] ||
      normalizedY > values[index]
    ) {
      values[index] =
        normalizedY;

      hasValue[index] = 1;
    }
  }

  fillRasterHoles(
    values,
    hasValue,
    resolution
  );

  customTerrain = {
    resolution,
    values,
    width,
    depth,
    height,
    sourcePoints: points
  };

  rawModelPoints =
    points;

  createTerrain();
  updateSourceVisual();
  createParticles();

  params.running = false;
  playButton.textContent = "PLAY";

  dropZone.classList.add(
    "loaded"
  );

  dropZone.innerHTML =
    `3D TERRAIN LOADED<span>${escapeHTML(
      currentFileName
    )}</span>`;

  frameCurrentTerrain();

  setStatus(
    `CUSTOM TERRAIN · ${formatNumber(
      points.length
    )} POINTS`
  );
}

function frameCurrentTerrain() {
  if (!terrainMesh) return;

  const box =
    new THREE.Box3()
      .setFromObject(
        terrainMesh
      );

  const center =
    new THREE.Vector3();

  const size =
    new THREE.Vector3();

  box.getCenter(
    center
  );

  box.getSize(
    size
  );

  const maxSize =
    Math.max(
      size.x,
      size.y,
      size.z
    );

  const distance =
    maxSize /
    Math.tan(
      THREE.MathUtils.degToRad(
        camera.fov * 0.5
      )
    ) *
    1.15;

  camera.position.set(
    center.x +
      distance * 0.85,

    center.y +
      distance * 0.65,

    center.z +
      distance * 0.85
  );

  controls.target.copy(
    center
  );

  controls.update();
}

function load3DTerrain(file) {
  if (!file) return;

  const extension =
    getFileExtension(
      file.name
    );

  if (
    ![
      "ply",
      "stl",
      "obj"
    ].includes(extension)
  ) {
    setStatus(
      "USE PLY, STL OR OBJ"
    );

    return;
  }

  currentFileName =
    file.name;

  setStatus(
    "LOADING MODEL..."
  );

  modelRotation.x = 0;
  modelRotation.y = 0;
  modelRotation.z = 0;

  updateRotationUI();

  if (extension === "obj") {
    const url =
      URL.createObjectURL(
        file
      );

    const loader =
      new OBJLoader();

    loader.load(
      url,
      (object) => {
        try {
          const points =
            getPointsFromObject(
              object
            );

          if (!points.length) {
            setStatus(
              "OBJ HAS NO MESH GEOMETRY"
            );
          } else {
            createTerrainFromPoints(
              points
            );
          }
        } catch (error) {
          console.error(error);

          setStatus(
            "OBJ PROCESSING ERROR"
          );
        } finally {
          URL.revokeObjectURL(
            url
          );
        }
      },
      undefined,
      (error) => {
        console.error(error);

        setStatus(
          "OBJ LOAD ERROR"
        );

        URL.revokeObjectURL(
          url
        );
      }
    );

    return;
  }

  const reader =
    new FileReader();

  reader.onload = (event) => {
    let geometry = null;

    try {
      const buffer =
        event.target.result;

      if (extension === "ply") {
        geometry =
          new PLYLoader()
            .parse(buffer);
      } else {
        geometry =
          new STLLoader()
            .parse(buffer);
      }

      const points =
        getPointsFromGeometry(
          geometry
        );

      if (!points.length) {
        setStatus(
          `${extension.toUpperCase()} HAS NO GEOMETRY`
        );

        return;
      }

      createTerrainFromPoints(
        points
      );
    } catch (error) {
      console.error(error);

      setStatus(
        "MODEL PARSE ERROR"
      );
    } finally {
      if (geometry) {
        geometry.dispose();
      }
    }
  };

  reader.onerror = () => {
    setStatus(
      "FILE READ ERROR"
    );
  };

  reader.readAsArrayBuffer(
    file
  );
}


/* =====================================================
   ROTATION
===================================================== */

function snapRotation(value) {
  const number =
    Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return THREE.MathUtils.clamp(
    Math.round(
      number / 45
    ) * 45,
    -180,
    180
  );
}

function updateRotationUI() {
  rotationXInput.value =
    modelRotation.x;

  rotationYInput.value =
    modelRotation.y;

  rotationZInput.value =
    modelRotation.z;

  rotationXNumber.value =
    modelRotation.x;

  rotationYNumber.value =
    modelRotation.y;

  rotationZNumber.value =
    modelRotation.z;
}

function rebuildRotatedTerrain() {
  if (
    !rawModelPoints ||
    !rawModelPoints.length
  ) {
    setStatus(
      "NO MODEL LOADED"
    );

    return;
  }

  createTerrainFromPoints(
    rawModelPoints
  );
}

function applyRotation(
  axis,
  value
) {
  modelRotation[axis] =
    snapRotation(value);

  updateRotationUI();

  if (rawModelPoints?.length) {
    rebuildRotatedTerrain();
  } else {
    setStatus(
      "ROTATION READY"
    );
  }
}


/* =====================================================
   DEBOUNCED REBUILDING
===================================================== */

let particleRebuildTimer = null;
let terrainRebuildTimer = null;
let terrainNeedsRasterization = false;

function scheduleParticleRebuild() {
  clearTimeout(
    particleRebuildTimer
  );

  particleRebuildTimer =
    setTimeout(() => {
      createParticles();
    }, 100);
}

function scheduleTerrainRebuild(
  rasterize = false
) {
  terrainNeedsRasterization =
    terrainNeedsRasterization ||
    rasterize;

  clearTimeout(
    terrainRebuildTimer
  );

  terrainRebuildTimer =
    setTimeout(() => {
      const shouldRasterize =
        terrainNeedsRasterization;

      terrainNeedsRasterization =
        false;

      if (
        shouldRasterize &&
        customTerrain?.sourcePoints
      ) {
        createTerrainFromPoints(
          customTerrain.sourcePoints
        );
      } else {
        createTerrain();
        updateSourceVisual();
        createParticles();
      }
    }, 140);
}


/* =====================================================
   SLIDER BINDING
===================================================== */

function bindNumericSlider(
  slider,
  numberInput,
  callback
) {
  if (
    !slider ||
    !numberInput
  ) {
    return;
  }

  function correctedValue(value) {
    const min =
      Number(slider.min);

    const max =
      Number(slider.max);

    const step =
      Number(slider.step) ||
      1;

    let result =
      Number(value);

    if (!Number.isFinite(result)) {
      result =
        Number(slider.value);
    }

    result =
      clamp(
        result,
        min,
        max
      );

    result =
      Math.round(
        (result - min) /
        step
      ) *
      step +
      min;

    return Number(
      result.toFixed(6)
    );
  }

  function apply(value) {
    const result =
      correctedValue(value);

    slider.value =
      result;

    numberInput.value =
      result;

    callback(result);
  }

  slider.addEventListener(
    "input",
    () => {
      apply(
        slider.value
      );
    }
  );

  numberInput.addEventListener(
    "change",
    () => {
      apply(
        numberInput.value
      );
    }
  );

  apply(
    slider.value
  );
}


/* =====================================================
   SLIDER EVENTS
===================================================== */

bindNumericSlider(
  materialFrictionInput,
  materialFrictionNumber,
  (value) => {
    params.materialFriction =
      value;

    setStatus(
      "MATERIAL FRICTION UPDATED"
    );
  }
);

bindNumericSlider(
  startVelocityInput,
  startVelocityNumber,
  (value) => {
    params.startVelocity =
      value;

    setStatus(
      "START VELOCITY UPDATED"
    );
  }
);

bindNumericSlider(
  terrainResolutionInput,
  terrainResolutionNumber,
  (value) => {
    params.terrainResolution =
      Math.round(value);

    scheduleTerrainRebuild(
      true
    );

    setStatus(
      `RESOLUTION ${params.terrainResolution}`
    );
  }
);

bindNumericSlider(
  modelScaleInput,
  modelScaleNumber,
  (value) => {
    params.modelScale =
      value;

    scheduleTerrainRebuild(
      false
    );

    setStatus(
      `MODEL SCALE ${value}`
    );
  }
);

bindNumericSlider(
  verticalScaleInput,
  verticalScaleNumber,
  (value) => {
    params.verticalExaggeration =
      value;

    scheduleTerrainRebuild(
      false
    );

    setStatus(
      `VERTICAL SCALE ${value}`
    );
  }
);

bindNumericSlider(
  depthScaleInput,
  depthScaleNumber,
  (value) => {
    params.depthScale =
      value;

    scheduleTerrainRebuild(
      false
    );

    setStatus(
      `DEPTH SCALE Z ${value}`
    );
  }
);

bindNumericSlider(
  sourceVolumeInput,
  sourceVolumeNumber,
  (value) => {
    params.sourceVolume =
      value;

    updateSourceVisual();
    scheduleParticleRebuild();

    setStatus(
      `SOURCE ${formatNumber(value)} m³`
    );
  }
);

bindNumericSlider(
  sourceFootprintInput,
  sourceFootprintNumber,
  (value) => {
    params.sourceFootprint =
      value;

    updateSourceVisual();
    scheduleParticleRebuild();

    setStatus(
      `RELEASE AREA ${value}`
    );
  }
);

bindNumericSlider(
  debrisDensityInput,
  debrisDensityNumber,
  (value) => {
    params.debrisDensity =
      value;

    scheduleParticleRebuild();

    setStatus(
      `DEBRIS DENSITY ${value}/m³`
    );
  }
);

bindNumericSlider(
  particleSizeInput,
  particleSizeNumber,
  (value) => {
    params.particleSize =
      value;

    updatePointMaterial();

    setStatus(
      `POINT SCALE ${value}`
    );
  }
);

bindNumericSlider(
  rotationXInput,
  rotationXNumber,
  (value) => {
    applyRotation(
      "x",
      value
    );
  }
);

bindNumericSlider(
  rotationYInput,
  rotationYNumber,
  (value) => {
    applyRotation(
      "y",
      value
    );
  }
);

bindNumericSlider(
  rotationZInput,
  rotationZNumber,
  (value) => {
    applyRotation(
      "z",
      value
    );
  }
);

particleVisualizationInput.addEventListener(
  "change",
  () => {
    params.particleVisualization =
      particleVisualizationInput.value;

    createParticles();

    setStatus(
      params.particleVisualization ===
      "spheres"
        ? "MESH SOUP ENABLED"
        : "POINT SPRITES ENABLED"
    );
  }
);


/* =====================================================
   SOURCE PLACEMENT
===================================================== */

const raycaster =
  new THREE.Raycaster();

const pointer =
  new THREE.Vector2();

renderer.domElement.addEventListener(
  "pointerdown",
  (event) => {
    if (
      event.button !== 0 ||
      !event.shiftKey ||
      !terrainMesh
    ) {
      return;
    }

    const rect =
      renderer.domElement
        .getBoundingClientRect();

    pointer.x =
      (
        (
          event.clientX -
          rect.left
        ) /
        rect.width
      ) *
      2 -
      1;

    pointer.y =
      -(
        (
          event.clientY -
          rect.top
        ) /
        rect.height
      ) *
      2 +
      1;

    raycaster.setFromCamera(
      pointer,
      camera
    );

    const intersections =
      raycaster.intersectObject(
        terrainMesh,
        false
      );

    if (!intersections.length) {
      return;
    }

    sourceLocation.copy(
      intersections[0].point
    );

    updateSourceVisual();
    createParticles();

    params.running = false;
    playButton.textContent =
      "PLAY";

    setStatus(
      "SOURCE PLACED"
    );
  }
);


/* =====================================================
   FILE EVENTS
===================================================== */

dropZone.addEventListener(
  "dragover",
  (event) => {
    event.preventDefault();

    dropZone.classList.add(
      "drag-over"
    );
  }
);

dropZone.addEventListener(
  "dragleave",
  () => {
    dropZone.classList.remove(
      "drag-over"
    );
  }
);

dropZone.addEventListener(
  "drop",
  (event) => {
    event.preventDefault();

    dropZone.classList.remove(
      "drag-over"
    );

    const file =
      event.dataTransfer.files?.[0];

    load3DTerrain(
      file
    );
  }
);

chooseModelButton.addEventListener(
  "click",
  () => {
    modelFileInput.click();
  }
);

modelFileInput.addEventListener(
  "change",
  () => {
    const file =
      modelFileInput.files?.[0];

    load3DTerrain(
      file
    );

    modelFileInput.value =
      "";
  }
);


/* =====================================================
   BUTTONS
===================================================== */

playButton.addEventListener(
  "click",
  () => {
    params.running =
      !params.running;

    playButton.textContent =
      params.running
        ? "PAUSE"
        : "PLAY";

    setStatus(
      params.running
        ? "RUNNING"
        : "PAUSED"
    );
  }
);

resetButton.addEventListener(
  "click",
  () => {
    createParticles();

    params.running = false;
    playButton.textContent =
      "PLAY";

    setStatus(
      "RESET"
    );
  }
);

addButton.addEventListener(
  "click",
  () => {
    const increment =
      Math.max(
        1,
        Math.round(
          params.sourceVolume *
          0.1
        )
      );

    params.sourceVolume =
      Math.min(
        1000000,
        params.sourceVolume +
        increment
      );

    sourceVolumeInput.value =
      params.sourceVolume;

    sourceVolumeNumber.value =
      params.sourceVolume;

    updateSourceVisual();
    createParticles();

    setStatus(
      "MATERIAL ADDED"
    );
  }
);

resetOrientationButton.addEventListener(
  "click",
  () => {
    modelRotation.x = 0;
    modelRotation.y = 0;
    modelRotation.z = 0;

    updateRotationUI();

    if (rawModelPoints?.length) {
      rebuildRotatedTerrain();
    } else {
      setStatus(
        "ORIENTATION RESET"
      );
    }
  }
);

terrainButton.addEventListener(
  "click",
  () => {
    terrainSeed =
      Math.random() *
      100000;

    customTerrain = null;
    rawModelPoints = null;
    currentFileName = "";

    modelRotation.x = 0;
    modelRotation.y = 0;
    modelRotation.z = 0;

    updateRotationUI();

    createTerrain();

    sourceLocation.set(
      -TERRAIN_SIZE * 0.3,
      0,
      -TERRAIN_SIZE * 0.35
    );

    updateSourceVisual();
    createParticles();

    params.running = false;

    playButton.textContent =
      "PLAY";

    dropZone.classList.remove(
      "loaded"
    );

    dropZone.innerHTML =
      "DROP 3D TERRAIN HERE" +
      "<span>PLY / STL / OBJ</span>";

    setStatus(
      "NEW TERRAIN"
    );
  }
);


/* =====================================================
   INITIALIZATION
===================================================== */

params.particleVisualization =
  particleVisualizationInput.value;

updateRotationUI();

createTerrain();
createSourceVisuals();
createParticles();

setStatus(
  "PAUSED"
);


/* =====================================================
   ANIMATION
===================================================== */

const clock =
  new THREE.Clock();

function animate() {
  requestAnimationFrame(
    animate
  );

  const deltaTime =
    Math.min(
      clock.getDelta(),
      0.033
    );

  if (params.running) {
    updateSimulation(
      deltaTime
    );
  }

  controls.update();

  renderer.render(
    scene,
    camera
  );
}

animate();


/* =====================================================
   RESIZE
===================================================== */

function resize() {
  const width =
    viewer.clientWidth ||
    window.innerWidth;

  const height =
    viewer.clientHeight ||
    window.innerHeight;

  camera.aspect =
    width / height;

  camera.updateProjectionMatrix();

  renderer.setSize(
    width,
    height
  );

  updatePointMaterial();
}

window.addEventListener(
  "resize",
  resize
);
