import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh } from 'three'
import type { TargetPoint } from '../sim/types'

interface TouchTargetProps {
  target: TargetPoint
  color: string
  reached: boolean
}

export function TouchTarget({ target, color, reached }: TouchTargetProps) {
  const meshRef = useRef<Mesh>(null)
  const ringRef = useRef<Mesh>(null)
  const displayColor = reached ? '#00ff88' : color

  useFrame((state) => {
    if (meshRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1
      meshRef.current.scale.setScalar(pulse)
    }
    if (ringRef.current) ringRef.current.rotation.z = state.clock.elapsedTime * 2
  })

  return (
    <group position={[target.x, target.y, target.z]}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.05, 20, 20]} />
        <meshStandardMaterial color={displayColor} emissive={displayColor} emissiveIntensity={2} transparent opacity={0.9} />
      </mesh>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.08, 0.003, 8, 32]} />
        <meshStandardMaterial color={displayColor} emissive={displayColor} emissiveIntensity={1.2} transparent opacity={0.6} />
      </mesh>
    </group>
  )
}
