import { Vector3 } from 'three'
import {
  FINGER_DEFS,
  WRIST_POSITION,
  type FingerDefinition,
  type FingerName,
  type HandPose,
  type JointAngles,
  type SolvedFinger,
  type SolvedJoint,
  type TargetPoint,
} from './types'

const _v0 = new Vector3()
const _v1 = new Vector3()
const _v2 = new Vector3()

interface FingerState {
  mcp: JointAngles
  pip: JointAngles
  dip: JointAngles
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function clampJoint(
  angles: JointAngles,
  limits: FingerDefinition['jointLimits']['mcp'],
): JointAngles {
  return {
    flex: clamp(angles.flex, limits.flex[0], limits.flex[1]),
    spread: clamp(angles.spread, limits.spread[0], limits.spread[1]),
  }
}

function clampPip(angles: JointAngles, limits: FingerDefinition['jointLimits']['pip']): JointAngles {
  return {
    flex: clamp(angles.flex, limits.flex[0], limits.flex[1]),
    spread: 0,
  }
}

function clampDip(angles: JointAngles, limits: FingerDefinition['jointLimits']['dip']): JointAngles {
  return {
    flex: clamp(angles.flex, limits.flex[0], limits.flex[1]),
    spread: 0,
  }
}

function applyJointRotation(
  position: Vector3,
  parentRotation: number,
  flex: number,
  spread: number,
  length: number,
): { end: Vector3; rotation: number } {
  const rotation = parentRotation + spread
  const dir = _v0.set(Math.sin(rotation) * Math.cos(flex), Math.sin(flex), Math.cos(rotation) * Math.cos(flex))
  const end = _v1.copy(position).add(dir.multiplyScalar(length))
  return { end, rotation }
}

export function forwardKinematics(
  def: FingerDefinition,
  state: FingerState,
  wrist: Vector3 = WRIST_POSITION,
): SolvedFinger {
  const joints: SolvedJoint[] = []
  let pos = _v2.copy(wrist).add(def.baseOffset)
  let parentRot = def.baseRotation

  joints.push({
    position: pos.clone(),
    rotation: parentRot,
    flexAngle: state.mcp.flex,
    spreadAngle: state.mcp.spread,
  })

  const mcp = applyJointRotation(pos, parentRot, state.mcp.flex, state.mcp.spread, def.segmentLengths[0])
  pos = mcp.end
  parentRot = mcp.rotation
  joints.push({
    position: pos.clone(),
    rotation: parentRot,
    flexAngle: state.pip.flex,
    spreadAngle: 0,
  })

  const pip = applyJointRotation(pos, parentRot, state.pip.flex, 0, def.segmentLengths[1])
  pos = pip.end
  parentRot = pip.rotation
  joints.push({
    position: pos.clone(),
    rotation: parentRot,
    flexAngle: state.dip.flex,
    spreadAngle: 0,
  })

  const dip = applyJointRotation(pos, parentRot, state.dip.flex, 0, def.segmentLengths[2])
  pos = dip.end
  joints.push({
    position: pos.clone(),
    rotation: dip.rotation,
    flexAngle: 0,
    spreadAngle: 0,
  })

  return {
    name: def.name,
    joints,
    tip: pos.clone(),
    color: def.color,
    glowColor: def.glowColor,
  }
}

function solveFingerCCD(
  def: FingerDefinition,
  state: FingerState,
  target: Vector3,
  wrist: Vector3,
  iterations = 24,
): FingerState {
  const result = {
    mcp: { ...state.mcp },
    pip: { ...state.pip },
    dip: { ...state.dip },
  }

  for (let iter = 0; iter < iterations; iter++) {
    const finger = forwardKinematics(def, result, wrist)
    const tip = finger.tip
    const error = tip.distanceTo(target)
    if (error < 0.008) break

    const jointUpdates: Array<{
      key: 'mcp' | 'pip' | 'dip'
      deltaFlex: number
      deltaSpread: number
      hasSpread: boolean
    }> = [
      { key: 'dip', deltaFlex: 0, deltaSpread: 0, hasSpread: false },
      { key: 'pip', deltaFlex: 0, deltaSpread: 0, hasSpread: false },
      { key: 'mcp', deltaFlex: 0, deltaSpread: 0, hasSpread: true },
    ]

    for (const update of jointUpdates) {
      const jointIdx = update.key === 'mcp' ? 0 : update.key === 'pip' ? 1 : 2
      const joint = finger.joints[jointIdx]
      const toTip = _v0.subVectors(tip, joint.position).normalize()
      const toTarget = _v1.subVectors(target, joint.position).normalize()
      const angle = toTip.angleTo(toTarget)
      if (angle < 0.001) continue

      const cross = _v2.crossVectors(toTip, toTarget)
      const sign = cross.y >= 0 ? 1 : -1
      const deltaFlex = sign * angle * 0.55

      if (update.hasSpread) {
        const crossSpread = _v2.crossVectors(toTip, toTarget)
        const spreadSign = crossSpread.z >= 0 ? 1 : -1
        update.deltaSpread = spreadSign * angle * 0.25
      }
      update.deltaFlex = deltaFlex

      if (update.key === 'mcp') {
        result.mcp.flex += update.deltaFlex
        result.mcp.spread += update.deltaSpread
        result.mcp = clampJoint(result.mcp, def.jointLimits.mcp)
      } else if (update.key === 'pip') {
        result.pip.flex += update.deltaFlex
        result.pip = clampPip(result.pip, def.jointLimits.pip)
      } else {
        result.dip.flex += update.deltaFlex
        result.dip = clampDip(result.dip, def.jointLimits.dip)
      }
    }
  }

  return result
}

const REST_POSES: Record<FingerName, FingerState> = {
  thumb: { mcp: { flex: 0.3, spread: -0.2 }, pip: { flex: 0.2, spread: 0 }, dip: { flex: 0.15, spread: 0 } },
  index: { mcp: { flex: 0.1, spread: 0 }, pip: { flex: 0.08, spread: 0 }, dip: { flex: 0.05, spread: 0 } },
  middle: { mcp: { flex: 0.05, spread: 0 }, pip: { flex: 0.05, spread: 0 }, dip: { flex: 0.03, spread: 0 } },
  ring: { mcp: { flex: 0.1, spread: 0 }, pip: { flex: 0.08, spread: 0 }, dip: { flex: 0.05, spread: 0 } },
  pinky: { mcp: { flex: 0.15, spread: 0.05 }, pip: { flex: 0.1, spread: 0 }, dip: { flex: 0.08, spread: 0 } },
}

export function solveHandIK(
  target: TargetPoint,
  activeFinger: FingerName = 'index',
): { pose: HandPose; error: number; reached: boolean } {
  const targetVec = new Vector3(target.x, target.y, target.z)
  const fingerStates = new Map<FingerName, FingerState>()

  for (const def of FINGER_DEFS) {
    const rest = REST_POSES[def.name]
    if (def.name === activeFinger) {
      fingerStates.set(def.name, solveFingerCCD(def, { ...rest, mcp: { ...rest.mcp }, pip: { ...rest.pip }, dip: { ...rest.dip } }, targetVec, WRIST_POSITION))
    } else {
      fingerStates.set(def.name, rest)
    }
  }

  const fingers = FINGER_DEFS.map((def) => forwardKinematics(def, fingerStates.get(def.name)!))
  const activeTip = fingers.find((f) => f.name === activeFinger)!.tip
  const error = activeTip.distanceTo(targetVec)

  return {
    pose: { fingers, wrist: WRIST_POSITION.clone() },
    error,
    reached: error < 0.025,
  }
}

export function getFingerReach(activeFinger: FingerName): number {
  const def = FINGER_DEFS.find((f) => f.name === activeFinger)!
  return def.segmentLengths.reduce((a, b) => a + b, 0) + def.baseOffset.length()
}

export const PRESET_TARGETS: { name: string; target: TargetPoint; finger: FingerName }[] = [
  { name: 'Point Forward', target: { x: 0, y: 0.85, z: 0.9 }, finger: 'index' },
  { name: 'High Reach', target: { x: 0.15, y: 1.2, z: 0.5 }, finger: 'index' },
  { name: 'Side Grab', target: { x: 0.55, y: 0.75, z: 0.3 }, finger: 'middle' },
  { name: 'Thumb Up', target: { x: -0.35, y: 1.05, z: 0.25 }, finger: 'thumb' },
  { name: 'Pinky Wave', target: { x: 0.45, y: 0.95, z: 0.55 }, finger: 'pinky' },
]

export function defaultTarget(): TargetPoint {
  return { x: 0, y: 0.9, z: 0.75 }
}
