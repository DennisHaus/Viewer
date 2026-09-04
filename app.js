import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js";

const debugBox = document.createElement("div");

debugBox.textContent = "APP STARTED";

Object.assign(debugBox.style, {
  position: "fixed",
  top: "10px",
  right: "10px",
  zIndex: "99999",
  padding: "8px 12px",
  background: "#c6d37a",
  color: "#111",
  fontFamily: "Arial, sans-serif",
  fontSize: "12px"
});

document.body.appendChild(debugBox);

/* -------------------------------------------------------
   BASIC SETUP
------------------------------------------------------- */

const viewer = document.getElementById("viewer");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111311);

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.set(15, 12, 16);

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
controls.minDistance = 5;
controls.maxDistance = 45;

/* -------------------------------------------------------
   LIGHTING
------------------------------------------------------- */

const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
directionalLight.position.set(8, 16, 10);
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
const TERRAIN_RESOLUTION = 100;

let terrainSeed = Math.random() * 1000;
let terrainMesh;
let terrainWire;

function noise(x, z) {
  return (
    Math.sin(x * 0.55 + terrainSeed) * 0.35 +
    Math.sin(z * 0.70 + terrainSeed * 0.7) * 0.25 +
    Math.sin((x + z) * 0.33 + terrainSeed * 0.4) * 0.20
  );
}

function terrainHeight(x, z) {
  const normalizedX = x / TERRAIN_SIZE;
  const normalizedZ = z / TERRAIN_SIZE;

  const broadForm = noise(x, z);
  const valley = -Math.exp(
    -Math.pow((normalizedX + 0.15) * 4.0, 2)
    -Math.pow((normalizedZ - 0.05) * 2.2, 2)
  ) * 1.2;

  const ridge = Math.exp(
    -Math.pow((normalizedX - 0.35) * 3.0, 2)
    -Math.pow((normalizedZ + 0.2) * 2.4, 2)
  ) * 1.1;

  const globalSlope = -z * 0.12 * (0.5 + params.slope);

  return broadForm + valley + ridge + globalSlope;
}

function createTerrain() {
  if (terrainMesh) {
    scene.remove(terrainMesh);
    terrainMesh.geometry.dispose();
    terrainMesh.material.dispose();
  }

  if (terrainWire) {
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
    color: 0x7c8969,
    wireframe: true,
    transparent: true,
    opacity: 0.12
  });

  terrainWire = new THREE.Mesh(wireGeometry, wireMaterial);
  scene.add(terrainWire);
}

createTerrain();

/* -------------------------------------------------------
   PARTICLES
------------------------------------------------------- */

const PARTICLE_COUNT = 3500;
const particles = [];

let particleGeometry;
let particleMaterial;
let particlePoints;

function randomParticle() {
  const x = -6.5 + Math.random() * 2.4;
  const z = -7.2 + Math.random() * 1.7;
  const y = terrainHeight(x, z) + 0.12 + Math.random() * 0.35;

  return {
    x,
    y,
    z,
    vx: 0,
    vy: 0,
    vz: 0,
    age: Math.random() * 10,
    deposited: false
  };
}

function createParticles() {
  particles.length = 0;

  const positions = new Float32Array(PARTICLE_COUNT * 3);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const p = randomParticle();
    particles.push(p);

    positions[i * 3] = p.x;
    positions[i * 3 + 1] = p.y;
    positions[i * 3 + 2] = p.z;
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

createParticles();

/* -------------------------------------------------------
   SIMPLE MPM-INSPIRED SIMULATION
------------------------------------------------------- */

function terrainGradient(x, z) {
  const sampleDistance = 0.08;

  const heightLeft = terrainHeight(x - sampleDistance, z);
  const heightRight = terrainHeight(x + sampleDistance, z);
  const heightBack = terrainHeight(x, z - sampleDistance);
  const heightFront = terrainHeight(x, z + sampleDistance);

  return {
    dx: (heightRight - heightLeft) / (2 * sampleDistance),
    dz: (heightFront - heightBack) / (2 * sampleDistance)
  };
}

function resetParticle(particle) {
  const replacement = randomParticle();

  particle.x = replacement.x;
  particle.y = replacement.y;
  particle.z = replacement.z;
  particle.vx = 0;
  particle.vy = 0;
  particle.vz = 0;
  particle.age = 0;
  particle.deposited = false;
}

function updateSimulation(deltaTime) {
  const positions = particleGeometry.attributes.position.array;

  const gravity = 2.2;
  const flowStrength = params.flow * 2.5;
  const friction = 0.75 + params.friction * 5.0;
  const terrainCollisionHeight = 0.08;
  const depositionSpeed = 0.22 + (1.0 - params.material) * 0.3;

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];

    p.age += deltaTime;

    const gradient = terrainGradient(p.x, p.z);

    /*
      Gravity moves material downhill according to the
      local terrain gradient.
    */
    const downhillX = -gradient.dx * gravity;
    const downhillZ = -gradient.dz * gravity;

    /*
      Flow introduces a preferred directional movement.
      This stands in for a simplified water force.
    */
    const flowX = 0.25 * flowStrength;
    const flowZ = 0.85 * flowStrength;

    p.vx += (downhillX + flowX) * deltaTime;
    p.vz += (downhillZ + flowZ) * deltaTime;

    /*
      Friction damps the velocity.
    */
    const damping = Math.max(0, 1.0 - friction * deltaTime);
    p.vx *= damping;
    p.vz *= damping;

    /*
      Small vertical movement keeps particles attached
      to the changing terrain surface.
    */
    p.x += p.vx * deltaTime;
    p.z += p.vz * deltaTime;

    const localTerrainHeight = terrainHeight(p.x, p.z);
    const speed = Math.sqrt(p.vx * p.vx + p.vz * p.vz);

    /*
      Deposition: particles with low velocity remain close
      to the terrain.
    */
    if (speed < depositionSpeed) {
      p.vx *= 0.94;
      p.vz *= 0.94;
      p.deposited = true;
    } else {
      p.deposited = false;
    }

    p.y = localTerrainHeight + terrainCollisionHeight;

    /*
      Recycle particles that leave the simulation area.
    */
    if (
      p.x < -TERRAIN_SIZE * 0.58 ||
      p.x > TERRAIN_SIZE * 0.58 ||
      p.z < -TERRAIN_SIZE * 0.58 ||
      p.z > TERRAIN_SIZE * 0.58 ||
      p.age > 45
    ) {
      resetParticle(p);
    }

    positions[i * 3] = p.x;
    positions[i * 3 + 1] = p.y;
    positions[i * 3 + 2] = p.z;
  }

  particleGeometry.attributes.position.needsUpdate = true;
}

/* -------------------------------------------------------
   ADD NEW SEDIMENT
------------------------------------------------------- */

function addSediment() {
  for (let i = 0; i < 450; i++) {
    const index = Math.floor(Math.random() * particles.length);
    const p = particles[index];

    p.x = -6.5 + Math.random() * 2.4;
    p.z = -7.2 + Math.random() * 1.7;
    p.y = terrainHeight(p.x, p.z) + 0.12 + Math.random() * 0.35;

    p.vx = 0;
    p.vy = 0;
    p.vz = 0;
    p.age = 0;
    p.deposited = false;
  }
}

/* -------------------------------------------------------
   UI
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

const status = document.getElementById("status");
const particleCount = document.getElementById("particleCount");

function updateValue(input, output, property) {
  input.addEventListener("input", () => {
    params[property] = Number(input.value);
    output.textContent = Number(input.value).toFixed(2);

    if (property === "slope") {
      createTerrain();
    }
  });
}

updateValue(flowInput, flowValue, "flow");
updateValue(slopeInput, slopeValue, "slope");
updateValue(frictionInput, frictionValue, "friction");
updateValue(materialInput, materialValue, "material");

playButton.addEventListener("click", () => {
  params.running = !params.running;
  playButton.textContent = params.running ? "PAUSE" : "PLAY";
  status.textContent = params.running ? "RUNNING" : "PAUSED";
});

resetButton.addEventListener("click", () => {
  createParticles();
  params.running = false;
  playButton.textContent = "PLAY";
  status.textContent = "PAUSED";
});

addButton.addEventListener("click", () => {
  addSediment();
});

terrainButton.addEventListener("click", () => {
  terrainSeed = Math.random() * 1000;
  createTerrain();
  createParticles();
});

function updateParticleCount() {
  particleCount.textContent = `${particles.length} PARTICLES`;
}

/* -------------------------------------------------------
   RENDER LOOP
------------------------------------------------------- */

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const deltaTime = Math.min(clock.getDelta(), 0.033);

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
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
});
