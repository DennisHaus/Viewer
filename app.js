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

const viewer =
  document.getElementById("viewer");

const flowInput =
  document.getElementById("flow");

const frictionInput =
  document.getElementById("friction");

const materialInput =
  document.getElementById("material");

const terrainResolutionInput =
  document.getElementById("terrainResolution");

const particleCountInput =
  document.getElementById("particleCount");

const sourceVolumeInput =
  document.getElementById("sourceVolume");

const rotationXInput =
  document.getElementById("rotationX");

const rotationYInput =
  document.getElementById("rotationY");

const rotationZInput =
  document.getElementById("rotationZ");

const flowValue =
  document.getElementById("flowValue");

const frictionValue =
  document.getElementById("frictionValue");

const materialValue =
  document.getElementById("materialValue");

const terrainResolutionValue =
  document.getElementById("terrainResolutionValue");

const particleCountValue =
  document.getElementById("particleCountValue");

const sourceVolumeValue =
  document.getElementById("sourceVolumeValue");

const rotationXValue =
  document.getElementById("rotationXValue");

const rotationYValue =
  document.getElementById("rotationYValue");

const rotationZValue =
  document.getElementById("rotationZValue");

const playButton =
  document.getElementById("playButton");

const resetButton =
  document.getElementById("resetButton");

const addButton =
  document.getElementById("addButton");

const terrainButton =
  document.getElementById("terrainButton");

const resetOrientationButton =
  document.getElementById(
    "resetOrientationButton"
  );

const statusElement =
  document.getElementById("status");

const particleCountStatus =
  document.getElementById(
    "particleCountStatus"
  );

const dropZone =
  document.getElementById("dropZone");

/* -------------------------------------------------------
   SCENE
------------------------------------------------------- */

const scene =
  new THREE.Scene();

scene.background =
  new THREE.Color(0x0c1b1d);

const camera =
  new THREE.PerspectiveCamera(
    45,
    window.innerWidth /
      window.innerHeight,
    0.1,
    1000
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

/* -------------------------------------------------------
   ORBIT / PAN / ZOOM
------------------------------------------------------- */

const controls =
  new OrbitControls(
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

/* -------------------------------------------------------
   LIGHTING
------------------------------------------------------- */

scene.add(
  new THREE.AmbientLight(
    0xffffff,
    1.4
  )
);

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

scene.add(
  directionalLight
);

/* -------------------------------------------------------
   PARAMETERS
------------------------------------------------------- */

const params = {
  flow: 0.50,
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

let terrainSeed =
  Math.random() * 1000;

let terrainMesh = null;
let terrainWire = null;
let customTerrain = null;

let rawModelPoints = null;

const modelRotation = {
  x: 0,
  y: 0,
  z: 0
};

/* -------------------------------------------------------
   SOURCE VARIABLES
------------------------------------------------------- */

let sourceLocation =
  new THREE.Vector3(
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
    Math.sin(
      x * 0.55 + terrainSeed
    ) * 0.35 +

    Math.sin(
      z * 0.70 +
      terrainSeed * 0.7
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

  /*
    Slope is intentionally fixed at zero.
  */
  const globalSlope = 0;

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
      customTerrain.values[index] ??
      0;

    return (
      value - 0.5
    ) * customTerrain.heightScale;
  }

  return proceduralTerrainHeight(
    x,
    z
  );
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

  scene.add(
    terrainMesh
  );

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

  scene.add(
    terrainWire
  );
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

  const geometry =
    new THREE.RingGeometry(
      0.32,
      0.42,
      32
    );

  const material =
    new THREE.MeshBasicMaterial({
      color: 0x9bd7d0,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
      depthTest: false
    });

  sourceMarker =
    new THREE.Mesh(
      geometry,
      material
    );

  sourceMarker.rotation.x =
    -Math.PI / 2;

  sourceMarker.renderOrder = 20;

  scene.add(
    sourceMarker
  );

  updateSourceMarker();
}

function updateSourceMarker() {
  if (sourceMarker === null) {
    return;
  }

  sourceLocation.y =
    terrainHeight(
      sourceLocation.x,
      sourceLocation.z
    ) + 0.035;

  sourceMarker.position.copy(
    sourceLocation
  );

  const markerScale =
    Math.max(
      0.65,
      Math.cbrt(
        params.sourceVolume
      )
    );

  sourceMarker.scale.set(
    markerScale,
    markerScale,
    markerScale
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
  const sourceSize =
    Math.cbrt(
      params.sourceVolume
    );

  const halfSize =
    sourceSize / 2;

  const x =
    sourceLocation.x +
    (Math.random() * 2 - 1) *
      halfSize;

  const z =
    sourceLocation.z +
    (Math.random() * 2 - 1) *
      halfSize;

  const y =
    terrainHeight(x, z) +
    Math.random() *
      sourceSize +
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
    scene.remove(
      particlePoints
    );

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
    new Float32Array(
      count * 3
    );

  for (
    let i = 0;
    i < count;
    i++
  ) {
    const particle =
      createRandomParticle();

    particles.push(
      particle
    );

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

  /*
    ShaderMaterial creates round points
    instead of square point sprites.
  */
  particleMaterial =
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,

      uniforms: {
        pointColor: {
          value: new THREE.Color(
            0x9bd7d0
          )
        },

        pointSize: {
          value: 7.0
        }
      },

      vertexShader: `
        uniform float pointSize;

        void main() {
          vec4 modelPosition =
            modelViewMatrix *
            vec4(position, 1.0);

          gl_Position =
            projectionMatrix *
            modelPosition;

          gl_PointSize =
            pointSize *
            (300.0 / -modelPosition.z);
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

          if (
            distanceFromCenter > 0.5
          ) {
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

  scene.add(
    particlePoints
  );

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

  for (
    let i = 0;
    i < amount;
    i++
  ) {
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
   SIMULATION
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

function updateSimulation(deltaTime) {
  if (
    particleGeometry === null
  ) {
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

    particle.age +=
      deltaTime;

    const gradient =
      terrainGradient(
        particle.x,
        particle.z
      );

    const downhillX =
      -gradient.dx *
      gravity;

    const downhillZ =
      -gradient.dz *
      gravity;

    const flowX =
      0.25 *
      flowStrength;

    const flowZ =
      0.85 *
      flowStrength;

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
        friction *
          deltaTime
      );

    particle.vx *=
      damping;

    particle.vz *=
      damping;

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
      particle.vx *=
        0.94;

      particle.vz *=
        0.94;

      particle.deposited =
        true;
    } else {
      particle.deposited =
        false;
    }

    particle.y =
      terrainHeight(
        particle.x,
        particle.z
      ) + 0.08;

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
      resetParticle(
        particle
      );
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

  object.updateMatrixWorld(
    true
  );

  object.traverse(
    (child) => {
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
    }
  );

  return points;
}

function transformModelPoints(points) {
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

  const transformed = [];
  const vector =
    new THREE.Vector3();

  for (
    const point of points
  ) {
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

function createTerrainFromPoints(points) {
  if (
    !points ||
    points.length === 0
  ) {
    setStatus(
      "MODEL HAS NO GEOMETRY"
    );

    return;
  }

  rawModelPoints =
    points;

  const transformedPoints =
    transformModelPoints(
      points
    );

  const bounds =
    new THREE.Box3();

  for (
    const point of transformedPoints
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
      resolution *
        resolution
    );

  const hasValue =
    new Uint8Array(
      resolution *
        resolution
    );

  const centerX =
    (min.x + max.x) *
    0.5;

  const centerZ =
    (min.z + max.z) *
    0.5;

  /*
    Use the largest horizontal dimension
    so the model keeps its proportions.
  */
  const horizontalSpan =
    Math.max(
      width,
      depth
    );

  for (
    const point of transformedPoints
  ) {
    const normalizedX =
      (point.x - centerX) /
        horizontalSpan +
      0.5;

    const normalizedZ =
      (point.z - centerZ) /
        horizontalSpan +
      0.5;

    const normalizedY =
      (point.y - min.y) /
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

    const index =
      gridZ *
        resolution +
      gridX;

    if (
      hasValue[index] === 0 ||
      normalizedY >
        values[index]
    ) {
      values[index] =
        normalizedY;

      hasValue[index] =
        1;
    }
  }

  /*
    Interpolate empty cells from neighboring cells.
  */
  for (
    let pass = 0;
    pass < 16;
    pass++
  ) {
    const previous =
      values.slice();

    const previousMask =
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
          z *
            resolution +
          x;

        if (
          previousMask[index] === 1
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

            const neighbor =
              nz *
                resolution +
              nx;

            if (
              previousMask[
                neighbor
              ] === 1
            ) {
              sum +=
                previous[
                  neighbor
                ];

              count++;
            }
          }
        }

        if (
          count > 0
        ) {
          values[index] =
            sum / count;

          hasValue[index] =
            1;
        }
      }
    }
  }

  customTerrain = {
    resolution,
    values,
    heightScale: 4.0,
    sourcePoints:
      rawModelPoints
  };

  createTerrain();
  createParticles();
  updateSourceMarker();

  params.running =
    false;

  playButton.textContent =
    "PLAY";

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

  modelRotation.x = 0;
  modelRotation.y = 0;
  modelRotation.z = 0;

  rotationXInput.value = 0;
  rotationYInput.value = 0;
  rotationZInput.value = 0;

  updateRotationUI();

  const extension =
    getFileExtension(
      file.name
    );

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

  if (
    extension === "obj"
  ) {
    const url =
      URL.createObjectURL(
        file
      );

    const loader =
      new OBJLoader();

    loader.load(
      url,
      (object) => {
        const points =
          getPointsFromObject(
            object
          );

        createTerrainFromPoints(
          points
        );

        URL.revokeObjectURL(
          url
        );
      },
      undefined,
      () => {
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

  reader.onload =
    (event) => {
      try {
        let geometry =
          null;

        if (
          extension === "ply"
        ) {
          geometry =
            new PLYLoader().parse(
              event.target.result
            );
        }

        if (
          extension === "stl"
        ) {
          geometry =
            new STLLoader().parse(
              event.target.result
            );
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

  reader.onerror =
    () => {
      setStatus(
        "FILE READ ERROR"
      );
    };

  reader.readAsArrayBuffer(
    file
  );
}

/* -------------------------------------------------------
   SOURCE PLACEMENT
------------------------------------------------------- */

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
      terrainMesh === null
    ) {
      return;
    }

    const rect =
      renderer.domElement
        .getBoundingClientRect();

    pointer.x =
      ((event.clientX -
        rect.left) /
        rect.width) *
        2 -
      1;

    pointer.y =
      -((event.clientY -
        rect.top) /
        rect.height) *
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

    if (
      intersections.length === 0
    ) {
      return;
    }

    sourceLocation.copy(
      intersections[0].point
    );

    updateSourceMarker();
    createParticles();

    params.running =
      false;

    playButton.textContent =
      "PLAY";

    setStatus(
      "SOURCE PLACED"
    );
  }
);

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

    load3DTerrain(
      file
    );
  }
);

/* -------------------------------------------------------
   UI FUNCTIONS
------------------------------------------------------- */

function setStatus(text) {
  statusElement.textContent =
    text;
}

function updateParticleCount() {
  particleCountValue.textContent =
    params.particleCount;

  particleCountStatus.textContent =
    `${params.particleCount} PARTICLES`;
}

function updateRotationUI() {
  rotationXValue.textContent =
    `${modelRotation.x}°`;

  rotationYValue.textContent =
    `${modelRotation.y}°`;

  rotationZValue.textContent =
    `${modelRotation.z}°`;
}

function rebuildRotatedTerrain() {
  if (
    rawModelPoints === null ||
    rawModelPoints.length === 0
  ) {
    setStatus(
      "NO MODEL LOADED"
    );

    return;
  }

  createTerrainFromPoints(
    rawModelPoints
  );

  updateSourceMarker();

  setStatus(
    "MODEL ROTATED"
  );
}

/* -------------------------------------------------------
   BASIC SLIDERS
------------------------------------------------------- */

flowInput.addEventListener(
  "input",
  () => {
    params.flow =
      Number(
        flowInput.value
      );

    flowValue.textContent =
      params.flow.toFixed(2);
  }
);

frictionInput.addEventListener(
  "input",
  () => {
    params.friction =
      Number(
        frictionInput.value
      );

    frictionValue.textContent =
      params.friction.toFixed(2);
  }
);

materialInput.addEventListener(
  "input",
  () => {
    params.material =
      Number(
        materialInput.value
      );

    materialValue.textContent =
      params.material.toFixed(2);
  }
);

sourceVolumeInput.addEventListener(
  "input",
  () => {
    params.sourceVolume =
      Number(
        sourceVolumeInput.value
      );

    sourceVolumeValue.textContent =
      params.sourceVolume;

    updateSourceMarker();
    createParticles();

    setStatus(
      `SOURCE ${params.sourceVolume} m³`
    );
  }
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

/* -------------------------------------------------------
   TERRAIN RESOLUTION
------------------------------------------------------- */

terrainResolutionInput.addEventListener(
  "input",
  () => {
    terrainResolutionValue.textContent =
      terrainResolutionInput.value;
  }
);

terrainResolutionInput.addEventListener(
  "change",
  () => {
    params.terrainResolution =
      Number(
        terrainResolutionInput.value
      );

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
);

/* -------------------------------------------------------
   ROTATION CONTROLS
------------------------------------------------------- */

rotationXInput.addEventListener(
  "change",
  () => {
    modelRotation.x =
      Number(
        rotationXInput.value
      );

    updateRotationUI();
    rebuildRotatedTerrain();
  }
);

rotationYInput.addEventListener(
  "change",
  () => {
    modelRotation.y =
      Number(
        rotationYInput.value
      );

    updateRotationUI();
    rebuildRotatedTerrain();
  }
);

rotationZInput.addEventListener(
  "change",
  () => {
    modelRotation.z =
      Number(
        rotationZInput.value
      );

    updateRotationUI();
    rebuildRotatedTerrain();
  }
);

resetOrientationButton.addEventListener(
  "click",
  () => {
    modelRotation.x = 0;
    modelRotation.y = 0;
    modelRotation.z = 0;

    rotationXInput.value = 0;
    rotationYInput.value = 0;
    rotationZInput.value = 0;

    updateRotationUI();
    rebuildRotatedTerrain();

    setStatus(
      "ORIENTATION RESET"
    );
  }
);

/* -------------------------------------------------------
   BUTTONS
------------------------------------------------------- */

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

    params.running =
      false;

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

    customTerrain =
      null;

    rawModelPoints =
      null;

    modelRotation.x = 0;
    modelRotation.y = 0;
    modelRotation.z = 0;

    rotationXInput.value = 0;
    rotationYInput.value = 0;
    rotationZInput.value = 0;

    updateRotationUI();

    createTerrain();

    sourceLocation.set(
      -5.3,
      terrainHeight(
        -5.3,
        -6.3
      ),
      -6.3
    );

    updateSourceMarker();
    createParticles();

    params.running =
      false;

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

particleCountValue.textContent =
  params.particleCount;

sourceVolumeValue.textContent =
  params.sourceVolume;

updateRotationUI();
updateParticleCount();

createTerrain();
createSourceMarker();
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

  if (
    params.running
  ) {
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
