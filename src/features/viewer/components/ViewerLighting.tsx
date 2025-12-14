'use client';

import { useRef } from 'react';
import * as THREE from 'three';

interface ViewerLightingProps {
  ambientIntensity?: number;
  directionalIntensity?: number;
}

export function ViewerLighting({
  ambientIntensity = 0.6,
  directionalIntensity = 0.8,
}: ViewerLightingProps) {
  const directionalRef = useRef<THREE.DirectionalLight>(null);

  return (
    <>
      {/* Ambient light for overall illumination */}
      <ambientLight intensity={ambientIntensity} color="#ffffff" />
      
      {/* Main directional light from front-top */}
      <directionalLight
        ref={directionalRef}
        position={[2, 3, 5]}
        intensity={directionalIntensity}
        color="#ffffff"
        castShadow={false}
      />
      
      {/* Fill light from the opposite side */}
      <directionalLight
        position={[-2, 1, -3]}
        intensity={directionalIntensity * 0.3}
        color="#e0e8ff"
      />
      
      {/* Rim light for depth */}
      <directionalLight
        position={[0, -2, -2]}
        intensity={directionalIntensity * 0.2}
        color="#ffe0e0"
      />
    </>
  );
}
