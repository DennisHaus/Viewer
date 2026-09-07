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

const flowInput =
  document.getElementById("flow");

const slopeInput =
  document.getElementById("slope");

const frictionInput =
  document.getElementById("friction");

const materialInput =
  document.getElementById("material");

const terrainResolutionInput =
  document.getElementById("terrainResolution");

const particleCountInput =
  document.getElementById("particleCount");

const flowValue =
  document.getElementById("flowValue");

const slopeValue =
  document.getElementById("slopeValue");

const frictionValue =
  document.getElementById("frictionValue");

const materialValue =
  document.getElementById("materialValue");

const terrainResolutionValue =
  document.getElementById("terrainResolutionValue");

const particleCountValue =
  document.getElementById("particleCountValue");

const playButton =
  document.getElementById("playButton");

const resetButton =
  document.getElementById("resetButton");

const addButton =
  document.getElementById("addButton");

const terrainButton =
  document.getElementById("terrainButton");

const statusElement =
  document.getElementById("status");

const particleCountStatus =
  document.getElementById("particleCountStatus");

const dropZone =
  document.getElementById("dropZone");

/* -------------------------------------------------------
   SCENE
------------------------------------------------------- */

const scene = new THREE.Scene();

scene.background = new THREE.Color(
  0x0c1b1d
);

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.set(14, 11, 15);

const renderer =
  new THREE.WebGLRenderer({
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

renderer.outputColorSpace =
  THREE.SRGBColorSpace;

viewer.appendChild(renderer.domElement);

const controls =
  new OrbitControls(
    camera,
    renderer.domElement
  );

controls.target.set(0, 0, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 4;
controls.maxDistance = 40;

/* -------------------------------------------------------
   LIGHTING
------------------------------------------------------- */

const ambientLight =
  new THREE.AmbientLight(
    0xffffff,
    1.4
  );

scene.add(ambientLight);

const directionalLight =
  new THREE.DirectionalLight(
    0xb8ffff,
    2.0
  );

directionalLight.position.set(
  8,
  15,
  10
);

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
  running: false
};

/* -------------------------------------------------------
   TERRAIN
------------------------------------------------------- */

const TERRAIN_SIZE = 18;

let terrainSeed =
  Math.random() * 1000;

let terrainMesh = null;
let terrainWire = null;

let customTerrain = null;

function terrainNoise(x, z) {
  return (
    Math.sin(
      x * 0.55 + terrainSeed
    ) * 0.35 +

    Math.sin(
      z * 0.70 + terrainSeed * 0.7
    ) * 0.25 +

    Math.sin(
      (x + z) * 0.33 +
      terrainSeed * 0.4
    ) * 0.20
  );
}

function proceduralTerrainHeight(x, z) {
  const normalizedX =
    x / TERRAIN_SIZE;

  const normalizedZ =
    z / TERRAIN_SIZE;

  const broadForm =
    terrainNoise(x, z);

  const valley =
    -Math.exp(
      -Math.pow(
        (normalizedX + 0.15) * 4.0,
        2
      ) -
      Math.pow(
        (normalizedZ - 0.05) * 2.2,
        2
      )
    ) * 1.2;

  const ridge =
    Math.exp(
      -Math.pow(
        (normalizedX - 0.35) * 3.0,
        2
      ) -
      Math.pow(
        (normalizedZ + 0.2) * 2.4,
        2
      )
    ) * 1.1;

  const globalSlope =
    -z * 0.12 *
    (0.5 + params.slope);

  return (
    broadForm +
    valley +
    ridge +
    globalSlope
  );
}

function terrainHeight(x, z) {
  if (customTerrain !== null) {
    const normalizedX =
      THREE.MathUtils.clamp(
        (x + TERRAIN_SIZE / 2) /
        TERRAIN_SIZE,
        0,
        1
      );

    const normalizedZ =
      THREE.MathUtils.clamp(
        (z + TERRAIN_SIZE / 2) /
        TERRAIN_SIZE,
        0,
        1
      );

    const resolution =
      customTerrain.resolution;

    const gridX =
      Math.floor(
        normalizedX *
        (resolution - 1)
      );

    const gridZ =
      Math.floor(
        normalizedZ *
        (resolution - 1)
      );

    const index =
      gridZ * resolution + gridX;

    const value =
      customTerrain.values[index] ?? 0;

    return (
      value - 0.5
    ) * customTerrain.heightScale;
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

  const resolution =
    params.terrainResolution;

  const geometry =
    new THREE.PlaneGeometry(
      TERRAIN_SIZE,
      TERRAIN_SIZE,
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

    const y =
      terrainHeight(x, z);

    positions.setXYZ(
      i,
      x,
      y,
      z
    );
  }

  positions.needsUpdate = true;
  geometry.computeVertexNormals();

  const material =
    new THREE.MeshStandardMaterial({
      color: 0x174f56,
      roughness: 0.88,
      metalness: 0.04,
      side: THREE.DoubleSide
    });

  terrainMesh =
    new THREE.Mesh(
      geometry,
      material
    );

  scene.add(terrainMesh);

  const wireGeometry =
    geometry.clone();

  const wireMaterial =
    new THREE.MeshBasicMaterial({
      color: 0x55a9aa,
      wireframe: true,
      transparent: true,
      opacity: 0.16
    });

  terrainWire =
    new THREE.Mesh(
      wireGeometry,
      wireMaterial
    );

  scene.add(terrainWire);
}

/* -------------------------------------------------------
   PARTICLES
------------------------------------------------------- */

let particles = [];
let particleGeometry = null;
let particleMaterial = null;
let particlePoints = null;

function createRandomParticle() {
  const x =
    -6.5 + Math.random() * 2.4;

  const z =
    -7.2 + Math.random() * 1.7;

  const y =
    terrainHeight(x, z) + 0.12;

  return {
    x: x,
    y: y,
    z: z,
    vx: 0,
    vy: 0,
    vz: 0,
    age: Math.random() * 10,
    deposited: false
  };
}

function createParticles() {
  if (particlePoints !== null) {
    scene.remove(particlePoints);

    particleGeometry.dispose();
    particleMaterial.dispose();

    particlePoints = null;
    particleGeometry = null;
    particleMaterial = null;
  }

  particles = [];

  const count =
    params.particleCount;

  const positions =
    new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const particle =
      createRandomParticle();

    particles.push(particle);

    positions[i * 3] =
      particle.x;

    positions[i * 3 + 1] =
      particle.y;

    positions[i * 3 + 2] =
      particle.z;
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

  particleMaterial =
    new THREE.PointsMaterial({
      color: 0x9bd7d0,
      size: 0.075,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.92,
      depthWrite: false
    });

  particlePoints =
    new THREE.Points(
      particleGeometry,
      particleMaterial
    );

  scene.add(particlePoints);

  updateParticleCount();
}

function resetParticle(particle) {
  const replacement =
    createRandomParticle();

  particle.x =
    replacement.x;

  particle.y =
    replacement.y;

  particle.z =
    replacement.z;

  particle.vx = 0;
  particle.vy = 0;
  particle.vz = 0;
  particle.age = 0;
  particle.deposited = false;
}

function addSediment() {
  const amount =
    Math.min(
      500,
      particles.length
    );

  for (let i = 0; i < amount; i++) {
    const index =
      Math.floor(
        Math.random() *
        particles.length
      );

    resetParticle(
      particles[index]
    );
  }
}

/* -------------------------------------------------------
   TERRAIN GRADIENT
------------------------------------------------------- */

function terrainGradient(x, z) {
  const distance = 0.08;

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

/* -------------------------------------------------------
   SIMULATION
------------------------------------------------------- */

function updateSimulation(deltaTime) {
  if (particleGeometry === null) {
    return;
  }

  const positions =
    particleGeometry
      .attributes
      .position
      .array;

  const gravity = 2.2;

  const flowStrength =
    params.flow * 2.5;

  const friction =
    0.75 +
    params.friction * 5.0;

  const collisionHeight = 0.08;

  const depositionSpeed =
    0.22 +
    (1.0 - params.material) *
    0.3;

  for (
    let i = 0;
    i < particles.length;
    i++
  ) {
    const particle =
      particles[i];

    particle.age += deltaTime;

    const gradient =
      terrainGradient(
        particle.x,
        particle.z
      );

    const downhillX =
      -gradient.dx * gravity;

    const downhillZ =
      -gradient.dz * gravity;

    const flowX =
      0.25 * flowStrength;

    const flowZ =
      0.85 * flowStrength;

    particle.vx +=
      (downhillX + flowX) *
      deltaTime;

    particle.vz +=
      (downhillZ + flowZ) *
      deltaTime;

    const damping =
      Math.max(
        0,
        1.0 -
        friction * deltaTime
      );

    particle.vx *= damping;
    particle.vz *= damping;

    particle.x +=
      particle.vx *
      deltaTime;

    particle.z +=
      particle.vz *
      deltaTime;

    const speed =
      Math.sqrt(
        particle.vx *
        particle.vx +

        particle.vz *
        particle.vz
      );

    if (
      speed <
      depositionSpeed
    ) {
      particle.vx *= 0.94;
      particle.vz *= 0.94;
      particle.deposited = true;
    } else {
      particle.deposited = false;
    }

    particle.y =
      terrainHeight(
        particle.x,
        particle.z
      ) + collisionHeight;

    const outside =
      particle.x <
        -TERRAIN_SIZE * 0.58 ||

      particle.x >
        TERRAIN_SIZE * 0.58 ||

      particle.z <
        -TERRAIN_SIZE * 0.58 ||

      particle.z >
        TERRAIN_SIZE * 0.58;

    if (
      outside ||
      particle.age > 45
    ) {
      resetParticle(particle);
    }

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

/* -------------------------------------------------------
   MODEL IMPORT
------------------------------------------------------- */

function getFileExtension(fileName) {
  return fileName
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
    geometry === null ||
    geometry.attributes.position === undefined
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

    point.applyMatrix4(matrix);

    points.push({
      x: point.x,
      y: point.y,
      z: point.z
    });
  }

  return points;
}

function getPointsFromObject(object) {
  const points = [];

  object.updateMatrixWorld(true);

  object.traverse((child) => {
    if (
      child.isMesh &&
      child.geometry
    ) {
      const childPoints =
        getPointsFromGeometry(
          child.geometry,
          child.matrixWorld
        );

      points.push(
        ...childPoints
      );
    }
  });

  return points;
}

function createTerrainFromPoints(points) {
  if (
    points === null ||
    points.length === 0
  ) {
    setStatus(
      "MODEL HAS NO GEOMETRY"
    );

    return;
  }

  const bounds =
    new THREE.Box3();

  for (
    const point of points
  ) {
    bounds.expandByPoint(
      new THREE.Vector3(
        point.x,
        point.y,
        point.z
      )
    );
  }

  const min =
    bounds.min;

  const max =
    bounds.max;

  const width =
    max.x - min.x;

  const depth =
    max.z - min.z;

  const height =
    max.y - min.y;

  if (
    width === 0 ||
    depth === 0 ||
    height === 0
  ) {
    setStatus(
      "INVALID MODEL ORIENTATION"
    );

    return;
  }

  const resolution =
    params.terrainResolution;

  const values =
    new Float32Array(
      resolution * resolution
    );

  const hasValue =
    new Uint8Array(
      resolution * resolution
    );

  for (
    const point of points
  ) {
    const normalizedX =
      (point.x - min.x) /
      width;

    const normalizedZ =
      (point.z - min.z) /
      depth;

    const gridX =
      THREE.MathUtils.clamp(
        Math.floor(
          normalizedX *
          (resolution - 1)
        ),
        0,
        resolution - 1
      );

    const gridZ =
      THREE.MathUtils.clamp(
        Math.floor(
          normalizedZ *
          (resolution - 1)
        ),
        0,
        resolution - 1
      );

    const normalizedY =
      (point.y - min.y) /
      height;

    const index =
      gridZ * resolution +
      gridX;

    if (
      hasValue[index] === 0 ||
      normalizedY >
        values[index]
    ) {
      values[index] =
        normalizedY;

      hasValue[index] = 1;
    }
  }

  /*
    Fill empty cells with neighboring
    values. This helps sparse models.
  */
  for (
    let pass = 0;
    pass < 16;
    pass++
  ) {
    const previous =
      values.slice();

    const previousHasValue =
      hasValue.slice();

    for (
      let z = 0;
      z < resolution;
      z++
    ) {
      for (
        let x = 0;
        x < resolution;
        x++
      ) {
        const index =
          z * resolution + x;

        if (
          previousHasValue[index] === 1
        ) {
          continue;
        }

        let sum = 0;
        let count = 0;

        for (
          let dz = -1;
          dz <= 1;
          dz++
        ) {
          for (
            let dx = -1;
            dx <= 1;
            dx++
          ) {
            const neighborX =
              x + dx;

            const neighborZ =
              z + dz;

            if (
              neighborX < 0 ||
              neighborX >= resolution ||
              neighborZ < 0 ||
              neighborZ >= resolution
            ) {
              continue;
            }

            const neighborIndex =
              neighborZ *
              resolution +
              neighborX;

            if (
              previousHasValue[
                neighborIndex
              ] === 1
            ) {
              sum +=
                previous[
                  neighborIndex
                ];

              count++;
            }
          }
        }

        if (count > 0) {
          values[index] =
            sum / count;

          hasValue[index] = 1;
        }
      }
    }
  }

  customTerrain = {
    resolution: resolution,
    values: values,
    heightScale: 4.0,
    sourcePoints: points
  };

  createTerrain();
  createParticles();

  params.running = false;
  playButton.textContent = "PLAY";

  dropZone.classList.add(
    "loaded"
  );

  dropZone.innerHTML =
    `3D TERRAIN LOADED<span>${currentFileName}</span>`;

  setStatus(
    "CUSTOM TERRAIN"
  );
}

let currentFileName = "";

function load3DTerrain(file) {
  if (!file) {
    return;
  }

  const extension =
    getFileExtension(file.name);

  if (
    extension !== "ply" &&
    extension !== "stl" &&
    extension !== "obj"
  ) {
    setStatus(
      "USE PLY, STL OR OBJ"
    );

    return;
  }

  currentFileName =
    file.name;

  if (extension === "obj") {
    const objectURL =
      URL.createObjectURL(file);

    const loader =
      new OBJLoader();

    loader.load(
      objectURL,
      (object) => {
        const points =
          getPointsFromObject(object);

        createTerrainFromPoints(
          points
        );

        URL.revokeObjectURL(
          objectURL
        );
      },
      undefined,
      () => {
        setStatus(
          "OBJ LOAD ERROR"
        );

        URL.revokeObjectURL(
          objectURL
        );
      }
    );

    return;
  }

  const reader =
    new FileReader();

  reader.onload =
    (event) => {
      try {
        let geometry = null;

        if (extension === "ply") {
          const loader =
            new PLYLoader();

          geometry =
            loader.parse(
              event.target.result
            );
        }

        if (extension === "stl") {
          const loader =
            new STLLoader();

          geometry =
            loader.parse(
              event.target.result
            );
        }

        if (
          geometry === null ||
          geometry.attributes.position === undefined
        ) {
          setStatus(
            "MODEL HAS NO POSITIONS"
          );

          return;
        }

        const points =
          getPointsFromGeometry(
            geometry
          );

        createTerrainFromPoints(
          points
        );

        geometry.dispose();
      } catch (error) {
        console.error(error);

        setStatus(
          "MODEL PARSE ERROR"
        );
      }
    };

  reader.onerror = () => {
    setStatus(
      "FILE READ ERROR"
    );
  };

  reader.readAsArrayBuffer(file);
}

/* -------------------------------------------------------
   DRAG AND DROP
------------------------------------------------------- */

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
      event.dataTransfer.files[0];

    load3DTerrain(file);
  }
);

/* -------------------------------------------------------
   USER INTERFACE
------------------------------------------------------- */

function setStatus(text) {
  statusElement.textContent =
    text;
}

function updateParticleCount() {
  const count =
    params.particleCount;

  particleCountValue.textContent =
    count;

  particleCountStatus.textContent =
    `${count} PARTICLES`;
}

function updateTerrainResolution() {
  params.terrainResolution =
    Number(
      terrainResolutionInput.value
    );

  terrainResolutionValue.textContent =
    params.terrainResolution;

  /*
    If a custom model is loaded,
    rebuild its heightfield from the
    original model points.
  */
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
  }

  setStatus(
    `RESOLUTION ${params.terrainResolution}`
  );
}

flowInput.addEventListener(
  "input",
  () => {
    params.flow =
      Number(flowInput.value);

    flowValue.textContent =
      params.flow.toFixed(2);
  }
);

slopeInput.addEventListener(
  "input",
  () => {
    params.slope =
      Number(slopeInput.value);

    slopeValue.textContent =
      params.slope.toFixed(2);

    if (customTerrain === null) {
      createTerrain();
    }
  }
);

frictionInput.addEventListener(
  "input",
  () => {
    params.friction =
      Number(frictionInput.value);

    frictionValue.textContent =
      params.friction.toFixed(2);
  }
);

materialInput.addEventListener(
  "input",
  () => {
    params.material =
      Number(materialInput.value);

    materialValue.textContent =
      params.material.toFixed(2);
  }
);

terrainResolutionInput.addEventListener(
  "input",
  updateTerrainResolution
);

particleCountInput.addEventListener(
  "input",
  () => {
    params.particleCount =
      Number(
        particleCountInput.value
      );

    updateParticleCount();

    createParticles();

    setStatus(
      `${params.particleCount} PARTICLES`
    );
  }
);

playButton.addEventListener(
  "click",
  () => {
    params.running =
      !params.running;

    if (params.running) {
      playButton.textContent =
        "PAUSE";

      setStatus(
        "RUNNING"
      );
    } else {
      playButton.textContent =
        "PLAY";

      setStatus(
        "PAUSED"
      );
    }
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
    addSediment();

    setStatus(
      "SEDIMENT ADDED"
    );
  }
);

terrainButton.addEventListener(
  "click",
  () => {
    terrainSeed =
      Math.random() * 1000;

    customTerrain = null;

    createTerrain();
    createParticles();

    params.running = false;

    playButton.textContent =
      "PLAY";

    dropZone.classList.remove(
      "loaded"
    );

    dropZone.innerHTML =
      "DROP 3D TERRAIN HERE<span>PLY / STL / OBJ</span>";

    setStatus(
      "NEW TERRAIN"
    );
  }
);

/* -------------------------------------------------------
   INITIALIZATION
------------------------------------------------------- */

terrainResolutionValue.textContent =
  params.terrainResolution;

particleCountInput.value =
  params.particleCount;

particleCountValue.textContent =
  params.particleCount;

particleCountStatus.textContent =
  `${params.particleCount} PARTICLES`;

createTerrain();
createParticles();

setStatus(
  "PAUSED"
);

/* -------------------------------------------------------
   ANIMATION
------------------------------------------------------- */

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

/* -------------------------------------------------------
   RESIZE
------------------------------------------------------- */

window.addEventListener(
  "resize",
  () => {
    camera.aspect =
      window.innerWidth /
      window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );
  }
);
