import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const viewer = document.getElementById("viewer");

/* -------------------------------------------------------
   SCENE
------------------------------------------------------- */

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111311);

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

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;

viewer.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 4;
controls.maxDistance = 40;

/* -------------------------------------------------------
   LIGHT
------------------------------------------------------- */

const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
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
  running: false
};

/* -------------------------------------------------------
   TERRAIN
------------------------------------------------------- */

const TERRAIN_SIZE = 18;
const TERRAIN_RESOLUTION = 80;

let terrainSeed = Math.random() * 1000;
let terrainMesh = null;
let terrainWire = null;

function terrainNoise(x, z) {
  return (
    Math.sin(x * 0.55 + terrainSeed) * 0.35 +
    Math.sin(z * 0.70 + terrainSeed * 0.7) * 0.25 +
    Math.sin((x + z) * 0.33 + terrainSeed * 0.4) * 0.20
  );
}

function terrainHeight(x, z) {
  const normalizedX = x / TERRAIN_SIZE;
  const normalizedZ = z / TERRAIN_SIZE;

  const broadForm = terrainNoise(x, z);

  const valley =
    -Math.exp(
      -Math.pow((normalizedX + 0.15) * 4.0, 2) -
      Math.pow((normalizedZ - 0.05) * 2.2, 2)
    ) * 1.2;

  const ridge =
    Math.exp(
      -Math.pow((normalizedX - 0.35) * 3.0, 2) -
      Math.pow((normalizedZ + 0.2) * 2.4, 2)
    ) * 1.1;

  const globalSlope = -z * 0.12 * (0.5 + params.slope);

  return broadForm + valley + ridge + globalSlope;
}

function createTerrain() {
  if (terrainMesh !== null) {
    scene.remove(terrainMesh);
    terrainMesh.geometry.dispose();
    terrainMesh.material.dispose();
  }

  if (terrainWire !== null) {
    scene.remove(terrainWire);
    terrainWire.geometry.dispose();
    terrainWire.material.dispose();
  }

  const geometry = new THREE.PlaneGeometry(
    TERRAIN_SIZE,
    TERRAIN_SIZE,
    TERRAIN_RESOLUTION,
    TERRAIN_RESOLUTION
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
    color: 0x505844,
    roughness: 1.0,
    metalness: 0.0,
    side: THREE.DoubleSide
  });

  terrainMesh = new THREE.Mesh(geometry, material);
  scene.add(terrainMesh);

  const wireGeometry = geometry.clone();

  const wireMaterial = new THREE.MeshBasicMaterial({
    color: 0x9aa875,
    wireframe: true,
    transparent: true,
    opacity: 0.12
  });

  terrainWire = new THREE.Mesh(wireGeometry, wireMaterial);
  scene.add(terrainWire);
}

/* -------------------------------------------------------
   PARTICLES
------------------------------------------------------- */

const PARTICLE_COUNT = 3500;

let particles = [];
let particleGeometry = null;
let particleMaterial = null;
let particlePoints = null;

function createRandomParticle() {
  const x = -6.5 + Math.random() * 2.4;
  const z = -7.2 + Math.random() * 1.7;
  const y = terrainHeight(x, z) + 0.12 + Math.random() * 0.35;

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

    if (particleGeometry !== null) {
      particleGeometry.dispose();
    }

    if (particleMaterial !== null) {
      particleMaterial.dispose();
    }
  }

  particles = [];

  const positions = new Float32Array(PARTICLE_COUNT * 3);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const particle = createRandomParticle();

    particles.push(particle);

    positions[i * 3] = particle.x;
    positions[i * 3 + 1] = particle.y;
    positions[i * 3 + 2] = particle.z;
  }

  particleGeometry = new THREE.BufferGeometry();

  particleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );

  particleMaterial = new THREE.PointsMaterial({
    color: 0xd7df88,
    size: 0.075,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.9,
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
  for (let i = 0; i < 450; i++) {
    const index = Math.floor(Math.random() * particles.length);
    const particle = particles[index];
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
}

/* -------------------------------------------------------
   TERRAIN GRADIENT
------------------------------------------------------- */

function terrainGradient(x, z) {
  const distance = 0.08;

  const left = terrainHeight(x - distance, z);
  const right = terrainHeight(x + distance, z);
  const back = terrainHeight(x, z - distance);
  const front = terrainHeight(x, z + distance);

  return {
    dx: (right - left) / (2 * distance),
    dz: (front - back) / (2 * distance)
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
    particleGeometry.attributes.position.array;

  const gravity = 2.2;
  const flowStrength = params.flow * 2.5;
  const friction = 0.75 + params.friction * 5.0;
  const collisionHeight = 0.08;
  const depositionSpeed =
    0.22 + (1.0 - params.material) * 0.3;

  for (let i = 0; i < particles.length; i++) {
    const particle = particles[i];

    particle.age += deltaTime;

    const gradient = terrainGradient(
      particle.x,
      particle.z
    );

    const downhillX = -gradient.dx * gravity;
    const downhillZ = -gradient.dz * gravity;

    const flowX = 0.25 * flowStrength;
    const flowZ = 0.85 * flowStrength;

    particle.vx += (downhillX + flowX) * deltaTime;
    particle.vz += (downhillZ + flowZ) * deltaTime;

    const damping = Math.max(
      0,
      1.0 - friction * deltaTime
    );

    particle.vx *= damping;
    particle.vz *= damping;

    particle.x += particle.vx * deltaTime;
    particle.z += particle.vz * deltaTime;

    const speed = Math.sqrt(
      particle.vx * particle.vx +
      particle.vz * particle.vz
    );

    if (speed < depositionSpeed) {
      particle.vx *= 0.94;
      particle.vz *= 0.94;
      particle.deposited = true;
    } else {
      particle.deposited = false;
    }

    particle.y =
      terrainHeight(particle.x, particle.z) +
      collisionHeight;

    const outside =
      particle.x < -TERRAIN_SIZE * 0.58 ||
      particle.x > TERRAIN_SIZE * 0.58 ||
      particle.z < -TERRAIN_SIZE * 0.58 ||
      particle.z > TERRAIN_SIZE * 0.58;

    if (outside || particle.age > 45) {
      resetParticle(particle);
    }

    positions[i * 3] = particle.x;
    positions[i * 3 + 1] = particle.y;
    positions[i * 3 + 2] = particle.z;
  }

  particleGeometry.attributes.position.needsUpdate = true;
}

/* -------------------------------------------------------
   USER INTERFACE
------------------------------------------------------- */

const flowInput = document.getElementById("flow");
const slopeInput = document.getElementById("slope");
const frictionInput = document.getElementById("friction");
const materialInput = document.getElementById("material");

const flowValue = document.getElementById("flowValue");
const slopeValue = document.getElementById("slopeValue");
const frictionValue = document.getElementById("frictionValue");
const materialValue = document.getElementById("materialValue");

const playButton = document.getElementById("playButton");
const resetButton = document.getElementById("resetButton");
const addButton = document.getElementById("addButton");
const terrainButton = document.getElementById("terrainButton");

const statusElement = document.getElementById("status");
const particleCountElement =
  document.getElementById("particleCount");

function setStatus(text) {
  statusElement.textContent = text;
}

function updateSlider(input, output, property) {
  input.addEventListener("input", () => {
    params[property] = Number(input.value);
    output.textContent = Number(input.value).toFixed(2);

    if (property === "slope") {
      createTerrain();

      for (const particle of particles) {
        particle.y =
          terrainHeight(particle.x, particle.z) + 0.08;
      }
    }
  });
}

updateSlider(flowInput, flowValue, "flow");
updateSlider(slopeInput, slopeValue, "slope");
updateSlider(frictionInput, frictionValue, "friction");
updateSlider(materialInput, materialValue, "material");

playButton.addEventListener("click", () => {
  params.running = !params.running;

  if (params.running) {
    playButton.textContent = "PAUSE";
    setStatus("RUNNING");
  } else {
    playButton.textContent = "PLAY";
    setStatus("PAUSED");
  }
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

  createTerrain();
  createParticles();

  params.running = false;
  playButton.textContent = "PLAY";
  setStatus("NEW TERRAIN");
});

function updateParticleCount() {
  particleCountElement.textContent =
    `${particles.length} PARTICLES`;
}

/* -------------------------------------------------------
   START
------------------------------------------------------- */

createTerrain();
createParticles();
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
