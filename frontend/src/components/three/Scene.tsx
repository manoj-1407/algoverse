import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Float, Sphere, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function ParticleNebula() {
  const mesh = useRef<THREE.Points>(null!);
  const count = 4000;
  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const palette = [[0.39,0.40,0.95],[0.55,0.36,0.96],[0.02,0.71,0.83],[0.06,0.72,0.51],[0.95,0.36,0.60]];
    for (let i = 0; i < count; i++) {
      const r = 10 + Math.random() * 22;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i*3]   = r * Math.sin(phi) * Math.cos(theta);
      positions[i*3+1] = r * Math.sin(phi) * Math.sin(theta) * 0.35;
      positions[i*3+2] = r * Math.cos(phi);
      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i*3] = c[0]; colors[i*3+1] = c[1]; colors[i*3+2] = c[2];
    }
    return { positions, colors };
  }, []);
  useFrame((state) => {
    mesh.current.rotation.y = state.clock.elapsedTime * 0.035;
    mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.018) * 0.08;
  });
  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.07} vertexColors sizeAttenuation transparent opacity={0.9} />
    </points>
  );
}

function DNAHelix() {
  const group = useRef<THREE.Group>(null!);
  const helixData = useMemo(() =>
    Array.from({ length: 48 }, (_, i) => {
      const t = (i / 48) * Math.PI * 4;
      return {
        x1: Math.cos(t)*2.2, y: (i/48)*9-4.5, z1: Math.sin(t)*2.2,
        x2: Math.cos(t+Math.PI)*2.2,           z2: Math.sin(t+Math.PI)*2.2,
        c1: new THREE.Color().setHSL(0.65+i*0.004, 0.95, 0.62),
        c2: new THREE.Color().setHSL(0.52+i*0.004, 0.95, 0.62),
        rung: i % 4 === 0,
      };
    }), []
  );
  useFrame((state) => {
    group.current.rotation.y = state.clock.elapsedTime * 0.28;
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.45) * 0.4;
  });
  return (
    <group ref={group} position={[7, 0, -4]}>
      {helixData.map((d, i) => (
        <group key={i}>
          <mesh position={[d.x1, d.y, d.z1]}>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshStandardMaterial color={d.c1} emissive={d.c1} emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[d.x2, d.y, d.z2]}>
            <sphereGeometry args={[0.09, 8, 8]} />
            <meshStandardMaterial color={d.c2} emissive={d.c2} emissiveIntensity={0.5} />
          </mesh>
          {d.rung && (
            <mesh position={[(d.x1+d.x2)/2, d.y, (d.z1+d.z2)/2]}
              rotation={[0, Math.atan2(d.z2-d.z1, d.x2-d.x1), Math.PI/2]}>
              <cylinderGeometry args={[0.025, 0.025, 4.4, 4]} />
              <meshStandardMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={0.4} transparent opacity={0.5} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

function FloatingOrbs() {
  const orbData = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      pos: [(Math.random()-0.5)*18, (Math.random()-0.5)*7, (Math.random()-0.5)*8-5] as [number,number,number],
      scale: 0.3 + Math.random() * 0.6,
      speed: 0.4 + Math.random() * 0.8,
      color: ["#6366f1","#8b5cf6","#06b6d4","#10b981","#ec4899"][i % 5],
    })), []
  );
  return (
    <>
      {orbData.map((o, i) => (
        <Float key={i} speed={o.speed} rotationIntensity={1} floatIntensity={1.5}>
          <mesh position={o.pos}>
            <icosahedronGeometry args={[o.scale, 1]} />
            <meshStandardMaterial color={o.color} emissive={o.color} emissiveIntensity={0.2}
              transparent opacity={0.5} wireframe={i % 2 === 0} />
          </mesh>
        </Float>
      ))}
    </>
  );
}

function PulsingCore() {
  const mesh = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    const s = 1 + Math.sin(state.clock.elapsedTime * 1.2) * 0.08;
    mesh.current.scale.setScalar(s);
    mesh.current.rotation.y = state.clock.elapsedTime * 0.2;
    mesh.current.rotation.z = state.clock.elapsedTime * 0.1;
  });
  return (
    <Sphere ref={mesh} args={[1.2, 32, 32]} position={[-6, 1, -3]}>
      <MeshDistortMaterial color="#6366f1" emissive="#4338ca" emissiveIntensity={0.6}
        distort={0.4} speed={2} transparent opacity={0.7} />
    </Sphere>
  );
}

function OrbitRings() {
  const r1 = useRef<THREE.Mesh>(null!);
  const r2 = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    r1.current.rotation.x = state.clock.elapsedTime * 0.12;
    r1.current.rotation.z = state.clock.elapsedTime * 0.07;
    r2.current.rotation.x = -state.clock.elapsedTime * 0.08;
    r2.current.rotation.y = state.clock.elapsedTime * 0.15;
  });
  return (
    <>
      <mesh ref={r1} position={[0, 0, -10]}>
        <torusGeometry args={[9, 0.03, 4, 140]} />
        <meshStandardMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={0.9} transparent opacity={0.3} />
      </mesh>
      <mesh ref={r2} position={[0, 0, -10]}>
        <torusGeometry args={[12, 0.02, 4, 140]} />
        <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.8} transparent opacity={0.2} />
      </mesh>
    </>
  );
}

export default function AlgoverseScene() {
  return (
    <Canvas camera={{ position: [0, 0, 13], fov: 58 }} style={{ background: "transparent" }} gl={{ alpha: true, antialias: true }}>
      <ambientLight intensity={0.15} />
      <pointLight position={[6, 6, 4]} intensity={1.2} color="#6366f1" />
      <pointLight position={[-6, -4, 4]} intensity={0.7} color="#06b6d4" />
      <pointLight position={[0, -8, 2]} intensity={0.4} color="#8b5cf6" />
      <Stars radius={100} depth={70} count={5000} factor={3} saturation={0.6} fade speed={0.4} />
      <ParticleNebula />
      <DNAHelix />
      <FloatingOrbs />
      <PulsingCore />
      <OrbitRings />
    </Canvas>
  );
}
