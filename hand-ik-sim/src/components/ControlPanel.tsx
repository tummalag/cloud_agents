import { PRESET_TARGETS } from '../sim/ikSolver'
import type { FingerName, TargetPoint } from '../sim/types'

interface ControlPanelProps {
  target: TargetPoint
  activeFinger: FingerName
  showSkeleton: boolean
  showGrid: boolean
  reached: boolean
  error: number
  open: boolean
  onClose: () => void
  onTargetChange: (partial: Partial<TargetPoint>) => void
  onFingerChange: (finger: FingerName) => void
  onShowSkeletonChange: (show: boolean) => void
  onShowGridChange: (show: boolean) => void
  onPreset: (target: TargetPoint, finger: FingerName) => void
}

const FINGERS: { name: FingerName; label: string; color: string }[] = [
  { name: 'thumb', label: 'Thumb', color: '#ff6b35' },
  { name: 'index', label: 'Index', color: '#00f0ff' },
  { name: 'middle', label: 'Middle', color: '#a855f7' },
  { name: 'ring', label: 'Ring', color: '#22d3ee' },
  { name: 'pinky', label: 'Pinky', color: '#f472b6' },
]

const AXES = [
  { key: 'x' as const, label: 'X', min: -0.7, max: 0.7, color: '#ff4466' },
  { key: 'y' as const, label: 'Y', min: 0.3, max: 1.4, color: '#44ff88' },
  { key: 'z' as const, label: 'Z', min: 0.1, max: 1.2, color: '#4488ff' },
]

function PanelContent({
  target,
  activeFinger,
  showSkeleton,
  showGrid,
  reached,
  error,
  onTargetChange,
  onFingerChange,
  onShowSkeletonChange,
  onShowGridChange,
  onPreset,
}: Omit<ControlPanelProps, 'open' | 'onClose'>) {
  return (
    <>
      <h2 className="font-display mb-4 text-xs font-semibold tracking-[0.2em] text-cyan-400">
        TARGET COORDINATES
      </h2>

      <div className="space-y-4">
        {AXES.map(({ key, label, min, max, color }) => (
          <div key={key}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span style={{ color }} className="font-semibold">
                {label}
              </span>
              <span className="font-mono text-slate-300">{target[key].toFixed(2)}m</span>
            </div>
            <input
              type="range"
              min={min}
              max={max}
              step={0.01}
              value={target[key]}
              onChange={(e) => onTargetChange({ [key]: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        {AXES.map(({ key, label }) => (
          <div key={`input-${key}`}>
            <label className="mb-1 block text-xs text-slate-400">{label}</label>
            <input
              type="number"
              step={0.01}
              value={target[key]}
              onChange={(e) => onTargetChange({ [key]: parseFloat(e.target.value) || 0 })}
              className="w-full rounded border border-cyan-900/50 bg-slate-900/80 px-2 py-1.5 font-mono text-sm text-cyan-100 outline-none focus:border-cyan-400/60"
            />
          </div>
        ))}
      </div>

      <h2 className="font-display mt-6 mb-3 text-xs font-semibold tracking-[0.2em] text-cyan-400">
        END EFFECTOR
      </h2>
      <div className="flex flex-wrap gap-2">
        {FINGERS.map(({ name, label, color }) => (
          <button
            key={name}
            type="button"
            onClick={() => onFingerChange(name)}
            className={`rounded-full border px-3 py-2 text-sm font-semibold transition-all ${
              activeFinger === name
                ? 'border-white/40 text-white'
                : 'border-slate-700 text-slate-400'
            }`}
            style={activeFinger === name ? { backgroundColor: `${color}33`, borderColor: color } : {}}
          >
            {label}
          </button>
        ))}
      </div>

      <h2 className="font-display mt-6 mb-3 text-xs font-semibold tracking-[0.2em] text-cyan-400">
        PRESETS
      </h2>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {PRESET_TARGETS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => onPreset(preset.target, preset.finger)}
            className="preset-btn rounded-lg border border-slate-700/80 px-3 py-2.5 text-left text-sm text-slate-300"
          >
            {preset.name}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-2 border-t border-slate-700/50 pt-4">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-400">
          <input
            type="checkbox"
            checked={showSkeleton}
            onChange={(e) => onShowSkeletonChange(e.target.checked)}
            className="accent-cyan-400"
          />
          Show joint skeleton
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-400">
          <input
            type="checkbox"
            checked={showGrid}
            onChange={(e) => onShowGridChange(e.target.checked)}
            className="accent-cyan-400"
          />
          Show workspace grid
        </label>
      </div>

      <div className="mt-4 rounded-lg bg-slate-900/60 p-3 font-mono text-xs">
        <div className="text-slate-500">IK Status</div>
        <div className={reached ? 'text-emerald-400' : 'text-amber-400'}>
          {reached ? 'Converged' : `Solving… Δ=${(error * 100).toFixed(1)}cm`}
        </div>
      </div>
    </>
  )
}

export function ControlPanel(props: ControlPanelProps) {
  const { open, onClose, ...contentProps } = props

  return (
    <>
      {/* Desktop: fixed left sidebar */}
      <aside className="glass-panel absolute top-20 left-4 z-20 hidden max-h-[calc(100vh-6rem)] w-80 overflow-y-auto rounded-xl p-5 md:block">
        <PanelContent {...contentProps} />
      </aside>

      {/* Mobile: bottom sheet */}
      {open && (
        <button
          type="button"
          aria-label="Close controls"
          className="mobile-backdrop fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`mobile-sheet glass-panel fixed right-0 bottom-0 left-0 z-40 max-h-[78vh] overflow-y-auto rounded-t-2xl p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:hidden ${
          open ? 'mobile-sheet-open pointer-events-auto' : 'pointer-events-none'
        }`}
        aria-hidden={!open}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="mx-auto h-1 w-10 rounded-full bg-slate-600" aria-hidden />
        </div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-sm font-semibold tracking-[0.15em] text-cyan-300">CONTROLS</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-300"
          >
            Done
          </button>
        </div>
        <PanelContent {...contentProps} />
      </aside>
    </>
  )
}

export { FINGERS, PRESET_TARGETS }
