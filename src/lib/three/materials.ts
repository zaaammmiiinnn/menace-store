import * as THREE from 'three';

export interface TeeMaterialConfig {
  color: string;
  roughness: number;
  metalness: number;
  normalScale: number;
  waffleRepeat: number;
}

/**
 * Default material settings for the garment
 */
export const defaultTeeMaterialConfig: TeeMaterialConfig = {
  color: '#423129',
  roughness: 0.8,
  metalness: 0.0,
  normalScale: 0.5,
  waffleRepeat: 6,
};

// Direct exports for convenience
export const {
  color,
  roughness,
  metalness,
  normalScale,
  waffleRepeat,
} = defaultTeeMaterialConfig;

/**
 * Creates a procedural normal map data texture mimicking waffle knit fabric
 */
export function createWaffleNormalMap(size = 512, repeat = defaultTeeMaterialConfig.waffleRepeat): THREE.DataTexture {
  const data = new Uint8Array(size * size * 4);
  const cellSize = 16;
  const ridgeWidth = 3;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const modX = x % cellSize;
      const modY = y % cellSize;

      // Distance from closest grid border
      const distX = Math.min(modX, cellSize - modX);
      const distY = Math.min(modY, cellSize - modY);
      const dist = Math.min(distX, distY);

      // Normal map calculation
      let nx = 0;
      let ny = 0;
      let nz = 1;

      if (dist < ridgeWidth) {
        // Slope towards the ridge
        const slope = (ridgeWidth - dist) / ridgeWidth;
        if (distX <= distY) {
          nx = (modX < cellSize / 2 ? -1 : 1) * slope * 0.5;
        } else {
          ny = (modY < cellSize / 2 ? -1 : 1) * slope * 0.5;
        }
      }

      // Normalize vector
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
      nx /= len;
      ny /= len;
      nz /= len;

      // Map from [-1, 1] to [0, 255]
      data[idx] = Math.floor((nx * 0.5 + 0.5) * 255);
      data[idx + 1] = Math.floor((ny * 0.5 + 0.5) * 255);
      data[idx + 2] = Math.floor((nz * 0.5 + 0.5) * 255);
      data[idx + 3] = 255;
    }
  }

  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat, repeat);
  texture.needsUpdate = true;
  return texture;
}

// Cached waffle normal map
let cachedWaffleMap: THREE.DataTexture | null = null;

export function getWaffleNormalMap(repeat?: number): THREE.DataTexture {
  if (!cachedWaffleMap || (repeat !== undefined && cachedWaffleMap.repeat.x !== repeat)) {
    cachedWaffleMap = createWaffleNormalMap(512, repeat ?? defaultTeeMaterialConfig.waffleRepeat);
  }
  return cachedWaffleMap;
}

/**
 * Creates a configured MeshStandardMaterial instance for the tee
 */
export function createTeeMaterial(
  overrides?: Partial<TeeMaterialConfig>,
  customNormalMap?: THREE.Texture
): THREE.MeshStandardMaterial {
  const config = { ...defaultTeeMaterialConfig, ...overrides };
  const map = customNormalMap ?? getWaffleNormalMap(config.waffleRepeat);

  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(config.color),
    roughness: config.roughness,
    metalness: config.metalness,
    normalMap: map,
    normalScale: new THREE.Vector2(config.normalScale, config.normalScale),
    side: THREE.DoubleSide,
  });
}

export const teeMaterialConfig = defaultTeeMaterialConfig;
