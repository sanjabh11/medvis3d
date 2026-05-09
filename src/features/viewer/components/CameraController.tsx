'use client';

import { useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitControlsHandle } from '../hooks/useViewerState';
import type { ViewPreset } from '@/features/builder';

interface CameraControllerProps {
  onControlsReady?: (controls: OrbitControlsHandle | null) => void;
  onCameraReady?: (camera: THREE.PerspectiveCamera) => void;
  enableDamping?: boolean;
  dampingFactor?: number;
  minDistance?: number;
  maxDistance?: number;
  minPolarAngle?: number;
  maxPolarAngle?: number;
  enablePan?: boolean;
  enableZoom?: boolean;
  enableRotate?: boolean;
  viewPreset?: ViewPreset;
}

function getPresetPosition(viewPreset: ViewPreset): THREE.Vector3 {
  switch (viewPreset) {
    case 'front':
      return new THREE.Vector3(0, 0, 2.2);
    case 'side':
      return new THREE.Vector3(2.2, 0.15, 0.6);
    case 'topographic':
      return new THREE.Vector3(0, 2.3, 1.1);
    case 'oblique':
    default:
      return new THREE.Vector3(1.25, 0.9, 2.05);
  }
}

export function CameraController({
  onControlsReady,
  onCameraReady,
  enableDamping = true,
  dampingFactor = 0.05,
  minDistance = 0.5,
  maxDistance = 5,
  minPolarAngle = 0,
  maxPolarAngle = Math.PI,
  enablePan = true,
  enableZoom = true,
  enableRotate = true,
  viewPreset = 'oblique',
}: CameraControllerProps) {
  const controlsRef = useRef<OrbitControlsHandle | null>(null);
  const { camera } = useThree();

  useEffect(() => {
    if (camera && onCameraReady) {
      onCameraReady(camera as THREE.PerspectiveCamera);
    }
  }, [camera, onCameraReady]);

  useEffect(() => {
    const perspectiveCamera = camera as THREE.PerspectiveCamera;
    perspectiveCamera.position.copy(getPresetPosition(viewPreset));
    perspectiveCamera.lookAt(0, 0, 0);
    perspectiveCamera.updateProjectionMatrix();
    controlsRef.current?.target.set(0, 0, 0);
    controlsRef.current?.update();
    onCameraReady?.(perspectiveCamera);
  }, [camera, onCameraReady, viewPreset]);

  useEffect(() => {
    if (controlsRef.current && onControlsReady) {
      onControlsReady(controlsRef.current);
    }
  }, [onControlsReady]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping={enableDamping}
      dampingFactor={dampingFactor}
      minDistance={minDistance}
      maxDistance={maxDistance}
      minPolarAngle={minPolarAngle}
      maxPolarAngle={maxPolarAngle}
      enablePan={enablePan}
      enableZoom={enableZoom}
      enableRotate={enableRotate}
      touches={{
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN,
      }}
      mouseButtons={{
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN,
      }}
    />
  );
}
