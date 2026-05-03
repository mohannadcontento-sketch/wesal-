'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePerformanceMode } from '@/hooks/usePerformanceMode';

interface ParticleFieldCanvasProps {
  className?: string;
  count?: number;
  background?: string;
}

// Wesal brand colors with transparency for particles
const PARTICLE_COLORS = [
  new THREE.Color('#73b3ce'), // wesal-sky
  new THREE.Color('#d6f3f4'), // wesal-ice
  new THREE.Color('#ffffff'), // white
  new THREE.Color('#508992'), // wesal-medium (accent)
];

function Particles({ count }: { count: number }) {
  const meshRef = useRef<THREE.Points>(null);

  // Generate random positions, colors and speeds
  const { positions, colors, speeds } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const spd = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Spread particles across a wide plane
      const i3 = i * 3;
      pos[i3] = (Math.random() - 0.5) * 20;     // x
      pos[i3 + 1] = (Math.random() - 0.5) * 12;  // y
      pos[i3 + 2] = (Math.random() - 0.5) * 6;   // z (shallow depth)

      // Pick a random brand color
      const c = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
      col[i3] = c.r;
      col[i3 + 1] = c.g;
      col[i3 + 2] = c.b;

      // Individual floating speed
      spd[i] = 0.2 + Math.random() * 0.8;
    }

    return { positions: pos, colors: col, speeds: spd };
  }, [count]);

  // Gentle sine/cos floating animation
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const posAttr = meshRef.current.geometry.attributes.position;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const speed = speeds[i];
      arr[i3 + 1] += Math.sin(t * speed + i) * 0.001;     // gentle Y drift
      arr[i3] += Math.cos(t * speed * 0.5 + i) * 0.0005;   // very subtle X drift
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function ParticleFieldCanvas({
  className = '',
  count,
  background = 'transparent',
}: ParticleFieldCanvasProps) {
  const performance = usePerformanceMode();

  // Default: ~200 on desktop, ~50 on mobile
  const particleCount =
    count ?? (performance === 'medium' ? 60 : 200);

  return (
    <div
      className={className}
      style={{ position: 'absolute', inset: 0, background, overflow: 'hidden' }}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        dpr={performance === 'medium' ? 1 : 1.5}
        gl={{ antialias: false, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.3} />
        <Particles count={particleCount} />
      </Canvas>
    </div>
  );
}
