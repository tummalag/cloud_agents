import { Vector3 } from 'three'

export type ArmSide = 'left' | 'right'

export interface TargetPoint {
  x: number
  y: number
  z: number
}

export interface ArmDefinition {
  side: ArmSide
  shoulder: Vector3
  segmentLengths: [number, number, number] // upper arm, forearm, hand
  color: string
  glowColor: string
  poleOffset: Vector3 // elbow bend direction hint
}

export interface SolvedArm {
  side: ArmSide
  joints: Vector3[] // [shoulder, elbow, wrist, endEffector]
  color: string
  glowColor: string
  reached: boolean
  error: number
}

export interface DualArmPose {
  left: SolvedArm
  right: SolvedArm
  torsoCenter: Vector3
}

export const LEFT_SHOULDER = new Vector3(-0.42, 1.22, 0.02)
export const RIGHT_SHOULDER = new Vector3(0.42, 1.22, 0.02)
export const TORSO_CENTER = new Vector3(0, 1.0, 0)

export const ARM_DEFS: Record<ArmSide, ArmDefinition> = {
  left: {
    side: 'left',
    shoulder: LEFT_SHOULDER,
    segmentLengths: [0.34, 0.30, 0.14],
    color: '#00f0ff',
    glowColor: '#00f0ff',
    poleOffset: new Vector3(-0.6, -0.4, -0.15),
  },
  right: {
    side: 'right',
    shoulder: RIGHT_SHOULDER,
    segmentLengths: [0.34, 0.30, 0.14],
    color: '#ff00aa',
    glowColor: '#ff6bcc',
    poleOffset: new Vector3(0.6, -0.4, -0.15),
  },
}

export const REACH_THRESHOLD = 0.03

export function defaultTargets(): Record<ArmSide, TargetPoint> {
  return {
    left: { x: -0.35, y: 0.85, z: 0.55 },
    right: { x: 0.35, y: 0.85, z: 0.55 },
  }
}
