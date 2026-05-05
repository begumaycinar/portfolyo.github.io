import * as THREE from 'three';

const textureLoader = new THREE.TextureLoader();
const spaceTextureUrl = './space.jpg';
const jeffTextureUrl = './pfp.jpg';
const moonTextureUrl = './moon.jpg';
const normalTextureUrl = './normal.jpg';
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const scrollDepth = 0.014;

const cameraTarget = {
  x: 0,
  z: 0,
  rotationY: 0,
};


// Setup

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
camera.position.setZ(0);
camera.position.setX(0);

renderer.render(scene, camera);

// Torus

const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
const material = new THREE.MeshStandardMaterial({ color: 0xff6347 });
const torus = new THREE.Mesh(geometry, material);

scene.add(torus);

// Lights

const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(5, 5, 5);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

// Helpers

// const lightHelper = new THREE.PointLightHelper(pointLight)
// const gridHelper = new THREE.GridHelper(200, 50);
// scene.add(lightHelper, gridHelper)

function addStars() {
  const geometry = new THREE.SphereGeometry(0.25, 12, 12);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const stars = new THREE.InstancedMesh(geometry, material, 200);
  const matrix = new THREE.Matrix4();

  for (let i = 0; i < stars.count; i++) {
    const [x, y, z] = Array(3)
      .fill()
      .map(() => THREE.MathUtils.randFloatSpread(100));

    matrix.setPosition(x, y, z);
    stars.setMatrixAt(i, matrix);
  }

  scene.add(stars);
}

addStars();

// Background

textureLoader.load(
  spaceTextureUrl,
  (texture) => {
    texture.encoding = THREE.sRGBEncoding;
    scene.background = texture;
  },
  undefined,
  () => {
    scene.background = new THREE.Color(0x060712);
  }
);

// Avatar

const jeffMaterial = new THREE.MeshBasicMaterial({ color: 0x8ec5ff });

textureLoader.load(
  jeffTextureUrl,
  (texture) => {
    texture.encoding = THREE.sRGBEncoding;
    jeffMaterial.map = texture;
    jeffMaterial.needsUpdate = true;
  }
);

const jeff = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 3), jeffMaterial);

scene.add(jeff);

// Moon

const moonTexture = textureLoader.load(moonTextureUrl);
const normalTexture = textureLoader.load(normalTextureUrl);

const moon = new THREE.Mesh(
  new THREE.SphereGeometry(3, 32, 32),
  new THREE.MeshStandardMaterial({
    map: moonTexture,
    normalMap: normalTexture,
  })
);

scene.add(moon);

moon.position.z = 38;
moon.position.setX(-10);
moon.position.y = 0;

jeff.position.z = -5;
jeff.position.x = 2;

// Planets

function createPlanet({ x, y, z, radius, color, ringColor, hasRing = false }) {
  const planet = new THREE.Group();
  const planetGeometry = new THREE.SphereGeometry(radius, 32, 32);
  const planetMaterial = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.65,
    metalness: 0.08,
  });
  const body = new THREE.Mesh(planetGeometry, planetMaterial);

  planet.add(body);

  if (hasRing) {
    const ringGeometry = new THREE.TorusGeometry(radius * 1.45, radius * 0.08, 12, 80);
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: ringColor,
      roughness: 0.4,
      metalness: 0.2,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);

    ring.rotation.x = Math.PI / 2.7;
    ring.rotation.y = Math.PI / 9;
    planet.add(ring);
  }

  planet.position.set(x, y, z);
  scene.add(planet);

  return planet;
}

const planets = [
  createPlanet({
    x: 8,
    y: -3,
    z: -10,
    radius: 2.2,
    color: 0x68d8ff,
    ringColor: 0xb9f3ff,
    hasRing: true,
  }),
  createPlanet({
    x: -8,
    y: 4,
    z: -24,
    radius: 1.9,
    color: 0xffb86b,
    ringColor: 0xffe2a8,
  }),
  createPlanet({
    x: 9,
    y: 5,
    z: -40,
    radius: 2.6,
    color: 0xb78cff,
    ringColor: 0xe0c8ff,
    hasRing: true,
  }),
  createPlanet({
    x: -7,
    y: -4,
    z: -58,
    radius: 2,
    color: 0x7dffb2,
    ringColor: 0xc7ffd9,
  }),
];

// Contact Objects

const contactSection = document.querySelector('.contact-section');
const contactGroup = new THREE.Group();
scene.add(contactGroup);

function createContactObject({ geometry, color, x, y, z = 0 }) {
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.38,
    metalness: 0.18,
  });
  const mesh = new THREE.Mesh(geometry, material);

  mesh.position.set(x, y, z);
  contactGroup.add(mesh);

  return mesh;
}

const contactObjects = [
  createContactObject({
    geometry: new THREE.BoxGeometry(2.6, 2.6, 2.6),
    color: 0x68d8ff,
    x: -3.2,
    y: -1.4,
  }),
  createContactObject({
    geometry: new THREE.SphereGeometry(1.6, 32, 32),
    color: 0xffb86b,
    x: -0.9,
    y: -1.8,
    z: -3,
  }),
];

function createContactText() {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = 1024;
  canvas.height = 256;

  const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#a9fffb');
  gradient.addColorStop(1, '#c68dff');

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.font = '900 150px Oswald, Arial, sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.shadowColor = 'rgba(142, 197, 255, 0.95)';
  context.shadowBlur = 28;
  context.fillStyle = gradient;
  context.fillText('Contact', canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.encoding = THREE.sRGBEncoding;

  const textMaterial = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide,
  });
  const textMesh = new THREE.Mesh(new THREE.PlaneGeometry(9, 2.25), textMaterial);

  textMesh.position.set(-2.8, 2.3, -2);
  textMesh.rotation.x = -0.12;
  contactGroup.add(textMesh);

  return textMesh;
}

const contactText = createContactText();

function positionContactObjects() {
  if (!contactSection) {
    return;
  }

  const isNarrow = window.innerWidth <= 700;
  const contactScrollZ = contactSection.offsetTop * scrollDepth;
  const contactScrollX = contactSection.offsetTop * -0.0002;

  contactObjects[0].position.x = isNarrow ? -2.7 : -3.2;
  contactObjects[1].position.x = isNarrow ? -0.6 : -0.9;
  contactText.position.x = isNarrow ? -1.8 : -2.8;
  contactText.scale.setScalar(isNarrow ? 0.72 : 1);

  contactGroup.position.set(contactScrollX, 0, contactScrollZ - 14);
}

positionContactObjects();

// Ending Comet

const endComet = new THREE.Group();
const cometCore = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1.2, 1),
  new THREE.MeshStandardMaterial({
    color: 0xa9fffb,
    emissive: 0x2d83ff,
    emissiveIntensity: 0.7,
    roughness: 0.28,
    metalness: 0.24,
  })
);
const cometRing = new THREE.Mesh(
  new THREE.TorusGeometry(1.9, 0.05, 8, 80),
  new THREE.MeshBasicMaterial({ color: 0xc68dff })
);
const cometTail = new THREE.Mesh(
  new THREE.ConeGeometry(0.7, 5, 24),
  new THREE.MeshBasicMaterial({
    color: 0x68d8ff,
    transparent: true,
    opacity: 0.32,
  })
);

cometRing.rotation.x = Math.PI / 2.5;
cometTail.position.set(0, -3.2, 0);
cometTail.rotation.x = Math.PI;
endComet.add(cometCore, cometRing);
scene.add(endComet);

function positionEndComet() {
  const endZ = document.body.scrollHeight * scrollDepth;
  const endX = document.body.scrollHeight * -0.0002;

  endComet.position.set(endX + -5, 0.2, endZ + 90);
}

positionEndComet();

// Scroll Animation

function moveCamera() {
  const t = document.body.getBoundingClientRect().top;

  if (!prefersReducedMotion) {
    moon.rotation.x += 0.03;
    moon.rotation.y += 0.045;
    moon.rotation.z += 0.03;

    jeff.rotation.y += 0.008;
    jeff.rotation.z += 0.008;
  }

  cameraTarget.z = t * -scrollDepth;
  cameraTarget.x = t * -0.0002;
  cameraTarget.rotationY = t * -0.0002;
}

document.body.onscroll = moveCamera;
moveCamera();

window.addEventListener('resize', () => {
  positionContactObjects();
  positionEndComet();
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  moveCamera();
});

// Animation Loop

function animate() {
  requestAnimationFrame(animate);

  if (prefersReducedMotion) {
    camera.position.x = cameraTarget.x;
    camera.position.z = cameraTarget.z;
    camera.rotation.y = cameraTarget.rotationY;
  } else {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, cameraTarget.x, 0.06);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, cameraTarget.z, 0.06);
    camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, cameraTarget.rotationY, 0.06);
  }

  if (prefersReducedMotion) {
    renderer.render(scene, camera);
    return;
  }

  torus.rotation.x += 0.01;
  torus.rotation.y += 0.005;
  torus.rotation.z += 0.01;

  moon.rotation.x += 0.005;

  planets.forEach((planet, index) => {
    planet.rotation.y += 0.004 + index * 0.001;
    planet.rotation.x += 0.0015;
  });

  contactObjects.forEach((object, index) => {
    object.rotation.x += 0.008 + index * 0.002;
    object.rotation.y += 0.01 + index * 0.0015;
  });

  contactText.position.y = 2.3 + Math.sin(Date.now() * 0.0015) * 0.2;
  contactText.rotation.y = Math.sin(Date.now() * 0.001) * 0.08;

  endComet.rotation.x += 0.006;
  endComet.rotation.y += 0.012;
  cometRing.rotation.z += 0.018;
  cometTail.scale.y = 1 + Math.sin(Date.now() * 0.003) * 0.08;

  renderer.render(scene, camera);
}

animate();

