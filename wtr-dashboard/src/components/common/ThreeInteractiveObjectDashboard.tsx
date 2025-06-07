// src/components/common/ThreeInteractiveObjectDashboard.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import './ThreeInteractiveObjectDashboard.css';

const ThreeInteractiveObjectDashboard: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const mainObjectRef = useRef<THREE.Mesh | null>(null); // Core Sphere
  const mainMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const ringMeshesRef = useRef<THREE.Mesh[]>([]);
  const ringMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const particlesRef = useRef<THREE.Points | null>(null);
  const particleMaterialRef = useRef<THREE.PointsMaterial | null>(null);
  const proximityFactorRef = useRef(0); // For mouse proximity effect


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

    // Attempt to get CSS variable values (with fallbacks)
    const computedStyle = getComputedStyle(document.documentElement);
    const goldLuminousColorStr = computedStyle.getPropertyValue('--color-accent-gold-luminous').trim() || '#E4A11B';
    const goldBurnishedColorStr = computedStyle.getPropertyValue('--color-accent-gold-burnished').trim() || '#B08D57';
    const backgroundPrimaryColorStr = computedStyle.getPropertyValue('--color-background-primary').trim() || '#0A0C10';


    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); // Softer ambient light
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(new THREE.Color(goldLuminousColorStr), 1.2, 150); // Stronger, gold luminous
    pointLight.position.set(8, 8, 8);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(new THREE.Color(goldBurnishedColorStr), 0.8, 100); // Softer, burnished gold fill
    pointLight2.position.set(-8, -4, -6);
    scene.add(pointLight2);

    const hemisphereLight = new THREE.HemisphereLight(
      new THREE.Color(goldBurnishedColorStr), // Sky color - burnished gold
      new THREE.Color(backgroundPrimaryColorStr),  // Ground color - dark background
      0.7 // Intensity
    );
    scene.add(hemisphereLight);

    // Core Sphere
    const coreSphereGeometry = new THREE.SphereGeometry(1.0, 64, 64);
    mainMaterialRef.current = new THREE.MeshStandardMaterial({
      color: new THREE.Color(goldLuminousColorStr),
      metalness: 0.9,
      roughness: 0.25,
      emissive: new THREE.Color(goldBurnishedColorStr),
      emissiveIntensity: 0.05, // Subtle inner glow
    });
    mainObjectRef.current = new THREE.Mesh(coreSphereGeometry, mainMaterialRef.current);
    scene.add(mainObjectRef.current);

    // Outer Rings
    const ringData = [
      { radius: 1.5, tube: 0.03, segments: 64, rotationX: Math.PI / 2, rotationY: 0.05, color: goldLuminousColorStr, roughness: 0.2 },
      { radius: 1.8, tube: 0.04, segments: 64, rotationX: 0, rotationY: -0.03, color: goldBurnishedColorStr, roughness: 0.3 },
      { radius: 2.1, tube: 0.02, segments: 64, rotationX: Math.PI / 3, rotationY: 0.02, color: goldLuminousColorStr, roughness: 0.25 },
    ];

    ringData.forEach(data => {
      const ringGeometry = new THREE.TorusGeometry(data.radius, data.tube, 24, data.segments);
      const ringMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(data.color),
        metalness: 0.85,
        roughness: data.roughness,
        emissive: new THREE.Color(data.color),
        emissiveIntensity: 0.1
      });
      ringMaterialsRef.current.push(ringMaterial);
      const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
      ringMesh.rotation.x = data.rotationX;
      ringMesh.rotation.y = data.rotationY * Math.PI; // Initial offset
      scene.add(ringMesh);
      ringMeshesRef.current.push(ringMesh);
    });

    // Internal Particle System
    const particleCount = 700;
    const particlePositions = new Float32Array(particleCount * 3);
    const sphereForParticles = new THREE.SphereGeometry(1.3, 64, 64); // Particles distributed in a slightly larger sphere

    for (let i = 0; i < particleCount; i++) {
        const vertex = new THREE.Vector3();
        // Get random point on sphere surface
        vertex.set(
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2
        ).normalize().multiplyScalar(0.8 + Math.random() * 0.7); // Radius between 0.8 and 1.5

        particlePositions[i * 3] = vertex.x;
        particlePositions[i * 3 + 1] = vertex.y;
        particlePositions[i * 3 + 2] = vertex.z;
    }

    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    particleMaterialRef.current = new THREE.PointsMaterial({
        color: new THREE.Color(goldLuminousColorStr),
        size: 0.025,
        transparent: true,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
        opacity: 0.7
    });
    particlesRef.current = new THREE.Points(particlesGeometry, particleMaterialRef.current);
    scene.add(particlesRef.current);


    camera.position.z = 7; // Adjusted camera position for new object scale

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      if (renderer && currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer?.dispose();

      // Dispose core object
      coreSphereGeometry?.dispose();
      mainMaterialRef.current?.dispose();

      // Dispose rings
      ringMeshesRef.current.forEach(mesh => {
        mesh.geometry?.dispose();
        scene.remove(mesh);
      });
      ringMaterialsRef.current.forEach(material => material.dispose());
      ringMeshesRef.current = [];
      ringMaterialsRef.current = [];

      // Dispose particles
      particlesGeometry?.dispose();
      particleMaterialRef.current?.dispose();
      if (particlesRef.current) scene.remove(particlesRef.current);

      scene.remove(ambientLight);
      scene.remove(pointLight);
      scene.remove(pointLight2);
      scene.remove(hemisphereLight);
    };
  }, []); // Initialize scene only once

  // Animation and Interaction Logic
  useEffect(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !mainObjectRef.current || !mainMaterialRef.current) return;

    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const mainObject = mainObjectRef.current; // This is now the core sphere
    const material = mainMaterialRef.current; // Material for the core sphere
    const currentMount = mountRef.current!;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-1000, -1000); // Initialize mouse off-screen

    const onMouseMove = (event: MouseEvent) => {
      if (!currentMount) return;
      const rect = currentMount.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / currentMount.clientWidth) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / currentMount.clientHeight) * 2 + 1;

      // Calculate distance from mouse to canvas center for proximity effect
      const canvasCenterX = rect.left + rect.width / 2;
      const canvasCenterY = rect.top + rect.height / 2;
      const distance = Math.sqrt(Math.pow(event.clientX - canvasCenterX, 2) + Math.pow(event.clientY - canvasCenterY, 2));
      const maxEffectDistance = 300; // Pixels: effective radius for proximity
      proximityFactorRef.current = Math.max(0, Math.min(1, 1 - distance / maxEffectDistance));
    };
    currentMount.addEventListener('mousemove', onMouseMove);

    const clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime(); // Keep for other potential time-based effects if needed

      // Enhanced Ambient Dynamics (Animation Loop)
      const baseSpeedX = 0.0008; // Slower base speeds
      const baseSpeedY = 0.0012;
      const baseSpeedZ = -0.0005;
      const hoverBoost = isHoveringRef.current ? 1.8 : 1;

      mainObject.rotation.x += baseSpeedX * hoverBoost;
      mainObject.rotation.y += baseSpeedY * hoverBoost;
      mainObject.rotation.z += baseSpeedZ * hoverBoost;

      // Animate Rings
      ringMeshesRef.current.forEach((ring, index) => {
        const speedFactor = (index + 1) * 0.3; // Different speed for each ring
        ring.rotation.x += (baseSpeedX * 0.5 + 0.0005 * speedFactor) * (index % 2 === 0 ? 1 : -1);
        ring.rotation.y += (baseSpeedY * 0.6 + 0.0008 * speedFactor) * (index % 2 === 0 ? 1 : -1);
        ring.rotation.z += (baseSpeedZ * 0.4 - 0.0003 * speedFactor) * (index % 2 === 0 ? 1 : -1);
      });

      // Animate Particles
      if (particlesRef.current) {
        particlesRef.current.rotation.y += 0.0005 * hoverBoost;
        particlesRef.current.rotation.x -= 0.0002 * hoverBoost;
        // Optional: individual particle animation (more complex)
        // const positions = particlesRef.current.geometry.attributes.position;
        // for (let i = 0; i < positions.count; i++) { ... }
        // positions.needsUpdate = true;

        // Particle intensification based on proximity
        if (particleMaterialRef.current) {
          const baseParticleSize = 0.025;
          const maxParticleSizeIncrease = 0.020; // Max size will be 0.045
          particleMaterialRef.current.size = baseParticleSize + (maxParticleSizeIncrease * proximityFactorRef.current);

          const baseParticleOpacity = 0.4; // Slightly more subtle base
          const maxParticleOpacityIncrease = 0.6; // Max opacity will be 1.0
          particleMaterialRef.current.opacity = baseParticleOpacity + (maxParticleOpacityIncrease * proximityFactorRef.current);
        }
      }

      // Raycasting for hover detection on the core sphere
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects([mainObject]); // Only check core sphere

      if (intersects.length > 0) {
        if (!isHoveringRef.current) setIsHovering(true);
      } else {
        if (isHoveringRef.current) setIsHovering(false);
      }

      // Hover effect and proximity pulse on core sphere's material
      const computedStyle = getComputedStyle(document.documentElement);
      const emissiveHighlightStr = computedStyle.getPropertyValue('--color-accent-gold-highlight').trim() || '#FFD700';
      const goldBurnishedColorStr = computedStyle.getPropertyValue('--color-accent-gold-burnished').trim() || '#B08D57';

      if (isHoveringRef.current) {
        material.emissive = new THREE.Color(emissiveHighlightStr);
        material.emissiveIntensity = 0.8; // Brighter emissive on hover
      } else {
        // Proximity pulse effect when not hovering
        material.emissive = new THREE.Color(goldBurnishedColorStr); // Base emissive color
        const baseEmissiveIntensity = 0.05;
        const pulseSpeed = 2.5; // Speed of the pulse
        const maxPulseAmplitude = 0.30; // How much intensity is added at peak
        const pulse = Math.abs(Math.sin(elapsedTime * pulseSpeed)) * maxPulseAmplitude * proximityFactorRef.current; // abs for only positive pulse
        material.emissiveIntensity = baseEmissiveIntensity + pulse;
      }
      material.needsUpdate = true;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      currentMount.removeEventListener('mousemove', onMouseMove);
    };

  }, [isHovering]);


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
