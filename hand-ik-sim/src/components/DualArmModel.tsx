import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferGeometry, Line, LineBasicMaterial, Mesh, MeshStandardMaterial, Quaternion, Vector3 } from 'three'
import type { DualArmPose, SolvedArm, TargetPoint } from '../sim/types'

const JOINT_SPEEDS = [0, 2.5, 3.8, 5.0] as const
const JOINT_SIZES = [0.055, 0.045, 0.038, 0.032]
const BONE_RADII = [0.028, 0.024, 0.02]

function smoothAlpha(speed: number, dt: number): number {
  const raw = 1 - Math.exp(-speed * dt)
  return raw * raw * (3 - 2 * raw)
}

function cloneJoints(joints: Vector3[]): Vector3[] {
  return joints.map((j) => j.clone())
}

const _dir = new Vector3()
const _mid = new Vector3()
const _up = new Vector3(0, 1, 0)
const _quat = new Quaternion()

function updateBone(mesh: Mesh | null, start: Vector3, end: Vector3) {
  if (!mesh) return
  _dir.subVectors(end, start)
  const len = _dir.length()
  if (len < 0.001) return
  _mid.addVectors(start, end).multiplyScalar(0.5)
  _quat.setFromUnitVectors(_up, _dir.normalize())
  mesh.position.copy(_mid)
  mesh.quaternion.copy(_quat)
  mesh.scale.set(1, len, 1)
}

function AnimatedArm({ targetArm, reachTarget }: { targetArm: SolvedArm; reachTarget: TargetPoint }) {
  const current = useRef(cloneJoints(targetArm.joints))
  const jointRefs = useRef<(Mesh | null)[]>([null, null, null, null])
  const boneRefs = useRef<(Mesh | null)[]>([null, null, null])
  const handRef = useRef<Mesh>(null)
  const lineObj = useMemo(() => {
    const geo = new BufferGeometry()
    const mat = new LineBasicMaterial({ color: targetArm.color, transparent: true, opacity: 0.6 })
    return new Line(geo, mat)
  }, [targetArm.color])
  const goal = useRef(new Vector3(reachTarget.x, reachTarget.y, reachTarget.z))

  useFrame((_, dt) => {
    const capped = Math.min(dt, 0.05)
    let maxMove = 0

    for (let i = 1; i < 4; i++) {
      const before = current.current[i].distanceTo(targetArm.joints[i])
      current.current[i].lerp(targetArm.joints[i], smoothAlpha(JOINT_SPEEDS[i], capped))
      maxMove = Math.max(maxMove, before - current.current[i].distanceTo(targetArm.joints[i]))
    }

    const moving = maxMove > 0.0003
    const actGlow = moving ? 0.6 + Math.min(maxMove / capped * 0.12, 1.0) : 0

    const [shoulder, elbow, wrist, endEffector] = current.current

    for (let i = 0; i < 4; i++) {
      const mesh = jointRefs.current[i]
      if (!mesh) continue
      mesh.position.copy(current.current[i])
      if (i > 0) {
        const mat = mesh.material as MeshStandardMaterial
        mat.emissiveIntensity = 1 + actGlow
      }
    }

    updateBone(boneRefs.current[0], shoulder, elbow)
    updateBone(boneRefs.current[1], elbow, wrist)
    updateBone(boneRefs.current[2], wrist, endEffector)

    if (handRef.current) {
      handRef.current.position.copy(endEffector)
      const mat = handRef.current.material as MeshStandardMaterial
      mat.emissiveIntensity = 1.5 + actGlow * 0.8
    }

    goal.current.set(reachTarget.x, reachTarget.y, reachTarget.z)
    lineObj.geometry.setFromPoints([endEffector, goal.current])
    const mat = lineObj.material as LineBasicMaterial
    mat.color.set(targetArm.reached && endEffector.distanceTo(goal.current) < 0.02 ? '#00ff88' : targetArm.color)
  })

  const endEffector = current.current[3]

  return (
    <group>
      {[1, 2, 3].map((i) => (
        <mesh
          key={`j-${targetArm.side}-${i}`}
          ref={(el) => {
            jointRefs.current[i] = el
          }}
          position={current.current[i].toArray()}
        >
          <sphereGeometry args={[JOINT_SIZES[i], 16, 16]} />
          <meshStandardMaterial
            color={targetArm.color}
            emissive={targetArm.glowColor}
            emissiveIntensity={1}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      ))}

      <mesh position={targetArm.joints[0].toArray()}>
        <sphereGeometry args={[JOINT_SIZES[0], 16, 16]} />
        <meshStandardMaterial color={targetArm.color} emissive={targetArm.glowColor} emissiveIntensity={0.8} metalness={0.8} roughness={0.2} />
      </mesh>

      {[0, 1, 2].map((i) => (
        <mesh
          key={`b-${targetArm.side}-${i}`}
          ref={(el) => {
            boneRefs.current[i] = el
          }}
        >
          <cylinderGeometry args={[BONE_RADII[i], BONE_RADII[i] * 0.88, 1, 10]} />
          <meshStandardMaterial color={targetArm.color} emissive={targetArm.glowColor} emissiveIntensity={0.7} metalness={0.75} roughness={0.25} />
        </mesh>
      ))}

      <mesh ref={handRef} position={endEffector.toArray()}>
        <boxGeometry args={[0.1, 0.06, 0.14]} />
        <meshStandardMaterial color="#ffffff" emissive={targetArm.glowColor} emissiveIntensity={1.5} metalness={0.9} roughness={0.1} />
      </mesh>

      <primitive object={lineObj} />
    </group>
  )
}

function Torso({ center }: { center: Vector3 }) {
  const meshRef = useRef<Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.01
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
    </group>
  )
}

interface DualArmModelProps {
  targetPose: DualArmPose
  leftTarget: TargetPoint
  rightTarget: TargetPoint
}

export function DualArmModel({ targetPose, leftTarget, rightTarget }: DualArmModelProps) {
  return (
    <group>
      <Torso center={targetPose.torsoCenter} />
      <AnimatedArm targetArm={targetPose.left} reachTarget={leftTarget} />
      <AnimatedArm targetArm={targetPose.right} reachTarget={rightTarget} />
    </group>
  )
}
