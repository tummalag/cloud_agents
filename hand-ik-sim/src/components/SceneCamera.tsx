import { useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { MOUSE, TOUCH } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

export const CAMERA_TARGET: [number, number, number] = [0, 1.0, 0.05]

interface SceneCameraProps {
  controlsRef: React.RefObject<OrbitControlsImpl | null>
}

export function SceneCamera({ controlsRef }: SceneCameraProps) {
  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      enablePan={false}
      enableZoom
      zoomSpeed={1.2}
      rotateSpeed={0.9}
      minDistance={0.5}
      maxDistance={10}
      minPolarAngle={0.02}
      maxPolarAngle={Math.PI - 0.02}
      target={CAMERA_TARGET}
      mouseButtons={{
        MIDDLE: MOUSE.DOLLY,
        RIGHT: MOUSE.ROTATE,
      }}
      touches={{
        TWO: TOUCH.DOLLY_ROTATE,
      }}
    />
  )
}

export function useCameraZoom(controlsRef: React.RefObject<OrbitControlsImpl | null>) {
  const { camera } = useThree()

  const zoom = (direction: 'in' | 'out') => {
    const controls = controlsRef.current
    if (!controls) return
    const factor = direction === 'in' ? 0.72 : 1.38
    const target = controls.target
    const offset = camera.position.clone().sub(target)
    offset.multiplyScalar(factor)
    camera.position.copy(target).add(offset)
    controls.update()
  }

  const resetView = () => {
    const controls = controlsRef.current
    if (!controls) return
    camera.position.set(0, 1.1, 3.2)
    controls.target.set(...CAMERA_TARGET)
    controls.update()
  }

  return { zoom, resetView }
}

export function CameraZoomBridge({
  controlsRef,
  zoomInRef,
  zoomOutRef,
  resetRef,
}: {
  controlsRef: React.RefObject<OrbitControlsImpl | null>
  zoomInRef: React.MutableRefObject<(() => void) | null>
  zoomOutRef: React.MutableRefObject<(() => void) | null>
  resetRef: React.MutableRefObject<(() => void) | null>
}) {
  const { zoom, resetView } = useCameraZoom(controlsRef)

  zoomInRef.current = () => zoom('in')
  zoomOutRef.current = () => zoom('out')
  resetRef.current = resetView

  return null
}
