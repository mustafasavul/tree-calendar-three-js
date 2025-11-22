import * as THREE from 'three';

/**
 * Utility functions for date calculations
 */

/**
 * Check if a year is a leap year
 */
function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * Get the total number of days in a year
 */
function getDaysInYear(year) {
  return isLeapYear(year) ? 366 : 365;
}

/**
 * Get the day of year (1-365 or 1-366 for leap years)
 */
function getDayOfYear(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Get season from month index (0-11)
 * Winter: Dec(11), Jan(0), Feb(1)
 * Spring: Mar(2), Apr(3), May(4)
 * Summer: Jun(5), Jul(6), Aug(7)
 * Autumn: Sep(8), Oct(9), Nov(10)
 */
function getSeasonFromMonth(monthIndex) {
  if (monthIndex === 11 || monthIndex <= 1) return 'winter';
  if (monthIndex >= 2 && monthIndex <= 4) return 'spring';
  if (monthIndex >= 5 && monthIndex <= 7) return 'summer';
  return 'autumn';
}

/**
 * Get month name from index
 */
function getMonthName(monthIndex) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[monthIndex];
}

/**
 * Month color palettes (each month has its own color)
 */
const MONTH_COLORS = {
  // Spring (Mar, Apr, May) - Green tones
  2: 0x81c784, // March - Green
  3: 0x66bb6a, // April - Darker green
  4: 0x4caf50, // May - Vibrant green
  
  // Summer (Jun, Jul, Aug) - Yellow tones
  5: 0xffeb3b, // June - Bright yellow
  6: 0xffc107, // July - Amber yellow
  7: 0xffd54f, // August - Golden yellow
  
  // Autumn (Sep, Oct, Nov) - Brown, yellow, green tones
  8: 0x8d6e63, // September - Brown
  9: 0xffa726, // October - Orange-yellow
  10: 0x9ccc65, // November - Yellow-green
  
  // Winter (Dec, Jan, Feb) - Ice blue tones
  11: 0x81d4fa, // December - Light ice blue
  0: 0x4fc3f7, // January - Ice blue
  1: 0x29b6f6 // February - Bright ice blue
};

/**
 * Get month color
 */
function getMonthColor(monthIndex) {
  return MONTH_COLORS[monthIndex] || 0xcccccc;
}

/**
 * Leaf status colors
 */
const LEAF_COLORS = {
  past: 0xb0a090, // Muted wood gray
  today: 0xffd700, // Gold color
  future: 0xd4c4a8 // Light wood beige
};

/**
 * Create heart-shaped leaf geometry (like the wooden calendar design)
 */
function createLeafGeometry() {
  const shape = new THREE.Shape();
  const width = 0.24;
  const height = 0.26;
  
  // Create classic heart shape
  // Start from bottom point (where stem connects)
  const bottomY = -height / 2;
  const topY = height / 2;
  const centerX = 0;
  
  // Heart shape: two rounded lobes at top, point at bottom
  // Start from bottom point
  shape.moveTo(centerX, bottomY);
  
  // Left side: curve up to left lobe
  shape.quadraticCurveTo(
    -width / 2.2, 
    bottomY + height * 0.15, 
    -width / 2.5, 
    bottomY + height * 0.35
  );
  shape.quadraticCurveTo(
    -width / 2.3, 
    bottomY + height * 0.55, 
    -width / 3.5, 
    bottomY + height * 0.7
  );
  shape.quadraticCurveTo(
    -width / 5, 
    bottomY + height * 0.85, 
    centerX, 
    topY
  );
  
  // Right side: curve down from right lobe
  shape.quadraticCurveTo(
    width / 5, 
    bottomY + height * 0.85, 
    width / 3.5, 
    bottomY + height * 0.7
  );
  shape.quadraticCurveTo(
    width / 2.3, 
    bottomY + height * 0.55, 
    width / 2.5, 
    bottomY + height * 0.35
  );
  shape.quadraticCurveTo(
    width / 2.2, 
    bottomY + height * 0.15, 
    centerX, 
    bottomY
  );
  
  const geometry = new THREE.ShapeGeometry(shape, 24); // Smooth curves
  
  return geometry;
}

/**
 * SeasonalTree class - Creates a realistic tree with 365 leaves representing days of the year
 */
export class SeasonalTree {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.branches = [];
    this.leaves = [];
    scene.add(this.group);

    // Trunk dimensions (thicker trunk - widened)
    this.trunkHeight = 3.5;
    this.trunkRadiusTop = 0.5;
    this.trunkRadiusBottom = 1.0;

    // Shared geometries and materials for performance (wooden calendar style)
    this.leafGeometry = createLeafGeometry();
    this.leafMaterials = {
      past: new THREE.MeshStandardMaterial({ 
        color: LEAF_COLORS.past,
        side: THREE.DoubleSide,
        roughness: 0.9, // Wood-like roughness
        metalness: 0.0,
        flatShading: false
      }),
      today: new THREE.MeshStandardMaterial({ 
        color: 0xffd700, // Gold (#ffd700)
        emissive: 0xffd700, // Gold emissive
        emissiveIntensity: 0.8, // Strong glow for gold leaf
        side: THREE.DoubleSide,
        roughness: 0.3, // Shiny gold
        metalness: 0.7, // Metallic gold
        flatShading: false
      }),
      future: new THREE.MeshStandardMaterial({ 
        color: LEAF_COLORS.future,
        side: THREE.DoubleSide,
        roughness: 0.9, // Wood-like roughness
        metalness: 0.0,
        flatShading: false
      })
    };

    // Create tree components
    try {
      console.log('Creating trunk...');
      this.createTrunk();
      
      console.log('Creating branches...');
      this.createSeasonBranches();
      console.log('Branches created:', this.branches.length);
      
      // Update matrices so branches have correct world transforms
      this.group.updateMatrixWorld(true);
      
      console.log('Creating leaves...');
      this.createLeavesForYear();
      console.log('Leaves created:', this.leaves.length);
      
      // Initial color update
      console.log('Updating leaf colors...');
      this.updateLeafColorsByDate();
      
      console.log('Tree creation completed successfully!');
    } catch (error) {
      console.error('Error creating tree:', error);
      throw error;
    }
  }

  /**
   * Create the tree trunk using a smooth cylinder
   */
  createTrunk() {
    // More segments for smoother appearance
    const trunkGeometry = new THREE.CylinderGeometry(
      this.trunkRadiusTop,
      this.trunkRadiusBottom,
      this.trunkHeight,
      32 // Increased segments for smoothness
    );
    
    // Wood-like trunk material (matching wooden calendar aesthetic)
    const trunkMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xd4a574, // Light wood color (like the calendar)
      roughness: 0.9,
      metalness: 0.0
    });
    
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = this.trunkHeight / 2;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    this.group.add(trunk);
    
    // Add subtle taper variation
    trunk.scale.x = 0.95;
    trunk.scale.z = 0.95;
  }

  /**
   * Create 12 month branches (3 per season) with seamless organic connection to trunk
   */
  createSeasonBranches() {
    // Month to season mapping
    const monthSeasons = {
      2: 'spring', 3: 'spring', 4: 'spring', // Mar, Apr, May
      5: 'summer', 6: 'summer', 7: 'summer', // Jun, Jul, Aug
      8: 'autumn', 9: 'autumn', 10: 'autumn', // Sep, Oct, Nov
      11: 'winter', 0: 'winter', 1: 'winter' // Dec, Jan, Feb
    };
    
    const branchLength = 3.0;
    const branchRadius = 0.15;
    const branchHeight = this.trunkHeight * 0.85;
    const tiltAngle = Math.PI / 5; // ~36 degrees upward tilt
    
    // Get current month for highlighting active branch
    const currentMonth = new Date().getMonth();

    // Create 12 branches (one for each month)
    Object.keys(monthSeasons).forEach(monthIndexStr => {
      const monthIndex = parseInt(monthIndexStr);
      const season = monthSeasons[monthIndex];
      
      // Calculate angle - spread branches around trunk
      // Group by season: spring (0-2), summer (3-5), autumn (6-8), winter (9-11)
      const seasonIndex = season === 'spring' ? 0 : 
                         season === 'summer' ? 1 : 
                         season === 'autumn' ? 2 : 3;
      const monthInSeason = monthIndex === 2 || monthIndex === 5 || monthIndex === 8 || monthIndex === 11 ? 0 :
                           monthIndex === 3 || monthIndex === 6 || monthIndex === 9 || monthIndex === 0 ? 1 : 2;
      
      // Base angle for season
      const seasonBaseAngle = (seasonIndex * Math.PI * 2) / 4;
      // Spread within season (3 branches per season) - increased spacing
      const monthOffset = (monthInSeason - 1) * (Math.PI / 4); // ~45 degrees between branches in same season (was 30)
      const angle = seasonBaseAngle + monthOffset;
      
      // Create seamless branch using a single curved geometry
      const branchGroup = new THREE.Group();
      
      // Calculate trunk radius at branch height
      const trunkRadiusAtHeight = this.trunkRadiusTop + 
        (this.trunkRadiusBottom - this.trunkRadiusTop) * 
        (1 - branchHeight / this.trunkHeight);
      
      // Create seamless branch that starts from trunk surface
      const branchGeometry = new THREE.CylinderGeometry(
        branchRadius * 0.4, // Top radius
        trunkRadiusAtHeight * 0.85, // Bottom radius matches trunk
        branchLength + 0.2, // Slightly longer to ensure seamless connection
        24 // More segments for smoothness
      );
      
      // Get month color
      const monthColor = getMonthColor(monthIndex);
      const isActiveMonth = monthIndex === currentMonth;
      
      // Branch material - brighter for active month
      const branchMaterial = new THREE.MeshStandardMaterial({
        color: monthColor,
        roughness: isActiveMonth ? 0.3 : 0.5,
        metalness: 0.0,
        emissive: monthColor,
        emissiveIntensity: isActiveMonth ? 0.6 : 0.3 // Brighter glow for active month
      });
      
      const branch = new THREE.Mesh(branchGeometry, branchMaterial);
      // Position so it starts from trunk surface
      branch.position.y = (branchLength + 0.2) / 2 - 0.1;
      branch.castShadow = true;
      branch.receiveShadow = true;
      branchGroup.add(branch);

      // Position branch group at trunk center (will extend outward)
      branchGroup.position.x = Math.cos(angle) * trunkRadiusAtHeight * 0.7;
      branchGroup.position.z = Math.sin(angle) * trunkRadiusAtHeight * 0.7;
      branchGroup.position.y = branchHeight;
      
      // Rotate to tilt upward and align with direction
      branchGroup.rotation.z = -tiltAngle;
      branchGroup.rotation.y = angle + Math.PI / 2;
      
      // Add gentle organic curve
      branchGroup.rotation.x = (Math.random() - 0.5) * 0.1;

      this.group.add(branchGroup);
      this.branches.push({
        month: monthIndex,
        season,
        index: monthIndex,
        angle,
        mesh: branchGroup,
        branchMesh: branch,
        length: branchLength,
        height: branchHeight,
        isActive: isActiveMonth
      });
    });
  }

  /**
   * Create 365 leaves, one for each day of the current year
   */
  createLeavesForYear() {
    const currentYear = new Date().getFullYear();
    const daysInYear = getDaysInYear(currentYear);
    
    // Group days by month (each month has its own branch)
    const monthDays = {};
    for (let month = 0; month < 12; month++) {
      monthDays[month] = [];
    }

    for (let dayOfYear = 1; dayOfYear <= daysInYear; dayOfYear++) {
      const date = new Date(currentYear, 0, dayOfYear);
      const month = date.getMonth();
      monthDays[month].push({ dayOfYear, date, month });
    }

    // Create leaves for each month branch
    Object.keys(monthDays).forEach(monthIndexStr => {
      const monthIndex = parseInt(monthIndexStr);
      const days = monthDays[monthIndex];
      const branch = this.branches.find(b => b.month === monthIndex);
      
      if (!branch) {
        console.warn(`Branch not found for month ${monthIndex}`);
        return;
      }
      
      if (days.length === 0) {
        console.warn(`No days found for month ${monthIndex}`);
        return;
      }

      days.forEach((dayInfo, index) => {
        const { dayOfYear, date, month: dayMonth } = dayInfo;
        
        // Position along branch (0 to 1), distribute evenly along branch
        const t = days.length > 1 ? 0.15 + (index / (days.length - 1)) * 0.75 : 0.5;
        
        // Calculate position along branch using branch group's world matrix
        const branchGroup = branch.mesh;
        const branchMesh = branch.branchMesh;
        
        // Create a point along the branch in local space
        const localPoint = new THREE.Vector3(0, t * branch.length, 0);
        
        // Transform to world space
        const worldPoint = localPoint.applyMatrix4(branchGroup.matrixWorld);
        
        // Get branch direction in world space for proper leaf placement
        const branchStart = new THREE.Vector3(0, 0, 0).applyMatrix4(branchGroup.matrixWorld);
        const branchEnd = new THREE.Vector3(0, branch.length, 0).applyMatrix4(branchGroup.matrixWorld);
        const branchWorldDir = new THREE.Vector3()
          .subVectors(branchEnd, branchStart)
          .normalize();
        
        // Calculate branch radius at this position for leaf placement
        const branchRadiusAtT = 0.18 * (0.5 + (1 - t) * 0.5); // Use branch radius value
        
        // Place leaves on the surface of the branch (like wooden calendar)
        // Small scatter for natural distribution
        const scatterRadius = branchRadiusAtT + 0.08; // Leaves sit on branch surface
        const scatterAngle = Math.random() * Math.PI * 2;
        const scatterDistance = scatterRadius;
        
        // Create perpendicular vectors for scatter (around branch)
        const perp1 = new THREE.Vector3();
        if (Math.abs(branchWorldDir.y) < 0.9) {
          perp1.set(0, 1, 0);
        } else {
          perp1.set(1, 0, 0);
        }
        const scatterDir = new THREE.Vector3()
          .crossVectors(branchWorldDir, perp1)
          .normalize()
          .multiplyScalar(Math.cos(scatterAngle) * scatterDistance);
        
        const scatterUp = new THREE.Vector3()
          .crossVectors(scatterDir, branchWorldDir)
          .normalize()
          .multiplyScalar(Math.sin(scatterAngle) * scatterDistance);
        
        // Final leaf position (on branch surface)
        const leafPosition = worldPoint.clone()
          .add(scatterDir)
          .add(scatterUp);
        
        // Create leaf group (leaf + stem connection)
        const leafGroup = new THREE.Group();
        
        // Create small stem connection to branch (wooden style)
        const stemLength = 0.04;
        const stemGeometry = new THREE.CylinderGeometry(0.006, 0.006, stemLength, 8);
        const monthColor = getMonthColor(monthIndex);
        const stemMaterial = new THREE.MeshStandardMaterial({
          color: monthColor,
          roughness: 0.9,
          metalness: 0.0
        });
        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.position.y = -stemLength / 2;
        stem.rotation.x = Math.PI / 2;
        leafGroup.add(stem);
        
        // Create leaf mesh (reuse geometry, share materials)
        const leafMesh = new THREE.Mesh(
          this.leafGeometry,
          this.leafMaterials.future
        );
        leafMesh.position.y = stemLength / 2;
        leafGroup.add(leafMesh);

        // Set leaf group position
        leafGroup.position.copy(leafPosition);
        
        // Store original position for later use (for fallen leaves)
        const originalPosition = leafPosition.clone();

        // Rotate leaves to face outward from branch (wooden calendar style)
        // Calculate direction from branch center to leaf
        const leafToBranchDir = new THREE.Vector3()
          .subVectors(leafPosition, worldPoint)
          .normalize();
        
        // If leaf is too close to branch center, use perpendicular direction
        if (leafToBranchDir.length() < 0.01) {
          const perp = new THREE.Vector3(1, 0, 0);
          if (Math.abs(branchWorldDir.dot(perp)) > 0.9) {
            perp.set(0, 0, 1);
          }
          leafToBranchDir.crossVectors(branchWorldDir, perp).normalize();
        }
        
        // Align leaf to face outward from branch
        // Use lookAt to orient the leaf group
        const lookTarget = leafPosition.clone().add(leafToBranchDir);
        leafGroup.lookAt(lookTarget);
        
        // Rotate to align heart shape properly (heart is in XY plane, rotate to face camera)
        leafGroup.rotateX(Math.PI / 2);
        
        // Add slight random variations for natural look (like wooden calendar)
        const randomYaw = (Math.random() - 0.5) * Math.PI / 4; // Small Y rotation
        const randomPitch = (Math.random() - 0.5) * Math.PI / 6; // Small X rotation
        const randomRoll = (Math.random() - 0.5) * Math.PI / 8; // Small Z rotation
        
        leafGroup.rotateY(randomYaw);
        leafGroup.rotateX(randomPitch);
        leafGroup.rotateZ(randomRoll);
        
        // Random scale for variety (0.85 to 1.15)
        const scale = 0.85 + Math.random() * 0.3;
        leafGroup.scale.setScalar(scale);

        // Enable shadows
        leafMesh.castShadow = true;
        leafMesh.receiveShadow = true;
        stem.castShadow = true;
        stem.receiveShadow = true;

        // Store leaf data
        const leafData = {
          dayOfYear,
          date,
          month: monthIndex,
          season: branch.season, // Use season from branch
          branchIndex: branch.index,
          mesh: leafGroup, // Store group instead of just mesh
          leafMesh: leafMesh, // Store actual leaf mesh for raycaster
          originalScale: scale,
          originalPosition: originalPosition // Store original position for fallen leaves
        };

        this.leaves.push(leafData);
        this.group.add(leafGroup);
      });
    });
  }

  /**
   * Update leaf colors and positions based on current date
   * Past days: fallen leaves (on ground, faded)
   * Today: gold (glowing) on branch
   * Future: normal leaves on branch
   */
  updateLeafColorsByDate() {
    const today = new Date();
    const currentDayOfYear = getDayOfYear(today);
    const currentYear = today.getFullYear();

    this.leaves.forEach(leaf => {
      const isPast = leaf.dayOfYear < currentDayOfYear;
      const isToday = leaf.dayOfYear === currentDayOfYear;
      const isFuture = leaf.dayOfYear > currentDayOfYear;

      if (isPast) {
        // Past leaves: fallen to ground, faded
        if (leaf.mesh && leaf.originalPosition) {
          // Move leaf to ground (fallen) - only if not already fallen
          if (leaf.mesh.position.y > 0.5) { // Only move if still on branch
            const groundY = 0.05 + Math.random() * 0.05; // Slightly above ground
            const fallDistance = Math.random() * 0.8 + 0.4; // Random fall distance
            const fallAngle = Math.random() * Math.PI * 2;
            
            leaf.mesh.position.set(
              leaf.originalPosition.x + Math.cos(fallAngle) * fallDistance,
              groundY,
              leaf.originalPosition.z + Math.sin(fallAngle) * fallDistance
            );
            
            // Rotate to lie flat on ground
            leaf.mesh.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.4;
            leaf.mesh.rotation.y = Math.random() * Math.PI * 2;
            leaf.mesh.rotation.z = (Math.random() - 0.5) * 0.5;
          }
          
          // Reset scale to original (not today's leaf)
          leaf.mesh.scale.setScalar(leaf.originalScale);
          
          // Make faded/transparent
          if (leaf.leafMesh) {
            leaf.leafMesh.material = this.leafMaterials.past;
            leaf.leafMesh.material.opacity = 0.3;
            leaf.leafMesh.material.transparent = true;
          }
          
          // Hide stem for fallen leaves
          if (leaf.mesh instanceof THREE.Group) {
            leaf.mesh.children.forEach(child => {
              if (child !== leaf.leafMesh && child !== leaf.outlineMesh) {
                child.visible = false; // Hide stem
              }
            });
          }
          
          // Hide outline if exists
          if (leaf.outlineMesh) {
            leaf.outlineMesh.visible = false;
          }
        }
      } else if (isToday) {
        // Today's leaf: gold and glowing, on branch - larger size with outline
        if (leaf.mesh && leaf.originalPosition) {
          // Restore original position (on branch)
          leaf.mesh.position.copy(leaf.originalPosition);
          
          // Restore original rotation (will be recalculated by lookAt)
          // We'll keep the current rotation but ensure it's on branch
          
          // Show stem
          if (leaf.mesh instanceof THREE.Group) {
            leaf.mesh.children.forEach(child => {
              child.visible = true;
            });
          }
          
          // Make today's leaf larger (1.3x scale)
          leaf.mesh.scale.setScalar(leaf.originalScale * 1.3);
          
          // Gold material with glow
          if (leaf.leafMesh) {
            leaf.leafMesh.material = this.leafMaterials.today;
            leaf.leafMesh.material.opacity = 1.0;
            leaf.leafMesh.material.transparent = false;
            
            // Add outline effect using EdgesGeometry
            if (!leaf.outlineMesh) {
              const edges = new THREE.EdgesGeometry(leaf.leafMesh.geometry);
              const outlineMaterial = new THREE.LineBasicMaterial({
                color: 0xffffff,
                linewidth: 3,
                transparent: true,
                opacity: 0.9
              });
              leaf.outlineMesh = new THREE.LineSegments(edges, outlineMaterial);
              leaf.outlineMesh.scale.setScalar(1.08); // Slightly larger than leaf for visible outline
              leaf.mesh.add(leaf.outlineMesh);
            }
            leaf.outlineMesh.visible = true;
          }
        }
      } else {
        // Future leaves: normal, on branch
        if (leaf.mesh && leaf.originalPosition) {
          // Ensure leaf is on branch (restore if needed)
          if (leaf.mesh.position.y < 0.5) {
            leaf.mesh.position.copy(leaf.originalPosition);
          }
          
          // Reset scale to original (not today's leaf)
          leaf.mesh.scale.setScalar(leaf.originalScale);
          
          // Show stem
          if (leaf.mesh instanceof THREE.Group) {
            leaf.mesh.children.forEach(child => {
              child.visible = true;
            });
          }
          
          // Normal material
          if (leaf.leafMesh) {
            leaf.leafMesh.material = this.leafMaterials.future;
            leaf.leafMesh.material.opacity = 1.0;
            leaf.leafMesh.material.transparent = false;
          }
          
          // Hide outline if exists
          if (leaf.outlineMesh) {
            leaf.outlineMesh.visible = false;
          }
        }
      }
    });
    
    // Update branch colors based on active month
    this.updateActiveBranch();
  }
  
  /**
   * Update active month branch to be more prominent
   */
  updateActiveBranch() {
    const currentMonth = new Date().getMonth();
    
    this.branches.forEach(branch => {
      const isActiveMonth = branch.month === currentMonth;
      const monthColor = getMonthColor(branch.month);
      
      // Update branch material
      if (branch.branchMesh && branch.branchMesh.material) {
        branch.branchMesh.material.color.setHex(monthColor);
        branch.branchMesh.material.emissive.setHex(monthColor);
        branch.branchMesh.material.emissiveIntensity = isActiveMonth ? 0.6 : 0.3;
        branch.branchMesh.material.roughness = isActiveMonth ? 0.3 : 0.5;
      }
    });
  }

  /**
   * Get leaf data from mesh (for raycaster)
   */
  getLeafFromMesh(mesh) {
    // Check if mesh is the leaf mesh or part of leaf group
    return this.leaves.find(leaf => 
      leaf.mesh === mesh || 
      leaf.leafMesh === mesh ||
      (leaf.mesh instanceof THREE.Group && leaf.mesh.children.includes(mesh))
    );
  }

  /**
   * Highlight a leaf (scale up)
   */
  highlightLeaf(leaf) {
    if (leaf && leaf.mesh) {
      const today = new Date();
      const currentDayOfYear = getDayOfYear(today);
      const isToday = leaf.dayOfYear === currentDayOfYear;
      // Today's leaf is already larger, so scale less
      const scaleMultiplier = isToday ? 1.2 : 1.5;
      leaf.mesh.scale.setScalar(leaf.originalScale * scaleMultiplier * (isToday ? 1.3 : 1.0));
    }
  }

  /**
   * Unhighlight a leaf (reset scale)
   */
  unhighlightLeaf(leaf) {
    if (leaf && leaf.mesh) {
      const today = new Date();
      const currentDayOfYear = getDayOfYear(today);
      const isToday = leaf.dayOfYear === currentDayOfYear;
      // Reset to original scale, or 1.3x if today's leaf
      leaf.mesh.scale.setScalar(leaf.originalScale * (isToday ? 1.3 : 1.0));
    }
  }

  /**
   * Update animation (slight rotation for breathing effect)
   */
  update(time) {
    // Subtle breathing effect
    const breathing = Math.sin(time * 0.5) * 0.02;
    this.group.rotation.y = breathing;
  }
}

