// src/components/common/ThreeSceneLogin.tsx
import React, { useEffect, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import './ThreeSceneLogin.css';

const ThreeSceneLogin: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null); // Ref to store renderer

  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    rendererRef.current = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // Store renderer
    const renderer = rendererRef.current;

    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);

    // Particle System
    const particleCount = 5000;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    // Attempt to get CSS variable values (with fallbacks)
    // Note: This direct fetching of CSS vars might not work in all contexts for JS.
    // More robust solutions might involve passing colors as props or using a CSS-in-JS solution.
    const style = getComputedStyle(document.documentElement);
    const goldColorStr = style.getPropertyValue('--color-accent-gold').trim() || '#E4A11B'; // Updated fallback to new gold
    const tealColorStr = style.getPropertyValue('--color-accent-tech-blue-desaturated').trim() || '#2A5A8C'; // Use new CSS var with fallback

    const colorGold = new THREE.Color(goldColorStr);
    const colorTeal = new THREE.Color(tealColorStr);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 15; // X
      positions[i + 1] = (Math.random() - 0.5) * 15; // Y
      positions[i + 2] = (Math.random() - 0.5) * 20; // Z - Increased depth

      const randomColor = Math.random() > 0.4 ? colorGold : colorTeal; // Adjusted ratio
      colors[i] = randomColor.r;
      colors[i + 1] = randomColor.g;
      colors[i + 2] = randomColor.b;
    }
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.028, // Experimented size (0.02 to 0.03 suggested, trying mid-value)
      vertexColors: true,
      transparent: true,
      opacity: 0.65, // Experimented opacity (0.5 to 0.7 suggested)
      sizeAttenuation: true,
    });
    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);

    camera.position.z = 4; // Closer camera

    const mouse = new THREE.Vector2();
    const handleMouseMove = (event: MouseEvent) => {
      if (currentMount) {
        mouse.x = (event.clientX / currentMount.clientWidth) * 2 - 1;
        mouse.y = -(event.clientY / currentMount.clientHeight) * 2 + 1;
      }
    };
    currentMount.addEventListener('mousemove', handleMouseMove);

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      // Base rotation + mouse influence
      particleSystem.rotation.y += 0.0003 + (mouse.x * 0.0005);
      particleSystem.rotation.x += 0.00015 + (mouse.y * 0.0005);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (currentMount && renderer) {
        camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      currentMount.removeEventListener('mousemove', handleMouseMove); // Remove mousemove listener
      cancelAnimationFrame(animationFrameId);
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      // Dispose of Three.js objects
      scene.remove(particleSystem);
      particles.dispose();
      particleMaterial.dispose();
      renderer.dispose();
      rendererRef.current = null;
    };
  }, []); // Empty dependency array ensures this runs once on mount and cleans up on unmount

  // useLayoutEffect to handle initial size correctly, esp. with SSR or fast navigation
  useLayoutEffect(() => {
    if (mountRef.current && rendererRef.current) {
        rendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        const camera = (rendererRef.current as any).camera; // Access camera if needed, though it's part of scene
        if (camera) {
            camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
            camera.updateProjectionMatrix();
        }
    }
  }, []);

  return <div ref={mountRef} className="three-scene-login" />;
};
export default ThreeSceneLogin;
