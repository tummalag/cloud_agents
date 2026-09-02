import { useEffect, useState } from 'react'

const STORAGE_KEY = 'neuroreach-dual-arm-guide'

const STEPS = [
  {
    title: 'Two full robot arms',
    body: 'You control TWO arms — each with Shoulder, Elbow, Wrist, and Hand (end effector). The dark block in the center is the torso.',
    visual: '🦾🦾',
  },
  {
    title: 'Left half = left arm',
    body: 'Touch or tap anywhere on the LEFT side of the screen. The cyan left arm will reach that point using inverse kinematics.',
    visual: '👈',
  },
  {
    title: 'Right half = right arm',
    body: 'Touch or tap anywhere on the RIGHT side of the screen. The pink right arm reaches that point independently.',
    visual: '👉',
  },
  {
    title: 'Drag to track',
    body: 'Hold and drag on either half to move the target in 3D. The arm follows in real time. Green target = locked on!',
    visual: '🎯',
  },
]

const MANUAL_SECTIONS = [
  {
    title: 'Arm anatomy',
    items: [
      'Shoulder — base joint on the torso',
      'Elbow — bends the upper/lower arm',
      'Wrist — rotates the hand',
      'End Effector — the hand tip that tries to touch the target',
    ],
  },
  {
    title: 'How to control',
    items: [
      'Left screen half → cyan LEFT arm reaches your touch point',
      'Right screen half → pink RIGHT arm reaches your touch point',
      'Drag while holding to move the target continuously',
      'Both arms work independently at the same time',
    ],
  },
  {
    title: 'Status indicators',
    items: [
      'L / R badges show each arm\'s distance to target (cm)',
      '● LOCKED = end effector reached the target',
      'Cyan sphere = left target · Pink sphere = right target',
      'Dashed line = arm is still reaching',
    ],
  },
  {
    title: 'Smooth human-like motion',
    items: [
      'Arms no longer snap instantly — each joint moves smoothly',
      'Elbow leads, then wrist, then hand (proximal → distal)',
      'Joints glow brighter while actuators are moving',
      'Motion eases out naturally as the arm approaches the target',
    ],
  },
  {
    title: '3D camera — full 360°',
    items: [
      'Mobile: 2 fingers to orbit and pinch-zoom around the robot',
      'Desktop: right-click drag to orbit · scroll wheel to zoom',
      'Use + / − buttons (top-right) to zoom in on the hands',
      '⟲ button resets the camera to the default view',
      'Orbit fully around the bot in all directions',
    ],
  },
]

interface HelpGuideProps {
  forceOpen?: boolean
  onForceClose?: () => void
}

export function HelpGuide({ forceOpen, onForceClose }: HelpGuideProps) {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showManual, setShowManual] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (forceOpen) {
      setShowManual(true)
      return
    }
    if (!localStorage.getItem(STORAGE_KEY)) setShowOnboarding(true)
  }, [forceOpen])

  const finishOnboarding = () => {
    localStorage.setItem(STORAGE_KEY, '1')
    setShowOnboarding(false)
    setStep(0)
  }

  const closeManual = () => {
    setShowManual(false)
    onForceClose?.()
  }

  if (showOnboarding) {
    const current = STEPS[step]
    const isLast = step === STEPS.length - 1

    return (
      <div className="guide-overlay fixed inset-0 z-50 flex items-end justify-center p-4 md:items-center">
        <div className="guide-card glass-panel w-full max-w-md rounded-2xl p-6">
          <div className="mb-4 text-center text-5xl">{current.visual}</div>
          <div className="mb-1 text-center text-xs font-semibold tracking-widest text-cyan-500">
            STEP {step + 1} OF {STEPS.length}
          </div>
          <h2 className="font-display mb-3 text-center text-xl font-bold text-cyan-200">{current.title}</h2>
          <p className="mb-6 text-center text-base leading-relaxed text-slate-300">{current.body}</p>
          <div className="mb-5 flex justify-center gap-1.5">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-cyan-400' : 'w-1.5 bg-slate-600'}`} />
            ))}
          </div>
          <div className="flex gap-2">
            {step > 0 && (
              <button type="button" onClick={() => setStep((s) => s - 1)} className="flex-1 rounded-xl border border-slate-600 py-3 text-sm font-semibold text-slate-300">
                Back
              </button>
            )}
            <button
              type="button"
              onClick={() => (isLast ? finishOnboarding() : setStep((s) => s + 1))}
              className="flex-1 rounded-xl border border-cyan-400/50 bg-cyan-950 py-3 text-sm font-bold text-cyan-300"
            >
              {isLast ? "Let's go!" : 'Next'}
            </button>
          </div>
          <button type="button" onClick={finishOnboarding} className="mt-3 w-full py-2 text-xs text-slate-500">
            Skip tutorial
          </button>
        </div>
      </div>
    )
  }

  if (showManual) {
    return (
      <div className="guide-overlay fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-4">
        <button type="button" aria-label="Close" className="absolute inset-0 bg-black/60" onClick={closeManual} />
        <div className="guide-card glass-panel relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-2xl p-6 md:rounded-2xl">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-cyan-300">Operating Manual</h2>
            <button type="button" onClick={closeManual} className="rounded-lg border border-slate-600 px-3 py-1 text-sm text-slate-400">
              Close
            </button>
          </div>
          {MANUAL_SECTIONS.map((section) => (
            <div key={section.title} className="mb-5">
              <h3 className="mb-2 text-sm font-bold tracking-wide text-cyan-400">{section.title}</h3>
              <ul className="space-y-1.5">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-2 text-sm leading-relaxed text-slate-300">
                    <span className="text-cyan-600">›</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem(STORAGE_KEY)
              closeManual()
              setShowOnboarding(true)
            }}
            className="mt-2 w-full rounded-xl border border-slate-700 py-2.5 text-xs text-slate-500"
          >
            Replay tutorial
          </button>
        </div>
      </div>
    )
  }

  return null
}

export function HelpButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open help"
      className="help-btn pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-cyan-400/30 bg-slate-950/80 text-lg font-bold text-cyan-300 backdrop-blur-md"
    >
      ?
    </button>
  )
}
