
export type NodeId = string;

export interface Knot {
  id: NodeId;
  x: number;
  y: number;
  vx: number;
  vy: number;
  mass: number;
  charge: number;
  type: 'up' | 'down' | 'electron' | 'fragment';
  pinned?: boolean;
}

export interface StringConnection {
  a: NodeId;
  b: NodeId;
  restLength: number;
  stiffness: number;
}

export interface SimulationState {
  knots: Knot[];
  strings: StringConnection[];
  timeDilation: number;
  entropy: number;
  expansionRate: number;
  totalMass: number;
  totalCharge: number;
  stabilityRatio: number;
}

export interface TheoryTestResult {
  name: string;
  status: 'pending' | 'success' | 'fail';
  value: string;
  description: string;
}

export interface AILog {
  id: string;
  agent: string;
  message: string;
  timestamp: number;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

export interface TelemetryData {
  nasa: any;
  hubble: number;
  ligo: string;
}

export enum AgentName {
  ANALYST = 'IA-Analista',
  THEORIST = 'IA-Teórica',
  GEOMETER = 'IA-Geómetra',
  THERMO = 'IA-Termodinámica',
  COSMOLOGIST = 'IA-Cosmóloga',
  CRITICAL = 'IA-Crítica',
  BRIDGE = 'IA-Puente'
}
