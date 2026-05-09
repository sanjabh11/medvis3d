'use client';

import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useMemoryManager } from '../hooks/useMemoryManager';
import type { MeshMaterialPreset } from '@/features/builder';

interface DepthMeshProps {
  imageUrl: string;
  depthMap: Float32Array;
  depthSize: number;
  displacementScale: number;
  wireframe?: boolean;
  materialPreset?: MeshMaterialPreset;
}

export function DepthMesh({
  imageUrl,
  depthMap,
  depthSize,
  displacementScale,
  wireframe = false,
  materialPreset = 'clinical-relief',
}: DepthMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { trackTexture, trackGeometry, disposeAll } = useMemoryManager();

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

  const heatmapTexture = useMemo(() => {
    if (!depthMap || depthMap.length === 0) return null;

    const data = new Uint8Array(depthSize * depthSize * 3);
    for (let i = 0; i < depthMap.length; i++) {
      const value = Math.max(0, Math.min(1, depthMap[i]));
      const r = Math.round(255 * Math.max(0, Math.min(1, 1.8 * value - 0.25)));
      const g = Math.round(255 * Math.max(0, Math.min(1, 1.6 - Math.abs(value - 0.55) * 2.8)));
      const b = Math.round(255 * Math.max(0, Math.min(1, 1.15 - value * 1.25)));
      const offset = i * 3;
      data[offset] = r;
      data[offset + 1] = g;
      data[offset + 2] = b;
    }

    const texture = new THREE.DataTexture(
      data,
      depthSize,
      depthSize,
      THREE.RGBFormat,
      THREE.UnsignedByteType
    );
    texture.needsUpdate = true;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return trackTexture(texture);
  }, [depthMap, depthSize, trackTexture]);

  // Create geometry with enough segments for smooth displacement
  const geometry = useMemo(() => {
    const smallViewport = typeof window !== 'undefined' && window.innerWidth < 768;
    const segmentCap = smallViewport ? 144 : 256;
    const segments = Math.min(segmentCap, Math.max(96, depthSize - 1));
    const geo = new THREE.PlaneGeometry(2, 2, segments, segments);
    geo.computeVertexNormals();
    return trackGeometry(geo);
  }, [depthSize, trackGeometry]);

  const materialSettings = useMemo(() => {
    switch (materialPreset) {
      case 'bone-contrast':
        return {
          map: imageTexture,
          color: '#f8fafc',
          emissive: '#111827',
          emissiveIntensity: 0.08,
          roughness: 0.62,
          metalness: 0.04,
        };
      case 'depth-heatmap':
        return {
          map: heatmapTexture || imageTexture,
          color: '#ffffff',
          emissive: '#0f172a',
          emissiveIntensity: 0.05,
          roughness: 0.7,
          metalness: 0,
        };
      case 'soft-tissue':
        return {
          map: imageTexture,
          color: '#f2d6ca',
          emissive: '#3b1d14',
          emissiveIntensity: 0.04,
          roughness: 0.88,
          metalness: 0.02,
        };
      case 'original-texture':
        return {
          map: imageTexture,
          color: '#ffffff',
          emissive: '#000000',
          emissiveIntensity: 0,
          roughness: 0.8,
          metalness: 0.02,
        };
      case 'clinical-relief':
      default:
        return {
          map: imageTexture,
          color: '#dbeafe',
          emissive: '#0f172a',
          emissiveIntensity: 0.04,
          roughness: 0.74,
          metalness: 0.05,
        };
    }
  }, [heatmapTexture, imageTexture, materialPreset]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disposeAll();
    };
  }, [disposeAll]);

  if (!displacementTexture) {
    return null;
  }

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial
        map={materialSettings.map}
        color={materialSettings.color}
        emissive={materialSettings.emissive}
        emissiveIntensity={materialSettings.emissiveIntensity}
        displacementMap={displacementTexture}
        displacementScale={displacementScale}
        side={THREE.DoubleSide}
        wireframe={wireframe}
        roughness={materialSettings.roughness}
        metalness={materialSettings.metalness}
      />
    </mesh>
  );
}
