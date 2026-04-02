import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useReducedMotion } from 'framer-motion';

export default function Background3D() {
  const mountRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    // Escape early if user requested reduced motion
    if (shouldReduceMotion) return;

    const isMobile = window.innerWidth < 768;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));

    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    // Create floating particles
    const geometry = new THREE.BufferGeometry();
    const count = isMobile ? 400 : 1200;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 20;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      size: 0.015,
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Add a subtle rotating torus wireframe in the background
    const torusGeo = new THREE.TorusGeometry(4, 1.5, 16, 60);
    const torusMat = new THREE.MeshBasicMaterial({
      color: 0x0072ff,
      wireframe: true,
      transparent: true,
      opacity: 0.05
    });
    const torus = new THREE.Mesh(torusGeo, torusMat);
    torus.position.set(5, -2, -8);
    scene.add(torus);

    camera.position.z = 5;

    let mouseX = 0, mouseY = 0;
    const onMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 0.3;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 0.3;
    };
    window.addEventListener('mousemove', onMouseMove);

    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      particles.rotation.y += 0.0003;
      particles.rotation.x += 0.0001;
      torus.rotation.x += 0.002;
      torus.rotation.y += 0.001;

      // Subtle parallax camera
      camera.position.x += (mouseX - camera.position.x) * 0.02;
      camera.position.y += (-mouseY - camera.position.y) * 0.02;

      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const mobileCheck = window.innerWidth < 768;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobileCheck ? 1.5 : 2));
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      torusGeo.dispose();
      torusMat.dispose();
    };
  }, [shouldReduceMotion]);

  if (shouldReduceMotion) {
    // Fallback: A simple CSS background
    return <div className="animated-auth-bg" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, pointerEvents: 'none' }} />;
  }

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none'
      }}
    />
  );
}
