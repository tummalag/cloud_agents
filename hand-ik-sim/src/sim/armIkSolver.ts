import { Vector3 } from 'three'
import {
  ARM_DEFS,
  REACH_THRESHOLD,
  TORSO_CENTER,
  type ArmDefinition,
  type ArmSide,
  type DualArmPose,
  type SolvedArm,
  type TargetPoint,
} from './types'

const _v0 = new Vector3()
const _v1 = new Vector3()
const _v2 = new Vector3()
const _v3 = new Vector3()

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

function targetToVec(t: TargetPoint): Vector3 {
  return new Vector3(t.x, t.y, t.z)
}

function clampTarget(shoulder: Vector3, target: Vector3, maxReach: number): Vector3 {
  const dist = shoulder.distanceTo(target)
  if (dist <= maxReach) return target.clone()
  return _v0.copy(target).sub(shoulder).normalize().multiplyScalar(maxReach * 0.98).add(shoulder)
}

/** Two-bone IK (shoulder → elbow → wrist) with pole vector for natural elbow bend */
function solveTwoBoneIK(
  shoulder: Vector3,
  wristTarget: Vector3,
  poleWorld: Vector3,
  upperLen: number,
  foreLen: number,
): { elbow: Vector3; wrist: Vector3 } {
  const toWrist = _v0.copy(wristTarget).sub(shoulder)
  let dist = toWrist.length()
  const maxReach = upperLen + foreLen

  if (dist < 0.001) {
    toWrist.set(0, -1, 0.3).normalize()
    dist = 0.3
  } else {
    toWrist.normalize()
  }

  if (dist >= maxReach * 0.995) {
    const elbow = shoulder.clone().add(toWrist.clone().multiplyScalar(upperLen))
    const wrist = shoulder.clone().add(toWrist.clone().multiplyScalar(maxReach * 0.995))
    return { elbow, wrist }
  }

  const cosShoulder =
    (upperLen * upperLen + dist * dist - foreLen * foreLen) / (2 * upperLen * dist)
  const shoulderAngle = Math.acos(clamp(cosShoulder, -1, 1))

  const toPole = _v1.copy(poleWorld).sub(shoulder)
  const planeNormal = _v2.copy(toWrist).cross(toPole)
  if (planeNormal.lengthSq() < 1e-8) {
    planeNormal.set(0, 1, 0).cross(toWrist)
  }
  planeNormal.normalize()

  const bendDir = _v3.copy(planeNormal).cross(toWrist).normalize()

  const elbowDir = toWrist
    .clone()
    .multiplyScalar(Math.cos(shoulderAngle))
    .add(bendDir.multiplyScalar(Math.sin(shoulderAngle)))

  const elbow = shoulder.clone().add(elbowDir.multiplyScalar(upperLen))
  const wristDir = wristTarget.clone().sub(elbow).normalize()
  const wrist = elbow.clone().add(wristDir.multiplyScalar(foreLen))

  return { elbow, wrist }
}

function solveArmChain(def: ArmDefinition, target: Vector3): Vector3[] {
  const [upperLen, foreLen, handLen] = def.segmentLengths
  const shoulder = def.shoulder
  const totalReach = upperLen + foreLen + handLen
  const clampedTarget = clampTarget(shoulder, target, totalReach)

  const poleWorld = shoulder.clone().add(def.poleOffset)

  const toTarget = _v0.copy(clampedTarget).sub(shoulder).normalize()
  const wristTarget = _v1.copy(clampedTarget).sub(toTarget.clone().multiplyScalar(handLen))

  const { elbow, wrist } = solveTwoBoneIK(shoulder, wristTarget, poleWorld, upperLen, foreLen)

  const handDir = _v2.copy(clampedTarget).sub(wrist).normalize()
  const endEffector =
    handDir.lengthSq() > 0.001
      ? wrist.clone().add(handDir.multiplyScalar(handLen))
      : wrist.clone().add(toTarget.multiplyScalar(handLen))

  return [shoulder.clone(), elbow, wrist, endEffector]
}

export function solveArm(def: ArmDefinition, target: TargetPoint): SolvedArm {
  const targetVec = targetToVec(target)
  const joints = solveArmChain(def, targetVec)
  const endEffector = joints[3]
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

export function solveDualArms(leftTarget: TargetPoint, rightTarget: TargetPoint): DualArmPose {
  return {
    left: solveArm(ARM_DEFS.left, leftTarget),
    right: solveArm(ARM_DEFS.right, rightTarget),
    torsoCenter: TORSO_CENTER.clone(),
  }
}

export function screenSideFromX(clientX: number, width: number): ArmSide {
  return clientX < width / 2 ? 'left' : 'right'
}

/** Sphere around torso for true 3D touch raycasting */
export const REACH_SPHERE_CENTER = TORSO_CENTER.clone()
export const REACH_SPHERE_RADIUS = 0.85
