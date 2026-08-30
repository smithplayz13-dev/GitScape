"use client";
/* eslint-disable react-hooks/immutability */

import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

export default function CinematicCamera({ autoPlay = true }: { autoPlay?: boolean }) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();
  const tRef = useRef(0);
  const doneRef = useRef(!autoPlay);

  useEffect(() => {
    // start slightly close, pull back cinematic reveal
    if (autoPlay) {
      camera.position.set(14, 10, 14);
      doneRef.current = false;
      tRef.current = 0;
    }
  }, [camera, autoPlay]);

  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!controls) return;

    if (!doneRef.current) {
      tRef.current += delta * 0.42; // ~2.4s pull-back
      const t = Math.min(tRef.current, 1);
      const ease = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const start = new THREE.Vector3(14, 10, 14);
      const end = new THREE.Vector3(19.5, 13.8, 18.2);
      camera.position.lerpVectors(start, end, ease);
      // subtle orbit drift
      const angle = ease * 0.22;
      camera.position.x = camera.position.x * Math.cos(angle) - camera.position.z * Math.sin(angle) * 0.15;
      controls.target.lerp(new THREE.Vector3(0, 0.6, 0.4), ease * 0.04);
      controls.update();
      if (t >= 1) doneRef.current = true;
    }
    // gentle idle drift after settle
    if (doneRef.current) {
      const idle = Math.sin(Date.now() * 0.00012) * 0.015;
      controls.target.x = idle * 0.6;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan
      enableZoom
      enableRotate
      minDistance={7}
      maxDistance={44}
      minPolarAngle={0.1}
      maxPolarAngle={Math.PI / 2.12}
      dampingFactor={0.075}
      enableDamping
      rotateSpeed={0.48}
      zoomSpeed={0.88}
      panSpeed={0.58}
    />
  );
}
