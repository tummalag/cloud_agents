import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { Plane, Vector2, Vector3 } from 'three'
import { screenSideFromX } from '../sim/armIkSolver'
import type { ArmSide, TargetPoint } from '../sim/types'

const _hit = new Vector3()
const TOUCH_PLANE = new Plane(new Vector3(0, 0, 1), -0.45)

interface TouchControllerProps {
  onTouch: (side: ArmSide, point: TargetPoint) => void
}

export function TouchController({ onTouch }: TouchControllerProps) {
  const { camera, raycaster, gl } = useThree()
  const dragging = useRef(false)

  useEffect(() => {
    const el = gl.domElement

    const projectTouch = (clientX: number, clientY: number): TargetPoint | null => {
      const rect = el.getBoundingClientRect()
      const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1
      const ndcY = -((clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(new Vector2(ndcX, ndcY), camera)
      if (!raycaster.ray.intersectPlane(TOUCH_PLANE, _hit)) return null
      return {
        x: Math.max(-0.75, Math.min(0.75, _hit.x)),
        y: Math.max(0.35, Math.min(1.45, _hit.y)),
        z: Math.max(0.15, Math.min(1.1, _hit.z)),
      }
    }

    const handlePointerDown = (e: PointerEvent) => {
      dragging.current = true
      const point = projectTouch(e.clientX, e.clientY)
      if (!point) return
      const side = screenSideFromX(e.clientX, window.innerWidth)
      onTouch(side, point)
    }

    const handlePointerMove = (e: PointerEvent) => {
      if (!dragging.current) return
      const point = projectTouch(e.clientX, e.clientY)
      if (!point) return
      const side = screenSideFromX(e.clientX, window.innerWidth)
      onTouch(side, point)
    }

    const handlePointerUp = () => {
      dragging.current = false
    }

    el.addEventListener('pointerdown', handlePointerDown)
    el.addEventListener('pointermove', handlePointerMove)
    el.addEventListener('pointerup', handlePointerUp)
    el.addEventListener('pointercancel', handlePointerUp)

    return () => {
      el.removeEventListener('pointerdown', handlePointerDown)
      el.removeEventListener('pointermove', handlePointerMove)
      el.removeEventListener('pointerup', handlePointerUp)
      el.removeEventListener('pointercancel', handlePointerUp)
    }
  }, [camera, gl, onTouch, raycaster])

  return null
}
