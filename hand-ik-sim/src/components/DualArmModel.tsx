import { useMemo, useRef } from 'react'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Mesh, Quaternion, Vector3 } from 'three'
import type { DualArmPose, SolvedArm } from '../sim/types'

interface DualArmModelProps {
  pose: DualArmPose
}

function BoneSegment({
  start,
  end,
  radius,
  color,
  glow,
  active,
}: {
  start: Vector3
  end: Vector3
  radius: number
  color: string
  glow: string
  active: boolean
}) {
  const { mid, quaternion, length } = useMemo(() => {
    const dir = new Vector3().subVectors(end, start)
    const len = dir.length()
    const center = new Vector3().addVectors(start, end).multiplyScalar(0.5)
    const quat = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), dir.normalize())
    return { mid: center, quaternion: quat, length: len }
  }, [start, end])

  if (length < 0.001) return null

  return (
    <mesh position={mid} quaternion={quaternion}>
      <cylinderGeometry args={[radius, radius * 0.88, length, 10]} />
      <meshStandardMaterial
        color={color}
        emissive={glow}
        emissiveIntensity={active ? 0.7 : 0.25}
        metalness={0.75}
        roughness={0.25}
      />
    </mesh>
  )
}

function JointSphere({ position, size, color, glow, label }: { position: Vector3; size: number; color: string; glow: string; label?: string }) {
  return (
    <group position={position.toArray()}>
      <mesh>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial color={color} emissive={glow} emissiveIntensity={1} metalness={0.8} roughness={0.2} />
      </mesh>
      {label && (
        <Html position={[0, size + 0.06, 0]} center distanceFactor={7}>
          <div className="finger-label-3d whitespace-nowrap rounded border border-white/20 bg-black/70 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-white">
            {label}
          </div>
        </Html>
      )}
    </group>
  )
}

function ArmChain({ arm }: { arm: SolvedArm }) {
  const [shoulder, elbow, wrist, endEffector] = arm.joints
  const labels = ['SHOULDER', 'ELBOW', 'WRIST', 'HAND']
  const sizes = [0.055, 0.045, 0.038, 0.032]
  const radii = [0.028, 0.024, 0.02]

  return (
    <group>
      {arm.joints.map((joint, i) => (
        <JointSphere
          key={`${arm.side}-j-${i}`}
          position={joint}
          size={sizes[i]}
          color={arm.color}
          glow={arm.glowColor}
          label={labels[i]}
        />
      ))}
      <BoneSegment start={shoulder} end={elbow} radius={radii[0]} color={arm.color} glow={arm.glowColor} active />
      <BoneSegment start={elbow} end={wrist} radius={radii[1]} color={arm.color} glow={arm.glowColor} active />
      <BoneSegment start={wrist} end={endEffector} radius={radii[2]} color={arm.color} glow={arm.glowColor} active />
      <mesh position={endEffector.toArray()}>
        <boxGeometry args={[0.1, 0.06, 0.14]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive={arm.glowColor}
          emissiveIntensity={1.5}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      <Html position={[endEffector.x, endEffector.y + 0.1, endEffector.z]} center distanceFactor={7}>
        <div
          className="finger-label-3d whitespace-nowrap rounded-full px-2 py-0.5 text-[9px] font-bold"
          style={{ background: `${arm.glowColor}33`, color: arm.glowColor, border: `1px solid ${arm.glowColor}` }}
        >
          END EFFECTOR
        </div>
      </Html>
    </group>
  )
}

function Torso({ center }: { center: Vector3 }) {
  const meshRef = useRef<Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.015
  })

  return (
    <group position={center.toArray()}>
      <mesh ref={meshRef} position={[0, 0.15, 0]}>
        <boxGeometry args={[0.55, 0.7, 0.28]} />
        <meshStandardMaterial color="#141428" emissive="#0a2040" emissiveIntensity={0.3} metalness={0.85} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#1e293b" emissive="#334155" emissiveIntensity={0.4} metalness={0.8} roughness={0.3} />
      </mesh>
      <Html position={[0, 0.55, 0.18]} center distanceFactor={8}>
        <div className="finger-label-3d text-[9px] font-semibold tracking-widest text-slate-400">TORSO</div>
      </Html>
    </group>
  )
}

export function DualArmModel({ pose }: DualArmModelProps) {
  return (
    <group>
      <Torso center={pose.torsoCenter} />
      <ArmChain arm={pose.left} />
      <ArmChain arm={pose.right} />
    </group>
  )
}
