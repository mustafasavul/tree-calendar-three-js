import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SeasonalTree } from './tree/SeasonalTree.js';
import { translations, detectLanguage, getLocale, isRTL } from './localization.js';

/**
 * Localization System
 */
// Get current language
const currentLang = detectLanguage();
const t = translations[currentLang] || translations.en;
const rtl = isRTL(currentLang);

/**
 * Main application setup and Three.js scene initialization
 */

// Scene setup
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x87ceeb, 20, 40); // Less aggressive fog
scene.background = new THREE.Color(0x87ceeb); // Sky blue background

// Camera - Better angle to see entire tree
const camera = new THREE.PerspectiveCamera(
  50, // Slightly narrower FOV for better framing
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 5, 12); // Higher and further back
camera.lookAt(0, 3, 0); // Look at tree center

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('app').appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 8;
controls.maxDistance = 25;
controls.maxPolarAngle = Math.PI / 2.1; // Allow looking down more
controls.target.set(0, 3, 0); // Focus on tree center

// Auto-rotate camera when idle (circular rotation around tree)
let lastInteractionTime = Date.now();
let isAutoRotating = false;
let autoRotateAngle = 0; // Current rotation angle for circular movement
let initialCameraDistance = 0; // Distance from tree center
let initialCameraHeight = 0; // Height offset from tree center

// Store initial camera position for circular rotation
function storeInitialCameraState() {
  const treeCenter = new THREE.Vector3(0, 3, 0); // Tree center
  const cameraPos = camera.position.clone();
  const direction = new THREE.Vector3().subVectors(cameraPos, treeCenter);
  initialCameraDistance = direction.length();
  initialCameraHeight = cameraPos.y - treeCenter.y;
}

// Initialize camera state
storeInitialCameraState();

function resetAutoRotateTimer() {
  lastInteractionTime = Date.now();
  if (isAutoRotating) {
    isAutoRotating = false;
    controls.autoRotate = false;
    // Store current camera state when user takes control
    storeInitialCameraState();
    // Calculate current angle from camera position
    const treeCenter = new THREE.Vector3(0, 3, 0);
    const cameraPos = camera.position.clone();
    const direction = new THREE.Vector3().subVectors(cameraPos, treeCenter);
    direction.y = 0; // Project to horizontal plane
    autoRotateAngle = Math.atan2(direction.z, direction.x);
  }
}

// Track user interactions (only real control changes, not just mouse movement)
let isUserInteracting = false;

controls.addEventListener('start', () => {
  isUserInteracting = true;
  resetAutoRotateTimer();
});

controls.addEventListener('end', () => {
  isUserInteracting = false;
  lastInteractionTime = Date.now(); // Reset timer when user releases
});

controls.addEventListener('change', () => {
  if (isUserInteracting) {
    resetAutoRotateTimer();
  }
});

window.addEventListener('wheel', resetAutoRotateTimer);
window.addEventListener('touchstart', resetAutoRotateTimer);

// Lights - More realistic lighting setup
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

// Main sunlight
const directionalLight = new THREE.DirectionalLight(0xfff8e1, 1.2); // Warm sunlight
directionalLight.position.set(5, 12, 5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -10;
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.top = 10;
directionalLight.shadow.camera.bottom = -10;
directionalLight.shadow.bias = -0.0001;
scene.add(directionalLight);

// Fill light for softer shadows
const fillLight = new THREE.DirectionalLight(0xb3e5fc, 0.4); // Cool fill light
fillLight.position.set(-5, 5, -5);
scene.add(fillLight);

// Rim light for depth
const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
rimLight.position.set(0, 8, -8);
scene.add(rimLight);

// Landscape ground (peyzaj alanı)
const groundGroup = new THREE.Group();

// Main grass ground - expanded
const groundGeometry = new THREE.CircleGeometry(18, 32); // Increased from 12 to 18
let groundMaterial = new THREE.MeshStandardMaterial({
  color: 0x7cb342, // Green grass (will change with season)
  roughness: 0.9
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
groundGroup.add(ground);

// Add more decorative stones/rocks - expanded area
for (let i = 0; i < 20; i++) { // More stones
  const angle = Math.random() * Math.PI * 2;
  const distance = 3 + Math.random() * 14; // Spread throughout the area
  const stoneSize = 0.2 + Math.random() * 0.5; // Varied sizes
  
  const stoneGeometry = new THREE.DodecahedronGeometry(stoneSize, 0);
  const stoneMaterial = new THREE.MeshStandardMaterial({
    color: 0x757575 + Math.random() * 0x202020, // Slight color variation
    roughness: 0.8
  });
  const stone = new THREE.Mesh(stoneGeometry, stoneMaterial);
  stone.position.set(
    Math.cos(angle) * distance,
    stoneSize,
    Math.sin(angle) * distance
  );
  stone.rotation.set(
    Math.random() * Math.PI,
    Math.random() * Math.PI,
    Math.random() * Math.PI
  );
  stone.castShadow = true;
  stone.receiveShadow = true;
  groundGroup.add(stone);
}

// Add flowers everywhere
function createFlower() {
  const flowerGroup = new THREE.Group();
  
  // Stem
  const stemGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.2, 6);
  const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x4caf50 });
  const stem = new THREE.Mesh(stemGeometry, stemMaterial);
  stem.position.y = 0.1;
  flowerGroup.add(stem);
  
  // Petals (multiple colored petals)
  const petalColors = [0xff6b9d, 0xffc107, 0x4caf50, 0x2196f3, 0xff9800, 0xe91e63];
  const petalColor = petalColors[Math.floor(Math.random() * petalColors.length)];
  
  for (let i = 0; i < 5; i++) {
    const petalGeometry = new THREE.SphereGeometry(0.08, 8, 8);
    const petalMaterial = new THREE.MeshStandardMaterial({ color: petalColor });
    const petal = new THREE.Mesh(petalGeometry, petalMaterial);
    const angle = (i / 5) * Math.PI * 2;
    petal.position.set(
      Math.cos(angle) * 0.1,
      0.25,
      Math.sin(angle) * 0.1
    );
    petal.scale.set(1, 0.5, 1);
    flowerGroup.add(petal);
  }
  
  // Center
  const centerGeometry = new THREE.SphereGeometry(0.04, 8, 8);
  const centerMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700 });
  const center = new THREE.Mesh(centerGeometry, centerMaterial);
  center.position.y = 0.25;
  flowerGroup.add(center);
  
  return flowerGroup;
}

// Store flowers and plants for season control
const flowers = [];
const plants = [];

// Add flowers everywhere (more flowers) - expanded area
for (let i = 0; i < 50; i++) {
  const angle = Math.random() * Math.PI * 2;
  const distance = 2 + Math.random() * 15; // Increased from 2-12 to 2-17
  
  const x = Math.cos(angle) * distance;
  const z = Math.sin(angle) * distance;
  
  const flower = createFlower();
  flower.position.set(x, 0, z);
  flower.rotation.y = Math.random() * Math.PI * 2;
  flower.castShadow = true;
  flower.receiveShadow = true;
  groundGroup.add(flower);
  flowers.push(flower);
}

// Add more small plants/grass patches - expanded area
for (let i = 0; i < 50; i++) { // More plants
  const angle = Math.random() * Math.PI * 2;
  const distance = 2 + Math.random() * 15; // Increased from 2-12 to 2-17
  
  const x = Math.cos(angle) * distance;
  const z = Math.sin(angle) * distance;
  
  // Small plant/grass with varied sizes
  const plantHeight = 0.2 + Math.random() * 0.3;
  const plantGeometry = new THREE.ConeGeometry(0.12 + Math.random() * 0.08, plantHeight, 6);
  const plantMaterial = new THREE.MeshStandardMaterial({
    color: 0x4caf50 + Math.random() * 0x202020, // Slight color variation
    roughness: 0.7
  });
  const plant = new THREE.Mesh(plantGeometry, plantMaterial);
  plant.position.set(x, plantHeight / 2, z);
  plant.castShadow = true;
  plant.receiveShadow = true;
  groundGroup.add(plant);
  plants.push(plant);
}

// Add mushrooms (natural objects)
function createMushroom() {
  const mushroomGroup = new THREE.Group();
  
  // Stem
  const stemGeometry = new THREE.CylinderGeometry(0.03, 0.04, 0.15, 8);
  const stemMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xf5deb3, // Beige/tan color
    roughness: 0.8
  });
  const stem = new THREE.Mesh(stemGeometry, stemMaterial);
  stem.position.y = 0.075;
  mushroomGroup.add(stem);
  
  // Cap
  const capGeometry = new THREE.SphereGeometry(0.08, 8, 8);
  const capMaterial = new THREE.MeshStandardMaterial({ 
    color: Math.random() > 0.5 ? 0xff6b6b : 0x4ecdc4, // Red or teal
    roughness: 0.6
  });
  const cap = new THREE.Mesh(capGeometry, capMaterial);
  cap.position.y = 0.2;
  cap.scale.set(1, 0.4, 1); // Flatten the sphere
  mushroomGroup.add(cap);
  
  // Spots on cap (optional, for some mushrooms)
  if (Math.random() > 0.6) {
    for (let i = 0; i < 3; i++) {
      const spotGeometry = new THREE.SphereGeometry(0.015, 6, 6);
      const spotMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
      const spot = new THREE.Mesh(spotGeometry, spotMaterial);
      spot.position.set(
        (Math.random() - 0.5) * 0.1,
        0.2,
        (Math.random() - 0.5) * 0.1
      );
      mushroomGroup.add(spot);
    }
  }
  
  return mushroomGroup;
}

// Add mushrooms around the scene
for (let i = 0; i < 15; i++) {
  const angle = Math.random() * Math.PI * 2;
  const distance = 3 + Math.random() * 14;
  
  const mushroom = createMushroom();
  mushroom.position.set(
    Math.cos(angle) * distance,
    0,
    Math.sin(angle) * distance
  );
  mushroom.rotation.y = Math.random() * Math.PI * 2;
  mushroom.castShadow = true;
  mushroom.receiveShadow = true;
  groundGroup.add(mushroom);
}

// Add small trees/bushes
function createSmallTree() {
  const treeGroup = new THREE.Group();
  
  // Trunk
  const trunkGeometry = new THREE.CylinderGeometry(0.05, 0.06, 0.4, 8);
  const trunkMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x8b4513, // Brown
    roughness: 0.9
  });
  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
  trunk.position.y = 0.2;
  treeGroup.add(trunk);
  
  // Foliage (multiple layers)
  const foliageColors = [0x4caf50, 0x66bb6a, 0x81c784];
  const foliageColor = foliageColors[Math.floor(Math.random() * foliageColors.length)];
  
  for (let i = 0; i < 3; i++) {
    const foliageGeometry = new THREE.ConeGeometry(0.15 - i * 0.03, 0.2 - i * 0.05, 6);
    const foliageMaterial = new THREE.MeshStandardMaterial({ 
      color: foliageColor,
      roughness: 0.7
    });
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage.position.y = 0.3 + i * 0.15;
    treeGroup.add(foliage);
  }
  
  return treeGroup;
}

// Add small trees around the scene
for (let i = 0; i < 12; i++) {
  const angle = Math.random() * Math.PI * 2;
  const distance = 4 + Math.random() * 12;
  
  const smallTree = createSmallTree();
  smallTree.position.set(
    Math.cos(angle) * distance,
    0,
    Math.sin(angle) * distance
  );
  smallTree.rotation.y = Math.random() * Math.PI * 2;
  smallTree.scale.setScalar(0.8 + Math.random() * 0.4); // Varied sizes
  smallTree.castShadow = true;
  smallTree.receiveShadow = true;
  groundGroup.add(smallTree);
}

// Add fallen leaves (natural debris)
function createFallenLeaf() {
  const leafGeometry = new THREE.PlaneGeometry(0.08, 0.1, 1, 1);
  const leafMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x8d6e63 + Math.random() * 0x202020, // Brown/autumn colors
    side: THREE.DoubleSide,
    roughness: 0.9
  });
  const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
  leaf.rotation.x = Math.PI / 2; // Lay flat
  leaf.rotation.z = Math.random() * Math.PI * 2;
  return leaf;
}

// Add fallen leaves scattered around
for (let i = 0; i < 30; i++) {
  const angle = Math.random() * Math.PI * 2;
  const distance = 2 + Math.random() * 15;
  
  const fallenLeaf = createFallenLeaf();
  fallenLeaf.position.set(
    Math.cos(angle) * distance,
    0.02 + Math.random() * 0.03, // Slightly above ground
    Math.sin(angle) * distance
  );
  fallenLeaf.rotation.y = Math.random() * Math.PI * 2;
  fallenLeaf.receiveShadow = true;
  groundGroup.add(fallenLeaf);
}

// Add bushes/shrubs
function createBush() {
  const bushGroup = new THREE.Group();
  
  // Multiple small spheres for bush shape
  for (let i = 0; i < 5; i++) {
    const bushPartGeometry = new THREE.SphereGeometry(0.12, 6, 6);
    const bushMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x4caf50 + Math.random() * 0x101010,
      roughness: 0.8
    });
    const bushPart = new THREE.Mesh(bushPartGeometry, bushMaterial);
    bushPart.position.set(
      (Math.random() - 0.5) * 0.2,
      (Math.random() - 0.5) * 0.15 + 0.1,
      (Math.random() - 0.5) * 0.2
    );
    bushPart.scale.setScalar(0.7 + Math.random() * 0.3);
    bushGroup.add(bushPart);
  }
  
  return bushGroup;
}

// Add bushes around the scene
for (let i = 0; i < 18; i++) {
  const angle = Math.random() * Math.PI * 2;
  const distance = 3 + Math.random() * 13;
  
  const bush = createBush();
  bush.position.set(
    Math.cos(angle) * distance,
    0,
    Math.sin(angle) * distance
  );
  bush.rotation.y = Math.random() * Math.PI * 2;
  bush.castShadow = true;
  bush.receiveShadow = true;
  groundGroup.add(bush);
}

// Add hills/mountains at the edge of the green area (much larger) - expanded
const hillsGroup = new THREE.Group();
for (let i = 0; i < 25; i++) { // More hills
  const angle = (i / 25) * Math.PI * 2;
  const distance = 17 + Math.random() * 1; // At edge of expanded ground (was 11-12, now 17-18)
  const hillHeight = 4 + Math.random() * 5; // Much taller hills (was 2-5, now 4-9)
  const hillWidth = 1.5 + Math.random() * 2.5; // Wider hills (was 0.8-2.0, now 1.5-4.0)
  
  const hillGeometry = new THREE.ConeGeometry(hillWidth, hillHeight, 12); // More segments for smoother look
  const hillMaterial = new THREE.MeshStandardMaterial({
    color: 0x558b2f, // Darker green for hills
    roughness: 0.9
  });
  const hill = new THREE.Mesh(hillGeometry, hillMaterial);
  hill.position.set(
    Math.cos(angle) * distance,
    hillHeight / 2,
    Math.sin(angle) * distance
  );
  hill.castShadow = true;
  hill.receiveShadow = true;
  hillsGroup.add(hill);
}
scene.add(hillsGroup);

// Season effects objects (define before clouds to use it)
const seasonEffects = {
  snowParticles: [],
  rainParticles: [],
  clouds: [],
  sun: null,
  skyColor: null,
  hillsMaterial: null
};

// Create clouds system
function createCloud() {
  const cloudGroup = new THREE.Group();
  
  // Create fluffy cloud using multiple spheres
  const cloudGeometry = new THREE.SphereGeometry(1, 16, 16);
  const cloudMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.8,
    roughness: 0.9,
    metalness: 0.0
  });
  
  // Main cloud body (larger spheres)
  for (let i = 0; i < 5; i++) {
    const sphere = new THREE.Mesh(cloudGeometry, cloudMaterial.clone());
    const offsetX = (Math.random() - 0.5) * 2;
    const offsetY = (Math.random() - 0.5) * 0.8;
    const offsetZ = (Math.random() - 0.5) * 1.5;
    const scale = 0.6 + Math.random() * 0.6;
    
    sphere.position.set(offsetX, offsetY, offsetZ);
    sphere.scale.setScalar(scale);
    cloudGroup.add(sphere);
  }
  
  // Smaller detail spheres
  for (let i = 0; i < 8; i++) {
    const sphere = new THREE.Mesh(cloudGeometry, cloudMaterial.clone());
    const offsetX = (Math.random() - 0.5) * 2.5;
    const offsetY = (Math.random() - 0.5) * 1;
    const offsetZ = (Math.random() - 0.5) * 2;
    const scale = 0.3 + Math.random() * 0.4;
    
    sphere.position.set(offsetX, offsetY, offsetZ);
    sphere.scale.setScalar(scale);
    cloudGroup.add(sphere);
  }
  
  return cloudGroup;
}

// Create multiple clouds at different positions
function createClouds() {
  const clouds = [];
  const cloudCount = 8; // Number of clouds
  
  for (let i = 0; i < cloudCount; i++) {
    const cloud = createCloud();
    
    // Position clouds at different heights and positions
    const angle = (i / cloudCount) * Math.PI * 2;
    const distance = 15 + Math.random() * 10; // Distance from center
    const height = 8 + Math.random() * 6; // Height above ground
    
    cloud.position.set(
      Math.cos(angle) * distance,
      height,
      Math.sin(angle) * distance - 10 // Behind the scene
    );
    
    // Random scale for variety
    const scale = 0.8 + Math.random() * 0.6;
    cloud.scale.setScalar(scale);
    
    // Random rotation
    cloud.rotation.y = Math.random() * Math.PI * 2;
    
    // Store velocity for animation
    cloud.userData.velocity = {
      x: (Math.random() - 0.5) * 0.01 + 0.005, // Slow horizontal movement
      y: (Math.random() - 0.5) * 0.002, // Slight vertical drift
      z: 0
    };
    
    scene.add(cloud);
    clouds.push(cloud);
  }
  
  return clouds;
}

// Initialize clouds
const clouds = createClouds();
seasonEffects.clouds = clouds;

// Season system
let currentSeason = 'spring'; // spring, summer, autumn, winter

// Initialize season system (called after ground and hills are created)
function initSeasonSystem() {
  // Set initial season based on current month
  const currentMonth = new Date().getMonth();
  if (currentMonth >= 2 && currentMonth <= 4) currentSeason = 'spring';
  else if (currentMonth >= 5 && currentMonth <= 7) currentSeason = 'summer';
  else if (currentMonth >= 8 && currentMonth <= 10) currentSeason = 'autumn';
  else currentSeason = 'winter';
  
  // Update season after a short delay to ensure all objects are created
  setTimeout(() => {
    updateSeason(currentSeason);
  }, 100);
}

// Update season visuals
function updateSeason(season) {
  currentSeason = season;
  
  // Update ground color
  if (season === 'spring') {
    groundMaterial.color.setHex(0x7cb342); // Green
  } else if (season === 'summer') {
    groundMaterial.color.setHex(0x8bc34a); // Bright green
  } else if (season === 'autumn') {
    groundMaterial.color.setHex(0x8d6e63); // Brown
  } else if (season === 'winter') {
    groundMaterial.color.setHex(0xe0e0e0); // Light gray/white
  }
  
  // Update sky color
  if (season === 'spring') {
    scene.background = new THREE.Color(0x87ceeb); // Sky blue
    scene.fog = new THREE.Fog(0x87ceeb, 20, 40);
  } else if (season === 'summer') {
    scene.background = new THREE.Color(0xffd54f); // Bright yellow/sunny
    scene.fog = new THREE.Fog(0xffd54f, 30, 50);
  } else if (season === 'autumn') {
    scene.background = new THREE.Color(0xffb74d); // Warm orange
    scene.fog = new THREE.Fog(0xffb74d, 25, 45);
  } else if (season === 'winter') {
    scene.background = new THREE.Color(0xcfd8dc); // Gray/cloudy
    scene.fog = new THREE.Fog(0xcfd8dc, 15, 35);
  }
  
  // Update hills color
  hillsGroup.children.forEach(hill => {
    if (season === 'spring') {
      hill.material.color.setHex(0x558b2f); // Dark green
    } else if (season === 'summer') {
      hill.material.color.setHex(0x66bb6a); // Green
    } else if (season === 'autumn') {
      hill.material.color.setHex(0x6d4c41); // Brown
    } else if (season === 'winter') {
      hill.material.color.setHex(0x9e9e9e); // Gray
    }
  });
  
  // Update flowers visibility based on season
  flowers.forEach(flower => {
    if (season === 'spring' || season === 'summer') {
      flower.visible = true; // Flowers bloom in spring and summer
    } else {
      flower.visible = false; // No flowers in autumn and winter
    }
  });
  
  // Update plants/grass visibility and color
  plants.forEach(plant => {
    if (season === 'winter') {
      plant.visible = false; // Grass dies in winter
    } else {
      plant.visible = true;
      if (season === 'spring') {
        plant.material.color.setHex(0x4caf50); // Bright green
      } else if (season === 'summer') {
        plant.material.color.setHex(0x66bb6a); // Green
      } else if (season === 'autumn') {
        plant.material.color.setHex(0x8d6e63); // Brown
      }
    }
  });
  
  // Remove old effects
  if (seasonEffects.sun) {
    scene.remove(seasonEffects.sun);
    seasonEffects.sun = null;
  }
  
  // Clear snow particles
  seasonEffects.snowParticles.forEach(particle => scene.remove(particle));
  seasonEffects.snowParticles = [];
  
  // Clear rain particles
  seasonEffects.rainParticles.forEach(particle => scene.remove(particle));
  seasonEffects.rainParticles = [];
  
  // Add season-specific effects
  if (season === 'summer') {
    // Add sun
    const sunGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const sunMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffeb3b,
      emissive: 0xffeb3b,
      emissiveIntensity: 1
    });
    seasonEffects.sun = new THREE.Mesh(sunGeometry, sunMaterial);
    seasonEffects.sun.position.set(8, 8, -8);
    scene.add(seasonEffects.sun);
  } else if (season === 'winter') {
    // Create snow particles
    const snowGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const snowMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffffff,
      transparent: true,
      opacity: 0.9
    });
    
    for (let i = 0; i < 200; i++) {
      const snow = new THREE.Mesh(snowGeometry, snowMaterial.clone());
      snow.position.set(
        (Math.random() - 0.5) * 30,
        Math.random() * 20 + 5,
        (Math.random() - 0.5) * 30
      );
      snow.userData.velocity = {
        x: (Math.random() - 0.5) * 0.02,
        y: -0.05 - Math.random() * 0.05,
        z: (Math.random() - 0.5) * 0.02
      };
      scene.add(snow);
      seasonEffects.snowParticles.push(snow);
    }
  } else if (season === 'autumn') {
    // Create rain particles (falling from clouds)
    const rainGeometry = new THREE.CylinderGeometry(0.008, 0.008, 0.2, 4); // Slightly thicker and longer
    const rainMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x87ceeb, // Sky blue/light blue
      transparent: true,
      opacity: 0.9 // More visible
    });
    
    // Create rain drops from cloud positions
    for (let i = 0; i < 300; i++) {
      const rain = new THREE.Mesh(rainGeometry, rainMaterial.clone());
      
      // Random position near clouds
      const cloudIndex = Math.floor(Math.random() * seasonEffects.clouds.length);
      const cloud = seasonEffects.clouds[cloudIndex];
      
      rain.position.set(
        cloud.position.x + (Math.random() - 0.5) * 4,
        cloud.position.y - Math.random() * 2 - 1,
        cloud.position.z + (Math.random() - 0.5) * 4
      );
      
      // Wind direction (from left to right, with some variation)
      const windStrength = 0.15 + Math.random() * 0.1; // Strong horizontal movement
      const windAngle = Math.PI / 6 + (Math.random() - 0.5) * Math.PI / 12; // ~30 degrees angle
      
      rain.userData.velocity = {
        x: windStrength * Math.cos(windAngle), // Strong horizontal movement (wind)
        y: -0.2 - Math.random() * 0.1, // Falling speed
        z: windStrength * Math.sin(windAngle) * 0.3 // Some depth movement
      };
      
      // Rotate rain to match wind direction (tilted, not vertical)
      rain.rotation.z = Math.PI / 2 - windAngle; // Tilt based on wind angle
      rain.rotation.y = windAngle; // Rotate around Y axis for wind direction
      scene.add(rain);
      seasonEffects.rainParticles.push(rain);
    }
  }
  
  // Update UI
  updateSeasonUI(season);
}

// Update season UI panel
function updateSeasonUI(season) {
  const buttons = document.querySelectorAll('.season-btn');
  buttons.forEach(btn => {
    if (btn.dataset.season === season) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// Update snow animation
function animateSnow() {
  if (currentSeason === 'winter' && seasonEffects.snowParticles.length > 0) {
    seasonEffects.snowParticles.forEach(snow => {
      snow.position.x += snow.userData.velocity.x;
      snow.position.y += snow.userData.velocity.y;
      snow.position.z += snow.userData.velocity.z;
      
      // Reset if fallen
      if (snow.position.y < 0) {
        snow.position.y = 20;
        snow.position.x = (Math.random() - 0.5) * 30;
        snow.position.z = (Math.random() - 0.5) * 30;
      }
    });
  }
}

// Update clouds animation (floating movement)
function animateClouds() {
  if (seasonEffects.clouds && seasonEffects.clouds.length > 0) {
    seasonEffects.clouds.forEach(cloud => {
      // Move cloud horizontally
      cloud.position.x += cloud.userData.velocity.x;
      cloud.position.y += cloud.userData.velocity.y;
      
      // Reset if moved too far (wrap around)
      if (cloud.position.x > 30) {
        cloud.position.x = -30;
      } else if (cloud.position.x < -30) {
        cloud.position.x = 30;
      }
      
      // Slight vertical oscillation
      const originalY = cloud.userData.originalY || cloud.position.y;
      cloud.userData.originalY = originalY;
      cloud.position.y = originalY + Math.sin(Date.now() * 0.0005 + cloud.position.x) * 0.3;
    });
  }
}

// Update rain animation
function animateRain() {
  if (currentSeason === 'autumn' && seasonEffects.rainParticles.length > 0) {
    seasonEffects.rainParticles.forEach(rain => {
      rain.position.x += rain.userData.velocity.x;
      rain.position.y += rain.userData.velocity.y;
      rain.position.z += rain.userData.velocity.z;
      
      // Reset if fallen below ground or moved too far horizontally (respawn from clouds)
      if (rain.position.y < 0 || Math.abs(rain.position.x) > 30) {
        const cloudIndex = Math.floor(Math.random() * seasonEffects.clouds.length);
        const cloud = seasonEffects.clouds[cloudIndex];
        
        // Recalculate wind direction for new rain drop
        const windStrength = 0.15 + Math.random() * 0.1;
        const windAngle = Math.PI / 6 + (Math.random() - 0.5) * Math.PI / 12;
        
        rain.position.set(
          cloud.position.x + (Math.random() - 0.5) * 4,
          cloud.position.y - Math.random() * 2 - 1,
          cloud.position.z + (Math.random() - 0.5) * 4
        );
        
        // Update velocity and rotation for new position
        rain.userData.velocity = {
          x: windStrength * Math.cos(windAngle),
          y: -0.2 - Math.random() * 0.1,
          z: windStrength * Math.sin(windAngle) * 0.3
        };
        
        rain.rotation.z = Math.PI / 2 - windAngle;
        rain.rotation.y = windAngle;
      }
    });
  }
}

// Initialize season system
initSeasonSystem();

// Season control panel event listeners
document.addEventListener('DOMContentLoaded', () => {
  const seasonButtons = document.querySelectorAll('.season-btn');
  seasonButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const season = btn.dataset.season;
      updateSeason(season);
    });
  });
});

scene.add(groundGroup);

// Create campfire
function createCampfire() {
  const campfireGroup = new THREE.Group();
  
  // Fire pit base (stones in circle)
  const stoneCount = 8;
  for (let i = 0; i < stoneCount; i++) {
    const angle = (i / stoneCount) * Math.PI * 2;
    const stoneGeometry = new THREE.DodecahedronGeometry(0.15, 0);
    const stoneMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x424242,
      roughness: 0.9
    });
    const stone = new THREE.Mesh(stoneGeometry, stoneMaterial);
    stone.position.set(
      Math.cos(angle) * 0.4,
      0.08,
      Math.sin(angle) * 0.4
    );
    stone.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    stone.castShadow = true;
    stone.receiveShadow = true;
    campfireGroup.add(stone);
  }
  
  // Logs (wood pieces)
  const logGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.6, 8);
  const logMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x5d4037,
    roughness: 0.8
  });
  
  // Three logs arranged in a teepee shape
  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2;
    const log = new THREE.Mesh(logGeometry, logMaterial);
    log.position.set(
      Math.cos(angle) * 0.15,
      0.3,
      Math.sin(angle) * 0.15
    );
    log.rotation.z = Math.PI / 6; // Tilt inward
    log.rotation.y = angle + Math.PI / 2;
    log.castShadow = true;
    log.receiveShadow = true;
    campfireGroup.add(log);
  }
  
  // Fire particles (will be animated)
  const fireParticles = [];
  const fireGeometry = new THREE.SphereGeometry(0.05, 8, 8);
  
  for (let i = 0; i < 30; i++) {
    const fireMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(0.1 - Math.random() * 0.1, 1, 0.5),
      transparent: true,
      opacity: 0.8
    });
    const particle = new THREE.Mesh(fireGeometry, fireMaterial);
    particle.position.set(
      (Math.random() - 0.5) * 0.3,
      Math.random() * 0.4 + 0.2,
      (Math.random() - 0.5) * 0.3
    );
    particle.userData.velocity = {
      x: (Math.random() - 0.5) * 0.005, // Slower horizontal movement
      y: 0.01 + Math.random() * 0.015, // Slower rising speed
      z: (Math.random() - 0.5) * 0.005 // Slower horizontal movement
    };
    particle.userData.life = Math.random();
    campfireGroup.add(particle);
    fireParticles.push(particle);
  }
  
  // Fire light (point light)
  const fireLight = new THREE.PointLight(0xff6600, 2, 5);
  fireLight.position.set(0, 0.5, 0);
  campfireGroup.add(fireLight);
  
  // Store fire particles for animation
  campfireGroup.userData.fireParticles = fireParticles;
  campfireGroup.userData.fireLight = fireLight;
  
  campfireGroup.castShadow = true;
  campfireGroup.receiveShadow = true;
  
  return campfireGroup;
}

// Position campfire a few meters away from tree
const campfire = createCampfire();
campfire.position.set(-4, 0, 3);
scene.add(campfire);

// Store campfire reference for animation
let campfireRef = campfire;

// Create Minecraft-style dog
function createDog() {
  const dogGroup = new THREE.Group();
  
  // Body (cube)
  const bodyGeometry = new THREE.BoxGeometry(0.4, 0.3, 0.6);
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 }); // Brown
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = 0.3;
  dogGroup.add(body);
  
  // Head (cube)
  const headGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
  const headMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.set(0, 0.5, 0.3);
  dogGroup.add(head);
  
  // Snout
  const snoutGeometry = new THREE.BoxGeometry(0.15, 0.1, 0.15);
  const snoutMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
  const snout = new THREE.Mesh(snoutGeometry, snoutMaterial);
  snout.position.set(0, 0.45, 0.45);
  dogGroup.add(snout);
  
  // Ears (two cubes)
  const earGeometry = new THREE.BoxGeometry(0.1, 0.15, 0.05);
  const earMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
  
  const leftEar = new THREE.Mesh(earGeometry, earMaterial);
  leftEar.position.set(-0.15, 0.6, 0.2);
  leftEar.rotation.z = -Math.PI / 6;
  dogGroup.add(leftEar);
  
  const rightEar = new THREE.Mesh(earGeometry, earMaterial);
  rightEar.position.set(0.15, 0.6, 0.2);
  rightEar.rotation.z = Math.PI / 6;
  dogGroup.add(rightEar);
  
  // Legs (four cubes)
  const legGeometry = new THREE.BoxGeometry(0.1, 0.2, 0.1);
  const legMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
  
  const frontLeftLeg = new THREE.Mesh(legGeometry, legMaterial);
  frontLeftLeg.position.set(-0.15, 0.1, 0.2);
  dogGroup.add(frontLeftLeg);
  
  const frontRightLeg = new THREE.Mesh(legGeometry, legMaterial);
  frontRightLeg.position.set(0.15, 0.1, 0.2);
  dogGroup.add(frontRightLeg);
  
  const backLeftLeg = new THREE.Mesh(legGeometry, legMaterial);
  backLeftLeg.position.set(-0.15, 0.1, -0.2);
  dogGroup.add(backLeftLeg);
  
  const backRightLeg = new THREE.Mesh(legGeometry, legMaterial);
  backRightLeg.position.set(0.15, 0.1, -0.2);
  dogGroup.add(backRightLeg);
  
  // Tail (cube) - store reference for animation
  const tailGeometry = new THREE.BoxGeometry(0.08, 0.08, 0.2);
  const tailMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
  const tail = new THREE.Mesh(tailGeometry, tailMaterial);
  tail.position.set(0, 0.35, -0.35);
  tail.rotation.x = Math.PI / 4;
  dogGroup.add(tail);
  
  // Store references for animation
  dogGroup.userData.tail = tail;
  dogGroup.userData.head = head;
  dogGroup.userData.body = body;
  dogGroup.userData.originalTailRotation = tail.rotation.clone();
  
  dogGroup.castShadow = true;
  dogGroup.receiveShadow = true;
  
  return dogGroup;
}

// Position dog near campfire, looking at tree
const dog = createDog();
dog.position.set(-3.5, 0, 2.5); // Near campfire (-4, 0, 3)
// Calculate angle to look at tree (tree is at 0, 0, 0)
const dogTreePos = new THREE.Vector3(0, 0, 0);
const dogToTree = new THREE.Vector3().subVectors(dogTreePos, dog.position).normalize();
dog.rotation.y = Math.atan2(dogToTree.x, dogToTree.z); // Look towards tree
scene.add(dog);

// Store dog reference for animation
let dogRef = dog;

// Create an improved person figure with better proportions and hand animations
// seasonColor: color for clothing (body)
function createPerson(seasonColor = 0x2196f3) {
  const personGroup = new THREE.Group();
  
  // Body (torso) - more detailed with seasonal color
  const bodyGeometry = new THREE.CylinderGeometry(0.18, 0.22, 0.65, 12);
  const bodyMaterial = new THREE.MeshStandardMaterial({ 
    color: seasonColor,
    roughness: 0.7
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = 0.325;
  body.castShadow = true;
  personGroup.add(body);
  
  // Head - more detailed with neck
  const neckGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.1, 8);
  const neckMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac });
  const neck = new THREE.Mesh(neckGeometry, neckMaterial);
  neck.position.y = 0.65;
  neck.castShadow = true;
  personGroup.add(neck);
  
  const headGeometry = new THREE.SphereGeometry(0.13, 16, 16);
  const headMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xffdbac,
    roughness: 0.6
  });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.y = 0.8;
  head.castShadow = true;
  personGroup.add(head);
  
  // Hair
  const hairGeometry = new THREE.SphereGeometry(0.14, 16, 16);
  const hairMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x4a3728, // Brown hair
    roughness: 0.8
  });
  const hair = new THREE.Mesh(hairGeometry, hairMaterial);
  hair.position.y = 0.82; // Slightly above head
  hair.scale.set(1, 0.6, 1); // Flatten on top
  hair.castShadow = true;
  personGroup.add(hair);
  
  // Eyes
  const eyeGeometry = new THREE.SphereGeometry(0.015, 8, 8);
  const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
  
  // Left eye
  const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  leftEye.position.set(-0.04, 0.82, 0.11); // On front of head
  personGroup.add(leftEye);
  
  // Right eye
  const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  rightEye.position.set(0.04, 0.82, 0.11); // On front of head
  personGroup.add(rightEye);
  
  // Nose
  const noseGeometry = new THREE.ConeGeometry(0.01, 0.02, 6);
  const noseMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac });
  const nose = new THREE.Mesh(noseGeometry, noseMaterial);
  nose.position.set(0, 0.8, 0.12); // Below eyes, on front
  nose.rotation.x = Math.PI; // Point forward
  personGroup.add(nose);
  
  // Mouth
  const mouthGeometry = new THREE.TorusGeometry(0.02, 0.005, 4, 8, Math.PI);
  const mouthMaterial = new THREE.MeshStandardMaterial({ color: 0x8b0000 }); // Dark red
  const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
  mouth.position.set(0, 0.77, 0.11); // Below nose
  mouth.rotation.x = Math.PI / 2; // Horizontal smile
  personGroup.add(mouth);
  
  // Shoulders removed - arms start from middle of torso
  
  // Arm materials
  const armMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xffdbac,
    roughness: 0.6
  });
  const handMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xffdbac,
    roughness: 0.6
  });
  
  // LEFT ARM - Single continuous arm (starting from middle of torso, going upward)
  const leftArmGeometry = new THREE.CylinderGeometry(0.06, 0.07, 0.5, 8); // Single long cylinder
  const leftArm = new THREE.Mesh(leftArmGeometry, armMaterial);
  leftArm.position.set(-0.18, 0.575, 0); // At middle of torso, extending upward
  leftArm.rotation.z = Math.PI / 2; // Rotate to point upward
  leftArm.castShadow = true;
  personGroup.add(leftArm);
  
  // Left hand (at end of arm)
  const handGeometry = new THREE.BoxGeometry(0.08, 0.1, 0.06);
  const leftHand = new THREE.Mesh(handGeometry, handMaterial);
  leftHand.position.set(-0.18, 0.825, 0); // At end of left arm
  leftHand.castShadow = true;
  personGroup.add(leftHand);
  
  // RIGHT ARM - Single continuous arm (starting from middle of torso, going upward)
  const rightArmGeometry = new THREE.CylinderGeometry(0.06, 0.07, 0.5, 8); // Single long cylinder
  const rightArm = new THREE.Mesh(rightArmGeometry, armMaterial);
  rightArm.position.set(0.18, 0.575, 0); // At middle of torso, extending upward
  rightArm.rotation.z = Math.PI / 2; // Rotate to point upward
  rightArm.castShadow = true;
  personGroup.add(rightArm);
  
  // Right hand (at end of arm)
  const rightHand = new THREE.Mesh(handGeometry, handMaterial);
  rightHand.position.set(0.18, 0.825, 0); // At end of right arm
  rightHand.castShadow = true;
  personGroup.add(rightHand);
  
  // Legs - more detailed
  const upperLegGeometry = new THREE.CylinderGeometry(0.08, 0.09, 0.3, 8);
  const legMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x424242,
    roughness: 0.8
  });
  
  // Left upper leg
  const leftUpperLeg = new THREE.Mesh(upperLegGeometry, legMaterial);
  leftUpperLeg.position.set(-0.1, -0.1, 0);
  leftUpperLeg.castShadow = true;
  personGroup.add(leftUpperLeg);
  
  // Right upper leg
  const rightUpperLeg = new THREE.Mesh(upperLegGeometry, legMaterial);
  rightUpperLeg.position.set(0.1, -0.1, 0);
  rightUpperLeg.castShadow = true;
  personGroup.add(rightUpperLeg);
  
  // Lower legs
  const lowerLegGeometry = new THREE.CylinderGeometry(0.07, 0.08, 0.28, 8);
  
  // Left lower leg
  const leftLowerLeg = new THREE.Mesh(lowerLegGeometry, legMaterial);
  leftLowerLeg.position.set(-0.1, -0.34, 0);
  leftLowerLeg.castShadow = true;
  personGroup.add(leftLowerLeg);
  
  // Right lower leg
  const rightLowerLeg = new THREE.Mesh(lowerLegGeometry, legMaterial);
  rightLowerLeg.position.set(0.1, -0.34, 0);
  rightLowerLeg.castShadow = true;
  personGroup.add(rightLowerLeg);
  
  // Feet
  const footGeometry = new THREE.BoxGeometry(0.12, 0.06, 0.2);
  const footMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x212121,
    roughness: 0.9
  });
  
  const leftFoot = new THREE.Mesh(footGeometry, footMaterial);
  leftFoot.position.set(-0.1, -0.5, 0.05);
  leftFoot.castShadow = true;
  personGroup.add(leftFoot);
  
  const rightFoot = new THREE.Mesh(footGeometry, footMaterial);
  rightFoot.position.set(0.1, -0.5, 0.05);
  rightFoot.castShadow = true;
  personGroup.add(rightFoot);
  
  // Store references (no animation needed)
  personGroup.userData.head = head;
  personGroup.userData.body = body;
  
  return personGroup;
}

// Seasonal color palette for clothing
const SEASONAL_COLORS = {
  spring: 0x66bb6a,   // Green
  summer: 0xffc107,   // Yellow/Amber
  autumn: 0xff6b35,   // Orange
  winter: 0x64b5f6    // Light blue
};

// Create people for each season
const people = [];

// Spring person - Green clothing
const springPerson = createPerson(SEASONAL_COLORS.spring);
springPerson.position.set(-5, 0, -3);
const springPersonTreePos = new THREE.Vector3(0, 0, 0);
const springPersonToTree = new THREE.Vector3().subVectors(springPersonTreePos, springPerson.position).normalize();
springPerson.rotation.y = Math.atan2(springPersonToTree.x, springPersonToTree.z);
springPerson.castShadow = true;
scene.add(springPerson);
people.push(springPerson);

// Summer person - Yellow/Amber clothing
const summerPerson = createPerson(SEASONAL_COLORS.summer);
summerPerson.position.set(6, 0, 2);
const summerPersonTreePos = new THREE.Vector3(0, 0, 0);
const summerPersonToTree = new THREE.Vector3().subVectors(summerPersonTreePos, summerPerson.position).normalize();
summerPerson.rotation.y = Math.atan2(summerPersonToTree.x, summerPersonToTree.z);
summerPerson.castShadow = true;
scene.add(summerPerson);
people.push(summerPerson);

// Autumn person - Orange clothing
const autumnPerson = createPerson(SEASONAL_COLORS.autumn);
autumnPerson.position.set(5, 0, -2); // Original position
const autumnPersonTreePos = new THREE.Vector3(0, 0, 0);
const autumnPersonToTree = new THREE.Vector3().subVectors(autumnPersonTreePos, autumnPerson.position).normalize();
autumnPerson.rotation.y = Math.atan2(autumnPersonToTree.x, autumnPersonToTree.z);
autumnPerson.castShadow = true;
scene.add(autumnPerson);
people.push(autumnPerson);

// Winter person - Light blue clothing
const winterPerson = createPerson(SEASONAL_COLORS.winter);
winterPerson.position.set(-6, 0, 2);
const winterPersonTreePos = new THREE.Vector3(0, 0, 0);
const winterPersonToTree = new THREE.Vector3().subVectors(winterPersonTreePos, winterPerson.position).normalize();
winterPerson.rotation.y = Math.atan2(winterPersonToTree.x, winterPersonToTree.z);
winterPerson.castShadow = true;
scene.add(winterPerson);
people.push(winterPerson);

// Store people references for animation
let peopleRefs = people;

// Background image plane
const textureLoader = new THREE.TextureLoader();
let backgroundPlane = null;

textureLoader.load(
  '/bg.jpg',
  (texture) => {
    // Background loaded successfully
    const bgWidth = 32;
    const bgHeight = 18;
    const bgGeometry = new THREE.PlaneGeometry(bgWidth, bgHeight);
    const bgMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide
    });
    backgroundPlane = new THREE.Mesh(bgGeometry, bgMaterial);
    backgroundPlane.position.z = -15;
    backgroundPlane.position.y = bgHeight / 2 - 2;
    scene.add(backgroundPlane);
  },
  undefined,
  (error) => {
    // Background image not found, create a simple gradient background instead
    console.warn('Background image not found, using gradient background');
    scene.background = new THREE.Color(0x87ceeb);
  }
);

// Create seasonal tree
let tree;
try {
  console.log('Initializing tree...');
  tree = new SeasonalTree(scene);
  console.log('Tree initialized successfully');
} catch (error) {
  console.error('Error initializing tree:', error);
  throw error;
}

// Debug: Log tree info
console.log('Tree created:', {
  branches: tree.branches.length,
  leaves: tree.leaves.length,
  todayLeafColor: 'Gold (#ffd700) with glow',
  seasonBranches: 'Colored with glow (Spring: Green, Summer: Dark Green, Autumn: Orange-Red, Winter: Blue)'
});

// Ensure initial render
renderer.render(scene, camera);

// Raycaster for hover detection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredLeaf = null;

// Get all leaf meshes for raycaster (include both leaf groups and individual meshes)
const leafMeshes = [];
tree.leaves.forEach(leaf => {
  if (leaf.mesh instanceof THREE.Group) {
    // Add all children of the group
    leaf.mesh.children.forEach(child => leafMeshes.push(child));
    // Also add the group itself for better detection
    leafMeshes.push(leaf.mesh);
  } else {
    leafMeshes.push(leaf.mesh);
  }
});

// Pointer move handler
function onPointerMove(event) {
  // Calculate mouse position in normalized device coordinates
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update raycaster
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(leafMeshes);

  // Handle hover
  if (intersects.length > 0) {
    const intersectedMesh = intersects[0].object;
    const leaf = tree.getLeafFromMesh(intersectedMesh);

    if (leaf && leaf !== hoveredLeaf) {
      // Unhighlight previous leaf
      if (hoveredLeaf) {
        tree.unhighlightLeaf(hoveredLeaf);
      }

      // Highlight new leaf
      hoveredLeaf = leaf;
      tree.highlightLeaf(leaf);

      // Show tooltip
      const tooltip = document.getElementById('tooltip');
      const locale = getLocale(currentLang);
      
      const dateFormatter = new Intl.DateTimeFormat(locale, {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });

      tooltip.innerHTML = `
        <div class="date">${dateFormatter.format(leaf.date)}</div>
        <div class="season">${t[leaf.season]}</div>
      `;
      tooltip.style.left = event.clientX + 10 + 'px';
      tooltip.style.top = event.clientY + 10 + 'px';
      tooltip.classList.add('visible');
    }
  } else {
    // No intersection, hide tooltip and unhighlight
    if (hoveredLeaf) {
      tree.unhighlightLeaf(hoveredLeaf);
      hoveredLeaf = null;
    }
    const tooltip = document.getElementById('tooltip');
    tooltip.classList.remove('visible');
  }
}

window.addEventListener('pointermove', onPointerMove);

// Helper function to get day of year
function getDayOfYear(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// Helper function to check if year is leap year
function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

// Helper function to get total days in year
function getDaysInYear(year) {
  return isLeapYear(year) ? 366 : 365;
}

// Initialize localization - update all text elements
function initializeLocalization() {
  // Update UI text elements
  const titleElement = document.querySelector('.ui-content h1');
  const subtitleElement = document.querySelector('.ui-content .subtitle');
  const leavesFallenLabel = document.querySelector('.stat-item:first-child .stat-label');
  const leavesRemainingLabel = document.querySelector('.stat-item:last-child .stat-label');
  const seasonsTitle = document.querySelector('.season-panel-title');
  const seasonButtons = document.querySelectorAll('.season-btn .season-name');
  const uiToggleBtn = document.getElementById('uiToggleBtn');
  const seasonToggleBtn = document.getElementById('seasonToggleBtn');
  const closeButtons = document.querySelectorAll('.close-btn');
  
  if (titleElement) titleElement.textContent = t.title;
  if (subtitleElement) subtitleElement.textContent = t.subtitle;
  if (leavesFallenLabel) leavesFallenLabel.textContent = t.leavesFallen;
  if (leavesRemainingLabel) leavesRemainingLabel.textContent = t.leavesRemaining;
  if (seasonsTitle) seasonsTitle.textContent = t.seasons;
  
  // Update season button names
  seasonButtons.forEach(btn => {
    const season = btn.closest('.season-btn').dataset.season;
    if (season) {
      btn.textContent = t[season];
    }
  });
  
  // Update tooltips
  if (uiToggleBtn) uiToggleBtn.title = t.showCalendarInfo;
  if (seasonToggleBtn) seasonToggleBtn.title = t.showSeasons;
  closeButtons.forEach(btn => {
    btn.title = t.close;
    btn.setAttribute('aria-label', t.close);
  });
  
  // Update About link
  const aboutLink = document.getElementById('aboutLink');
  if (aboutLink && t.aboutTitle) {
    aboutLink.textContent = t.aboutTitle;
  }
  
  // Update HTML lang attribute and direction
  document.documentElement.lang = currentLang;
  document.documentElement.dir = rtl ? 'rtl' : 'ltr';
  
  // Apply RTL styles to UI elements
  if (rtl) {
    document.body.classList.add('rtl');
  } else {
    document.body.classList.remove('rtl');
  }
}

// Update current date display and leaf statistics
function updateCurrentDate() {
  const dateElement = document.getElementById('currentDate');
  // Use detected language for date formatting
  const locale = getLocale(currentLang);
  
  const formatter = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  dateElement.textContent = formatter.format(new Date());
  
  // Update leaf statistics
  updateLeafStatistics();
}

// Update leaf statistics (fallen and remaining)
function updateLeafStatistics() {
  const today = new Date();
  const currentDayOfYear = getDayOfYear(today);
  const currentYear = today.getFullYear();
  const daysInYear = getDaysInYear(currentYear);
  
  // Leaves fallen: from start of year to today (excluding today)
  const leavesFallen = currentDayOfYear - 1;
  
  // Leaves remaining: from today to end of year (including today)
  const leavesRemaining = daysInYear - currentDayOfYear + 1;
  
  // Update DOM
  const fallenElement = document.getElementById('leavesFallen');
  const remainingElement = document.getElementById('leavesRemaining');
  
  if (fallenElement) {
    fallenElement.textContent = leavesFallen;
  }
  
  if (remainingElement) {
    remainingElement.textContent = leavesRemaining;
  }
}

// Initialize localization and update UI
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeLocalization();
    updateCurrentDate();
  });
} else {
  initializeLocalization();
  updateCurrentDate();
}

setInterval(updateCurrentDate, 1000 * 60 * 60); // Update every hour

// HUD Toggle functionality
let uiOverlayTimeout = null;
let seasonPanelTimeout = null;
let uiUserOpened = false;
let seasonUserOpened = false;

function initHUDToggle() {
  const uiOverlay = document.getElementById('uiOverlay');
  const uiToggleBtn = document.getElementById('uiToggleBtn');
  const uiCloseBtn = document.getElementById('uiCloseBtn');
  const seasonPanel = document.getElementById('seasonPanel');
  const seasonToggleBtn = document.getElementById('seasonToggleBtn');
  const seasonCloseBtn = document.getElementById('seasonCloseBtn');
  
  // Open UI Overlay (user clicked toggle)
  function openUIOverlay() {
    uiOverlay.classList.remove('collapsed');
    uiUserOpened = true;
    // Clear any existing timeout
    if (uiOverlayTimeout) {
      clearTimeout(uiOverlayTimeout);
      uiOverlayTimeout = null;
    }
  }
  
  // Close UI Overlay (user clicked close button)
  function closeUIOverlay() {
    uiOverlay.classList.add('collapsed');
    uiUserOpened = false;
    // Clear any existing timeout
    if (uiOverlayTimeout) {
      clearTimeout(uiOverlayTimeout);
      uiOverlayTimeout = null;
    }
  }
  
  // Open Season Panel (user clicked toggle)
  function openSeasonPanel() {
    seasonPanel.classList.remove('collapsed');
    seasonUserOpened = true;
    // Clear any existing timeout
    if (seasonPanelTimeout) {
      clearTimeout(seasonPanelTimeout);
      seasonPanelTimeout = null;
    }
  }
  
  // Close Season Panel (user clicked close button)
  function closeSeasonPanel() {
    seasonPanel.classList.add('collapsed');
    seasonUserOpened = false;
    // Clear any existing timeout
    if (seasonPanelTimeout) {
      clearTimeout(seasonPanelTimeout);
      seasonPanelTimeout = null;
    }
  }
  
  // Add click event listeners
  if (uiToggleBtn) {
    uiToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openUIOverlay();
    });
  }
  
  if (uiCloseBtn) {
    uiCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeUIOverlay();
    });
  }
  
  if (seasonToggleBtn) {
    seasonToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openSeasonPanel();
    });
  }
  
  if (seasonCloseBtn) {
    seasonCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeSeasonPanel();
    });
  }
  
  // Auto-close both HUDs after 2 seconds on page load (only if user hasn't opened them)
  setTimeout(() => {
    if (uiOverlay && !uiUserOpened) {
      uiOverlay.classList.add('collapsed');
    }
    if (seasonPanel && !seasonUserOpened) {
      seasonPanel.classList.add('collapsed');
    }
  }, 2000);
}

// Initialize HUD toggle when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHUDToggle);
} else {
  initHUDToggle();
}

// Footer auto-hide functionality
function initFooterAutoHide() {
  const footer = document.querySelector('.main-footer');
  if (!footer) return;
  
  let hideTimeout = null;
  let rehideTimeout = null;
  
  // Show footer initially
  footer.classList.remove('hidden');
  
  // Function to hide footer
  const hideFooter = () => {
    footer.classList.add('hidden');
  };
  
  // Function to show footer
  const showFooter = () => {
    footer.classList.remove('hidden');
    // Clear any pending hide timeouts
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
    if (rehideTimeout) {
      clearTimeout(rehideTimeout);
      rehideTimeout = null;
    }
  };
  
  // Hide footer after 3 seconds
  hideTimeout = setTimeout(hideFooter, 3000);
  
  // Show footer on hover (including hover area)
  footer.addEventListener('mouseenter', showFooter);
  
  // Re-hide footer after mouse leaves (with delay)
  footer.addEventListener('mouseleave', () => {
    rehideTimeout = setTimeout(hideFooter, 2000);
  });
}

// Initialize footer auto-hide when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFooterAutoHide);
} else {
  initFooterAutoHide();
}

// Resize handler
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize);

// Animation loop
let clock = new THREE.Clock();
let lastFrameTime = 0;

function animate() {
  requestAnimationFrame(animate);

  try {
    const elapsedTime = clock.getElapsedTime();
    let deltaTime = elapsedTime - lastFrameTime;
    // Clamp deltaTime to prevent large jumps on first frame or tab switch
    if (deltaTime > 0.1) deltaTime = 0.016; // Cap at ~60fps
    lastFrameTime = elapsedTime;

    // Update tree (breathing effect)
    if (tree) {
      tree.update(elapsedTime);

      // Update leaf colors (check once per second)
      if (Math.floor(elapsedTime) !== Math.floor(elapsedTime - 0.016)) {
        tree.updateLeafColorsByDate();
      }
    }

    // Animate season effects
    animateSnow();
    animateClouds();
    animateRain();
    
    // Animate campfire
    animateCampfire(elapsedTime);
    
    // Animate dog and person
    animateDog(elapsedTime);
    animatePerson(elapsedTime);

    // Auto-rotate camera after 5 seconds of inactivity (circular rotation around tree)
    const timeSinceLastInteraction = (Date.now() - lastInteractionTime) / 1000;
    
    if (timeSinceLastInteraction > 5 && !isAutoRotating) {
      isAutoRotating = true;
      controls.autoRotate = false; // Disable OrbitControls auto-rotate, we'll do it manually
    } else if (timeSinceLastInteraction <= 5 && isAutoRotating) {
      isAutoRotating = false;
    }
    
    // Perform circular rotation around tree if auto-rotating
    if (isAutoRotating) {
      const treeCenter = new THREE.Vector3(0, 3, 0); // Tree center
      const rotationSpeed = 0.3; // Slow rotation speed (radians per second)
      
      // Update rotation angle using deltaTime for smooth rotation
      autoRotateAngle += rotationSpeed * deltaTime;
      
      // Calculate new camera position in a circle around the tree
      // Use horizontal distance and maintain height
      const horizontalDistance = Math.sqrt(
        Math.pow(initialCameraDistance, 2) - Math.pow(initialCameraHeight, 2)
      ) || initialCameraDistance; // Fallback if calculation fails
      
      const x = treeCenter.x + horizontalDistance * Math.cos(autoRotateAngle);
      const z = treeCenter.z + horizontalDistance * Math.sin(autoRotateAngle);
      const y = treeCenter.y + initialCameraHeight;
      
      // Set camera position directly for smooth circular motion
      camera.position.set(x, y, z);
      
      // Make camera look at tree center
      camera.lookAt(treeCenter);
      
      // Update controls target to tree center
      controls.target.copy(treeCenter);
    }

    // Update controls
    controls.update();

    // Render scene
    renderer.render(scene, camera);
  } catch (error) {
    console.error('Error in animation loop:', error);
  }
}

// Animate campfire flames
function animateCampfire(time) {
  if (campfireRef && campfireRef.userData.fireParticles) {
    const particles = campfireRef.userData.fireParticles;
    const fireLight = campfireRef.userData.fireLight;
    
    particles.forEach((particle, index) => {
      // Update particle position (rising and flickering) - slower movement
      particle.position.x += particle.userData.velocity.x + Math.sin(time * 2 + index) * 0.005;
      particle.position.y += particle.userData.velocity.y;
      particle.position.z += particle.userData.velocity.z + Math.cos(time * 2 + index) * 0.005;
      
      // Reset if too high
      if (particle.position.y > 0.8) {
        particle.position.y = 0.2;
        particle.position.x = (Math.random() - 0.5) * 0.3;
        particle.position.z = (Math.random() - 0.5) * 0.3;
      }
      
      // Flicker opacity - slower flicker
      particle.material.opacity = 0.6 + Math.sin(time * 4 + index) * 0.2;
      
      // Change color slightly (orange to yellow) - slower color change
      const hue = 0.1 - Math.random() * 0.05;
      particle.material.color.setHSL(hue, 1, 0.4 + Math.random() * 0.2);
    });
    
    // Flicker fire light intensity - slower flicker
    if (fireLight) {
      fireLight.intensity = 1.5 + Math.sin(time * 3) * 0.4;
    }
  }
}

// Animate dog (tail wagging, breathing)
function animateDog(time) {
  if (!dogRef) return;
  
  // Find tail, head, and body in the group
  const tail = dogRef.children.find(child => child.geometry && child.geometry.type === 'BoxGeometry' && child.position.z < -0.3);
  const head = dogRef.children.find(child => child.geometry && child.geometry.type === 'BoxGeometry' && child.position.y > 0.4 && child.position.z > 0.2);
  const body = dogRef.children.find(child => child.geometry && child.geometry.type === 'BoxGeometry' && child.position.y === 0.3);
  
  if (tail) {
    // Tail wagging animation
    tail.rotation.z = Math.sin(time * 3) * 0.5; // Wag tail side to side
    tail.rotation.x = Math.PI / 4 + Math.sin(time * 2) * 0.1; // Slight up/down movement
  }
  
  if (body) {
    // Breathing animation (subtle body movement)
    body.scale.y = 1 + Math.sin(time * 2) * 0.02;
  }
  
  if (head) {
    // Head slight movement (looking around)
    head.rotation.y = Math.sin(time * 0.5) * 0.1;
    head.rotation.x = Math.sin(time * 0.7) * 0.05;
  }
}

// Animate people (face looking at tree, no arm animation)
function animatePerson(time) {
  if (!peopleRefs || peopleRefs.length === 0) return;
  
  // Face always looking at tree for all people
  const treePos = new THREE.Vector3(0, 3, 0); // Tree center (at height 3)
  
  peopleRefs.forEach(personRef => {
    if (!personRef || !personRef.userData) return;
    
    const personPos = new THREE.Vector3().setFromMatrixPosition(personRef.matrixWorld);
    const personToTree = new THREE.Vector3().subVectors(treePos, personPos).normalize();
    const baseRotation = Math.atan2(personToTree.x, personToTree.z);
    personRef.rotation.y = baseRotation; // Face always towards tree
  });
}

animate();

