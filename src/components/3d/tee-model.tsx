'use client';

import { forwardRef, useImperativeHandle, useMemo, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { TEE_MODEL_PATH } from '@/../site.config';
import {
  teeMaterialConfig,
  getWaffleNormalMap,
  createTeeMaterial,
} from '@/lib/three/materials';

export interface TeeModelProps {
  color?: string;
  scale?: number;
  modelPath?: string;
  onInteraction?: () => void;
}

const TeeModel = forwardRef<THREE.Group, TeeModelProps>(
  ({ color = teeMaterialConfig.color, scale = 1, modelPath = TEE_MODEL_PATH, onInteraction }, ref) => {
    const groupRef = useRef<THREE.Group>(null);
    const materialRef = useRef<THREE.MeshStandardMaterial | null>(null);
    const [isReducedMotion, setIsReducedMotion] = useState(false);
    const [isInteracting, setIsInteracting] = useState(false);
    const [loadedScene, setLoadedScene] = useState<THREE.Group | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useImperativeHandle(ref, () => groupRef.current as THREE.Group);

    useEffect(() => {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setIsReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }, []);

    const targetColor = useMemo(() => new THREE.Color(color), [color]);
    const targetScale = useMemo(() => new THREE.Vector3(scale, scale, scale), [scale]);

    // Waffle normal map from materials config
    const waffleNormalMap = useMemo(() => {
      return getWaffleNormalMap(teeMaterialConfig.waffleRepeat);
    }, []);

    // Create shared MeshStandardMaterial based on material controls
    const sharedMaterial = useMemo(() => {
      const mat = createTeeMaterial(
        {
          color,
          roughness: teeMaterialConfig.roughness,
          metalness: teeMaterialConfig.metalness,
          normalScale: teeMaterialConfig.normalScale,
        },
        waffleNormalMap
      );
      materialRef.current = mat;
      return mat;
    }, [waffleNormalMap]);

    // Update material when material ref is set
    useEffect(() => {
      materialRef.current = sharedMaterial;
    }, [sharedMaterial]);

    // Load real 3D model
    useEffect(() => {
      let isMounted = true;
      setIsLoading(true);

      const loader = new GLTFLoader();
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
      loader.setDRACOLoader(dracoLoader);

      loader.load(
        modelPath,
        (gltf) => {
          if (!isMounted) return;

          const scene = gltf.scene.clone(true);

          // Center model and compute appropriate scale
          const box = new THREE.Box3().setFromObject(scene);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());

          // Match viewport scale (torso placeholder height is ~2.4)
          const targetHeight = 2.4;
          const fitScale = size.y > 0 ? targetHeight / size.y : 1;
          scene.scale.set(fitScale, fitScale, fitScale);

          // Center garment at origin
          scene.position.set(
            -center.x * fitScale,
            -center.y * fitScale - 0.1,
            -center.z * fitScale
          );

          // Apply MeshStandardMaterial with material controls
          scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.castShadow = true;
              mesh.receiveShadow = true;
              mesh.material = sharedMaterial;
            }
          });

          setLoadedScene(scene);
          setIsLoading(false);
        },
        undefined,
        (error) => {
          console.warn(`[TeeModel] Failed to load model from ${modelPath}. Using placeholder.`, error);
          if (isMounted) {
            setIsLoading(false);
          }
        }
      );

      return () => {
        isMounted = false;
        dracoLoader.dispose();
      };
    }, [modelPath, sharedMaterial]);

    // Keep animation exactly as before
    useFrame((_, delta) => {
      if (materialRef.current) {
        materialRef.current.color.lerp(targetColor, delta * 6);
      }
      if (groupRef.current) {
        groupRef.current.scale.lerp(targetScale, delta * 6);

        if (!isReducedMotion && !isInteracting) {
          groupRef.current.rotation.y += 0.003;
        }
      }
    });

    const handlePointerDown = () => {
      setIsInteracting(true);
      if (onInteraction) onInteraction();
    };

    const handlePointerUp = () => {
      setIsInteracting(false);
    };

    // Swap: Show real model if loaded; show placeholder while loading or as fallback
    const showRealModel = !isLoading && loadedScene !== null;

    return (
      <group
        ref={groupRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerOut={handlePointerUp}
      >
        {showRealModel ? (
          <primitive object={loadedScene} />
        ) : (
          /* Placeholder Garment */
          <group>
            {/* Torso */}
            <mesh position={[0, -0.2, 0]} material={sharedMaterial}>
              <boxGeometry args={[1.6, 2.4, 0.4]} />
            </mesh>

            {/* Left Sleeve */}
            <mesh position={[-1.0, 0.6, 0]} rotation={[0, 0, 0.5]} material={sharedMaterial}>
              <boxGeometry args={[0.7, 1.0, 0.35]} />
            </mesh>

            {/* Right Sleeve */}
            <mesh position={[1.0, 0.6, 0]} rotation={[0, 0, -0.5]} material={sharedMaterial}>
              <boxGeometry args={[0.7, 1.0, 0.35]} />
            </mesh>

            {/* Collar */}
            <mesh position={[0, 1.05, 0]} rotation={[Math.PI / 2, 0, 0]} material={sharedMaterial}>
              <torusGeometry args={[0.4, 0.08, 16, 32]} />
            </mesh>
          </group>
        )}
      </group>
    );
  }
);

TeeModel.displayName = 'TeeModel';

export default TeeModel;
