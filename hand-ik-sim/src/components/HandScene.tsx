import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, Grid, Float, Sparkles } from '@react-three/drei'
import { Suspense } from 'react'
import { HandModel } from './HandModel'
import { TargetMarker } from './TargetMarker'
import type { FingerName, HandPose, TargetPoint } from '../sim/types'

interface HandSceneProps {
  pose: HandPose
  target: TargetPoint
  activeFinger: FingerName
  reached: boolean
  error: number
  showSkeleton: boolean
  showGrid: boolean
  onTargetChange: (target: TargetPoint) => void
}

function SceneContent({
  pose,
  target,
  activeFinger,
  reached,
  showSkeleton,
  showGrid,
  onTargetChange,
}: HandSceneProps) {
  return (
    <>
      <color attach="background" args={['#050510']} />
      <fog attach="fog" args={['#050510', 4, 12]} />

      <ambientLight intensity={0.3} />
      <pointLight position={[2, 3, 2]} intensity={1.2} color="#00f0ff" />
      <pointLight position={[-2, 1, -1]} intensity={0.8} color="#ff00aa" />
      <spotLight position={[0, 4, 0]} angle={0.5} penumbra={0.8} intensity={1.5} color="#a855f7" castShadow />

      <Stars radius={80} depth={40} count={3000} factor={3} saturation={0.2} fade speed={0.5} />
      <Sparkles count={80} scale={6} size={2} speed={0.3} color="#00f0ff" opacity={0.4} />

      {showGrid && (
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
      )}

      <Float speed={1.2} rotationIntensity={0.05} floatIntensity={0.15}>
        <HandModel pose={pose} activeFinger={activeFinger} showSkeleton={showSkeleton} />
      </Float>

      <TargetMarker target={target} reached={reached} onTargetChange={onTargetChange} />

      <OrbitControls
        makeDefault
        enablePan
        minDistance={1.5}
        maxDistance={6}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 1.8}
        target={[0, 0.7, 0.3]}
      />
    </>
  )
}

export function HandScene(props: HandSceneProps) {
  return (
    <Canvas
      shadows
      camera={{ position: [1.8, 1.4, 2.2], fov: 50, near: 0.1, far: 50 }}
      gl={{ antialias: true, alpha: false }}
      style={{ width: '100%', height: '100%' }}
    >
      <Suspense fallback={null}>
        <SceneContent {...props} />
      </Suspense>
    </Canvas>
  )
}
