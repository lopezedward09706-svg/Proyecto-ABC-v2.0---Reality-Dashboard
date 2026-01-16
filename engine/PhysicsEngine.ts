
import { Knot, StringConnection, SimulationState, NodeId } from '../types';
import { 
  GRAVITY_STRENGTH_BASE, 
  FRICTION_BASE, 
  STRING_STIFFNESS_BASE, 
  ALPHA_ABC, 
  BETA_ABC, 
  RELATIVITY_CORRECTION 
} from '../constants';

export class PhysicsEngine {
  private state: SimulationState;
  public vibrationProfiles = { a: 0.8, b: 0.5, c: 0.3 };

  constructor(initialState: SimulationState) {
    this.state = initialState;
  }

  public update(dt: number, mousePos: {x: number, y: number} | null, draggedId: NodeId | null) {
    const { knots, strings, timeDilation } = this.state;
    const effectiveDt = dt * (1 / (timeDilation * (1 + RELATIVITY_CORRECTION)));
    
    // Mapeo de perfiles R-QNT a físicas
    const currentGravity = GRAVITY_STRENGTH_BASE * (this.vibrationProfiles.a * 2);
    const currentFriction = Math.min(0.99, FRICTION_BASE * (0.9 + this.vibrationProfiles.b * 0.1));
    const kineticBoost = this.vibrationProfiles.c * 5;

    for (const knot of knots) {
      if (knot.id === draggedId && mousePos) {
        knot.x = mousePos.x;
        knot.y = mousePos.y;
        knot.vx = 0;
        knot.vy = 0;
        continue;
      }

      if (knot.pinned) continue;

      const dx = 400 - knot.x;
      const dy = 300 - knot.y;
      const dist = Math.sqrt(dx*dx + dy*dy) || 1;
      
      const curvatureCorrection = ALPHA_ABC * dist * Math.log(dist + 1e-10) * this.vibrationProfiles.a;
      knot.vx += (dx / dist) * (currentGravity + curvatureCorrection) * effectiveDt;
      knot.vy += (dy / dist) * (currentGravity + curvatureCorrection) * effectiveDt;

      if (knot.type === 'electron') {
        const angle = Math.atan2(knot.y - 300, knot.x - 400);
        knot.vx += Math.cos(angle + Math.PI/2) * (2.5 + kineticBoost);
        knot.vy += Math.sin(angle + Math.PI/2) * (2.5 + kineticBoost);
      }

      knot.x += knot.vx * effectiveDt;
      knot.y += knot.vy * effectiveDt;
      knot.vx *= currentFriction;
      knot.vy *= currentFriction;
    }

    for (let i = 0; i < 5; i++) {
      for (const str of strings) {
        const knotA = knots.find(k => k.id === str.a);
        const knotB = knots.find(k => k.id === str.b);
        if (!knotA || !knotB) continue;

        const dx = knotB.x - knotA.x;
        const dy = knotB.y - knotA.y;
        const currentLen = Math.sqrt(dx*dx + dy*dy) || 1;
        
        const betaCorrection = 1 + BETA_ABC * (currentLen ** 2) * this.vibrationProfiles.c;
        const diff = (currentLen - str.restLength) / currentLen;
        
        const stiffness = STRING_STIFFNESS_BASE * (0.5 + this.vibrationProfiles.b);
        const offsetX = dx * 0.5 * diff * stiffness * betaCorrection;
        const offsetY = dy * 0.5 * diff * stiffness * betaCorrection;

        if (!knotA.pinned && knotA.id !== draggedId) {
          knotA.x += offsetX;
          knotA.y += offsetY;
        }
        if (!knotB.pinned && knotB.id !== draggedId) {
          knotB.x -= offsetX;
          knotB.y -= offsetY;
        }
      }
    }

    this.calculateMetrics();
    return this.state;
  }

  private calculateMetrics() {
    let totalMass = 0;
    let totalCharge = 0;
    let entropy = 0;
    let avgTension = 0;

    for (const k of this.state.knots) {
      totalMass += k.mass;
      totalCharge += k.charge;
      entropy += Math.abs(k.vx) + Math.abs(k.vy);
    }

    for (const s of this.state.strings) {
      const knotA = this.state.knots.find(k => k.id === s.a);
      const knotB = this.state.knots.find(k => k.id === s.b);
      if (knotA && knotB) {
        const dist = Math.sqrt((knotA.x-knotB.x)**2 + (knotA.y-knotB.y)**2);
        avgTension += Math.abs(dist - s.restLength);
      }
    }

    this.state.totalMass = totalMass;
    this.state.totalCharge = totalCharge;
    this.state.entropy = entropy * 0.01;
    this.state.expansionRate = 70.4 * (1 + avgTension * 0.001);
    this.state.timeDilation = 1 + (avgTension * 0.005) + (ALPHA_ABC * 10);
    this.state.stabilityRatio = Math.max(0, 1 - (avgTension * 0.02));
  }

  public getState() { return this.state; }
}
