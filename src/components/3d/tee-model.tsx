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

    // Sculpted continuous oversized drop-shoulder tee geometry
    const teeGeometry = useMemo(() => {
      const shape = new THREE.Shape();
      
      // Bottom hem center
      shape.moveTo(0, -1.25);
      
      // Right bottom hem
      shape.lineTo(0.95, -1.25);
      
      // Right side seam up to underarm (boxy streetwear drape)
      shape.quadraticCurveTo(1.02, -0.3, 1.02, 0.25);
      
      // Underarm curve transitioning to sleeve bottom
      shape.quadraticCurveTo(1.15, 0.22, 1.62, -0.15);
      
      // Sleeve cuff (elbow length, slightly angled)
      shape.lineTo(1.82, 0.28);
      
      // Sleeve top curve sloping up to dropped shoulder seam
      shape.quadraticCurveTo(1.42, 0.72, 1.12, 0.92);
      
      // Right shoulder slope to neckline
      shape.quadraticCurveTo(0.65, 1.08, 0.38, 1.1);
      
      // Crew neckline scoop (curving down smoothly)
      shape.quadraticCurveTo(0, 0.82, -0.38, 1.1);
      
      // Left shoulder slope to dropped shoulder
      shape.quadraticCurveTo(-0.65, 1.08, -1.12, 0.92);
      
      // Left sleeve top curve
      shape.quadraticCurveTo(-1.42, 0.72, -1.82, 0.28);
      
      // Left sleeve cuff
      shape.lineTo(-1.62, -0.15);
      
      // Left underarm curve transitioning to side seam
      shape.quadraticCurveTo(-1.15, 0.22, -1.02, 0.25);
      
      // Left side seam down to bottom hem
      shape.quadraticCurveTo(-1.02, -0.3, -0.95, -1.25);
      
      // Left bottom hem to center
      shape.lineTo(0, -1.25);

      const extrudeSettings = {
        depth: 0.3,
        bevelEnabled: true,
        bevelSegments: 5,
        steps: 1,
        bevelSize: 0.07,
        bevelThickness: 0.07,
      };

      const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      geom.center();
      geom.computeVertexNormals();
      return geom;
    }, []);

    return (
      <group
        ref={groupRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerOut={handlePointerUp}
      >
        {/* Continuous Sculpted Streetwear Tee */}
        <mesh geometry={teeGeometry}>
          <meshStandardMaterial
            ref={materialRef}
            color={color}
            roughness={0.75}
            metalness={0.02}
            normalMap={waffleNormalMap}
            normalScale={new THREE.Vector2(0.4, 0.4)}
          />
        </mesh>
      </group>
    );
  }
);

TeeModel.displayName = 'TeeModel';

export default TeeModel;
