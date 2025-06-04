// src/components/common/ThreeInteractiveObjectDashboard.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import './ThreeInteractiveObjectDashboard.css';

const ThreeInteractiveObjectDashboard: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const mainObjectRef = useRef<THREE.Mesh | null>(null); // Ref for the main interactive object
  const mainMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null); // Ref for the material

  const [isHovering, setIsHovering] = useState(false);
  // Using a ref for isHovering to be accessed reliably inside the animation loop
  const isHoveringRef = useRef(isHovering);
  useEffect(() => { isHoveringRef.current = isHovering; }, [isHovering]);


  // Initialize scene
  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;
    sceneRef.current = new THREE.Scene();
    const scene = sceneRef.current;

    cameraRef.current = new THREE.PerspectiveCamera(50, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    const camera = cameraRef.current;

    rendererRef.current = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    const renderer = rendererRef.current;
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2); // Reduce intensity
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffd700, 0.7, 100); // Use a gold color, slightly reduced intensity
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);
    const pointLight2 = new THREE.PointLight(0xffffff, 0.3, 100); // White fill, reduced intensity
    pointLight2.position.set(-5, -3, -4);
    scene.add(pointLight2);
    const hemisphereLight = new THREE.HemisphereLight(0x404040, 0x080808, 0.6); // skyColor, groundColor, intensity
    scene.add(hemisphereLight);


    // Main Object
    const geometry = new THREE.IcosahedronGeometry(1.8, 1);

    // Attempt to get CSS variable values (with fallbacks)
    const computedStyle = getComputedStyle(document.documentElement);
    const goldColorStr = computedStyle.getPropertyValue('--color-accent-gold').trim() || '#B08D57';
    const tealColorStr = computedStyle.getPropertyValue('--color-accent-secondary-teal').trim() || '#2AA092';
    // const emissiveGoldStr = computedStyle.getPropertyValue('--color-accent-gold-highlight').trim() || '#FFD700'; // Defined later in animate


    mainMaterialRef.current = new THREE.MeshStandardMaterial({
      color: new THREE.Color(goldColorStr),
      metalness: 0.8, // Adjusted for dark brushed gold
      roughness: 0.4, // Adjusted for dark brushed gold
      emissive: new THREE.Color("#000000"), // Will be controlled by hover
      emissiveIntensity: 0, // Will be controlled by hover
    });
    const material = mainMaterialRef.current;
    mainObjectRef.current = new THREE.Mesh(geometry, material);
    const mainObject = mainObjectRef.current;
    scene.add(mainObject);

    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(tealColorStr),
      wireframe: true,
      opacity: 0.15, // More subtle wireframe
      transparent: true,
    });
    const wireframe = new THREE.Mesh(geometry, wireframeMaterial);
    mainObject.add(wireframe); // Add wireframe to the mainObject

    camera.position.z = 6; // Adjusted camera position

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      // currentMount.removeEventListener('mousemove', onMouseMove); // onMouseMove is added in another useEffect
      if (renderer && currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer?.dispose();
      geometry?.dispose();
      material?.dispose();
      wireframeMaterial?.dispose();
      scene.remove(ambientLight);
      scene.remove(pointLight);
      scene.remove(pointLight2);
      scene.remove(hemisphereLight);
      // Dispose other Three.js objects if any
    };
  }, []); // Initialize scene only once

  // Animation and Interaction Logic
  useEffect(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !mainObjectRef.current || !mainMaterialRef.current) return;

    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const mainObject = mainObjectRef.current;
    const material = mainMaterialRef.current;
    const currentMount = mountRef.current!; // Should be defined if this effect runs

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-1000, -1000); // Initialize mouse off-screen

    const onMouseMove = (event: MouseEvent) => {
      if (!currentMount) return;
      const rect = currentMount.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / currentMount.clientWidth) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / currentMount.clientHeight) * 2 + 1;
    };
    currentMount.addEventListener('mousemove', onMouseMove);

    const clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      mainObject.rotation.x = elapsedTime * 0.03; // Slower and more graceful
      mainObject.rotation.y = elapsedTime * 0.06; // Slower and more graceful

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects([mainObject]);

      if (intersects.length > 0) {
        if (!isHoveringRef.current) setIsHovering(true);
      } else {
        if (isHoveringRef.current) setIsHovering(false);
      }

      const computedStyle = getComputedStyle(document.documentElement);
      const emissiveHighlightStr = computedStyle.getPropertyValue('--color-accent-gold-highlight').trim() || '#FFD700';

      material.emissiveIntensity = isHoveringRef.current ? 0.8 : 0; // More pronounced on hover, off otherwise
      material.emissive = isHoveringRef.current ? new THREE.Color(emissiveHighlightStr) : new THREE.Color('#000000');
      material.needsUpdate = true;

      renderer.render(scene, camera);
    };
    animate();

    return () => { // Cleanup for this effect
      cancelAnimationFrame(animationFrameId);
      currentMount.removeEventListener('mousemove', onMouseMove);
    };

  }, [isHovering]); // Re-run effect if isHovering changes (for the ref update, not for Three.js setup)


  // Resize handler
  const handleResize = useCallback(() => {
    if (mountRef.current && rendererRef.current && cameraRef.current) {
      const currentMount = mountRef.current;
      const renderer = rendererRef.current;
      const camera = cameraRef.current;
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial size check
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);


  return <div ref={mountRef} className="three-interactive-object-dashboard" />;
};
export default ThreeInteractiveObjectDashboard;
