import { Vector3 } from 'three'
import {
  ARM_DEFS,
  REACH_THRESHOLD,
  type ArmDefinition,
  type ArmSide,
  type DualArmPose,
  type SolvedArm,
  type TargetPoint,
} from './types'

const _v0 = new Vector3()
const _v1 = new Vector3()
const _v2 = new Vector3()

function targetToVec(t: TargetPoint): Vector3 {
  return new Vector3(t.x, t.y, t.z)
}

function clampTarget(shoulder: Vector3, target: Vector3, maxReach: number): Vector3 {
  const dist = shoulder.distanceTo(target)
  if (dist <= maxReach) return target.clone()
  return _v0.copy(target).sub(shoulder).normalize().multiplyScalar(maxReach * 0.98).add(shoulder)
}

function initChain(def: ArmDefinition): Vector3[] {
  const [upper, forearm, hand] = def.segmentLengths
  const shoulder = def.shoulder
  const forward = def.side === 'left' ? -0.3 : 0.3
  const dir = _v0.set(forward, -0.4, 0.6).normalize()

  const elbow = _v1.copy(shoulder).add(dir.clone().multiplyScalar(upper))
  const wrist = _v2.copy(elbow).add(dir.clone().multiplyScalar(forearm))
  const end = wrist.clone().add(dir.clone().multiplyScalar(hand))

  return [shoulder.clone(), elbow, wrist, end]
}

function applyElbowPole(joints: Vector3[], def: ArmDefinition): void {
  if (joints.length < 3) return
  const shoulder = joints[0]
  const elbow = joints[1]
  const wrist = joints[2]

  const mid = _v0.addVectors(shoulder, wrist).multiplyScalar(0.5)
  const toElbow = _v1.subVectors(elbow, mid)
  const desired = _v2.copy(def.poleOffset).normalize().multiplyScalar(0.15)

  elbow.add(desired.sub(toElbow.normalize().multiplyScalar(0.15)))

  const upperLen = def.segmentLengths[0]
  const foreLen = def.segmentLengths[1]
  const toWrist = wrist.clone().sub(shoulder)
  const distSW = toWrist.length()
  if (distSW < 0.001 || distSW > upperLen + foreLen) return

  const cosAngle = (upperLen * upperLen + distSW * distSW - foreLen * foreLen) / (2 * upperLen * distSW)
  const angle = Math.acos(Math.max(-1, Math.min(1, cosAngle)))
  const axis = toWrist.clone().cross(def.poleOffset).normalize()
  if (axis.lengthSq() < 0.001) return

  const dirToWrist = toWrist.clone().normalize()
  const newElbow = shoulder
    .clone()
    .add(
      dirToWrist
        .clone()
        .applyAxisAngle(axis, angle * 0.5)
        .normalize()
        .multiplyScalar(upperLen),
    )
  joints[1].lerp(newElbow, 0.35)
}

function solveFABRIK(def: ArmDefinition, target: Vector3, iterations = 20): Vector3[] {
  const lengths = def.segmentLengths
  const totalLen = lengths.reduce((a, b) => a + b, 0)
  const shoulder = def.shoulder
  const clamped = clampTarget(shoulder, target, totalLen)

  const joints = initChain(def)

  for (let iter = 0; iter < iterations; iter++) {
    joints[joints.length - 1].copy(clamped)

    for (let i = joints.length - 2; i >= 0; i--) {
      const dir = _v0.subVectors(joints[i], joints[i + 1]).normalize()
      joints[i].copy(joints[i + 1]).add(dir.multiplyScalar(lengths[i]))
    }

    joints[0].copy(shoulder)
    for (let i = 0; i < joints.length - 1; i++) {
      const dir = _v0.subVectors(joints[i + 1], joints[i]).normalize()
      joints[i + 1].copy(joints[i]).add(dir.multiplyScalar(lengths[i]))
    }

    if (iter % 4 === 3) applyElbowPole(joints, def)
  }

  return joints.map((j) => j.clone())
}

export function solveArm(def: ArmDefinition, target: TargetPoint): SolvedArm {
  const targetVec = targetToVec(target)
  const joints = solveFABRIK(def, targetVec)
  const endEffector = joints[joints.length - 1]
  const error = endEffector.distanceTo(targetVec)

  return {
    side: def.side,
    joints,
    color: def.color,
    glowColor: def.glowColor,
    reached: error < REACH_THRESHOLD,
    error,
  }
}

export function solveDualArms(
  leftTarget: TargetPoint,
  rightTarget: TargetPoint,
): DualArmPose {
  return {
    left: solveArm(ARM_DEFS.left, leftTarget),
    right: solveArm(ARM_DEFS.right, rightTarget),
    torsoCenter: new Vector3(0, 1.0, 0),
  }
}

export function screenSideFromX(clientX: number, width: number): ArmSide {
  return clientX < width / 2 ? 'left' : 'right'
}
