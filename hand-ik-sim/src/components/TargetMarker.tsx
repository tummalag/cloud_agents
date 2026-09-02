import { useRef, useState } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { useFrame, useThree } from '@react-three/fiber'
import { Mesh } from 'three'
import type { TargetPoint } from '../sim/types'

interface TargetMarkerProps {
  target: TargetPoint
  reached: boolean
  onTargetChange: (target: TargetPoint) => void
}

export function TargetMarker({ target, reached, onTargetChange }: TargetMarkerProps) {
  const meshRef = useRef<Mesh>(null)
  const ringRef = useRef<Mesh>(null)
  const [dragging, setDragging] = useState(false)
  const { gl } = useThree()

  useFrame((state) => {
    if (meshRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.08
      meshRef.current.scale.setScalar(pulse)
    }
    if (ringRef.current) {
      ringRef.current.rotation.x = Math.PI / 2
      ringRef.current.rotation.z = state.clock.elapsedTime * 1.5
    }
  })

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setDragging(true)
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
    gl.domElement.style.cursor = 'grabbing'
  }

  const handlePointerUp = () => {
    setDragging(false)
    gl.domElement.style.cursor = 'auto'
  }

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!dragging) return
    const point = e.point
    onTargetChange({
      x: Math.max(-0.7, Math.min(0.7, point.x)),
      y: Math.max(0.3, Math.min(1.4, point.y)),
      z: Math.max(0.1, Math.min(1.2, point.z)),
    })
  }

  const color = reached ? '#00ff88' : '#ff00aa'
  const emissive = reached ? '#00ff88' : '#ff00aa'

  return (
    <group position={[target.x, target.y, target.z]}>
      <mesh
        ref={meshRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        onPointerOver={() => {
          gl.domElement.style.cursor = 'grab'
        }}
        onPointerOut={() => {
          if (!dragging) gl.domElement.style.cursor = 'auto'
        }}
      >
        <sphereGeometry args={[0.06, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={2}
          metalness={0.5}
          roughness={0.1}
          transparent
          opacity={0.85}
        />
      </mesh>

      <mesh ref={ringRef}>
        <torusGeometry args={[0.1, 0.004, 8, 32]} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={1.5} transparent opacity={0.7} />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.12, 0.125, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} side={2} />
      </mesh>

      {(['x', 'y', 'z'] as const).map((axis, i) => {
        const rot: [number, number, number] = i === 0 ? [0, 0, Math.PI / 2] : i === 1 ? [0, 0, 0] : [Math.PI / 2, 0, 0]
        return (
          <mesh key={axis} rotation={rot}>
            <boxGeometry args={[0.2, 0.003, 0.003]} />
            <meshBasicMaterial color={color} transparent opacity={0.4} />
          </mesh>
        )
      })}
    </group>
  )
}
