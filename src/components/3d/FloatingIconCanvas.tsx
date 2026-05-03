'use client';

import { Canvas } from '@react-three/fiber';
import { Float, RoundedBox, Environment } from '@react-three/drei';
import { usePerformanceMode } from '@/hooks/usePerformanceMode';

interface FloatingIconCanvasProps {
  color: string;
  size: number;
  className?: string;
}

function GlassIcon({ color, size }: { color: string; size: number }) {
  const s = size / 100;

  return (
    <Float speed={2} rotationIntensity={0.4} floatIntensity={0.6}>
      <group scale={s}>
        {/* Glass-morphism box */}
        <RoundedBox args={[1, 1, 0.15]} radius={0.2} smoothness={4}>
          <meshPhysicalMaterial
            color={color}
            transparent
            opacity={0.25}
            roughness={0.1}
            metalness={0}
            transmission={0.92}
            thickness={0.3}
            envMapIntensity={0.8}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </RoundedBox>
        {/* Inner glow sphere */}
        <mesh position={[0, 0, 0.08]}>
          <sphereGeometry args={[0.2, 32, 32]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.4}
            transparent
            opacity={0.5}
          />
        </mesh>
      </group>
    </Float>
  );
}

export default function FloatingIconCanvas({
  color,
  size,
  className,
}: FloatingIconCanvasProps) {
  const performance = usePerformanceMode();

  return (
    <div className={className} style={{ width: size, height: size }}>
      <Canvas
        camera={{ position: [0, 0, 3], fov: 45 }}
        dpr={performance === 'medium' ? 1.5 : 2}
        gl={{ antialias: performance !== 'low', alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <GlassIcon color={color} size={size} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
