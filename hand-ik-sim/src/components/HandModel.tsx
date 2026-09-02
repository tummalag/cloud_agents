import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh, Quaternion, Vector3 } from 'three'
import type { FingerName, HandPose, SolvedFinger } from '../sim/types'

interface HandModelProps {
  pose: HandPose
  activeFinger: FingerName
  showSkeleton: boolean
}

function BoneSegment({
  start,
  end,
  radius,
  color,
  emissive,
  isActive,
}: {
  start: Vector3
  end: Vector3
  radius: number
  color: string
  emissive: string
  isActive: boolean
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
      <cylinderGeometry args={[radius, radius * 0.85, length, 8]} />
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={isActive ? 0.6 : 0.2}
        metalness={0.7}
        roughness={0.3}
        transparent
        opacity={0.9}
      />
    </mesh>
  )
}

function FingerMesh({ finger, isActive, showSkeleton }: { finger: SolvedFinger; isActive: boolean; showSkeleton: boolean }) {
  const joints = finger.joints

  return (
    <group>
      {showSkeleton &&
        joints.map((joint, i) => (
          <mesh key={`joint-${i}`} position={joint.position.toArray()}>
            <sphereGeometry args={[isActive ? 0.035 : 0.025, 16, 16]} />
            <meshStandardMaterial
              color={finger.color}
              emissive={finger.glowColor}
              emissiveIntensity={isActive ? 1.2 : 0.4}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
        ))}

      {joints.length >= 2 && (
        <>
          <BoneSegment
            start={joints[0].position}
            end={joints[1].position}
            radius={isActive ? 0.022 : 0.016}
            color={finger.color}
            emissive={finger.glowColor}
            isActive={isActive}
          />
          <BoneSegment
            start={joints[1].position}
            end={joints[2].position}
            radius={isActive ? 0.019 : 0.014}
            color={finger.color}
            emissive={finger.glowColor}
            isActive={isActive}
          />
          <BoneSegment
            start={joints[2].position}
            end={joints[3].position}
            radius={isActive ? 0.016 : 0.012}
            color={finger.color}
            emissive={finger.glowColor}
            isActive={isActive}
          />
        </>
      )}

      <mesh position={finger.tip.toArray()}>
        <sphereGeometry args={[isActive ? 0.028 : 0.018, 12, 12]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive={finger.glowColor}
          emissiveIntensity={isActive ? 2 : 0.6}
          metalness={1}
          roughness={0.1}
        />
      </mesh>
    </group>
  )
}

function Palm({ wrist }: { wrist: Vector3 }) {
  const meshRef = useRef<Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.02
    }
  })

  return (
    <group position={wrist.toArray()}>
      <mesh ref={meshRef} position={[0, 0, 0.18]} rotation={[-0.3, 0, 0]}>
        <boxGeometry args={[0.72, 0.08, 0.5]} />
        <meshStandardMaterial
          color="#1a1a2e"
          emissive="#0a3060"
          emissiveIntensity={0.3}
          metalness={0.9}
          roughness={0.2}
          transparent
          opacity={0.85}
        />
      </mesh>
      <mesh position={[0, -0.02, 0.18]}>
        <boxGeometry args={[0.68, 0.04, 0.46]} />
        <meshStandardMaterial color="#0d1b2a" metalness={0.8} roughness={0.4} />
      </mesh>
    </group>
  )
}

function WristJoint({ wrist }: { wrist: Vector3 }) {
  return (
    <mesh position={wrist.toArray()}>
      <sphereGeometry args={[0.06, 16, 16]} />
      <meshStandardMaterial color="#334155" emissive="#1e3a5f" emissiveIntensity={0.5} metalness={0.9} roughness={0.3} />
    </mesh>
  )
}

export function HandModel({ pose, activeFinger, showSkeleton }: HandModelProps) {
  return (
    <group>
      <WristJoint wrist={pose.wrist} />
      <Palm wrist={pose.wrist} />
      {pose.fingers.map((finger) => (
        <FingerMesh
          key={finger.name}
          finger={finger}
          isActive={finger.name === activeFinger}
          showSkeleton={showSkeleton}
        />
      ))}
    </group>
  )
}
