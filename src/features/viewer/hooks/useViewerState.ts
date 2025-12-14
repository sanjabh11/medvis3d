'use client';

import { useState, useCallback, useRef } from 'react';
import * as THREE from 'three';

interface CameraState {
  position: THREE.Vector3;
  target: THREE.Vector3;
  zoom: number;
}

const DEFAULT_CAMERA_STATE: CameraState = {
  position: new THREE.Vector3(0, 0, 2),
  target: new THREE.Vector3(0, 0, 0),
  zoom: 1,
};

export function useViewerState() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contextLost, setContextLost] = useState(false);
  
  const controlsRef = useRef<any>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const initialCameraState = useRef<CameraState>(DEFAULT_CAMERA_STATE);

  const resetCamera = useCallback(() => {
    if (controlsRef.current && cameraRef.current) {
      const controls = controlsRef.current;
      const camera = cameraRef.current;
      
      camera.position.copy(initialCameraState.current.position);
      controls.target.copy(initialCameraState.current.target);
      camera.zoom = initialCameraState.current.zoom;
      camera.updateProjectionMatrix();
      controls.update();
    }
  }, []);

  const toggleFullscreen = useCallback(async (containerRef: React.RefObject<HTMLDivElement>) => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('[Viewer] Fullscreen error:', err);
      setError('Fullscreen not supported');
    }
  }, []);

  const handleContextLost = useCallback((event: Event) => {
    event.preventDefault();
    console.error('[Viewer] WebGL context lost');
    setContextLost(true);
    setError('Graphics context lost. Please refresh the page.');
  }, []);

  const handleContextRestored = useCallback(() => {
    console.log('[Viewer] WebGL context restored');
    setContextLost(false);
    setError(null);
  }, []);

  const setControlsRef = useCallback((controls: any) => {
    controlsRef.current = controls;
  }, []);

  const setCameraRef = useCallback((camera: THREE.PerspectiveCamera) => {
    cameraRef.current = camera;
    // Store initial state
    initialCameraState.current = {
      position: camera.position.clone(),
      target: new THREE.Vector3(0, 0, 0),
      zoom: camera.zoom,
    };
  }, []);

  return {
    isFullscreen,
    isLoading,
    setIsLoading,
    error,
    setError,
    contextLost,
    resetCamera,
    toggleFullscreen,
    handleContextLost,
    handleContextRestored,
    setControlsRef,
    setCameraRef,
    controlsRef,
    cameraRef,
  };
}
