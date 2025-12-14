'use client';

import { useRef, useCallback, useEffect } from 'react';
import * as THREE from 'three';

interface Disposable {
  dispose: () => void;
}

export function useMemoryManager() {
  const disposables = useRef<Set<Disposable>>(new Set());
  const textures = useRef<Set<THREE.Texture>>(new Set());
  const geometries = useRef<Set<THREE.BufferGeometry>>(new Set());
  const materials = useRef<Set<THREE.Material>>(new Set());

  const trackTexture = useCallback((texture: THREE.Texture) => {
    textures.current.add(texture);
    disposables.current.add(texture);
    return texture;
  }, []);

  const trackGeometry = useCallback((geometry: THREE.BufferGeometry) => {
    geometries.current.add(geometry);
    disposables.current.add(geometry);
    return geometry;
  }, []);

  const trackMaterial = useCallback((material: THREE.Material) => {
    materials.current.add(material);
    disposables.current.add(material);
    return material;
  }, []);

  const disposeTexture = useCallback((texture: THREE.Texture) => {
    texture.dispose();
    textures.current.delete(texture);
    disposables.current.delete(texture);
  }, []);

  const disposeGeometry = useCallback((geometry: THREE.BufferGeometry) => {
    geometry.dispose();
    geometries.current.delete(geometry);
    disposables.current.delete(geometry);
  }, []);

  const disposeMaterial = useCallback((material: THREE.Material) => {
    material.dispose();
    materials.current.delete(material);
    disposables.current.delete(material);
  }, []);

  const disposeAll = useCallback(() => {
    disposables.current.forEach((item) => {
      try {
        item.dispose();
      } catch (e) {
        console.warn('[MemoryManager] Failed to dispose:', e);
      }
    });
    disposables.current.clear();
    textures.current.clear();
    geometries.current.clear();
    materials.current.clear();
  }, []);

  const getStats = useCallback(() => ({
    textures: textures.current.size,
    geometries: geometries.current.size,
    materials: materials.current.size,
    total: disposables.current.size,
  }), []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disposeAll();
    };
  }, [disposeAll]);

  return {
    trackTexture,
    trackGeometry,
    trackMaterial,
    disposeTexture,
    disposeGeometry,
    disposeMaterial,
    disposeAll,
    getStats,
  };
}
