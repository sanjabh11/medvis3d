'use client';

import { Suspense, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { DepthMesh } from './DepthMesh';
import { ViewerLighting } from './ViewerLighting';
import { CameraController } from './CameraController';
import { useViewerState } from '../hooks/useViewerState';

interface Viewer3DProps {
  imageUrl: string;
  depthMap: Float32Array;
  depthSize: number;
  displacementScale: number;
  wireframe?: boolean;
  onContextLost?: () => void;
  onContextRestored?: () => void;
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#2563EB" wireframe />
    </mesh>
  );
}

export function Viewer3D({
  imageUrl,
  depthMap,
  depthSize,
  displacementScale,
  wireframe = false,
  onContextLost,
  onContextRestored,
}: Viewer3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    handleContextLost,
    handleContextRestored,
    setControlsRef,
    setCameraRef,
  } = useViewerState();

  const onCreated = useCallback(({ gl }: { gl: THREE.WebGLRenderer }) => {
    // Configure renderer
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1;
    
    // Handle context loss
    const canvas = gl.domElement;
    
    canvas.addEventListener('webglcontextlost', (e) => {
      handleContextLost(e);
      onContextLost?.();
    });
    
    canvas.addEventListener('webglcontextrestored', () => {
      handleContextRestored();
      onContextRestored?.();
    });
  }, [handleContextLost, handleContextRestored, onContextLost, onContextRestored]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <Canvas
        camera={{
          position: [0, 0, 2],
          fov: 50,
          near: 0.1,
          far: 100,
        }}
        gl={{
          antialias: true,
          preserveDrawingBuffer: true,
          powerPreference: 'high-performance',
          alpha: false,
        }}
        dpr={[1, 2]}
        onCreated={onCreated}
      >
        <color attach="background" args={['#1a1a2e']} />
        
        <Suspense fallback={<LoadingFallback />}>
          <ViewerLighting />
          
          <DepthMesh
            imageUrl={imageUrl}
            depthMap={depthMap}
            depthSize={depthSize}
            displacementScale={displacementScale}
            wireframe={wireframe}
          />
          
          <CameraController
            onControlsReady={setControlsRef}
            onCameraReady={setCameraRef}
            enableDamping={true}
            dampingFactor={0.05}
            minDistance={0.5}
            maxDistance={5}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
