'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useMemoryManager } from '../hooks/useMemoryManager';

interface DepthMeshProps {
  imageUrl: string;
  depthMap: Float32Array;
  depthSize: number;
  displacementScale: number;
  wireframe?: boolean;
}

export function DepthMesh({
  imageUrl,
  depthMap,
  depthSize,
  displacementScale,
  wireframe = false,
}: DepthMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { trackTexture, trackGeometry, trackMaterial, disposeAll } = useMemoryManager();

  // Load the original image as texture
  const imageTexture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const texture = loader.load(imageUrl);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return trackTexture(texture);
  }, [imageUrl, trackTexture]);

  // Create displacement texture from depth map
  const displacementTexture = useMemo(() => {
    if (!depthMap || depthMap.length === 0) return null;

    // Convert Float32Array to Uint8Array for DataTexture
    const data = new Uint8Array(depthSize * depthSize);
    for (let i = 0; i < depthMap.length; i++) {
      data[i] = Math.round(depthMap[i] * 255);
    }

    const texture = new THREE.DataTexture(
      data,
      depthSize,
      depthSize,
      THREE.RedFormat,
      THREE.UnsignedByteType
    );
    texture.needsUpdate = true;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    
    return trackTexture(texture);
  }, [depthMap, depthSize, trackTexture]);

  // Create geometry with enough segments for smooth displacement
  const geometry = useMemo(() => {
    const segments = Math.min(256, depthSize);
    const geo = new THREE.PlaneGeometry(2, 2, segments, segments);
    return trackGeometry(geo);
  }, [depthSize, trackGeometry]);

  // Create material
  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      map: imageTexture,
      displacementMap: displacementTexture || undefined,
      displacementScale: displacementScale,
      side: THREE.DoubleSide,
      wireframe: wireframe,
      roughness: 0.8,
      metalness: 0.1,
    });
    return trackMaterial(mat);
  }, [imageTexture, displacementTexture, displacementScale, wireframe, trackMaterial]);

  // Update displacement scale when it changes
  useEffect(() => {
    if (material && 'displacementScale' in material) {
      (material as THREE.MeshStandardMaterial).displacementScale = displacementScale;
      material.needsUpdate = true;
    }
  }, [displacementScale, material]);

  // Update wireframe when it changes
  useEffect(() => {
    if (material && material instanceof THREE.MeshStandardMaterial) {
      material.wireframe = wireframe;
      material.needsUpdate = true;
    }
  }, [wireframe, material]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disposeAll();
    };
  }, [disposeAll]);

  // Optional: Add subtle animation
  useFrame((state) => {
    if (meshRef.current) {
      // Subtle breathing effect (disabled by default)
      // meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    }
  });

  if (!displacementTexture) {
    return null;
  }

  return (
    <mesh ref={meshRef} geometry={geometry} material={material} />
  );
}
