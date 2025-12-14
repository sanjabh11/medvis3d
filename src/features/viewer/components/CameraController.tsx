'use client';

import { useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface CameraControllerProps {
  onControlsReady?: (controls: any) => void;
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
}: CameraControllerProps) {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();

  useEffect(() => {
    if (camera && onCameraReady) {
      onCameraReady(camera as THREE.PerspectiveCamera);
    }
  }, [camera, onCameraReady]);

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
