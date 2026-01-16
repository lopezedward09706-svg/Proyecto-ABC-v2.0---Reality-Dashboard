
export const PLANCK_LENGTH = 1.616e-35;
export const FINE_STRUCTURE_CONSTANT_PREDICTED = 1/137.035999;
export const C_SPEED = 299792458;
export const GRAVITY_STRENGTH_BASE = 0.05;
export const FRICTION_BASE = 0.98;
export const STRING_STIFFNESS_BASE = 0.02;

// PARÁMETROS R-QNT OPTIMIZADOS
export const ALPHA_ABC = 1e-4;
export const BETA_ABC = 1e-6;
export const RELATIVITY_CORRECTION = 0.0069;

export const INITIAL_PROTON = {
  up1: { x: 400, y: 300, charge: 2/3, type: 'up' as const },
  up2: { x: 440, y: 340, charge: 2/3, type: 'up' as const },
  down: { x: 380, y: 340, charge: -1/3, type: 'down' as const }
};

export const INITIAL_ELECTRON = {
  x: 550,
  y: 320,
  charge: -1,
  type: 'electron' as const
};
