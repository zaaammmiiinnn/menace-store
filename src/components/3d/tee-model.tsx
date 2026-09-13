'use client';

import { forwardRef, useImperativeHandle, useMemo, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface TeeModelProps {
  color?: string;
  scale?: number;
  onInteraction?: () => void;
}

const TeeModel = forwardRef<THREE.Group, TeeModelProps>(
  ({ color = '#F5F1E8', scale = 1, onInteraction }, ref) => {
    const groupRef = useRef<THREE.Group>(null);
    const materialRef = useRef<THREE.MeshStandardMaterial>(null);
    const [isReducedMotion, setIsReducedMotion] = useState(false);
    const [isInteracting, setIsInteracting] = useState(false);

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

    // Procedural normal map for waffle texture
    const waffleNormalMap = useMemo(() => {
      const size = 512;
      const data = new Uint8Array(size * size * 4);
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          const idx = (i * size + j) * 4;
          // Simple grid bump pattern
          const isWaffle = i % 16 < 4 || j % 16 < 4;
          // RGB values for a normal map (flat is 128, 128, 255)
          data[idx] = isWaffle ? 110 : 128; // R
          data[idx + 1] = isWaffle ? 110 : 128; // G
          data[idx + 2] = 255; // B (always max for normals pointing out)
          data[idx + 3] = 255; // Alpha
        }
      }
      const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
      texture.needsUpdate = true;
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(4, 4);
      return texture;
    }, []);

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

    return (
      <group
        ref={groupRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerOut={handlePointerUp}
      >
        {/* Torso */}
        <mesh position={[0, -0.2, 0]}>
          <boxGeometry args={[1.6, 2.4, 0.4]} />
          <meshStandardMaterial
            ref={materialRef}
            color={color}
            roughness={0.8}
            metalness={0.0}
            normalMap={waffleNormalMap}
            normalScale={new THREE.Vector2(0.5, 0.5)}
          />
        </mesh>

        {/* Left Sleeve */}
        <mesh position={[-1.0, 0.6, 0]} rotation={[0, 0, 0.5]}>
          <boxGeometry args={[0.7, 1.0, 0.35]} />
          <meshStandardMaterial
            color={color}
            roughness={0.8}
            metalness={0.0}
            normalMap={waffleNormalMap}
          />
        </mesh>

        {/* Right Sleeve */}
        <mesh position={[1.0, 0.6, 0]} rotation={[0, 0, -0.5]}>
          <boxGeometry args={[0.7, 1.0, 0.35]} />
          <meshStandardMaterial
            color={color}
            roughness={0.8}
            metalness={0.0}
            normalMap={waffleNormalMap}
          />
        </mesh>

        {/* Collar */}
        <mesh position={[0, 1.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.4, 0.08, 16, 32]} />
          <meshStandardMaterial
            color={color}
            roughness={0.9}
            metalness={0.0}
            normalMap={waffleNormalMap}
          />
        </mesh>
      </group>
    );
  }
);

TeeModel.displayName = 'TeeModel';

export default TeeModel;
