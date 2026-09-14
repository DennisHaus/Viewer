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

import {
  MarchingCubes
} from "three/addons/objects/MarchingCubes.js";


/* =====================================================
   DOM
===================================================== */

const $ = (id) => {
  return document.getElementById(id);
};

const viewer = $("viewer");

const materialFrictionInput =
  $("materialFriction");

const materialFrictionNumber =
  $("materialFrictionNumber");

const terrainFrictionInput =
  $("terrainFriction");

const terrainFrictionNumber =
  $("terrainFrictionNumber");

const particleCohesionInput =
  $("particleCohesion");

const particleCohesionNumber =
  $("particleCohesionNumber");

const startVelocityInput =
  $("startVelocity");

const startVelocityNumber =
  $("startVelocityNumber");

const simulationSpeedInput =
  $("simulationSpeed");

const simulationSpeedNumber =
  $("simulationSpeedNumber");

const startDirectionModeInput =
  $("startDirectionMode");

const directionAngleInput =
  $("directionAngle");

const directionAngleNumber =
  $("directionAngleNumber");

const directionXInput =
  $("directionX");

const directionXNumber =
  $("directionXNumber");

const directionZInput =
  $("directionZ");

const directionZNumber =
  $("directionZNumber");

const fixedDirectionControl =
  $("fixedDirectionControl");

const userDirectionXControl =
  $("userDirectionXControl");

const userDirectionZControl =
  $("userDirectionZControl");

const terrainResolutionInput =
  $("terrainResolution");

const terrainResolutionNumber =
  $("terrainResolutionNumber");

const modelScaleInput =
  $("modelScale");

const modelScaleNumber =
  $("modelScaleNumber");

const metersPerModelUnitInput =
  $("metersPerModelUnit");

const metersPerModelUnitNumber =
  $("metersPerModelUnitNumber");

const verticalScaleInput =
  $("verticalExaggeration");

const verticalScaleNumber =
  $("verticalScaleNumber");

const depthScaleInput =
  $("depthScale");

const depthScaleNumber =
  $("depthScaleNumber");

const releaseShapeModeInput =
  $("releaseShapeMode");

const rectangleAreaControl =
  $("rectangleAreaControl");

const customShapeControl =
  $("customShapeControl");

const sourceAreaInput =
  $("sourceArea");

const sourceAreaNumber =
  $("sourceAreaNumber");

const drawReleaseShapeButton =
  $("drawReleaseShapeButton");

const clearReleaseShapeButton =
  $("clearReleaseShapeButton");

const drawShapeHint =
  $("drawShapeHint");

const releaseAreaReadout =
  $("releaseAreaReadout");

const sourceVolumeInput =
  $("sourceVolume");

const sourceVolumeNumber =
  $("sourceVolumeNumber");

const particleDensityInput =
  $("particleDensity");

const particleDensityNumber =
  $("particleDensityNumber");

const particleVisualizationInput =
  $("particleVisualization");

const soupLinkRangeInput =
  $("soupLinkRange");

const soupLinkRangeNumber =
  $("soupLinkRangeNumber");

const colorModeInput =
  $("colorMode");

const particleSizeInput =
  $("particleSize");

const particleSizeNumber =
  $("particleSizeNumber");

const rotationXInput =
  $("rotationX");

const rotationXNumber =
  $("rotationXNumber");

const rotationYInput =
  $("rotationY");

const rotationYNumber =
  $("rotationYNumber");

const rotationZInput =
  $("rotationZ");

const rotationZNumber =
  $("rotationZNumber");

const playButton =
  $("playButton");

const resetButton =
  $("resetButton");

const addButton =
  $("addButton");

const terrainButton =
  $("terrainButton");

const resetOrientationButton =
  $("resetOrientationButton");

const statusElement =
  $("status");

const particleCountStatus =
  $("particleCountStatus");

const dropZone =
  $("dropZone");

const modelFileInput =
  $("modelFileInput");

const chooseModelButton =
  $("chooseModelButton");

function setStatus(text) {
  if (statusElement) {
    statusElement.textContent =
      text;
  }
}


/* =====================================================
   SCENE
===================================================== */

const scene =
  new THREE.Scene();

scene.background =
  new THREE.Color(
    0x000000
  );

const camera =
  new THREE.PerspectiveCamera(
    45,
    window.innerWidth /
      window.innerHeight,
    0.1,
    1000000
  );

camera.position.set(
  180,
  140,
  180
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
   CONTROLS
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

controls.dampingFactor =
  0.08;

controls.screenSpacePanning =
  true;

controls.rotateSpeed =
  0.7;

controls.panSpeed =
  0.8;

controls.zoomSpeed =
  0.9;

controls.minDistance =
  0.5;

controls.maxDistance =
  10000000;

controls.minPolarAngle =
  0.05;

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
  180,
  260,
  220
);

scene.add(
  directionalLight
);


/* =====================================================
   PARAMETERS
===================================================== */

const params = {
  materialFriction: 0.35,
  terrainFriction: 0.65,
  particleCohesion: 0.35,

  startVelocity: 1,
  simulationSpeed: 1,

  startDirectionMode: "downhill",
  directionAngle: 0,
  directionX: 0,
  directionZ: 1,

  terrainResolution: 256,

  modelScale: 1,
  metersPerModelUnit: 1,
  verticalExaggeration: 1,
  depthScale: 1,

  releaseShapeMode: "rectangle",
  sourceArea: 100,

  sourceVolume: 10000,
  particleDensity: 1,

  particleVisualization: "points",
  soupLinkRange: 1.25,
  colorMode: "material",
  particleSize: 1,

  launchDuration: 2.5,
  minimumMovementSpeed: 0.12,

  running: false
};


/* =====================================================
   CONSTANTS
===================================================== */

const TERRAIN_SIZE =
  600;

const MAX_SIMULATED_PARTICLES =
  20000;

const GRAVITY =
  9.81;

const PHYSICS_STEP =
  1 / 120;

const MAX_PHYSICS_SUBSTEPS =
  20;

const COLLISION_ITERATIONS =
  3;

const COLLISION_RESTITUTION =
  0;

const SURFACE_CLEARANCE =
  0.025;

const DEFAULT_IMPORTED_ROTATION_X =
  -90;

const COHESION_STRENGTH =
  5;

const COHESION_RANGE_MULTIPLIER =
  3;

const SOUP_RESOLUTION =
  32;

const SOUP_MAX_POLYGONS =
  50000;

const MAX_SOUP_FIELDS =
  64;

const MAX_SOUP_BALLS_PER_FIELD =
  500;

const SOUP_UPDATE_INTERVAL =
  0.08;


/* =====================================================
   STATE
===================================================== */

let terrainSeed =
  Math.random() * 100000;

let terrainMesh =
  null;

let terrainWire =
  null;

let customTerrain =
  null;

let rawModelPoints =
  null;

let currentFileName =
  "";

let releaseOutline =
  null;

let releaseVolumePreview =
  null;

let drawingPreviewLine =
  null;

let particles =
  [];

let particleGeometry =
  null;

let particleMaterial =
  null;

let particlePoints =
  null;

let soupRenderers =
  [];

let soupMaterial =
  null;

let particleCount =
  0;

let parcelVolume =
  0;

let parcelRadius =
  0;

let sourceLayout =
  null;

let simulationStarted =
  false;

let simulationAccumulator =
  0;

let soupUpdateAccumulator =
  0;

let drawingReleaseShape =
  false;

let drawingRequiresModifier =
  true;

let drawingPoints =
  [];

let releasePolygonLocal =
  null;

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

const raycaster =
  new THREE.Raycaster();

const pointer =
  new THREE.Vector2();


/* =====================================================
   HELPERS
===================================================== */

function clamp(
  value,
  min,
  max
) {
  return Math.max(
    min,
    Math.min(
      max,
      value
    )
  );
}

function formatNumber(value) {
  return Number(value)
    .toLocaleString(
      "en-US"
    );
}

function escapeHTML(value) {
  return String(value)
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );
}

function disposeObject(object) {
  if (!object) {
    return;
  }

  if (object.parent) {
    object.parent.remove(
      object
    );
  }

  if (object.traverse) {
    object.traverse(
      (child) => {
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
      }
    );
  }
}

function cellKey(
  x,
  y,
  z
) {
  return `${x}:${y}:${z}`;
}

function hasCommandModifier(event) {
  return Boolean(
    event.metaKey ||
    event.ctrlKey
  );
}


/* =====================================================
   TERRAIN DIMENSIONS
===================================================== */

function getTerrainWidth() {
  const baseWidth =
    customTerrain
      ? customTerrain.widthModel *
        params.metersPerModelUnit
      : TERRAIN_SIZE;

  return baseWidth *
    params.modelScale;
}

function getTerrainDepth() {
  const baseDepth =
    customTerrain
      ? customTerrain.depthModel *
        params.metersPerModelUnit
      : TERRAIN_SIZE;

  return baseDepth *
    params.modelScale *
    params.depthScale;
}

function getTerrainHeightScale() {
  if (!customTerrain) {
    return params.modelScale *
      params.verticalExaggeration;
  }

  return customTerrain.heightModel *
    params.metersPerModelUnit *
    params.modelScale *
    params.verticalExaggeration;
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

function hash2D(
  x,
  z
) {
  const value =
    Math.sin(
      x * 127.1 +
      z * 311.7 +
      terrainSeed * 0.123
    ) *
    43758.5453123;

  return fract(value);
}

function valueNoise(
  x,
  z
) {
  const x0 =
    Math.floor(x);

  const z0 =
    Math.floor(z);

  const x1 =
    x0 + 1;

  const z1 =
    z0 + 1;

  const tx =
    smoothStep(
      x - x0
    );

  const tz =
    smoothStep(
      z - z0
    );

  const a =
    hash2D(
      x0,
      z0
    );

  const b =
    hash2D(
      x1,
      z0
    );

  const c =
    hash2D(
      x0,
      z1
    );

  const d =
    hash2D(
      x1,
      z1
    );

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
  let frequency =
    1;

  let amplitude =
    0.5;

  let total =
    0;

  let weight =
    0;

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

    weight +=
      amplitude;

    frequency *=
      2;

    amplitude *=
      0.5;
  }

  return total /
    weight;
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

  return combined *
    0.48;
}


/* =====================================================
   TERRAIN HEIGHT
===================================================== */

function sampleCustomTerrain(
  worldX,
  worldZ
) {
  const width =
    getTerrainWidth();

  const depth =
    getTerrainDepth();

  const normalizedX =
    clamp(
      worldX / width + 0.5,
      0,
      1
    );

  const normalizedZ =
    clamp(
      worldZ / depth + 0.5,
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

  return THREE.MathUtils.lerp(
    top,
    bottom,
    tz
  ) *
    getTerrainHeightScale();
}

function terrainHeight(
  x,
  z
) {
  if (customTerrain) {
    return sampleCustomTerrain(
      x,
      z
    );
  }

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


/* =====================================================
   TERRAIN CREATION
===================================================== */

function createTerrain() {
  disposeObject(
    terrainMesh
  );

  disposeObject(
    terrainWire
  );

  terrainMesh =
    null;

  terrainWire =
    null;

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
      terrainHeight(
        x,
        z
      ),
      z
    );
  }

  positions.needsUpdate =
    true;

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

  updateSourceVisuals();
}


/* =====================================================
   POLYGON GEOMETRY
===================================================== */

function polygonSignedArea(
  points
) {
  let area =
    0;

  for (
    let i = 0;
    i < points.length;
    i++
  ) {
    const a =
      points[i];

    const b =
      points[
        (i + 1) %
        points.length
      ];

    area +=
      a.x * b.z -
      b.x * a.z;
  }

  return area *
    0.5;
}

function polygonArea(
  points
) {
  return Math.abs(
    polygonSignedArea(
      points
    )
  );
}

function polygonCentroid(
  points
) {
  const area =
    polygonSignedArea(
      points
    );

  if (
    Math.abs(area) <
    0.000001
  ) {
    const average =
      points.reduce(
        (sum, point) => {
          sum.x +=
            point.x;

          sum.z +=
            point.z;

          return sum;
        },
        {
          x: 0,
          z: 0
        }
      );

    return {
      x:
        average.x /
        points.length,

      z:
        average.z /
        points.length
    };
  }

  let x =
    0;

  let z =
    0;

  for (
    let i = 0;
    i < points.length;
    i++
  ) {
    const a =
      points[i];

    const b =
      points[
        (i + 1) %
        points.length
      ];

    const cross =
      a.x * b.z -
      b.x * a.z;

    x +=
      (
        a.x +
        b.x
      ) *
      cross;

    z +=
      (
        a.z +
        b.z
      ) *
      cross;
  }

  return {
    x:
      x /
      (
        6 *
        area
      ),

    z:
      z /
      (
        6 *
        area
      )
  };
}

function polygonBounds(
  points
) {
  const bounds = {
    minX: Infinity,
    maxX: -Infinity,
    minZ: Infinity,
    maxZ: -Infinity
  };

  for (
    const point of points
  ) {
    bounds.minX =
      Math.min(
        bounds.minX,
        point.x
      );

    bounds.maxX =
      Math.max(
        bounds.maxX,
        point.x
      );

    bounds.minZ =
      Math.min(
        bounds.minZ,
        point.z
      );

    bounds.maxZ =
      Math.max(
        bounds.maxZ,
        point.z
      );
  }

  return bounds;
}

function pointInPolygon(
  point,
  polygon
) {
  let inside =
    false;

  for (
    let i = 0,
    j = polygon.length - 1;
    i < polygon.length;
    j = i++
  ) {
    const xi =
      polygon[i].x;

    const zi =
      polygon[i].z;

    const xj =
      polygon[j].x;

    const zj =
      polygon[j].z;

    const intersects =
      (
        zi > point.z
      ) !== (
        zj > point.z
      ) &&
      point.x <
      (
        xj - xi
      ) *
      (
        point.z - zi
      ) /
      (
        zj - zi
      ) +
      xi;

    if (
      intersects
    ) {
      inside =
        !inside;
    }
  }

  return inside;
}

function orientation(
  a,
  b,
  c
) {
  return (
    b.x - a.x
  ) *
  (
    c.z - a.z
  ) -
  (
    b.z - a.z
  ) *
  (
    c.x - a.x
  );
}

function segmentsIntersect(
  a,
  b,
  c,
  d
) {
  const epsilon =
    0.000001;

  const o1 =
    orientation(
      a,
      b,
      c
    );

  const o2 =
    orientation(
      a,
      b,
      d
    );

  const o3 =
    orientation(
      c,
      d,
      a
    );

  const o4 =
    orientation(
      c,
      d,
      b
    );

  return (
    (
      o1 > epsilon &&
      o2 < -epsilon ||
      o1 < -epsilon &&
      o2 > epsilon
    ) &&
    (
      o3 > epsilon &&
      o4 < -epsilon ||
      o3 < -epsilon &&
      o4 > epsilon
    )
  );
}

function polygonSelfIntersects(
  points
) {
  for (
    let i = 0;
    i < points.length;
    i++
  ) {
    const a =
      points[i];

    const b =
      points[
        (i + 1) %
        points.length
      ];

    for (
      let j = i + 1;
      j < points.length;
      j++
    ) {
      if (
        j === i ||
        j === (
          i + 1
        ) %
        points.length ||
        (
          j + 1
        ) %
        points.length === i
      ) {
        continue;
      }

      const c =
        points[j];

      const d =
        points[
          (j + 1) %
          points.length
        ];

      if (
        segmentsIntersect(
          a,
          b,
          c,
          d
        )
      ) {
        return true;
      }
    }
  }

  return false;
}

function getRectanglePolygonLocal() {
  const side =
    Math.sqrt(
      params.sourceArea
    );

  const half =
    side *
    0.5;

  return [
    {
      x: -half,
      z: -half
    },
    {
      x: half,
      z: -half
    },
    {
      x: half,
      z: half
    },
    {
      x: -half,
      z: half
    }
  ];
}

function hasValidCustomPolygon() {
  return (
    releasePolygonLocal &&
    releasePolygonLocal.length >= 3 &&
    polygonArea(
      releasePolygonLocal
    ) > 1
  );
}

function getReleasePolygonLocal() {
  if (
    params.releaseShapeMode ===
      "polygon"
  ) {
    return hasValidCustomPolygon()
      ? releasePolygonLocal
      : null;
  }

  return getRectanglePolygonLocal();
}

function getReleasePolygonWorld() {
  const local =
    getReleasePolygonLocal();

  if (!local) {
    return null;
  }

  return local.map(
    (point) => {
      return {
        x:
          sourceLocation.x +
          point.x,

        z:
          sourceLocation.z +
          point.z
      };
    }
  );
}

function getReleaseArea() {
  const polygon =
    getReleasePolygonLocal();

  if (!polygon) {
    return 0;
  }

  return polygonArea(
    polygon
  );
}

function getSourceHeight() {
  const area =
    getReleaseArea();

  if (
    area <= 0
  ) {
    return 0;
  }

  return params.sourceVolume /
    area;
}


/* =====================================================
   SOURCE VISUALIZATION
===================================================== */

function createReleaseOutline(
  worldPolygon
) {
  if (
    !worldPolygon ||
    worldPolygon.length < 3
  ) {
    return null;
  }

  const positions =
    new Float32Array(
      (
        worldPolygon.length +
        1
      ) *
      3
    );

  for (
    let i = 0;
    i < worldPolygon.length;
    i++
  ) {
    const point =
      worldPolygon[i];

    positions[i * 3] =
      point.x;

    positions[i * 3 + 1] =
      terrainHeight(
        point.x,
        point.z
      ) +
      SURFACE_CLEARANCE;

    positions[i * 3 + 2] =
      point.z;
  }

  const first =
    worldPolygon[0];

  const lastIndex =
    worldPolygon.length;

  positions[lastIndex * 3] =
    first.x;

  positions[lastIndex * 3 + 1] =
    terrainHeight(
      first.x,
      first.z
    ) +
    SURFACE_CLEARANCE;

  positions[lastIndex * 3 + 2] =
    first.z;

  const geometry =
    new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(
      positions,
      3
    )
  );

  const line =
    new THREE.Line(
      geometry,
      new THREE.LineBasicMaterial({
        color: 0x9bd7d0,
        transparent: true,
        opacity: 0.95,
        depthTest: false
      })
    );

  line.renderOrder =
    40;

  return line;
}

function createReleaseVolumeMesh(
  worldPolygon
) {
  if (
    !worldPolygon ||
    worldPolygon.length < 3
  ) {
    return null;
  }

  const vertexCount =
    worldPolygon.length;

  const height =
    getSourceHeight();

  const positions =
    new Float32Array(
      vertexCount *
      2 *
      3
    );

  for (
    let i = 0;
    i < vertexCount;
    i++
  ) {
    const point =
      worldPolygon[i];

    const groundY =
      terrainHeight(
        point.x,
        point.z
      ) +
      SURFACE_CLEARANCE;

    positions[i * 3] =
      point.x;

    positions[i * 3 + 1] =
      groundY;

    positions[i * 3 + 2] =
      point.z;

    const topIndex =
      vertexCount +
      i;

    positions[topIndex * 3] =
      point.x;

    positions[topIndex * 3 + 1] =
      groundY +
      height;

    positions[topIndex * 3 + 2] =
      point.z;
  }

  const polygon2D =
    worldPolygon.map(
      (point) => {
        return new THREE.Vector2(
          point.x,
          point.z
        );
      }
    );

  const triangles =
    THREE.ShapeUtils.triangulateShape(
      polygon2D,
      []
    );

  const indices =
    [];

  for (
    const triangle of triangles
  ) {
    const a =
      triangle[0];

    const b =
      triangle[1];

    const c =
      triangle[2];

    indices.push(
      vertexCount + a,
      vertexCount + b,
      vertexCount + c
    );

    indices.push(
      c,
      b,
      a
    );
  }

  for (
    let i = 0;
    i < vertexCount;
    i++
  ) {
    const next =
      (
        i + 1
      ) %
      vertexCount;

    const baseA =
      i;

    const baseB =
      next;

    const topA =
      vertexCount +
      i;

    const topB =
      vertexCount +
      next;

    indices.push(
      baseA,
      baseB,
      topB
    );

    indices.push(
      baseA,
      topB,
      topA
    );
  }

  const geometry =
    new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(
      positions,
      3
    )
  );

  geometry.setIndex(
    indices
  );

  geometry.computeVertexNormals();

  const mesh =
    new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({
        color: 0x54b8b3,
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide,
        depthWrite: false
      })
    );

  mesh.renderOrder =
    20;

  return mesh;
}

function updateReleaseShapeControls() {
  const polygonMode =
    params.releaseShapeMode ===
    "polygon";

  rectangleAreaControl.classList.toggle(
    "hidden",
    polygonMode
  );

  customShapeControl.classList.toggle(
    "hidden",
    !polygonMode
  );

  sourceAreaInput.disabled =
    polygonMode;

  sourceAreaNumber.disabled =
    polygonMode;

  if (
    polygonMode &&
    hasValidCustomPolygon()
  ) {
    releaseAreaReadout.textContent =
      `DRAWN AREA ${formatNumber(
        getReleaseArea()
      )} m²`;
  } else if (
    polygonMode
  ) {
    releaseAreaReadout.textContent =
      "NO CUSTOM SHAPE";
  } else {
    releaseAreaReadout.textContent =
      `AREA ${formatNumber(
        getReleaseArea()
      )} m²`;
  }
}

function updateSourceVisuals() {
  disposeObject(
    releaseOutline
  );

  disposeObject(
    releaseVolumePreview
  );

  releaseOutline =
    null;

  releaseVolumePreview =
    null;

  const worldPolygon =
    getReleasePolygonWorld();

  if (
    worldPolygon
  ) {
    releaseOutline =
      createReleaseOutline(
        worldPolygon
      );

    releaseVolumePreview =
      createReleaseVolumeMesh(
        worldPolygon
      );

    if (
      releaseOutline
    ) {
      releaseOutline.visible =
        !simulationStarted &&
        !drawingReleaseShape;

      scene.add(
        releaseOutline
      );
    }

    if (
      releaseVolumePreview
    ) {
      releaseVolumePreview.visible =
        !simulationStarted &&
        !drawingReleaseShape;

      scene.add(
        releaseVolumePreview
      );
    }
  }

  updateReleaseShapeControls();
}


/* =====================================================
   DRAWING CUSTOM SHAPE
===================================================== */

function getTerrainIntersection(
  event
) {
  if (
    !terrainMesh
  ) {
    return null;
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

  return intersections.length
    ? intersections[0].point
    : null;
}

function setDrawingPreview(
  extraPoint = null
) {
  disposeObject(
    drawingPreviewLine
  );

  drawingPreviewLine =
    null;

  const points =
    drawingPoints.slice();

  if (
    extraPoint
  ) {
    points.push(
      {
        x: extraPoint.x,
        z: extraPoint.z
      }
    );
  }

  if (
    points.length < 2
  ) {
    return;
  }

  const positions =
    new Float32Array(
      points.length *
      3
    );

  for (
    let i = 0;
    i < points.length;
    i++
  ) {
    const point =
      points[i];

    positions[i * 3] =
      point.x;

    positions[i * 3 + 1] =
      terrainHeight(
        point.x,
        point.z
      ) +
      SURFACE_CLEARANCE *
      2;

    positions[i * 3 + 2] =
      point.z;
  }

  const geometry =
    new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(
      positions,
      3
    )
  );

  drawingPreviewLine =
    new THREE.Line(
      geometry,
      new THREE.LineBasicMaterial({
        color: 0xffd166,
        transparent: true,
        opacity: 0.95,
        depthTest: false
      })
    );

  drawingPreviewLine.renderOrder =
    50;

  scene.add(
    drawingPreviewLine
  );
}

function startDrawingReleaseShape(
  requiresModifier = true
) {
  if (
    drawingReleaseShape
  ) {
    return;
  }

  if (
    !terrainMesh
  ) {
    setStatus(
      "NO TERRAIN AVAILABLE"
    );

    return;
  }

  stopSimulation(
    true
  );

  params.releaseShapeMode =
    "polygon";

  releaseShapeModeInput.value =
    "polygon";

  drawingReleaseShape =
    true;

  drawingRequiresModifier =
    requiresModifier;

  drawingPoints =
    [];

  controls.enabled =
    false;

  renderer.domElement.classList.add(
    "drawing"
  );

  updateSourceVisuals();

  drawShapeHint.textContent =
    requiresModifier
      ? "Hold CMD and left-click each terrain point. Press ENTER to finish."
      : "Left-click terrain points. Press ENTER to finish.";

  setStatus(
    requiresModifier
      ? "CMD + CLICK TO DRAW"
      : "DRAWING RELEASE SHAPE"
  );
}

function cancelDrawingReleaseShape() {
  drawingReleaseShape =
    false;

  drawingPoints =
    [];

  controls.enabled =
    true;

  renderer.domElement.classList.remove(
    "drawing"
  );

  disposeObject(
    drawingPreviewLine
  );

  drawingPreviewLine =
    null;

  updateSourceVisuals();

  setStatus(
    "DRAWING CANCELLED"
  );
}

function finishDrawingReleaseShape() {
  if (
    !drawingReleaseShape
  ) {
    return;
  }

  let points =
    drawingPoints.slice();

  if (
    points.length >= 2
  ) {
    const first =
      points[0];

    const last =
      points[
        points.length - 1
      ];

    if (
      Math.hypot(
        first.x - last.x,
        first.z - last.z
      ) < 0.5
    ) {
      points =
        points.slice(
          0,
          -1
        );
    }
  }

  if (
    points.length < 3
  ) {
    setStatus(
      "ADD AT LEAST 3 POINTS"
    );

    return;
  }

  if (
    polygonSelfIntersects(
      points
    )
  ) {
    setStatus(
      "SHAPE LINES MAY NOT CROSS"
    );

    return;
  }

  const area =
    polygonArea(
      points
    );

  if (
    area < 1
  ) {
    setStatus(
      "CUSTOM SHAPE IS TOO SMALL"
    );

    return;
  }

  const centroid =
    polygonCentroid(
      points
    );

  releasePolygonLocal =
    points.map(
      (point) => {
        return {
          x:
            point.x -
            centroid.x,

          z:
            point.z -
            centroid.z
        };
      }
    );

  sourceLocation.x =
    centroid.x;

  sourceLocation.z =
    centroid.z;

  params.releaseShapeMode =
    "polygon";

  releaseShapeModeInput.value =
    "polygon";

  drawingReleaseShape =
    false;

  drawingPoints =
    [];

  controls.enabled =
    true;

  renderer.domElement.classList.remove(
    "drawing"
  );

  disposeObject(
    drawingPreviewLine
  );

  drawingPreviewLine =
    null;

  createParticles();
  updateSourceVisuals();

  drawShapeHint.textContent =
    "Custom polygon active. Hold CMD and click DRAW RELEASE SHAPE to replace it.";

  setStatus(
    `CUSTOM AREA ${formatNumber(
      area
    )} m²`
  );
}

function clearCustomReleaseShape() {
  releasePolygonLocal =
    null;

  params.releaseShapeMode =
    "rectangle";

  releaseShapeModeInput.value =
    "rectangle";

  cancelDrawingReleaseShape();

  createParticles();
  updateSourceVisuals();

  setStatus(
    "CUSTOM SHAPE CLEARED"
  );
}


/* =====================================================
   PARTICLE COUNT
===================================================== */

function getRequestedParticleCount() {
  return Math.max(
    1,
    Math.round(
      params.sourceVolume *
      params.particleDensity
    )
  );
}

function getParticleCount() {
  return Math.min(
    MAX_SIMULATED_PARTICLES,
    getRequestedParticleCount()
  );
}

function updateParticleCountStatus() {
  if (
    !particleCountStatus
  ) {
    return;
  }

  const requested =
    getRequestedParticleCount();

  const simulated =
    getParticleCount();

  particleCountStatus.textContent =
    requested === simulated
      ? `${formatNumber(
          requested
        )} PARTICLES`
      : `${formatNumber(
          simulated
        )} / ${formatNumber(
          requested
        )} PARTICLES`;
}


/* =====================================================
   START DIRECTION
===================================================== */

function updateDirectionControls() {
  const mode =
    params.startDirectionMode;

  fixedDirectionControl.classList.toggle(
    "hidden",
    mode !== "fixed"
  );

  userDirectionXControl.classList.toggle(
    "hidden",
    mode !== "vector"
  );

  userDirectionZControl.classList.toggle(
    "hidden",
    mode !== "vector"
  );
}

function getLaunchDirection(
  x,
  z
) {
  const mode =
    params.startDirectionMode;

  let directionX =
    0;

  let directionZ =
    1;

  if (
    mode ===
    "downhill"
  ) {
    const gradient =
      terrainGradient(
        x,
        z
      );

    directionX =
      -gradient.dx;

    directionZ =
      -gradient.dz;
  }

  if (
    mode ===
    "fixed"
  ) {
    const angle =
      THREE.MathUtils.degToRad(
        params.directionAngle
      );

    directionX =
      Math.sin(
        angle
      );

    directionZ =
      Math.cos(
        angle
      );
  }

  if (
    mode ===
    "radial"
  ) {
    directionX =
      x -
      sourceLocation.x;

    directionZ =
      z -
      sourceLocation.z;

    if (
      Math.hypot(
        directionX,
        directionZ
      ) < 0.0001
    ) {
      directionX =
        0;

      directionZ =
        1;
    }
  }

  if (
    mode ===
    "vector"
  ) {
    directionX =
      params.directionX;

    directionZ =
      params.directionZ;
  }

  const length =
    Math.hypot(
      directionX,
      directionZ
    );

  if (
    length < 0.0001
  ) {
    return {
      x: 0,
      z: 1
    };
  }

  return {
    x:
      directionX /
      length,

    z:
      directionZ /
      length
  };
}


/* =====================================================
   TERRAIN GRADIENT
===================================================== */

function terrainGradient(
  x,
  z
) {
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
      (
        right -
        left
      ) /
      (
        2 *
        distance
      ),

    dz:
      (
        front -
        back
      ) /
      (
        2 *
        distance
      )
  };
}


/* =====================================================
   SOURCE PARTICLE DISTRIBUTION
===================================================== */

function generateInteriorPoints(
  polygon,
  count
) {
  const bounds =
    polygonBounds(
      polygon
    );

  const width =
    Math.max(
      bounds.maxX -
        bounds.minX,
      0.001
    );

  const depth =
    Math.max(
      bounds.maxZ -
        bounds.minZ,
      0.001
    );

  const aspect =
    width /
    depth;

  const columns =
    Math.max(
      1,
      Math.ceil(
        Math.sqrt(
          count *
          aspect
        )
      )
    );

  const rows =
    Math.max(
      1,
      Math.ceil(
        count /
        columns
      )
    );

  const points =
    [];

  for (
    let row = 0;
    row < rows;
    row++
  ) {
    for (
      let column = 0;
      column < columns;
      column++
    ) {
      const point = {
        x:
          bounds.minX +
          (
            column +
            0.5
          ) /
          columns *
          width,

        z:
          bounds.minZ +
          (
            row +
            0.5
          ) /
          rows *
          depth
      };

      if (
        pointInPolygon(
          point,
          polygon
        )
      ) {
        points.push(
          point
        );
      }
    }
  }

  if (
    points.length === 0
  ) {
    const center =
      polygonCentroid(
        polygon
      );

    points.push(
      center
    );
  }

  while (
    points.length <
    count
  ) {
    points.push(
      points[
        points.length %
        points.length
      ]
    );
  }

  return points.slice(
    0,
    count
  );
}

function createSourceLayout() {
  const polygon =
    getReleasePolygonLocal() ||
    getRectanglePolygonLocal();

  const area =
    Math.max(
      getReleaseArea(),
      1
    );

  const sourceHeight =
    params.sourceVolume /
    area;

  const diameter =
    parcelRadius *
    2;

  const layers =
    Math.max(
      1,
      Math.ceil(
        sourceHeight /
        Math.max(
          diameter,
          0.001
        )
      )
    );

  const pointsPerLayer =
    Math.max(
      1,
      Math.ceil(
        particleCount /
        layers
      )
    );

  const positions =
    generateInteriorPoints(
      polygon,
      pointsPerLayer
    );

  return {
    layers,
    pointsPerLayer,
    positions,

    verticalSpacing:
      Math.max(
        diameter *
        1.02,
        sourceHeight /
        layers
      )
  };
}

function getParticleVisualRadius() {
  return params.particleVisualization ===
    "points"
    ? parcelRadius *
      params.particleSize
    : parcelRadius;
}

function placeParticleAtSource(
  particle
) {
  if (
    !sourceLayout
  ) {
    return;
  }

  const layer =
    Math.floor(
      particle.sourceIndex /
      sourceLayout.pointsPerLayer
    );

  const slot =
    particle.sourceIndex %
    sourceLayout.pointsPerLayer;

  const local =
    sourceLayout.positions[
      slot
    ];

  const x =
    sourceLocation.x +
    local.x;

  const z =
    sourceLocation.z +
    local.z;

  const groundY =
    terrainHeight(
      x,
      z
    );

  particle.x =
    x;

  particle.y =
    groundY +
    getParticleVisualRadius() +
    layer *
    sourceLayout.verticalSpacing;

  particle.z =
    z;

  const direction =
    getLaunchDirection(
      x,
      z
    );

  particle.vx =
    direction.x *
    params.startVelocity;

  particle.vy =
    0;

  particle.vz =
    direction.z *
    params.startVelocity;

  particle.age =
    0;

  particle.launchAge =
    0;

  particle.distanceTraveled =
    0;

  particle.speed =
    0;

  particle.thickness =
    0;

  particle.deposited =
    false;
}

function createRandomParticle(
  sourceIndex
) {
  const particle = {
    x: 0,
    y: 0,
    z: 0,

    vx: 0,
    vy: 0,
    vz: 0,

    age: 0,
    launchAge: 0,
    distanceTraveled: 0,
    speed: 0,
    thickness: 0,

    deposited: false,
    sourceIndex,

    color:
      new THREE.Color(
        0x9bd7d0
      )
  };

  placeParticleAtSource(
    particle
  );

  return particle;
}

function resetParticle(
  particle
) {
  particle.vx =
    0;

  particle.vy =
    0;

  particle.vz =
    0;

  placeParticleAtSource(
    particle
  );
}


/* =====================================================
   PARTICLE METRICS
===================================================== */

function updateParticleMetrics() {
  let maxSpeed =
    0;

  let maxDistance =
    0;

  let maxAge =
    0;

  const cellSize =
    Math.max(
      parcelRadius * 4,
      Math.min(
        getTerrainWidth(),
        getTerrainDepth()
      ) /
      128
    );

  const cells =
    new Map();

  for (
    const particle of particles
  ) {
    particle.speed =
      Math.hypot(
        particle.vx,
        particle.vy,
        particle.vz
      );

    maxSpeed =
      Math.max(
        maxSpeed,
        particle.speed
      );

    maxDistance =
      Math.max(
        maxDistance,
        particle.distanceTraveled
      );

    maxAge =
      Math.max(
        maxAge,
        particle.age
      );

    const x =
      Math.floor(
        particle.x /
        cellSize
      );

    const z =
      Math.floor(
        particle.z /
        cellSize
      );

    const key =
      `${x}:${z}`;

    cells.set(
      key,
      (
        cells.get(
          key
        ) || 0
      ) +
      parcelVolume
    );
  }

  let maxThickness =
    0;

  for (
    const particle of particles
  ) {
    const x =
      Math.floor(
        particle.x /
        cellSize
      );

    const z =
      Math.floor(
        particle.z /
        cellSize
      );

    let localVolume =
      0;

    for (
      let dx = -1;
      dx <= 1;
      dx++
    ) {
      for (
        let dz = -1;
        dz <= 1;
        dz++
      ) {
        localVolume +=
          cells.get(
            `${x + dx}:${z + dz}`
          ) || 0;
      }
    }

    particle.thickness =
      localVolume /
      (
        cellSize *
        cellSize
      );

    maxThickness =
      Math.max(
        maxThickness,
        particle.thickness
      );
  }

  const metrics = {
    maxSpeed:
      Math.max(
        maxSpeed,
        params.startVelocity,
        0.1
      ),

    maxDistance:
      Math.max(
        maxDistance,
        0.1
      ),

    maxThickness:
      Math.max(
        maxThickness,
        0.0001
      ),

    maxAge:
      Math.max(
        maxAge,
        0.1
      )
  };

  for (
    const particle of particles
  ) {
    updateParticleColor(
      particle,
      metrics
    );
  }
}

function updateParticleColor(
  particle,
  metrics
) {
  if (
    params.colorMode ===
    "material"
  ) {
    particle.color.setHex(
      0x9bd7d0
    );

    return;
  }

  let value =
    0;

  if (
    params.colorMode ===
    "velocity"
  ) {
    value =
      particle.speed /
      metrics.maxSpeed;
  }

  if (
    params.colorMode ===
    "distance"
  ) {
    value =
      particle.distanceTraveled /
      metrics.maxDistance;
  }

  if (
    params.colorMode ===
    "thickness"
  ) {
    value =
      particle.thickness /
      metrics.maxThickness;
  }

  if (
    params.colorMode ===
    "age"
  ) {
    value =
      particle.age /
      Math.max(
        metrics.maxAge,
        params.launchDuration
      );
  }

  value =
    clamp(
      value,
      0,
      1
    );

  particle.color.setHSL(
    0.66 -
      value *
      0.66,
    0.86,
    0.54
  );
}


/* =====================================================
   POINT PARTICLES
===================================================== */

function getProjectionScale() {
  const size =
    new THREE.Vector2();

  renderer.getDrawingBufferSize(
    size
  );

  return size.y /
    (
      2 *
      Math.tan(
        THREE.MathUtils.degToRad(
          camera.fov *
          0.5
        )
      )
    );
}

function createPointParticles() {
  updateParticleMetrics();

  const positions =
    new Float32Array(
      particleCount *
      3
    );

  const radii =
    new Float32Array(
      particleCount
    );

  const colors =
    new Float32Array(
      particleCount *
      3
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
      parcelRadius;

    colors[i * 3] =
      particle.color.r;

    colors[i * 3 + 1] =
      particle.color.g;

    colors[i * 3 + 2] =
      particle.color.b;
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

  particleGeometry.setAttribute(
    "particleColor",
    new THREE.BufferAttribute(
      colors,
      3
    )
  );

  particleMaterial =
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: true,

      uniforms: {
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
        attribute vec3 particleColor;

        varying vec3 vParticleColor;

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
              max(
                1.0,
                -modelPosition.z
              )
            );

          vParticleColor =
            particleColor;
        }
      `,

      fragmentShader: `
        varying vec3 vParticleColor;

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
              vParticleColor,
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

  particlePoints.renderOrder =
    30;

  /*
    Keep points visible even while paused
    and before the first simulation frame.
  */
  particlePoints.visible =
    true;

  scene.add(
    particlePoints
  );
}

function syncPointParticles() {
  if (
    !particleGeometry
  ) {
    return;
  }

  updateParticleMetrics();

  const positions =
    particleGeometry
      .attributes
      .position
      .array;

  const colors =
    particleGeometry
      .attributes
      .particleColor
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

    colors[i * 3] =
      particle.color.r;

    colors[i * 3 + 1] =
      particle.color.g;

    colors[i * 3 + 2] =
      particle.color.b;
  }

  particleGeometry
    .attributes
    .position
    .needsUpdate =
    true;

  particleGeometry
    .attributes
    .particleColor
    .needsUpdate =
    true;

  particlePoints.visible =
    true;
}

function updatePointMaterial() {
  if (
    particleMaterial &&
    particleMaterial.uniforms
  ) {
    particleMaterial
      .uniforms
      .pointSize
      .value =
      params.particleSize;

    particleMaterial
      .uniforms
      .projectionScale
      .value =
      getProjectionScale();
  }
}


/* =====================================================
   PARTICLE GRID
===================================================== */

function buildParticleGrid(
  cellSize
) {
  const grid =
    new Map();

  for (
    let i = 0;
    i < particles.length;
    i++
  ) {
    const particle =
      particles[i];

    const x =
      Math.floor(
        particle.x /
        cellSize
      );

    const y =
      Math.floor(
        particle.y /
        cellSize
      );

    const z =
      Math.floor(
        particle.z /
        cellSize
      );

    const key =
      cellKey(
        x,
        y,
        z
      );

    let bucket =
      grid.get(
        key
      );

    if (
      !bucket
    ) {
      bucket =
        [];

      grid.set(
        key,
        bucket
      );
    }

    bucket.push(
      i
    );
  }

  return grid;
}


/* =====================================================
   COHESION
===================================================== */

function applyCohesionForces(
  deltaTime
) {
  const cohesion =
    params.particleCohesion;

  if (
    cohesion <= 0 ||
    particles.length < 2
  ) {
    return;
  }

  const diameter =
    parcelRadius *
    2;

  const interactionDistance =
    diameter *
    (
      1.1 +
      cohesion *
      COHESION_RANGE_MULTIPLIER
    );

  const grid =
    buildParticleGrid(
      interactionDistance
    );

  for (
    let i = 0;
    i < particles.length;
    i++
  ) {
    const a =
      particles[i];

    const cellX =
      Math.floor(
        a.x /
        interactionDistance
      );

    const cellY =
      Math.floor(
        a.y /
        interactionDistance
      );

    const cellZ =
      Math.floor(
        a.z /
        interactionDistance
      );

    for (
      let ox = -1;
      ox <= 1;
      ox++
    ) {
      for (
        let oy = -1;
        oy <= 1;
        oy++
      ) {
        for (
          let oz = -1;
          oz <= 1;
          oz++
        ) {
          const bucket =
            grid.get(
              cellKey(
                cellX + ox,
                cellY + oy,
                cellZ + oz
              )
            );

          if (
            !bucket
          ) {
            continue;
          }

          for (
            const j of bucket
          ) {
            if (
              j <= i
            ) {
              continue;
            }

            const b =
              particles[j];

            const dx =
              b.x - a.x;

            const dy =
              b.y - a.y;

            const dz =
              b.z - a.z;

            const distance =
              Math.hypot(
                dx,
                dy,
                dz
              );

            if (
              distance <= diameter ||
              distance >=
                interactionDistance
            ) {
              continue;
            }

            const nx =
              dx /
              distance;

            const ny =
              dy /
              distance;

            const nz =
              dz /
              distance;

            const falloff =
              (
                interactionDistance -
                distance
              ) /
              (
                interactionDistance -
                diameter
              );

            const force =
              cohesion *
              5 *
              falloff *
              falloff *
              deltaTime;

            a.vx +=
              nx *
              force;

            a.vy +=
              ny *
              force;

            a.vz +=
              nz *
              force;

            b.vx -=
              nx *
              force;

            b.vy -=
              ny *
              force;

            b.vz -=
              nz *
              force;
          }
        }
      }
    }
  }
}


/* =====================================================
   TERRAIN CONTACT AND COLLISIONS
===================================================== */

function applyTerrainContact(
  particle,
  deltaTime
) {
  const groundY =
    terrainHeight(
      particle.x,
      particle.z
    ) +
    getParticleVisualRadius() +
    SURFACE_CLEARANCE;

  if (
    particle.y <
    groundY
  ) {
    particle.y =
      groundY;

    if (
      particle.vy < 0
    ) {
      particle.vy =
        0;
    }
  }

  if (
    particle.y <=
    groundY +
    0.01
  ) {
    const damping =
      Math.exp(
        -params.terrainFriction *
        8 *
        deltaTime
      );

    particle.vx *=
      damping;

    particle.vz *=
      damping;

    if (
      Math.abs(
        particle.vy
      ) < 0.5
    ) {
      particle.vy =
        0;
    }
  }
}

function resolveParticleCollisions() {
  if (
    particles.length < 2
  ) {
    return;
  }

  const minimumDistance =
    parcelRadius *
    2;

  const cellSize =
    minimumDistance *
    1.1;

  const grid =
    buildParticleGrid(
      cellSize
    );

  for (
    let i = 0;
    i < particles.length;
    i++
  ) {
    const a =
      particles[i];

    const cellX =
      Math.floor(
        a.x /
        cellSize
      );

    const cellY =
      Math.floor(
        a.y /
        cellSize
      );

    const cellZ =
      Math.floor(
        a.z /
        cellSize
      );

    for (
      let ox = -1;
      ox <= 1;
      ox++
    ) {
      for (
        let oy = -1;
        oy <= 1;
        oy++
      ) {
        for (
          let oz = -1;
          oz <= 1;
          oz++
        ) {
          const bucket =
            grid.get(
              cellKey(
                cellX + ox,
                cellY + oy,
                cellZ + oz
              )
            );

          if (
            !bucket
          ) {
            continue;
          }

          for (
            const j of bucket
          ) {
            if (
              j <= i
            ) {
              continue;
            }

            const b =
              particles[j];

            let dx =
              b.x - a.x;

            let dy =
              b.y - a.y;

            let dz =
              b.z - a.z;

            let distance =
              Math.hypot(
                dx,
                dy,
                dz
              );

            if (
              distance >=
              minimumDistance
            ) {
              continue;
            }

            if (
              distance < 0.000001
            ) {
              dx =
                1;

              dy =
                0;

              dz =
                0;

              distance =
                1;
            }

            const nx =
              dx /
              distance;

            const ny =
              dy /
              distance;

            const nz =
              dz /
              distance;

            const penetration =
              minimumDistance -
              distance;

            const correction =
              penetration *
              0.5;

            a.x -=
              nx *
              correction;

            a.y -=
              ny *
              correction;

            a.z -=
              nz *
              correction;

            b.x +=
              nx *
              correction;

            b.y +=
              ny *
              correction;

            b.z +=
              nz *
              correction;

            const relativeVx =
              b.vx - a.vx;

            const relativeVy =
              b.vy - a.vy;

            const relativeVz =
              b.vz - a.vz;

            const normalVelocity =
              relativeVx * nx +
              relativeVy * ny +
              relativeVz * nz;

            if (
              normalVelocity < 0
            ) {
              const impulse =
                -normalVelocity *
                0.5;

              a.vx -=
                nx *
                impulse;

              a.vy -=
                ny *
                impulse;

              a.vz -=
                nz *
                impulse;

              b.vx +=
                nx *
                impulse;

              b.vy +=
                ny *
                impulse;

              b.vz +=
                nz *
                impulse;

              const tangentVx =
                relativeVx -
                normalVelocity *
                nx;

              const tangentVy =
                relativeVy -
                normalVelocity *
                ny;

              const tangentVz =
                relativeVz -
                normalVelocity *
                nz;

              const tangentLength =
                Math.hypot(
                  tangentVx,
                  tangentVy,
                  tangentVz
                );

              if (
                tangentLength >
                0.000001
              ) {
                const tangentImpulse =
                  Math.min(
                    tangentLength,
                    impulse *
                    params.materialFriction
                  );

                const tx =
                  tangentVx /
                  tangentLength;

                const ty =
                  tangentVy /
                  tangentLength;

                const tz =
                  tangentVz /
                  tangentLength;

                a.vx +=
                  tx *
                  tangentImpulse *
                  0.5;

                a.vy +=
                  ty *
                  tangentImpulse *
                  0.5;

                a.vz +=
                  tz *
                  tangentImpulse *
                  0.5;

                b.vx -=
                  tx *
                  tangentImpulse *
                  0.5;

                b.vy -=
                  ty *
                  tangentImpulse *
                  0.5;

                b.vz -=
                  tz *
                  tangentImpulse *
                  0.5;
              }
            }
          }
        }
      }
    }
  }
}


/* =====================================================
   PHYSICS
===================================================== */

function updatePhysics(
  deltaTime
) {
  const downhillForce =
    2;

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
    const particle of particles
  ) {
    particle.age +=
      deltaTime;

    particle.launchAge +=
      deltaTime;

    const gradient =
      terrainGradient(
        particle.x,
        particle.z
      );

    const downhillFactor =
      params.startDirectionMode ===
      "downhill"
        ? 1
        : 0.35;

    particle.vx +=
      -gradient.dx *
      downhillForce *
      downhillFactor *
      deltaTime;

    particle.vz +=
      -gradient.dz *
      downhillForce *
      downhillFactor *
      deltaTime;

    particle.vy -=
      9.81 *
      deltaTime;

    particle.vx *=
      frictionFactor;

    particle.vz *=
      frictionFactor;

    const horizontalSpeed =
      Math.hypot(
        particle.vx,
        particle.vz
      );

    if (
      particle.launchAge <
        params.launchDuration &&
      params.startVelocity > 0 &&
      horizontalSpeed <
        Math.max(
          params.startVelocity,
          params.minimumMovementSpeed
        )
    ) {
      const direction =
        getLaunchDirection(
          particle.x,
          particle.z
        );

      const targetSpeed =
        Math.max(
          params.startVelocity,
          params.minimumMovementSpeed
        );

      particle.vx =
        direction.x *
        targetSpeed;

      particle.vz =
        direction.z *
        targetSpeed;
    }
  }

  applyCohesionForces(
    deltaTime
  );

  for (
    const particle of particles
  ) {
    const oldX =
      particle.x;

    const oldY =
      particle.y;

    const oldZ =
      particle.z;

    particle.x +=
      particle.vx *
      deltaTime;

    particle.y +=
      particle.vy *
      deltaTime;

    particle.z +=
      particle.vz *
      deltaTime;

    particle.distanceTraveled +=
      Math.hypot(
        particle.x -
          oldX,

        particle.y -
          oldY,

        particle.z -
          oldZ
      );

    const speed =
      Math.hypot(
        particle.vx,
        particle.vz
      );

    particle.deposited =
      particle.launchAge >=
        params.launchDuration &&
      speed <
        settlingThreshold;
  }

  for (
    let iteration = 0;
    iteration < COLLISION_ITERATIONS;
    iteration++
  ) {
    for (
      const particle of particles
    ) {
      applyTerrainContact(
        particle,
        deltaTime
      );
    }

    resolveParticleCollisions();

    for (
      const particle of particles
    ) {
      applyTerrainContact(
        particle,
        deltaTime
      );
    }
  }

  for (
    const particle of particles
  ) {
    const outside =
      particle.x <
        -terrainWidth * 0.62 ||
      particle.x >
        terrainWidth * 0.62 ||
      particle.z <
        -terrainDepth * 0.62 ||
      particle.z >
        terrainDepth * 0.62;

    if (
      outside ||
      particle.age > 45
    ) {
      resetParticle(
        particle
      );
    }
  }
}

function simulateFrame(
  frameDelta
) {
  simulationAccumulator +=
    frameDelta *
    params.simulationSpeed;

  let substeps =
    0;

  while (
    simulationAccumulator >=
      PHYSICS_STEP &&
    substeps <
      MAX_PHYSICS_SUBSTEPS
  ) {
    updatePhysics(
      PHYSICS_STEP
    );

    simulationAccumulator -=
      PHYSICS_STEP;

    substeps++;
  }

  if (
    substeps >=
    MAX_PHYSICS_SUBSTEPS
  ) {
    simulationAccumulator =
      0;
  }
}


/* =====================================================
   SOUP
===================================================== */

function clearSoupRenderers() {
  for (
    const soup of soupRenderers
  ) {
    if (
      soup.parent
    ) {
      soup.parent.remove(
        soup
      );
    }

    if (
      soup.geometry
    ) {
      soup.geometry.dispose();
    }
  }

  soupRenderers =
    [];

  if (
    soupMaterial
  ) {
    soupMaterial.dispose();

    soupMaterial =
      null;
  }
}

function getSoupLinkDistance() {
  return parcelRadius *
    2 *
    params.soupLinkRange;
}

function buildParticleComponents() {
  const linkDistance =
    Math.max(
      getSoupLinkDistance(),
      parcelRadius
    );

  const linkDistanceSquared =
    linkDistance *
    linkDistance;

  const grid =
    buildParticleGrid(
      linkDistance
    );

  const visited =
    new Uint8Array(
      particles.length
    );

  const components =
    [];

  for (
    let start = 0;
    start < particles.length;
    start++
  ) {
    if (
      visited[start]
    ) {
      continue;
    }

    const component =
      [];

    const stack =
      [start];

    visited[start] =
      1;

    while (
      stack.length
    ) {
      const index =
        stack.pop();

      component.push(
        index
      );

      const particle =
        particles[index];

      const cellX =
        Math.floor(
          particle.x /
          linkDistance
        );

      const cellY =
        Math.floor(
          particle.y /
          linkDistance
        );

      const cellZ =
        Math.floor(
          particle.z /
          linkDistance
        );

      for (
        let ox = -1;
        ox <= 1;
        ox++
      ) {
        for (
          let oy = -1;
          oy <= 1;
          oy++
        ) {
          for (
            let oz = -1;
            oz <= 1;
            oz++
          ) {
            const bucket =
              grid.get(
                cellKey(
                  cellX + ox,
                  cellY + oy,
                  cellZ + oz
                )
              );

            if (
              !bucket
            ) {
              continue;
            }

            for (
              const candidateIndex of bucket
            ) {
              if (
                visited[
                  candidateIndex
                ]
              ) {
                continue;
              }

              const candidate =
                particles[
                  candidateIndex
                ];

              const dx =
                candidate.x -
                particle.x;

              const dy =
                candidate.y -
                particle.y;

              const dz =
                candidate.z -
                particle.z;

              const distanceSquared =
                dx * dx +
                dy * dy +
                dz * dz;

              if (
                distanceSquared <=
                linkDistanceSquared
              ) {
                visited[
                  candidateIndex
                ] =
                  1;

                stack.push(
                  candidateIndex
                );
              }
            }
          }
        }
      }
    }

    components.push(
      component
    );
  }

  components.sort(
    (a, b) => {
      return b.length -
        a.length;
    }
  );

  return {
    components,
    linkDistance
  };
}

function getComponentBounds(
  component
) {
  const bounds = {
    minX: Infinity,
    maxX: -Infinity,
    minY: Infinity,
    maxY: -Infinity,
    minZ: Infinity,
    maxZ: -Infinity
  };

  for (
    const index of component
  ) {
    const particle =
      particles[index];

    bounds.minX =
      Math.min(
        bounds.minX,
        particle.x
      );

    bounds.maxX =
      Math.max(
        bounds.maxX,
        particle.x
      );

    bounds.minY =
      Math.min(
        bounds.minY,
        particle.y
      );

    bounds.maxY =
      Math.max(
        bounds.maxY,
        particle.y
      );

    bounds.minZ =
      Math.min(
        bounds.minZ,
        particle.z
      );

    bounds.maxZ =
      Math.max(
        bounds.maxZ,
        particle.z
      );
  }

  return bounds;
}

function ensureSoupRenderers(
  count
) {
  if (
    !soupMaterial
  ) {
    soupMaterial =
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.82,
        metalness: 0,
        side: THREE.DoubleSide,
        vertexColors: true
      });
  }

  while (
    soupRenderers.length <
    count
  ) {
    const soup =
      new MarchingCubes(
        32,
        soupMaterial,
        false,
        true,
        50000
      );

    soup.enableUvs =
      false;

    soup.enableColors =
      true;

    soup.isolation =
      80;

    soup.frustumCulled =
      false;

    soup.visible =
      false;

    soup.renderOrder =
      25;

    soupRenderers.push(
      soup
    );

    scene.add(
      soup
    );
  }

  while (
    soupRenderers.length >
    count
  ) {
    const soup =
      soupRenderers.pop();

    if (
      soup.parent
    ) {
      soup.parent.remove(
        soup
      );
    }

    if (
      soup.geometry
    ) {
      soup.geometry.dispose();
    }
  }
}

function updateSoupRenderer(
  force = false
) {
  if (
    !simulationStarted ||
    params.particleVisualization !==
      "soup" ||
    !particles.length
  ) {
    return;
  }

  if (
    !force &&
    soupUpdateAccumulator <
      SOUP_UPDATE_INTERVAL
  ) {
    return;
  }

  soupUpdateAccumulator =
    0;

  updateParticleMetrics();

  const data =
    buildParticleComponents();

  /*
    Very small components are still rendered.
    This prevents the soup from disappearing
    when particles separate.
  */
  ensureSoupRenderers(
    data.components.length
  );

  const subtract =
    12;

  for (
    let groupIndex = 0;
    groupIndex <
      data.components.length;
    groupIndex++
  ) {
    const group =
      data.components[
        groupIndex
      ];

    const soup =
      soupRenderers[
        groupIndex
      ];

    const bounds =
      getComponentBounds(
        group
      );

    const margin =
      Math.max(
        data.linkDistance *
          0.75,
        parcelRadius,
        0.5
      );

    const fieldSize =
      Math.max(
        bounds.maxX -
          bounds.minX,

        bounds.maxY -
          bounds.minY,

        bounds.maxZ -
          bounds.minZ,

        data.linkDistance *
          2
      ) +
      margin *
      2;

    const center =
      new THREE.Vector3(
        (
          bounds.minX +
          bounds.maxX
        ) *
        0.5,

        (
          bounds.minY +
          bounds.maxY
        ) *
        0.5,

        (
          bounds.minZ +
          bounds.maxZ
        ) *
        0.5
      );

    const minX =
      center.x -
      fieldSize *
      0.5;

    const minY =
      center.y -
      fieldSize *
      0.5;

    const minZ =
      center.z -
      fieldSize *
      0.5;

    soup.position.copy(
      center
    );

    soup.scale.set(
      fieldSize,
      fieldSize,
      fieldSize
    );

    soup.reset();

    const desiredRadius =
      Math.max(
        parcelRadius *
          0.55,
        data.linkDistance *
          0.5
      );

    const normalizedRadius =
      desiredRadius /
      fieldSize;

    const strength =
      (
        soup.isolation +
        subtract
      ) *
      normalizedRadius *
      normalizedRadius;

    let selectedGroup =
      group;

    if (
      selectedGroup.length >
      500
    ) {
      const stride =
        Math.ceil(
          selectedGroup.length /
          500
        );

      selectedGroup =
        selectedGroup.filter(
          (_, index) => {
            return index %
              stride ===
              0;
          }
        );
    }

    for (
      const index of selectedGroup
    ) {
      const particle =
        particles[index];

      const terrainY =
        terrainHeight(
          particle.x,
          particle.z
        );

      const centerY =
        Math.max(
          particle.y,
          terrainY +
            desiredRadius +
            SURFACE_CLEARANCE
        );

      const normalizedX =
        clamp(
          (
            particle.x -
            minX
          ) /
          fieldSize,
          0.001,
          0.999
        );

      const normalizedY =
        clamp(
          (
            centerY -
            minY
          ) /
          fieldSize,
          0.001,
          0.999
        );

      const normalizedZ =
        clamp(
          (
            particle.z -
            minZ
          ) /
          fieldSize,
          0.001,
          0.999
        );

      soup.addBall(
        normalizedX,
        normalizedY,
        normalizedZ,
        strength,
        subtract,
        particle.color
      );
    }

    soup.update();

    soup.visible =
      true;
  }

  for (
    let i =
      data.components.length;
    i < soupRenderers.length;
    i++
  ) {
    soupRenderers[i].visible =
      false;
  }
}


/* =====================================================
   PARTICLES AND SIMULATION STATE
===================================================== */

function updateParticleVisibility() {
  if (
    particlePoints
  ) {
    /*
      Point particles are always visible.
      This fixes the previous state where they
      could disappear during the first play frame.
    */
    particlePoints.visible =
      params.particleVisualization ===
      "points";
  }

  for (
    const soup of soupRenderers
  ) {
    soup.visible =
      simulationStarted &&
      params.particleVisualization ===
      "soup";
  }

  if (
    releaseOutline
  ) {
    releaseOutline.visible =
      !simulationStarted &&
      !drawingReleaseShape;
  }

  if (
    releaseVolumePreview
  ) {
    releaseVolumePreview.visible =
      !simulationStarted &&
      !drawingReleaseShape;
  }
}

function createParticles() {
  disposeObject(
    particlePoints
  );

  particlePoints =
    null;

  particleGeometry =
    null;

  particleMaterial =
    null;

  clearSoupRenderers();

  particleCount =
    getParticleCount();

  parcelVolume =
    params.sourceVolume /
    particleCount;

  parcelRadius =
    Math.cbrt(
      parcelVolume *
      3 /
      (
        4 *
        Math.PI
      )
    );

  sourceLayout =
    createSourceLayout();

  particles =
    [];

  for (
    let i = 0;
    i < particleCount;
    i++
  ) {
    particles.push(
      createRandomParticle(
        i
      )
    );
  }

  if (
    params.particleVisualization ===
    "points"
  ) {
    createPointParticles();
  }

  simulationAccumulator =
    0;

  soupUpdateAccumulator =
    0;

  updateParticleVisibility();
  updateParticleCountStatus();

  if (
    simulationStarted &&
    params.particleVisualization ===
      "soup"
  ) {
    updateSoupRenderer(
      true
    );
  }
}

function canStartSimulation() {
  if (
    params.releaseShapeMode ===
      "polygon" &&
    !hasValidCustomPolygon()
  ) {
    setStatus(
      "DRAW A CUSTOM RELEASE SHAPE FIRST"
    );

    return false;
  }

  if (
    getReleaseArea() <=
    0
  ) {
    setStatus(
      "INVALID RELEASE AREA"
    );

    return false;
  }

  if (
    !particles.length
  ) {
    setStatus(
      "NO PARTICLES AVAILABLE"
    );

    return false;
  }

  return true;
}

function startSimulation() {
  if (
    !canStartSimulation()
  ) {
    return;
  }

  simulationStarted =
    true;

  params.running =
    true;

  simulationAccumulator =
    0;

  soupUpdateAccumulator =
    0;

  playButton.textContent =
    "PAUSE";

  updateParticleVisibility();

  /*
    Synchronize immediately before the first
    render so particles cannot appear frozen
    or invisible for one frame.
  */
  if (
    particlePoints
  ) {
    syncPointParticles();
  }

  if (
    params.particleVisualization ===
      "soup"
  ) {
    updateSoupRenderer(
      true
    );
  }

  setStatus(
    "RUNNING"
  );
}

function pauseSimulation() {
  params.running =
    false;

  playButton.textContent =
    "PLAY";

  if (
    particlePoints
  ) {
    syncPointParticles();
  }

  setStatus(
    "PAUSED"
  );
}

function stopSimulation(
  resetVisualState = true
) {
  params.running =
    false;

  simulationStarted =
    false;

  simulationAccumulator =
    0;

  soupUpdateAccumulator =
    0;

  playButton.textContent =
    "PLAY";

  if (
    resetVisualState
  ) {
    updateParticleVisibility();
  }
}


/* =====================================================
   MODEL IMPORT
===================================================== */

function getFileExtension(
  name
) {
  return name
    .split(".")
    .pop()
    .toLowerCase();
}

function getPointsFromGeometry(
  geometry,
  matrix = new THREE.Matrix4()
) {
  const points =
    [];

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

function getPointsFromObject(
  object
) {
  const points =
    [];

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

function transformModelPoints(
  points
) {
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

  const vector =
    new THREE.Vector3();

  const transformed =
    [];

  for (
    const point of points
  ) {
    vector.set(
      point.x -
        center.x,

      point.y -
        center.y,

      point.z -
        center.z
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

  let head =
    0;

  let tail =
    0;

  for (
    let i = 0;
    i < hasValue.length;
    i++
  ) {
    if (
      hasValue[i]
    ) {
      queue[tail++] =
        i;
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

  while (
    head <
    tail
  ) {
    const index =
      queue[head++];

    const z =
      Math.floor(
        index /
        resolution
      );

    const x =
      index -
      z *
      resolution;

    for (
      const [dx, dz] of directions
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

      const neighbour =
        nz *
        resolution +
        nx;

      if (
        hasValue[neighbour]
      ) {
        continue;
      }

      values[neighbour] =
        values[index];

      hasValue[neighbour] =
        1;

      queue[tail++] =
        neighbour;
    }
  }
}

function createTerrainFromPoints(
  points
) {
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

  const widthModel =
    bounds.max.x -
    bounds.min.x;

  const depthModel =
    bounds.max.z -
    bounds.min.z;

  const heightModel =
    bounds.max.y -
    bounds.min.y;

  if (
    !Number.isFinite(
      widthModel
    ) ||
    !Number.isFinite(
      depthModel
    ) ||
    !Number.isFinite(
      heightModel
    ) ||
    widthModel <= 0 ||
    depthModel <= 0 ||
    heightModel <= 0
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

  for (
    const point of transformedPoints
  ) {
    const normalizedX =
      (
        point.x -
        bounds.min.x
      ) /
      widthModel;

    const normalizedZ =
      (
        point.z -
        bounds.min.z
      ) /
      depthModel;

    const normalizedY =
      (
        point.y -
        bounds.min.y
      ) /
      heightModel;

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
          (
            resolution -
            1
          )
        ),
        0,
        resolution - 1
      );

    const gridZ =
      clamp(
        Math.floor(
          normalizedZ *
          (
            resolution -
            1
          )
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
      normalizedY >
        values[index]
    ) {
      values[index] =
        normalizedY;

      hasValue[index] =
        1;
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
    widthModel,
    depthModel,
    heightModel,
    sourcePoints: points
  };

  rawModelPoints =
    points;

  stopSimulation(
    true
  );

  createTerrain();
  createParticles();
  updateSourceVisuals();

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
  if (
    !terrainMesh
  ) {
    return;
  }

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
        camera.fov *
        0.5
      )
    ) *
    1.2;

  camera.position.set(
    center.x +
      distance *
      0.85,

    center.y +
      distance *
      0.65,

    center.z +
      distance *
      0.85
  );

  controls.target.copy(
    center
  );

  controls.update();
}

function load3DTerrain(
  file
) {
  if (
    !file
  ) {
    return;
  }

  const extension =
    getFileExtension(
      file.name
    );

  if (
    ![
      "ply",
      "stl",
      "obj"
    ].includes(
      extension
    )
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

  modelRotation.x =
    DEFAULT_IMPORTED_ROTATION_X;

  modelRotation.y =
    0;

  modelRotation.z =
    0;

  updateRotationUI();

  if (
    extension ===
    "obj"
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
        try {
          const points =
            getPointsFromObject(
              object
            );

          if (
            !points.length
          ) {
            setStatus(
              "OBJ HAS NO MESH GEOMETRY"
            );
          } else {
            createTerrainFromPoints(
              points
            );
          }
        } catch (error) {
          console.error(
            error
          );

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
        console.error(
          error
        );

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
      let geometry =
        null;

      try {
        const buffer =
          event.target.result;

        if (
          extension ===
          "ply"
        ) {
          geometry =
            new PLYLoader()
              .parse(
                buffer
              );
        } else {
          geometry =
            new STLLoader()
              .parse(
                buffer
              );
        }

        const points =
          getPointsFromGeometry(
            geometry
          );

        if (
          !points.length
        ) {
          setStatus(
            `${extension.toUpperCase()} HAS NO GEOMETRY`
          );

          return;
        }

        createTerrainFromPoints(
          points
        );
      } catch (error) {
        console.error(
          error
        );

        setStatus(
          "MODEL PARSE ERROR"
        );
      } finally {
        if (
          geometry
        ) {
          geometry.dispose();
        }
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


/* =====================================================
   ROTATION
===================================================== */

function snapRotation(
  value
) {
  const number =
    Number(value);

  if (
    !Number.isFinite(
      number
    )
  ) {
    return 0;
  }

  return THREE.MathUtils.clamp(
    Math.round(
      number /
      45
    ) *
      45,
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
    snapRotation(
      value
    );

  updateRotationUI();

  if (
    rawModelPoints?.length
  ) {
    rebuildRotatedTerrain();
  } else {
    setStatus(
      "ROTATION READY"
    );
  }
}


/* =====================================================
   REBUILD SCHEDULING
===================================================== */

let particleRebuildTimer =
  null;

let terrainRebuildTimer =
  null;

let terrainNeedsRasterization =
  false;

function scheduleParticleRebuild() {
  clearTimeout(
    particleRebuildTimer
  );

  particleRebuildTimer =
    setTimeout(
      () => {
        createParticles();
      },
      100
    );
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
    setTimeout(
      () => {
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
          createParticles();
        }
      },
      140
    );
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

  function correctedValue(
    value
  ) {
    const min =
      Number(
        slider.min
      );

    const max =
      Number(
        slider.max
      );

    const step =
      Number(
        slider.step
      ) ||
      1;

    let result =
      Number(
        value
      );

    if (
      !Number.isFinite(
        result
      )
    ) {
      result =
        Number(
          slider.value
        );
    }

    result =
      clamp(
        result,
        min,
        max
      );

    result =
      Math.round(
        (
          result -
          min
        ) /
        step
      ) *
      step +
      min;

    return Number(
      result.toFixed(
        6
      )
    );
  }

  function apply(
    value
  ) {
    const result =
      correctedValue(
        value
      );

    slider.value =
      result;

    numberInput.value =
      result;

    callback(
      result
    );
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
  terrainFrictionInput,
  terrainFrictionNumber,
  (value) => {
    params.terrainFriction =
      value;

    setStatus(
      "TERRAIN FRICTION UPDATED"
    );
  }
);

bindNumericSlider(
  particleCohesionInput,
  particleCohesionNumber,
  (value) => {
    params.particleCohesion =
      value;

    setStatus(
      "PARTICLE COHESION UPDATED"
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
  simulationSpeedInput,
  simulationSpeedNumber,
  (value) => {
    params.simulationSpeed =
      value;

    setStatus(
      `SIMULATION SPEED ${value}×`
    );
  }
);

bindNumericSlider(
  directionAngleInput,
  directionAngleNumber,
  (value) => {
    params.directionAngle =
      value;

    setStatus(
      `HEADING ${value}°`
    );
  }
);

bindNumericSlider(
  directionXInput,
  directionXNumber,
  (value) => {
    params.directionX =
      value;

    setStatus(
      `VECTOR X ${value}`
    );
  }
);

bindNumericSlider(
  directionZInput,
  directionZNumber,
  (value) => {
    params.directionZ =
      value;

    setStatus(
      `VECTOR Z ${value}`
    );
  }
);

startDirectionModeInput.addEventListener(
  "change",
  () => {
    params.startDirectionMode =
      startDirectionModeInput.value;

    updateDirectionControls();

    setStatus(
      `DIRECTION ${
        startDirectionModeInput.options[
          startDirectionModeInput.selectedIndex
        ].text
      }`
    );
  }
);

bindNumericSlider(
  terrainResolutionInput,
  terrainResolutionNumber,
  (value) => {
    params.terrainResolution =
      Math.round(
        value
      );

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
      `MODEL SCALE ${value}×`
    );
  }
);

bindNumericSlider(
  metersPerModelUnitInput,
  metersPerModelUnitNumber,
  (value) => {
    params.metersPerModelUnit =
      value;

    scheduleTerrainRebuild(
      false
    );

    setStatus(
      `${value} m / MODEL UNIT`
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
      `VERTICAL SCALE ${value}×`
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
      `Z SCALE ${value}×`
    );
  }
);

bindNumericSlider(
  sourceAreaInput,
  sourceAreaNumber,
  (value) => {
    params.sourceArea =
      value;

    updateSourceVisuals();
    scheduleParticleRebuild();

    setStatus(
      `RELEASE AREA ${formatNumber(
        value
      )} m²`
    );
  }
);

bindNumericSlider(
  sourceVolumeInput,
  sourceVolumeNumber,
  (value) => {
    params.sourceVolume =
      value;

    updateSourceVisuals();
    scheduleParticleRebuild();

    setStatus(
      `SOURCE ${formatNumber(
        value
      )} m³`
    );
  }
);

bindNumericSlider(
  particleDensityInput,
  particleDensityNumber,
  (value) => {
    params.particleDensity =
      value;

    scheduleParticleRebuild();

    setStatus(
      `PARTICLES ${value} / m³`
    );
  }
);

bindNumericSlider(
  soupLinkRangeInput,
  soupLinkRangeNumber,
  (value) => {
    params.soupLinkRange =
      value;

    soupUpdateAccumulator =
      0;

    if (
      simulationStarted &&
      params.particleVisualization ===
        "soup"
    ) {
      updateSoupRenderer(
        true
      );
    }

    setStatus(
      `SOUP LINK RANGE ${value}×`
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

    if (
      !simulationStarted
    ) {
      createParticles();
    }

    setStatus(
      `PARTICLE SCALE ${value}×`
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

releaseShapeModeInput.addEventListener(
  "change",
  () => {
    params.releaseShapeMode =
      releaseShapeModeInput.value;

    updateSourceVisuals();
    createParticles();

    if (
      params.releaseShapeMode ===
        "polygon" &&
      !hasValidCustomPolygon()
    ) {
      setStatus(
        "HOLD CMD AND CLICK TERRAIN TO DRAW"
      );
    } else {
      setStatus(
        "RELEASE SHAPE UPDATED"
      );
    }
  }
);

drawReleaseShapeButton.addEventListener(
  "click",
  () => {
    startDrawingReleaseShape(
      false
    );
  }
);

clearReleaseShapeButton.addEventListener(
  "click",
  () => {
    clearCustomReleaseShape();
  }
);

colorModeInput.addEventListener(
  "change",
  () => {
    params.colorMode =
      colorModeInput.value;

    if (
      particlePoints
    ) {
      syncPointParticles();
    }

    if (
      simulationStarted &&
      params.particleVisualization ===
        "soup"
    ) {
      updateSoupRenderer(
        true
      );
    }

    setStatus(
      `COLOR BY ${
        colorModeInput.options[
          colorModeInput.selectedIndex
        ].text
      }`
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
        "soup"
        ? "CONNECTED SOUP ENABLED"
        : "POINT PARTICLES ENABLED"
    );
  }
);


/* =====================================================
   POINTER EVENTS
===================================================== */

/*
  Capture-phase handling is intentional.
  OrbitControls receives CMD/CTRL + left-click
  as a pan gesture, so custom drawing must
  intercept it first.
*/
renderer.domElement.addEventListener(
  "pointerdown",
  (event) => {
    const modifier =
      hasCommandModifier(
        event
      );

    if (
      drawingReleaseShape
    ) {
      const allowed =
        drawingRequiresModifier
          ? modifier
          : true;

      if (
        event.button !== 0 ||
        !allowed
      ) {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();

      const hit =
        getTerrainIntersection(
          event
        );

      if (
        !hit
      ) {
        return;
      }

      const nextPoint = {
        x: hit.x,
        z: hit.z
      };

      const last =
        drawingPoints[
          drawingPoints.length - 1
        ];

      if (
        last &&
        Math.hypot(
          last.x -
            nextPoint.x,

          last.z -
            nextPoint.z
        ) < 0.5
      ) {
        return;
      }

      drawingPoints.push(
        nextPoint
      );

      setDrawingPreview();

      if (
        event.detail >= 2 &&
        drawingPoints.length >= 3
      ) {
        finishDrawingReleaseShape();
      }

      return;
    }

    /*
      CMD/Ctrl + left-click automatically starts
      polygon drawing. No button is required.
    */
    if (
      event.button === 0 &&
      modifier &&
      terrainMesh
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();

      startDrawingReleaseShape(
        true
      );

      const hit =
        getTerrainIntersection(
          event
        );

      if (
        hit
      ) {
        drawingPoints.push({
          x: hit.x,
          z: hit.z
        });

        setDrawingPreview();
      }

      return;
    }

    /*
      Shift + left-click moves the source.
    */
    if (
      event.button === 0 &&
      event.shiftKey &&
      terrainMesh
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();

      const hit =
        getTerrainIntersection(
          event
        );

      if (
        hit
      ) {
        sourceLocation.x =
          hit.x;

        sourceLocation.z =
          hit.z;

        stopSimulation(
          true
        );

        createParticles();
        updateSourceVisuals();

        setStatus(
          "SOURCE MOVED"
        );
      }
    }
  },
  true
);

renderer.domElement.addEventListener(
  "pointermove",
  (event) => {
    if (
      !drawingReleaseShape
    ) {
      return;
    }

    const modifier =
      hasCommandModifier(
        event
      );

    const allowed =
      drawingRequiresModifier
        ? modifier
        : true;

    if (
      !allowed
    ) {
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();

    const hit =
      getTerrainIntersection(
        event
      );

    if (
      hit
    ) {
      setDrawingPreview(
        hit
      );
    }
  },
  true
);

window.addEventListener(
  "keydown",
  (event) => {
    if (
      !drawingReleaseShape
    ) {
      return;
    }

    if (
      event.key ===
      "Escape"
    ) {
      event.preventDefault();

      cancelDrawingReleaseShape();
    }

    if (
      event.key ===
      "Enter"
    ) {
      event.preventDefault();

      finishDrawingReleaseShape();
    }

    if (
      event.key ===
      "Backspace"
    ) {
      event.preventDefault();

      drawingPoints.pop();
      setDrawingPreview();
    }
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
    if (
      drawingReleaseShape
    ) {
      setStatus(
        "FINISH OR CANCEL DRAWING FIRST"
      );

      return;
    }

    if (
      params.running
    ) {
      pauseSimulation();
    } else {
      startSimulation();
    }
  }
);

resetButton.addEventListener(
  "click",
  () => {
    stopSimulation(
      true
    );

    createParticles();
    updateSourceVisuals();

    setStatus(
      "RESET"
    );
  }
);

addButton.addEventListener(
  "click",
  () => {
    params.sourceVolume =
      Math.min(
        1000000,
        params.sourceVolume +
          1000
      );

    sourceVolumeInput.value =
      params.sourceVolume;

    sourceVolumeNumber.value =
      params.sourceVolume;

    updateSourceVisuals();
    createParticles();

    setStatus(
      "1000 m³ ADDED"
    );
  }
);

resetOrientationButton.addEventListener(
  "click",
  () => {
    if (
      rawModelPoints?.length
    ) {
      modelRotation.x =
        DEFAULT_IMPORTED_ROTATION_X;

      modelRotation.y =
        0;

      modelRotation.z =
        0;

      updateRotationUI();
      rebuildRotatedTerrain();

      setStatus(
        "IMPORT ORIENTATION RESET"
      );
    } else {
      modelRotation.x =
        0;

      modelRotation.y =
        0;

      modelRotation.z =
        0;

      updateRotationUI();

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

    customTerrain =
      null;

    rawModelPoints =
      null;

    currentFileName =
      "";

    releasePolygonLocal =
      null;

    params.releaseShapeMode =
      "rectangle";

    releaseShapeModeInput.value =
      "rectangle";

    modelRotation.x =
      0;

    modelRotation.y =
      0;

    modelRotation.z =
      0;

    stopSimulation(
      true
    );

    updateRotationUI();

    sourceLocation.set(
      -TERRAIN_SIZE * 0.3,
      0,
      -TERRAIN_SIZE * 0.35
    );

    createTerrain();
    createParticles();
    updateSourceVisuals();

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

params.startDirectionMode =
  startDirectionModeInput.value;

params.particleVisualization =
  particleVisualizationInput.value;

params.colorMode =
  colorModeInput.value;

params.releaseShapeMode =
  releaseShapeModeInput.value;

updateDirectionControls();
updateRotationUI();
updateReleaseShapeControls();

createTerrain();
createParticles();
updateSourceVisuals();

frameCurrentTerrain();

setStatus(
  "PAUSED"
);


/* =====================================================
   ANIMATION LOOP
===================================================== */

const clock =
  new THREE.Clock();

function animate() {
  requestAnimationFrame(
    animate
  );

  const frameDelta =
    Math.min(
      clock.getDelta(),
      0.05
    );

  try {
    if (
      params.running
    ) {
      simulateFrame(
        frameDelta
      );
    }

    /*
      Synchronize before every render,
      including the first frame after PLAY.
    */
    if (
      particlePoints
    ) {
      syncPointParticles();
    }

    if (
      simulationStarted &&
      params.particleVisualization ===
        "soup"
    ) {
      soupUpdateAccumulator +=
        frameDelta;

      updateSoupRenderer();
    }

    controls.update();

    renderer.render(
      scene,
      camera
    );
  } catch (error) {
    console.error(
      error
    );

    params.running =
      false;

    playButton.textContent =
      "PLAY";

    setStatus(
      "SIMULATION ERROR — CHECK CONSOLE"
    );
  }
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
    width /
    height;

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
