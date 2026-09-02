import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { Sphere, Vector2, Vector3 } from 'three'
import { REACH_SPHERE_CENTER, REACH_SPHERE_RADIUS, screenSideFromX } from '../sim/armIkSolver'
import type { ArmSide, TargetPoint } from '../sim/types'

const _hit = new Vector3()
const _hit2 = new Vector3()
const REACH_SPHERE = new Sphere(REACH_SPHERE_CENTER, REACH_SPHERE_RADIUS)

interface TouchControllerProps {
  onTouch: (side: ArmSide, point: TargetPoint) => void
}

export function TouchController({ onTouch }: TouchControllerProps) {
  const { camera, raycaster, gl } = useThree()
  const dragging = useRef(false)
  const activePointers = useRef(new Set<number>())

  useEffect(() => {
    const el = gl.domElement

    const projectTouch = (clientX: number, clientY: number): TargetPoint | null => {
      const rect = el.getBoundingClientRect()
      const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1
      const ndcY = -((clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(new Vector2(ndcX, ndcY), camera)

      const hits = raycaster.ray.intersectSphere(REACH_SPHERE, _hit)
      if (hits === null) {
        const far = raycaster.ray.at(2.5, _hit2)
        return {
          x: clamp(far.x, -0.8, 0.8),
          y: clamp(far.y, 0.3, 1.5),
          z: clamp(far.z, -0.3, 1.2),
        }
      }

      return {
        x: clamp(_hit.x, -0.8, 0.8),
        y: clamp(_hit.y, 0.3, 1.5),
        z: clamp(_hit.z, -0.3, 1.2),
      }
    }

    const handlePointerDown = (e: PointerEvent) => {
      activePointers.current.add(e.pointerId)
      if (activePointers.current.size > 1) {
        dragging.current = false
        return
      }
      e.stopPropagation()
      dragging.current = true
      const rect = el.getBoundingClientRect()
      const point = projectTouch(e.clientX, e.clientY)
      if (!point) return
      onTouch(screenSideFromX(e.clientX, rect.width), point)
    }

    const handlePointerMove = (e: PointerEvent) => {
      if (!dragging.current || activePointers.current.size > 1) return
      const rect = el.getBoundingClientRect()
      const point = projectTouch(e.clientX, e.clientY)
      if (!point) return
      onTouch(screenSideFromX(e.clientX, rect.width), point)
    }

    const handlePointerUp = (e: PointerEvent) => {
      activePointers.current.delete(e.pointerId)
      if (activePointers.current.size === 0) dragging.current = false
    }

    el.addEventListener('pointerdown', handlePointerDown, { capture: true })
    el.addEventListener('pointermove', handlePointerMove, { capture: true })
    el.addEventListener('pointerup', handlePointerUp, { capture: true })
    el.addEventListener('pointercancel', handlePointerUp, { capture: true })

    return () => {
      el.removeEventListener('pointerdown', handlePointerDown, { capture: true })
      el.removeEventListener('pointermove', handlePointerMove, { capture: true })
      el.removeEventListener('pointerup', handlePointerUp, { capture: true })
      el.removeEventListener('pointercancel', handlePointerUp, { capture: true })
    }
  }, [camera, gl, onTouch, raycaster])

  return null
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}
