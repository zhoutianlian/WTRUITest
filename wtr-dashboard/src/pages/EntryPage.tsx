import React, { Suspense, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as random from 'maath/random/dist/maath-random.esm';
import './EntryPage.css';

// Three.js Particle Background
const StarsBackground: React.FC = (props: any) => {
  const ref: any = useRef();
  const [sphere] = random.inSphere(new Float32Array(5000), { radius: 1.5 });

  useFrame((_state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled {...props}>
        <PointMaterial
          transparent
          color="#ffd700" // Gold color for particles
          size={0.005}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
};

const ThreeJSBackground: React.FC = () => {
  return (
    <div id="threejs-bg-container">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <Suspense fallback={null}>
          <StarsBackground />
        </Suspense>
      </Canvas>
    </div>
  );
};

const EntryPage: React.FC = () => {
  return (
    <div className="entry-page-container">
      <ThreeJSBackground />
      <div className="entry-content">
        <h1>Welcome to WTR</h1>
        <p>Your gateway to advanced trading insights.</p>
        <div className="entry-buttons">
          <Link to="/dashboard" className="entry-button">
            Enter Homepage/Dashboard
          </Link>
          <Link to="/login" className="entry-button">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EntryPage;
