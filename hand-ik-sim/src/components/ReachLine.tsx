import { Line } from '@react-three/drei'
import type { Vector3 } from 'three'

interface ReachLineProps {
  from: Vector3
  to: [number, number, number]
  reached: boolean
}

export function ReachLine({ from, to, reached }: ReachLineProps) {
  const color = reached ? '#00ff88' : '#ff00aa'

  return (
    <Line
      points={[from, to]}
      color={color}
      lineWidth={reached ? 2 : 1.5}
      dashed
      dashSize={0.06}
      gapSize={0.04}
      transparent
      opacity={0.7}
    />
  )
}
