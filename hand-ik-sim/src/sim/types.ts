import { Vector3 } from 'three'

export type FingerName = 'thumb' | 'index' | 'middle' | 'ring' | 'pinky'

export interface JointAngles {
  flex: number
  spread: number
}

export interface FingerDefinition {
  name: FingerName
  baseOffset: Vector3
  baseRotation: number
  segmentLengths: [number, number, number]
  jointLimits: {
    mcp: { flex: [number, number]; spread: [number, number] }
    pip: { flex: [number, number] }
    dip: { flex: [number, number] }
  }
  color: string
  glowColor: string
}

export interface SolvedJoint {
  position: Vector3
  rotation: number
  flexAngle: number
  spreadAngle: number
}

export interface SolvedFinger {
  name: FingerName
  joints: SolvedJoint[]
  tip: Vector3
  color: string
  glowColor: string
}

export interface HandPose {
  fingers: SolvedFinger[]
  wrist: Vector3
}

export interface TargetPoint {
  x: number
  y: number
  z: number
}

export const FINGER_DEFS: FingerDefinition[] = [
  {
    name: 'thumb',
    baseOffset: new Vector3(-0.38, 0.05, 0.12),
    baseRotation: -0.6,
    segmentLengths: [0.38, 0.32, 0.28],
    jointLimits: {
      mcp: { flex: [-0.3, 1.4], spread: [-0.8, 0.4] },
      pip: { flex: [-0.1, 1.2] },
      dip: { flex: [-0.1, 1.0] },
    },
    color: '#ff6b35',
    glowColor: '#ff6b35',
  },
  {
    name: 'index',
    baseOffset: new Vector3(-0.22, 0, 0.42),
    baseRotation: -0.08,
    segmentLengths: [0.42, 0.28, 0.22],
    jointLimits: {
      mcp: { flex: [-0.2, 1.5], spread: [-0.3, 0.3] },
      pip: { flex: [-0.1, 1.6] },
      dip: { flex: [-0.1, 1.2] },
    },
    color: '#00f0ff',
    glowColor: '#00f0ff',
  },
  {
    name: 'middle',
    baseOffset: new Vector3(-0.02, 0, 0.44),
    baseRotation: 0,
    segmentLengths: [0.44, 0.30, 0.24],
    jointLimits: {
      mcp: { flex: [-0.2, 1.5], spread: [-0.2, 0.2] },
      pip: { flex: [-0.1, 1.6] },
      dip: { flex: [-0.1, 1.2] },
    },
    color: '#a855f7',
    glowColor: '#c084fc',
  },
  {
    name: 'ring',
    baseOffset: new Vector3(0.18, 0, 0.42),
    baseRotation: 0.08,
    segmentLengths: [0.40, 0.28, 0.22],
    jointLimits: {
      mcp: { flex: [-0.2, 1.5], spread: [-0.2, 0.2] },
      pip: { flex: [-0.1, 1.6] },
      dip: { flex: [-0.1, 1.2] },
    },
    color: '#22d3ee',
    glowColor: '#67e8f9',
  },
  {
    name: 'pinky',
    baseOffset: new Vector3(0.36, 0, 0.36),
    baseRotation: 0.18,
    segmentLengths: [0.32, 0.24, 0.20],
    jointLimits: {
      mcp: { flex: [-0.2, 1.5], spread: [-0.2, 0.4] },
      pip: { flex: [-0.1, 1.6] },
      dip: { flex: [-0.1, 1.2] },
    },
    color: '#f472b6',
    glowColor: '#fb7185',
  },
]

export const WRIST_POSITION = new Vector3(0, 0.6, 0)
