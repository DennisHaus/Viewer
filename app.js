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

/* -------------------------------------------------------
   HTML ELEMENTS
------------------------------------------------------- */

const viewer = document.getElementById("viewer");

const flowInput = document.getElementById("flow");
const slopeInput = document.getElementById("slope");
const frictionInput = document.getElementById("friction");
const materialInput = document.getElementById("material");
const terrainResolutionInput =
  document.getElementById("terrainResolution");
const particleCountInput =
  document.getElementById("particleCount");
const sourceVolumeInput =
  document.getElementById("sourceVolume");

const flowValue = document.getElementById("flowValue");
const slopeValue = document.getElementById("slopeValue");
const frictionValue = document.getElementById("frictionValue");
const materialValue = document.getElementById("materialValue");
const terrainResolutionValue =
  document.getElementById("terrainResolutionValue");
const particleCountValue =
  document.getElementById("particleCountValue");
const sourceVolumeValue =
  document.getElementById("sourceVolumeValue");

const playButton = document.getElementById("playButton");
const resetButton = document.getElementById("resetButton");
const addButton = document.getElementById("addButton");
const terrainButton = document.getElementById("terrainButton");

const statusElement = document.getElementById("status");
const particleCountStatus =
  document.getElementById("particleCountStatus");
const dropZone = document.getElementById("dropZone");

/* -------------------------------------------------------
   SCENE
------------------------------------------------------- */

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0c1b1d);

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.set(14, 11, 15);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance"
});

renderer.setPixelRatio(
  Math.min(window.devicePixelRatio, 2)
);

renderer.setSize(
  window.innerWidth,
  window.innerHeight
);

renderer.outputColorSpace = THREE.SRGBColorSpace;
viewer.appendChild(renderer.domElement);

/* -------------------------------------------------------
   ORBIT / PAN / ZOOM
------------------------------------------------------- */

const controls = new OrbitControls(
  camera,
  renderer.domElement
);

controls.target.set(0, 0, 0);
controls.enableRotate = true;
controls.enablePan = true;
controls.enableZoom = true;
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.screenSpacePanning = true;
controls.rotateSpeed = 0.7;
controls.panSpeed = 0.8;
controls.zoomSpeed = 0.9;
controls.minDistance = 4;
controls.maxDistance = 40;
controls.minPolarAngle = 0.05;
controls.maxPolarAngle = Math.PI * 0.49;

controls.mouseButtons = {
  LEFT: THREE.MOUSE.ROTATE,
  MIDDLE: THREE.MOUSE.PAN,
  RIGHT: THREE.MOUSE.PAN
};

controls.touches = {
  ONE: THREE.TOUCH.ROTATE,
  TWO: THREE.TOUCH.DOLLY_PAN
};

/* -------------------------------------------------------
   LIGHTING
------------------------------------------------------- */

scene.add(
  new THREE.AmbientLight(0xffffff, 1.4)
);

const directionalLight =
  new THREE.DirectionalLight(0xb8ffff, 2.0);

directionalLight.position.set(8, 15, 10);
scene.add(directionalLight);

/* -------------------------------------------------------
   PARAMETERS
------------------------------------------------------- */

const params = {
  flow: 0.50,
  slope: 0.50,
  friction: 0.35,
  material: 0.60,
  terrainResolution: 128,
  particleCount: 3500,
  sourceVolume: 8,
  running: false
};

/* -------------------------------------------------------
   TERRAIN VARIABLES
------------------------------------------------------- */

const TERRAIN_SIZE = 18;

let terrainSeed = Math.random() * 1000;
let terrainMesh = null;
let terrainWire = null;
let customTerrain = null;

/* -------------------------------------------------------
   SOURCE VARIABLES
------------------------------------------------------- */

let sourceLocation = new THREE.Vector3(
  -5.3,
  0,
  -6.3
);

let sourceMarker = null;

/* -------------------------------------------------------
   TERRAIN FUNCTIONS
------------------------------------------------------- */

function terrainNoise(x, z) {
  return (
    Math.sin(x * 0.55 + terrainSeed) * 0.35 +
    Math.sin(z * 0.70 + terrainSeed * 0.7) * 0.25 +
    Math.sin((x + z) * 0.33 + terrainSeed * 0.4) * 0.20
  );
}

function proceduralTerrainHeight(x, z) {
  const nx = x / TERRAIN_SIZE;
  const nz = z / TERRAIN_SIZE;

  const broadForm = terrainNoise(x, z);

  const valley =
    -Math.exp(
      -Math.pow((nx + 0.15) * 4.0, 2) -
      Math.pow((nz - 0.05) * 2.2, 2)
    ) * 1.2;

  const ridge =
    Math.exp(
      -Math.pow((nx - 0.35) * 3.0, 2) -
      Math.pow((nz + 0.2) * 2.4, 2)
    ) * 1.1;

  const globalSlope =
    -z * 0.12 * (0.5 + params.slope);

  return broadForm + valley + ridge + globalSlope;
}

function terrainHeight(x, z) {
  if (customTerrain !== null) {
    const nx = THREE.MathUtils.clamp(
      (x + TERRAIN_SIZE / 2) / TERRAIN_SIZE,
      0,
      1
    );

    const nz = THREE.MathUtils.clamp(
      (z + TERRAIN_SIZE / 2) / TERRAIN_SIZE,
      0,
      1
    );

    const resolution = customTerrain.resolution;

    const gridX = Math.floor(
      nx * (resolution - 1)
    );

    const gridZ = Math.floor(
      nz * (resolution - 1)
    );

    const index = gridZ * resolution + gridX;
    const value = customTerrain.values[index] ?? 0;

    return (value - 0.5) *
      customTerrain.heightScale;
  }

  return proceduralTerrainHeight(x, z);
}

function createTerrain() {
  if (terrainMesh !== null) {
    scene.remove(terrainMesh);
    terrainMesh.geometry.dispose();
    terrainMesh.material.dispose();
    terrainMesh = null;
  }

  if (terrainWire !== null) {
    scene.remove(terrainWire);
    terrainWire.geometry.dispose();
    terrainWire.material.dispose();
    terrainWire = null;
  }

  const resolution = params.terrainResolution;

  const geometry = new THREE.PlaneGeometry(
    TERRAIN_SIZE,
    TERRAIN_SIZE,
    resolution,
    resolution
  );

  const positions = geometry.attributes.position;

  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const z = -positions.getY(i);
    const y = terrainHeight(x, z);

    positions.setXYZ(i, x, y, z);
  }

  positions.needsUpdate = true;
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    color: 0x174f56,
    roughness: 0.88,
    metalness: 0.04,
    side: THREE.DoubleSide
  });

  terrainMesh = new THREE.Mesh(
    geometry,
    material
  );

  scene.add(terrainMesh);

  const wireGeometry = geometry.clone();

  const wireMaterial = new THREE.MeshBasicMaterial({
    color: 0x55a9aa,
    wireframe: true,
    transparent: true,
    opacity: 0.16
  });

  terrainWire = new THREE.Mesh(
    wireGeometry,
    wireMaterial
  );

  scene.add(terrainWire);
}

/* -------------------------------------------------------
   SOURCE MARKER
------------------------------------------------------- */

function createSourceMarker() {
  if (sourceMarker !== null) {
    scene.remove(sourceMarker);
    sourceMarker.geometry.dispose();
    sourceMarker.material.dispose();
  }

  const geometry = new THREE.RingGeometry(
    0.32,
    0.42,
    32
  );

  const material = new THREE.MeshBasicMaterial({
    color: 0x9bd7d0,
    transparent: true,
    opacity: 0.95,
    side: THREE.DoubleSide,
    depthTest: false
  });

  sourceMarker = new THREE.Mesh(
    geometry,
    material
  );

  sourceMarker.rotation.x = -Math.PI / 2;
  sourceMarker.renderOrder = 20;

  scene.add(sourceMarker);
  updateSourceMarker();
}

function updateSourceMarker() {
  if (sourceMarker === null) return;

  sourceLocation.y =
    terrainHeight(
      sourceLocation.x,
      sourceLocation.z
    ) + 0.035;

  sourceMarker.position.copy(sourceLocation);

  const scale = Math.max(
    0.65,
    Math.cbrt(params.sourceVolume)
  );

  sourceMarker.scale.set(
    scale,
    scale,
    scale
  );
}

/* -------------------------------------------------------
   PARTICLES
------------------------------------------------------- */

let particles = [];
let particleGeometry = null;
let particleMaterial = null;
let particlePoints = null;

function createRandomParticle() {
  const sourceSize = Math.cbrt(
    params.sourceVolume
  );

  const halfSize = sourceSize / 2;

  const x = sourceLocation.x +
    (Math.random() * 2 - 1) * halfSize;

  const z = sourceLocation.z +
    (Math.random() * 2 - 1) * halfSize;

  const y = terrainHeight(x, z) +
    Math.random() * sourceSize +
    0.12;

  return {
    x,
    y,
    z,
    vx: 0,
    vy: 0,
    vz: 0,
    age: Math.random() * 4,
    deposited: false
  };
}

function createParticles() {
  if (particlePoints !== null) {
    scene.remove(particlePoints);
    particleGeometry.dispose();
    particleMaterial.dispose();
    particlePoints = null;
  }

  particles = [];

  const count = params.particleCount;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const particle = createRandomParticle();

    particles.push(particle);

    positions[i * 3] = particle.x;
    positions[i * 3 + 1] = particle.y;
    positions[i * 3 + 2] = particle.z;
  }

  particleGeometry = new THREE.BufferGeometry();

  particleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(
      positions,
      3
    )
  );

  particleMaterial = new THREE.PointsMaterial({
    color: 0x9bd7d0,
    size: 0.075,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.92,
    depthWrite: false
  });

  particlePoints = new THREE.Points(
    particleGeometry,
    particleMaterial
  );

  scene.add(particlePoints);
  updateParticleCount();
}

function resetParticle(particle) {
  const replacement = createRandomParticle();

  particle.x = replacement.x;
  particle.y = replacement.y;
  particle.z = replacement.z;
  particle.vx = 0;
  particle.vy = 0;
  particle.vz = 0;
  particle.age = 0;
  particle.deposited = false;
}

function addSediment() {
  const amount = Math.min(
    500,
    particles.length
  );

  for (let i = 0; i < amount; i++) {
    const index = Math.floor(
      Math.random() * particles.length
    );

    resetParticle(particles[index]);
  }
}

/* -------------------------------------------------------
   SIMULATION
------------------------------------------------------- */

function terrainGradient(x, z) {
  const d = 0.08;

  return {
    dx: (
      terrainHeight(x + d, z) -
      terrainHeight(x - d, z)
    ) / (2 * d),

    dz: (
      terrainHeight(x, z + d) -
      terrainHeight(x, z - d)
    ) / (2 * d)
  };
}

function updateSimulation(deltaTime) {
  if (particleGeometry === null) return;

  const positions =
    particleGeometry.attributes.position.array;

  const gravity = 2.2;
  const flowStrength = params.flow * 2.5;
  const friction = 0.75 + params.friction * 5.0;
  const depositionSpeed =
    0.22 + (1.0 - params.material) * 0.3;

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];

    p.age += deltaTime;

    const gradient = terrainGradient(
      p.x,
      p.z
    );

    p.vx += (
      -gradient.dx * gravity +
      0.25 * flowStrength
    ) * deltaTime;

    p.vz += (
      -gradient.dz * gravity +
      0.85 * flowStrength
    ) * deltaTime;

    const damping = Math.max(
      0,
      1.0 - friction * deltaTime
    );

    p.vx *= damping;
    p.vz *= damping;

    p.x += p.vx * deltaTime;
    p.z += p.vz * deltaTime;

    const speed = Math.sqrt(
      p.vx * p.vx +
      p.vz * p.vz
    );

    if (speed < depositionSpeed) {
      p.vx *= 0.94;
      p.vz *= 0.94;
      p.deposited = true;
    } else {
      p.deposited = false;
    }

    p.y = terrainHeight(p.x, p.z) + 0.08;

    const outside =
      p.x < -TERRAIN_SIZE * 0.58 ||
      p.x > TERRAIN_SIZE * 0.58 ||
      p.z < -TERRAIN_SIZE * 0.58 ||
      p.z > TERRAIN_SIZE * 0.58;

    if (outside || p.age > 45) {
      resetParticle(p);
    }

    positions[i * 3] = p.x;
    positions[i * 3 + 1] = p.y;
    positions[i * 3 + 2] = p.z;
  }

  particleGeometry.attributes.position.needsUpdate = true;
}

/* -------------------------------------------------------
   MODEL IMPORT
------------------------------------------------------- */

function getFileExtension(name) {
  return name.split(".").pop().toLowerCase();
}

function pointsFromGeometry(
  geometry,
  matrix = new THREE.Matrix4()
) {
  const points = [];

  if (
    !geometry ||
    !geometry.attributes.position
  ) {
    return points;
  }

  const attribute =
    geometry.attributes.position;

  const point = new THREE.Vector3();

  for (let i = 0; i < attribute.count; i++) {
    point.fromBufferAttribute(
      attribute,
      i
    );

    point.applyMatrix4(matrix);

    points.push({
      x: point.x,
      y: point.y,
      z: point.z
    });
  }

  return points;
}

function pointsFromObject(object) {
  const points = [];

  object.updateMatrixWorld(true);

  object.traverse((child) => {
    if (child.isMesh && child.geometry) {
      points.push(
        ...pointsFromGeometry(
          child.geometry,
          child.matrixWorld
        )
      );
    }
  });

  return points;
}

function createTerrainFromPoints(points) {
  if (!points || points.length === 0) {
    setStatus("MODEL HAS NO GEOMETRY");
    return;
  }

  const bounds = new THREE.Box3();

  for (const p of points) {
    bounds.expandByPoint(
      new THREE.Vector3(p.x, p.y, p.z)
    );
  }

  const min = bounds.min;
  const max = bounds.max;

  const width = max.x - min.x;
  const depth = max.z - min.z;
  const height = max.y - min.y;

  if (width === 0 || depth === 0 || height === 0) {
    setStatus("INVALID MODEL ORIENTATION");
    return;
  }

  const resolution = params.terrainResolution;

  const values = new Float32Array(
    resolution * resolution
  );

  const hasValue = new Uint8Array(
    resolution * resolution
  );

  for (const p of points) {
    const nx = (p.x - min.x) / width;
    const nz = (p.z - min.z) / depth;
    const ny = (p.y - min.y) / height;

    const x = THREE.MathUtils.clamp(
      Math.floor(nx * (resolution - 1)),
      0,
      resolution - 1
    );

    const z = THREE.MathUtils.clamp(
      Math.floor(nz * (resolution - 1)),
      0,
      resolution - 1
    );

    const index = z * resolution + x;

    if (
      hasValue[index] === 0 ||
      ny > values[index]
    ) {
      values[index] = ny;
      hasValue[index] = 1;
    }
  }

  /*
    Fill empty raster cells from neighbors.
  */
  for (let pass = 0; pass < 16; pass++) {
    const previous = values.slice();
    const previousMask = hasValue.slice();

    for (let z = 0; z < resolution; z++) {
      for (let x = 0; x < resolution; x++) {
        const index = z * resolution + x;

        if (previousMask[index]) continue;

        let sum = 0;
        let count = 0;

        for (let dz = -1; dz <= 1; dz++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx;
            const nz = z + dz;

            if (
              nx < 0 ||
              nx >= resolution ||
              nz < 0 ||
              nz >= resolution
            ) {
              continue;
            }

            const neighbor =
              nz * resolution + nx;

            if (previousMask[neighbor]) {
              sum += previous[neighbor];
              count++;
            }
          }
        }

        if (count > 0) {
          values[index] = sum / count;
          hasValue[index] = 1;
        }
      }
    }
  }

  customTerrain = {
    resolution,
    values,
    heightScale: 4.0,
    sourcePoints: points
  };

  createTerrain();
  createParticles();
  updateSourceMarker();

  params.running = false;
  playButton.textContent = "PLAY";

  dropZone.classList.add("loaded");
  dropZone.innerHTML =
    `3D TERRAIN LOADED<span>${currentFileName}</span>`;

  setStatus("CUSTOM TERRAIN");
}

let currentFileName = "";

function load3DTerrain(file) {
  if (!file) return;

  const extension =
    getFileExtension(file.name);

  if (
    extension !== "ply" &&
    extension !== "stl" &&
    extension !== "obj"
  ) {
    setStatus("USE PLY, STL OR OBJ");
    return;
  }

  currentFileName = file.name;

  if (extension === "obj") {
    const url = URL.createObjectURL(file);
    const loader = new OBJLoader();

    loader.load(
      url,
      (object) => {
        createTerrainFromPoints(
          pointsFromObject(object)
        );

        URL.revokeObjectURL(url);
      },
      undefined,
      () => {
        setStatus("OBJ LOAD ERROR");
        URL.revokeObjectURL(url);
      }
    );

    return;
  }

  const reader = new FileReader();

  reader.onload = (event) => {
    try {
      let geometry = null;

      if (extension === "ply") {
        geometry = new PLYLoader().parse(
          event.target.result
        );
      }

      if (extension === "stl") {
        geometry = new STLLoader().parse(
          event.target.result
        );
      }

      const points =
        pointsFromGeometry(geometry);

      createTerrainFromPoints(points);

      geometry.dispose();
    } catch (error) {
      console.error(error);
      setStatus("MODEL PARSE ERROR");
    }
  };

  reader.onerror = () => {
    setStatus("FILE READ ERROR");
  };

  reader.readAsArrayBuffer(file);
}

/* -------------------------------------------------------
   SOURCE PLACEMENT
------------------------------------------------------- */

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

renderer.domElement.addEventListener(
  "pointerdown",
  (event) => {
    if (
      event.button !== 0 ||
      !event.shiftKey ||
      terrainMesh === null
    ) {
      return;
    }

    const rect =
      renderer.domElement.getBoundingClientRect();

    pointer.x =
      ((event.clientX - rect.left) / rect.width) *
      2 - 1;

    pointer.y =
      -((event.clientY - rect.top) / rect.height) *
      2 + 1;

    raycaster.setFromCamera(
      pointer,
      camera
    );

    const hits =
      raycaster.intersectObject(
        terrainMesh,
        false
      );

    if (hits.length === 0) return;

    sourceLocation.copy(hits[0].point);

    updateSourceMarker();
    createParticles();

    params.running = false;
    playButton.textContent = "PLAY";
    setStatus("SOURCE PLACED");
  }
);

/* -------------------------------------------------------
   DRAG AND DROP
------------------------------------------------------- */

dropZone.addEventListener(
  "dragover",
  (event) => {
    event.preventDefault();
    dropZone.classList.add("drag-over");
  }
);

dropZone.addEventListener(
  "dragleave",
  () => {
    dropZone.classList.remove("drag-over");
  }
);

dropZone.addEventListener(
  "drop",
  (event) => {
    event.preventDefault();
    dropZone.classList.remove("drag-over");

    load3DTerrain(
      event.dataTransfer.files[0]
    );
  }
);

/* -------------------------------------------------------
   UI FUNCTIONS
------------------------------------------------------- */

function setStatus(text) {
  statusElement.textContent = text;
}

function updateParticleCount() {
  particleCountValue.textContent =
    params.particleCount;

  particleCountStatus.textContent =
    `${params.particleCount} PARTICLES`;
}

flowInput.addEventListener("input", () => {
  params.flow = Number(flowInput.value);
  flowValue.textContent = params.flow.toFixed(2);
});

slopeInput.addEventListener("input", () => {
  params.slope = Number(slopeInput.value);
  slopeValue.textContent = params.slope.toFixed(2);

  if (customTerrain === null) {
    createTerrain();
    updateSourceMarker();
  }
});

frictionInput.addEventListener("input", () => {
  params.friction = Number(frictionInput.value);
  frictionValue.textContent =
    params.friction.toFixed(2);
});

materialInput.addEventListener("input", () => {
  params.material = Number(materialInput.value);
  materialValue.textContent =
    params.material.toFixed(2);
});

sourceVolumeInput.addEventListener("input", () => {
  params.sourceVolume =
    Number(sourceVolumeInput.value);

  sourceVolumeValue.textContent =
    params.sourceVolume;

  updateSourceMarker();
  createParticles();

  setStatus(
    `SOURCE ${params.sourceVolume} m³`
  );
});

particleCountInput.addEventListener(
  "input",
  () => {
    params.particleCount =
      Number(particleCountInput.value);

    updateParticleCount();
    createParticles();

    setStatus(
      `${params.particleCount} PARTICLES`
    );
  }
);

function updateTerrainResolution() {
  params.terrainResolution =
    Number(terrainResolutionInput.value);

  terrainResolutionValue.textContent =
    params.terrainResolution;

  if (
    customTerrain !== null &&
    customTerrain.sourcePoints
  ) {
    createTerrainFromPoints(
      customTerrain.sourcePoints
    );
  } else {
    createTerrain();
    createParticles();
    updateSourceMarker();
  }

  setStatus(
    `RESOLUTION ${params.terrainResolution}`
  );
}

terrainResolutionInput.addEventListener(
  "input",
  () => {
    terrainResolutionValue.textContent =
      terrainResolutionInput.value;
  }
);

terrainResolutionInput.addEventListener(
  "change",
  updateTerrainResolution
);

playButton.addEventListener("click", () => {
  params.running = !params.running;

  playButton.textContent =
    params.running ? "PAUSE" : "PLAY";

  setStatus(
    params.running ? "RUNNING" : "PAUSED"
  );
});

resetButton.addEventListener("click", () => {
  createParticles();
  params.running = false;
  playButton.textContent = "PLAY";
  setStatus("RESET");
});

addButton.addEventListener("click", () => {
  addSediment();
  setStatus("SEDIMENT ADDED");
});

terrainButton.addEventListener("click", () => {
  terrainSeed = Math.random() * 1000;
  customTerrain = null;

  createTerrain();

  sourceLocation.set(
    -5.3,
    terrainHeight(-5.3, -6.3),
    -6.3
  );

  updateSourceMarker();
  createParticles();

  params.running = false;
  playButton.textContent = "PLAY";

  dropZone.classList.remove("loaded");
  dropZone.innerHTML =
    "DROP 3D TERRAIN HERE<span>PLY / STL / OBJ</span>";

  setStatus("NEW TERRAIN");
});

/* -------------------------------------------------------
   INITIALIZATION
------------------------------------------------------- */

createTerrain();
createSourceMarker();
createParticles();
updateParticleCount();

setStatus("PAUSED");

/* -------------------------------------------------------
   ANIMATION
------------------------------------------------------- */

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const deltaTime = Math.min(
    clock.getDelta(),
    0.033
  );

  if (params.running) {
    updateSimulation(deltaTime);
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();

/* -------------------------------------------------------
   RESIZE
------------------------------------------------------- */

window.addEventListener("resize", () => {
  camera.aspect =
    window.innerWidth / window.innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );
});
