import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

const ParticleSystem: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null!);
  const { size, viewport } = useThree(); // For mouse interaction later
  const aspect = size.width / viewport.width;

  const count = 5000;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 10; // Distribute particles in a cube
    }
    return pos;
  }, [count]);

  // Theme colors (assuming CSS variables are somehow accessible or hardcoded for now)
  // For simplicity, I'll hardcode them here but ideally, they'd be passed or fetched.
  const goldColor = new THREE.Color("#E4A11B"); // --color-accent-gold-luminous
  const blueColor = new THREE.Color("#4A90E2"); // --color-accent-secondary-blue

  const particleColors = useMemo(() => {
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const color = Math.random() > 0.3 ? goldColor : blueColor;
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    return colors;
  }, [count, goldColor, blueColor]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.0005; // Slow rotation
      pointsRef.current.rotation.x += 0.0002;

      // Mouse interaction - subtle parallax
      const { mouse } = state;
      pointsRef.current.position.x = THREE.MathUtils.lerp(pointsRef.current.position.x, mouse.x * 0.5, 0.02);
      pointsRef.current.position.y = THREE.MathUtils.lerp(pointsRef.current.position.y, mouse.y * 0.5, 0.02);
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        vertexColors
        size={0.015}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
};


const Dynamic3DBackground: React.FC = () => {
  return (
    <Canvas
      camera={{ position: [0, 0, 1.5], fov: 75 }}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}
    >
      <ambientLight intensity={0.5} />
      {/* A subtle point light to give some depth if materials react */}
      <pointLight position={[0, 1, 2]} intensity={0.8} color="#E4A11B" />
      <ParticleSystem />
    </Canvas>
  );
};

export default Dynamic3DBackground;
