import { useCallback, useMemo, useState } from 'react'
import { ControlPanel } from './components/ControlPanel'
import { HandScene } from './components/HandScene'
import { defaultTarget, solveHandIK } from './sim/ikSolver'
import type { FingerName, TargetPoint } from './sim/types'

export default function App() {
  const [target, setTarget] = useState<TargetPoint>(defaultTarget)
  const [activeFinger, setActiveFinger] = useState<FingerName>('index')
  const [showSkeleton, setShowSkeleton] = useState(true)
  const [showGrid, setShowGrid] = useState(true)

  const ikResult = useMemo(() => solveHandIK(target, activeFinger), [target, activeFinger])

  const handleTargetChange = useCallback((partial: Partial<TargetPoint>) => {
    setTarget((prev) => ({ ...prev, ...partial }))
  }, [])

  const handlePreset = useCallback((presetTarget: TargetPoint, finger: FingerName) => {
    setTarget(presetTarget)
    setActiveFinger(finger)
  }, [])

  return (
    <div className="relative h-full w-full">
      <HandScene
        pose={ikResult.pose}
        target={target}
        activeFinger={activeFinger}
        reached={ikResult.reached}
        error={ikResult.error}
        showSkeleton={showSkeleton}
        showGrid={showGrid}
        onTargetChange={setTarget}
      />

      <header className="pointer-events-none absolute top-0 right-0 left-0 z-10 flex items-start justify-between p-5">
        <div>
          <h1 className="font-display neon-text text-2xl font-bold tracking-widest text-cyan-300 md:text-3xl">
            NEUROREACH
          </h1>
          <p className="mt-1 text-sm tracking-wide text-cyan-200/60">
            Biomechanical Hand IK · Real-time Inverse Kinematics
          </p>
        </div>
        <div
          className={`glass-panel pointer-events-auto rounded-lg px-4 py-2 text-sm font-semibold tracking-wider ${
            ikResult.reached ? 'reached-badge border-emerald-400/50 text-emerald-300' : 'text-amber-300'
          }`}
        >
          {ikResult.reached ? '● TARGET LOCKED' : `◌ TRACKING · ${(ikResult.error * 100).toFixed(1)}cm off`}
        </div>
      </header>

      <ControlPanel
        target={target}
        activeFinger={activeFinger}
        showSkeleton={showSkeleton}
        showGrid={showGrid}
        reached={ikResult.reached}
        error={ikResult.error}
        onTargetChange={handleTargetChange}
        onFingerChange={setActiveFinger}
        onShowSkeletonChange={setShowSkeleton}
        onShowGridChange={setShowGrid}
        onPreset={handlePreset}
      />

      <footer className="pointer-events-none absolute right-0 bottom-0 left-0 z-10 p-4 text-center text-xs text-slate-500">
        Drag the glowing target sphere · Adjust coordinates in the panel · Click presets for demo poses
      </footer>
    </div>
  )
}
