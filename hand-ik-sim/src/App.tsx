import { useCallback, useMemo, useRef, useState } from 'react'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { DualArmScene } from './components/DualArmScene'
import { HelpButton, HelpGuide } from './components/HelpGuide'
import { solveDualArms } from './sim/armIkSolver'
import { defaultTargets, type ArmSide, type TargetPoint } from './sim/types'

export default function App() {
  const [targets, setTargets] = useState(defaultTargets)
  const [helpOpen, setHelpOpen] = useState(false)
  const [lastSide, setLastSide] = useState<ArmSide | null>(null)

  const controlsRef = useRef<OrbitControlsImpl | null>(null)
  const zoomInRef = useRef<(() => void) | null>(null)
  const zoomOutRef = useRef<(() => void) | null>(null)
  const resetRef = useRef<(() => void) | null>(null)

  const targetPose = useMemo(
    () => solveDualArms(targets.left, targets.right),
    [targets.left, targets.right],
  )

  const handleTouch = useCallback((side: ArmSide, point: TargetPoint) => {
    setLastSide(side)
    setTargets((prev) => ({ ...prev, [side]: point }))
  }, [])

  return (
    <div className="relative h-full w-full">
      <DualArmScene
        targetPose={targetPose}
        leftTarget={targets.left}
        rightTarget={targets.right}
        onTouch={handleTouch}
        controlsRef={controlsRef}
        zoomInRef={zoomInRef}
        zoomOutRef={zoomOutRef}
        resetRef={resetRef}
      />

      <HelpGuide forceOpen={helpOpen} onForceClose={() => setHelpOpen(false)} />

      <div className="pointer-events-none absolute inset-0 z-10 flex">
        <div className="zone-overlay zone-left flex flex-1 flex-col items-center justify-end pb-44 md:pb-28">
          <span className="font-display rounded-full border border-cyan-400/30 bg-cyan-950/50 px-3 py-1 text-xs font-bold tracking-widest text-cyan-300">
            LEFT ARM
          </span>
        </div>
        <div className="w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
        <div className="zone-overlay zone-right flex flex-1 flex-col items-center justify-end pb-44 md:pb-28">
          <span className="font-display rounded-full border border-pink-400/30 bg-pink-950/50 px-3 py-1 text-xs font-bold tracking-widest text-pink-300">
            RIGHT ARM
          </span>
        </div>
      </div>

      <header className="pointer-events-none absolute top-0 right-0 left-0 z-20 flex items-start justify-between p-4 md:p-5">
        <div>
          <h1 className="font-display neon-text text-xl font-bold tracking-widest text-cyan-300 md:text-3xl">
            NEUROREACH
          </h1>
          <p className="mt-0.5 hidden text-sm text-cyan-200/60 md:block">
            Dual-arm IK · Smooth actuator motion · 360° view
          </p>
        </div>
        <div className="pointer-events-auto flex items-center gap-2">
          <HelpButton onClick={() => setHelpOpen(true)} />
        </div>
      </header>

      <div className="pointer-events-none absolute top-[max(3.5rem,calc(env(safe-area-inset-top)+3rem))] right-0 left-0 z-20 flex justify-center gap-3 px-4">
        <div
          className={`glass-panel rounded-full px-3 py-1 text-xs font-semibold ${
            targetPose.left.reached ? 'text-emerald-300' : lastSide === 'left' ? 'text-cyan-300' : 'text-slate-400'
          }`}
        >
          L {targetPose.left.reached ? '● LOCKED' : `${(targetPose.left.error * 100).toFixed(0)}cm`}
        </div>
        <div
          className={`glass-panel rounded-full px-3 py-1 text-xs font-semibold ${
            targetPose.right.reached ? 'text-emerald-300' : lastSide === 'right' ? 'text-pink-300' : 'text-slate-400'
          }`}
        >
          R {targetPose.right.reached ? '● LOCKED' : `${(targetPose.right.error * 100).toFixed(0)}cm`}
        </div>
      </div>

      {/* Camera zoom controls */}
      <div className="pointer-events-auto absolute right-3 z-30 flex flex-col gap-2 pt-[max(5rem,calc(env(safe-area-inset-top)+4.5rem))] md:right-5">
        <button
          type="button"
          aria-label="Zoom in"
          onClick={() => zoomInRef.current?.()}
          className="camera-btn flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/40 bg-slate-950/85 text-xl font-bold text-cyan-300 backdrop-blur-md"
        >
          +
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => zoomOutRef.current?.()}
          className="camera-btn flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/40 bg-slate-950/85 text-xl font-bold text-cyan-300 backdrop-blur-md"
        >
          −
        </button>
        <button
          type="button"
          aria-label="Reset camera"
          onClick={() => resetRef.current?.()}
          className="camera-btn flex h-11 w-11 items-center justify-center rounded-xl border border-slate-600/60 bg-slate-950/85 text-sm text-slate-400 backdrop-blur-md"
        >
          ⟲
        </button>
      </div>

      <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-20 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-center">
        <p className="mx-auto max-w-lg rounded-xl border border-slate-700/50 bg-slate-950/80 px-4 py-3 text-sm leading-relaxed text-slate-300 backdrop-blur-md">
          <span className="text-cyan-400">Tap left</span> / <span className="text-pink-400">tap right</span> to reach ·
          Arms move smoothly through each joint
        </p>
        <p className="mt-2 text-[10px] text-slate-500">
          1 finger = reach · 2 fingers = orbit &amp; zoom · +/- buttons = zoom · Drag to orbit 360°
        </p>
      </div>
    </div>
  )
}
