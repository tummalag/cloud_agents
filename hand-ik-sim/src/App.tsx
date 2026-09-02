import { useCallback, useMemo, useState } from 'react'
import { ControlPanel, FINGERS } from './components/ControlPanel'
import { HandScene } from './components/HandScene'
import { HelpButton, HelpGuide } from './components/HelpGuide'
import { defaultTarget, solveHandIK } from './sim/ikSolver'
import type { FingerName, TargetPoint } from './sim/types'

export default function App() {
  const [target, setTarget] = useState<TargetPoint>(defaultTarget)
  const [activeFinger, setActiveFinger] = useState<FingerName>('index')
  const [showSkeleton, setShowSkeleton] = useState(true)
  const [showGrid, setShowGrid] = useState(true)
  const [panelOpen, setPanelOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)

  const ikResult = useMemo(() => solveHandIK(target, activeFinger), [target, activeFinger])

  const handleTargetChange = useCallback((partial: Partial<TargetPoint>) => {
    setTarget((prev) => ({ ...prev, ...partial }))
  }, [])

  const handlePreset = useCallback((presetTarget: TargetPoint, finger: FingerName) => {
    setTarget(presetTarget)
    setActiveFinger(finger)
    setPanelOpen(false)
  }, [])

  const activeFingerLabel = FINGERS.find((f) => f.name === activeFinger)?.label ?? 'Index'

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

      <HelpGuide forceOpen={helpOpen} onForceClose={() => setHelpOpen(false)} />

      {/* Desktop header */}
      <header className="pointer-events-none absolute top-0 right-0 left-0 z-10 hidden items-start justify-between p-5 md:flex">
        <div>
          <h1 className="font-display neon-text text-3xl font-bold tracking-widest text-cyan-300">
            NEUROREACH
          </h1>
          <p className="mt-1 text-sm tracking-wide text-cyan-200/60">
            Biomechanical Hand IK · Real-time Inverse Kinematics
          </p>
        </div>
        <div className="pointer-events-auto flex items-center gap-3">
          <HelpButton onClick={() => setHelpOpen(true)} />
          <div
            className={`glass-panel rounded-lg px-4 py-2 text-sm font-semibold tracking-wider ${
              ikResult.reached ? 'reached-badge border-emerald-400/50 text-emerald-300' : 'text-amber-300'
            }`}
          >
            {ikResult.reached ? '● TARGET LOCKED' : `◌ TRACKING · ${(ikResult.error * 100).toFixed(1)}cm off`}
          </div>
        </div>
      </header>

      {/* Mobile header */}
      <header className="pointer-events-none absolute top-0 right-0 left-0 z-10 flex items-center justify-between px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 md:hidden">
        <h1 className="font-display neon-text text-lg font-bold tracking-widest text-cyan-300">NEUROREACH</h1>
        <div className="pointer-events-auto flex items-center gap-2">
          <HelpButton onClick={() => setHelpOpen(true)} />
          <div
            className={`glass-panel rounded-full px-3 py-1 text-xs font-semibold ${
              ikResult.reached ? 'text-emerald-300' : 'text-amber-300'
            }`}
          >
            {ikResult.reached ? '● LOCKED' : `${(ikResult.error * 100).toFixed(0)}cm off`}
          </div>
        </div>
      </header>

      <ControlPanel
        target={target}
        activeFinger={activeFinger}
        showSkeleton={showSkeleton}
        showGrid={showGrid}
        reached={ikResult.reached}
        error={ikResult.error}
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        onTargetChange={handleTargetChange}
        onFingerChange={setActiveFinger}
        onShowSkeletonChange={setShowSkeleton}
        onShowGridChange={setShowGrid}
        onPreset={handlePreset}
      />

      {/* Mobile quick bar */}
      <div className="mobile-quick-bar pointer-events-none absolute right-0 bottom-0 left-0 z-20 flex flex-col gap-2 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
        <div className="pointer-events-none mx-auto max-w-sm rounded-xl border border-cyan-900/30 bg-slate-950/70 px-3 py-2 text-center backdrop-blur-sm">
          <p className="text-[11px] font-semibold text-cyan-300/90">
            ① Drag <span className="text-pink-400">DRAG TARGET</span> sphere · ② Pick finger · ③ Watch it reach
          </p>
          <p className="mt-0.5 text-[10px] text-slate-500">
            {activeFingerLabel} is reaching · {ikResult.reached ? 'Target locked!' : `${(ikResult.error * 100).toFixed(0)}cm away`}
          </p>
        </div>
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="flex flex-1 gap-1.5 overflow-x-auto rounded-xl border border-cyan-900/40 bg-slate-950/80 p-1.5 backdrop-blur-md">
            {FINGERS.map(({ name, label, color }) => (
              <button
                key={name}
                type="button"
                onClick={() => setActiveFinger(name)}
                className={`shrink-0 rounded-lg px-2.5 py-2 text-xs font-bold transition-all ${
                  activeFinger === name ? 'text-white' : 'text-slate-400'
                }`}
                style={
                  activeFinger === name
                    ? { backgroundColor: `${color}44`, borderColor: color, borderWidth: 1 }
                    : { borderWidth: 1, borderColor: 'transparent' }
                }
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setPanelOpen(true)}
            aria-label="Open controls"
            className="controls-fab shrink-0 rounded-xl border border-cyan-400/40 bg-cyan-950/90 px-4 py-3 text-sm font-bold text-cyan-300 backdrop-blur-md"
          >
            ⚙
          </button>
        </div>
      </div>

      <footer className="pointer-events-none absolute right-0 bottom-0 left-0 z-10 hidden p-4 text-center text-xs text-slate-500 md:block">
        Drag the <strong className="text-pink-400">DRAG TARGET</strong> sphere · Pick a finger · Tap <strong>?</strong> for the operating manual
      </footer>
    </div>
  )
}
