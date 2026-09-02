# cloud_agents

Interactive demos deployed to GitHub Pages.

## Live demos

| Demo | URL | Description |
|------|-----|-------------|
| **Landing** | https://tummalag.github.io/cloud_agents/ | Hub for all demos |
| **NeuroReach Hand IK** | https://tummalag.github.io/cloud_agents/hand-ik/ | 3D biomechanical hand with real-time inverse kinematics |
| **Weather Dashboard** | https://tummalag.github.io/cloud_agents/weather/ | Live Dallas weather forecast |

## NeuroReach — Dual Arm IK Simulation

A cyberpunk-styled 3D dual-arm robot with full kinematic chains: **Shoulder → Elbow → Wrist → End Effector**. Touch the left half of the screen and the left arm reaches; touch the right half and the right arm reaches — independently, in real time using FABRIK inverse kinematics.

**Features:**
- Two full arms with shoulder, elbow, wrist, and hand end effector
- Touch-left / touch-right screen zones control each arm independently
- FABRIK IK solver with natural elbow bending
- Real-time reach feedback per arm

### Local development

```bash
cd hand-ik-sim
npm install
npm run dev
# → http://localhost:5174/cloud_agents/hand-ik/
```

### Build all demos for Pages

```bash
bash scripts/build-pages.sh
# Output: dist-pages/
```
