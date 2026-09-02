# cloud_agents

Interactive demos deployed to GitHub Pages.

## Live demos

| Demo | URL | Description |
|------|-----|-------------|
| **Landing** | https://tummalag.github.io/cloud_agents/ | Hub for all demos |
| **NeuroReach Hand IK** | https://tummalag.github.io/cloud_agents/hand-ik/ | 3D biomechanical hand with real-time inverse kinematics |
| **Weather Dashboard** | https://tummalag.github.io/cloud_agents/weather/ | Live Dallas weather forecast |

## NeuroReach — Hand IK Simulation

A cyberpunk-styled 3D hand simulation with human-like finger joints (MCP, PIP, DIP). Set a target point via sliders or drag the glowing sphere — the selected finger's end effector reaches it using CCD inverse kinematics.

**Features:**
- 5 articulated fingers with joint limits
- Switchable end effector (thumb through pinky)
- Drag-and-drop 3D target + X/Y/Z coordinate inputs
- Demo pose presets
- Real-time IK convergence feedback

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
