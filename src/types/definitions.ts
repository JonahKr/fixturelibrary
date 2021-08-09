/**
 * In hertz (Hz), beats per minute (bpm), percent (%) or
 * ["fast", "slow", "stop", "slow reverse", "fast reverse"]
 */
export interface SpeedStartEnd {
  speed?: string
  speedStart?: string
  speedEnd?: string
}

/**
 * In hertz (Hz), rounds per minute (rpm), percent (%) or
 * ["fast CW", "slow CW", "stop", "slow CCW", "fast CCW"]
 */
export interface RotationSpeedStartEnd {
  speed?: string
  speedStart?: string
  speedEnd?: string
}

/**
 * In hertz (Hz), beats per minute (bpm), percent (%) or
 * ["fast", "slow", "stop", "slow reverse", "fast reverse"]
 */
export interface ShakeSpeedStartEnd {
  speed?: string
  speedStart?: string
  speedEnd?: string
}

/**
 * In seconds (s), milliseconds (ms), percent (%) or ["instant", "short", "long"]
 */
export interface DurationStartEnd {
  duration?: string
  durationStart?: string
  durationEnd?: string
}

/**
 * In meters (m), percent (%) or ["near", "far"]
 */
export interface DistanceStartEnd {
  distance?: string
  distanceStart?: string
  distanceEnd?: string
}

/**
 * In lumens (lm), percent (%) or ["off", "dark", "bright"]
 */
export interface BrightnessStartEnd {
  brightness?: string
  brightnessStart?: string
  brightnessEnd?: string
}

/**
 * Color Hex Codes: #foobar
 */
export interface ColorsStartEnd {
  colors?: string[]
  colorsStart?: string[]
  colorsEnd?: string[]
}

/**
 * In kelvin (K), percent (%) or ["warm", "CTO", "default", "cold", "CTB"]
 */
export interface ColorTemperatureStartEnd {
  colorTemperature?: string
  colorTemperatureStart?: string
  colorTemperatureEnd?: string
}

/**
 * In volume per minute (m^3/min), percent (%) or ["off", "weak", "strong"]
 */
export interface FogOutputStartEnd {
  fogOutput?: string
  fogOutputStart?: string
  fogOutputEnd?: string
}

/**
 * In degrees (deg) or percent (%)
 */
export interface RotationAngleStartEnd {
  angle?: string
  angleStart?: string
  angleEnd?: string
}

/**
 * In degrees (deg), percent (%) or ["closed", "narrow", "wide"]
 */
export interface BeamAngleStartEnd {
  angle?: string
  angleStart?: string
  angleEnd?: string
}

/**
 * In degrees (deg), percent (%) or ["left", "center", "right"]
 */
export interface HorizontalAngleStartEnd {
  horizontalAngle?: string
  horizontalAngleStart?: string
  horizontalAngleEnd?: string
}

/**
 * In degrees (deg), percent (%) or ["top", "center", "bottom"]
 */
export interface VerticalAngleStartEnd {
  verticalAngle?: string
  verticalAngleStart?: string
  verticalAngleEnd?: string
}

/**
 * In degrees (deg), percent (%) or ["closed", "narrow", "wide"]
 */
export interface SwingAngleStartEnd {
  shakeAngle?: string
  shakeAngleStart?: string
  shakeAngleEnd?: string
}

/**
 * As number, percent (%) or
 * ["off", "low", "high", "slow", "fast", "small", "big", "instant", "short", "long"]
 */
export interface ParameterStartEnd {
  parameter?: string
  parameterStart?: string
  parameterEnd?: string
}

export interface SlotNumberStartEnd {
  slotNumber?: number
  slotNumberStart?: number
  slotNumberEnd?: number
}

/**
 * In percent (%)
 */
export interface SoundSensitivityStartEnd {
  soundSensitivity?: string
  soundSensitivityStart?: string
  soundSensitivityEnd?: string
}
