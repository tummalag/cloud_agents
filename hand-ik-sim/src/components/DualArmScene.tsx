import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, Grid, Sparkles } from '@react-three/drei'
import { Suspense } from 'react'
import { DualArmModel } from './DualArmModel'
import { ReachLine } from './ReachLine'
import { TouchController } from './TouchController'
import { TouchTarget } from './TouchTarget'
import type { ArmSide, DualArmPose, TargetPoint } from '../sim/types'

interface DualArmSceneProps {
  pose: DualArmPose
  leftTarget: TargetPoint
  rightTarget: TargetPoint
  onTouch: (side: ArmSide, point: TargetPoint) => void
}

function SceneContent({ pose, leftTarget, rightTarget, onTouch }: DualArmSceneProps) {
  const leftEnd = pose.left.joints[3]
  const rightEnd = pose.right.joints[3]

  return (
    <>
      <color attach="background" args={['#050510']} />
      <fog attach="fog" args={['#050510', 4, 14]} />

      <ambientLight intensity={0.35} />
      <pointLight position={[2, 3, 2]} intensity={1.2} color="#00f0ff" />
      <pointLight position={[-2, 1, -1]} intensity={0.8} color="#ff00aa" />
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
        fadeDistance={8}
        fadeStrength={1}
        infiniteGrid
      />

      <DualArmModel pose={pose} />

      <ReachLine from={leftEnd} to={[leftTarget.x, leftTarget.y, leftTarget.z]} color="#00f0ff" reached={pose.left.reached} />
      <ReachLine from={rightEnd} to={[rightTarget.x, rightTarget.y, rightTarget.z]} color="#ff00aa" reached={pose.right.reached} />

      <TouchTarget target={leftTarget} color="#00f0ff" reached={pose.left.reached} />
      <TouchTarget target={rightTarget} color="#ff00aa" reached={pose.right.reached} />

      <TouchController onTouch={onTouch} />

      <OrbitControls
        makeDefault
        enableRotate={false}
        enablePan={false}
        minDistance={2}
        maxDistance={7}
        target={[0, 1.0, 0.2]}
      />
    </>
  )
}

export function DualArmScene(props: DualArmSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 1.2, 3.2], fov: 50, near: 0.1, far: 50 }}
      gl={{ antialias: true }}
      style={{ width: '100%', height: '100%', touchAction: 'none' }}
    >
      <Suspense fallback={null}>
        <SceneContent {...props} />
      </Suspense>
    </Canvas>
  )
}
