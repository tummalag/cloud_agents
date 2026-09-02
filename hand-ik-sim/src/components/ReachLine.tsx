import { Line } from '@react-three/drei'
import type { Vector3 } from 'three'

interface ReachLineProps {
  from: Vector3
  to: [number, number, number]
  color: string
  reached: boolean
}

export function ReachLine({ from, to, color, reached }: ReachLineProps) {
  return (
    <Line
      points={[from, to]}
      color={reached ? '#00ff88' : color}
      lineWidth={reached ? 2.5 : 1.5}
      dashed={!reached}
      dashSize={0.05}
      gapSize={0.035}
      transparent
      opacity={0.75}
    />
  )
}
