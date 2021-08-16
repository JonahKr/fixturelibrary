/**
 * Single Slot in a Gobo wheel.
 * Types: Open, Closed, Color, Gobo, Prism, Iris, Frost,
 * AnimationGoboStart, AnimationGoboStop
 */
export type GoboWheelSlot = {
  type: 'Open'
} | {
  type: 'Closed'
} | {
  type: 'Color'
  name?: string
  /** hexcolorArray */
  colors?: string[]
  /** Kelvin, Percent or ["warm", "CTO", "default", "cold", "CTB"] */
  colorTemperature?: string
} | {
  type: 'Gobo'
  /** goboResourceString */
  resource?: string
} | {
  type: 'Prism'
  name?: string
  facets?: number
} | {
  type: 'Iris'
  /** Percent or ["closed", "open"] */
  openPercent: string
} | {
  type: 'Frost'
  /** Percent */
  frostIntensity?: string
} | {
  type: 'AnimationGoboStart'
  name?: string
} | {
  type: 'AnimationGoboEnd'
};
