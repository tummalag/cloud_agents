import { Canvas } from '@react-three/fiber'
import { Stars, Grid, Sparkles } from '@react-three/drei'
import { Suspense } from 'react'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { DualArmModel } from './DualArmModel'
import { SceneCamera, CameraZoomBridge } from './SceneCamera'
import { TouchController } from './TouchController'
import { TouchTarget } from './TouchTarget'
import type { ArmSide, DualArmPose, TargetPoint } from '../sim/types'

export interface DualArmSceneProps {
  targetPose: DualArmPose
  leftTarget: TargetPoint
  rightTarget: TargetPoint
  onTouch: (side: ArmSide, point: TargetPoint) => void
  controlsRef: React.RefObject<OrbitControlsImpl | null>
  zoomInRef: React.MutableRefObject<(() => void) | null>
  zoomOutRef: React.MutableRefObject<(() => void) | null>
  resetRef: React.MutableRefObject<(() => void) | null>
}

function SceneContent({
  targetPose,
  leftTarget,
  rightTarget,
  onTouch,
  controlsRef,
  zoomInRef,
  zoomOutRef,
  resetRef,
}: DualArmSceneProps) {
  return (
    <>
      <color attach="background" args={['#050510']} />
      <fog attach="fog" args={['#050510', 5, 18]} />

      <ambientLight intensity={0.35} />
      <pointLight position={[2, 3, 2]} intensity={1.2} color="#00f0ff" />
      <pointLight position={[-2, 1, -1]} intensity={0.8} color="#ff00aa" />
      <pointLight position={[0, 2, -2]} intensity={0.5} color="#a855f7" />
      <spotLight position={[0, 4, 1]} angle={0.5} penumbra={0.8} intensity={1.5} color="#a855f7" />

      <Stars radius={80} depth={40} count={2500} factor={3} saturation={0.2} fade speed={0.5} />
      <Sparkles count={60} scale={7} size={2} speed={0.3} color="#00f0ff" opacity={0.35} />

      <Grid
        position={[0, 0, 0]}
        args={[4, 4]}
        cellSize={0.2}
        cellThickness={0.5}
        cellColor="#0a2040"
        sectionSize={1}
        sectionThickness={1}
        sectionColor="#00f0ff"
        fadeDistance={10}
        fadeStrength={1}
        infiniteGrid
      />

      <DualArmModel targetPose={targetPose} leftTarget={leftTarget} rightTarget={rightTarget} />

      <TouchTarget target={leftTarget} color="#00f0ff" reached={targetPose.left.reached} />
      <TouchTarget target={rightTarget} color="#ff00aa" reached={targetPose.right.reached} />

      <TouchController onTouch={onTouch} />

      <SceneCamera controlsRef={controlsRef} />
      <CameraZoomBridge controlsRef={controlsRef} zoomInRef={zoomInRef} zoomOutRef={zoomOutRef} resetRef={resetRef} />
    </>
  )
}

export function DualArmScene(props: DualArmSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 1.1, 3.2], fov: 52, near: 0.1, far: 50 }}
      gl={{ antialias: true }}
      style={{ width: '100%', height: '100%', touchAction: 'none' }}
    >
      <Suspense fallback={null}>
        <SceneContent {...props} />
      </Suspense>
    </Canvas>
  )
}
