import {
  BeamAngleStartEnd,
  BrightnessStartEnd,
  ColorsStartEnd,
  ColorTemperatureStartEnd,
  DistanceStartEnd,
  DurationStartEnd,
  FogOutputStartEnd,
  HorizontalAngleStartEnd,
  ParameterStartEnd,
  RotationAngleStartEnd,
  RotationSpeedStartEnd,
  ShakeSpeedStartEnd,
  SlotNumberStartEnd,
  SoundSensitivityStartEnd,
  SpeedStartEnd,
  SwingAngleStartEnd,
  VerticalAngleStartEnd,
} from './definitions';

/**
 * Most basic Capability Definition
 */
export interface Capability {
  type: string
  /** 2 DMXValues */
  dmxRange?: [number, number]
  comment?: string
  helpWanted?: string
  menuClick?: 'start' | 'end' | 'center' | 'hidden'
  switchChannels?: {
    [key: string]: string
  }
}

/**
 * All Capabilities a single Channel can have.
 */
export type Capabilities =
  NoFunction |
  ShutterStrobe |
  StrobeSpeed |
  StrobeDuration |
  Intensity |
  ColorIntensity |
  ColorPreset |
  ColorTemperature |
  Pan |
  PanContinuous |
  Tilt |
  TiltContinuous |
  PanTiltSpeed |
  WheelSlot |
  WheelShake |
  WheelSlotRotation |
  WheelRotation |
  Effect |
  EffectSpeed |
  EffectDuration |
  EffectParameter |
  SoundSensitivity |
  BeamAngle |
  BeamPosition |
  Focus |
  Zoom |
  Iris |
  IrisEffect |
  Frost |
  FrostEffect |
  Prism |
  PrismRotation |
  BladeInsertion |
  BladeRotation |
  BladeSystemRotation |
  Fog |
  FogOutput |
  FogType |
  Rotation |
  Speed |
  Time |
  Maintenance |
  Generic;

export interface NoFunction extends Capability {
  type: 'NoFunction'
}

export interface ShutterStrobe extends Capability, SpeedStartEnd, DurationStartEnd {
  type: 'ShutterStrobe'
  shutterEffect: ShutterEffect
  soundControlled?: boolean
  randomTiming?: boolean
}

export type ShutterEffect =
  'Open' |
  'Closed' |
  'Strobe' |
  'Pulse' |
  'RampUp' |
  'RampDown' |
  'RampUpDown' |
  'Lightning' |
  'Spikes';

export interface StrobeSpeed extends Capability, SpeedStartEnd {
  type: 'StrobeSpeed'
}

export interface StrobeDuration extends Capability, DurationStartEnd {
  type: 'StrobeDuration'
}

export interface Intensity extends Capability, BrightnessStartEnd {
  type: 'Intensity'
}

export interface ColorIntensity extends Capability, BrightnessStartEnd {
  type: 'ColorIntensity'
  color: Color
}

export type Color =
  'Red' |
  'Green' |
  'Blue' |
  'Cyan' |
  'Magenta' |
  'Yellow' |
  'Amber' |
  'White' |
  'Warm White' |
  'Cold White' |
  'UV' |
  'Lime' |
  'Indigo';

export interface ColorPreset extends Capability, ColorsStartEnd, ColorTemperatureStartEnd {
  type: 'ColorPreset'
}

export interface ColorTemperature extends Capability, ColorTemperatureStartEnd {
  type: 'ColorTemperature'
}

export interface Pan extends Capability, RotationAngleStartEnd {
  type: 'Pan'
}

export interface PanContinuous extends Capability, RotationSpeedStartEnd {
  type: 'PanContinuous'
}

export interface Tilt extends Capability, RotationAngleStartEnd {
  type: 'Tilt'
}

export interface TiltContinuous extends Capability, RotationSpeedStartEnd {
  type: 'TiltContinuous'
}

export interface PanTiltSpeed extends Capability, SpeedStartEnd, DurationStartEnd {
  type: 'PanTiltSpeed'
}

export interface WheelSlot extends Capability, SlotNumberStartEnd {
  type: 'WheelSlot'
}

export interface WheelShake extends
  Capability, SlotNumberStartEnd, ShakeSpeedStartEnd, SwingAngleStartEnd {
  type: 'WheelShake'
}

export interface WheelSlotRotation extends
  Capability, SlotNumberStartEnd, RotationSpeedStartEnd, RotationAngleStartEnd {
  type: 'WheelSlotRotation'
}

export interface WheelRotation extends Capability, RotationSpeedStartEnd, RotationAngleStartEnd {
  type: 'WheelRotation'
  wheel: string | string[]
}

export interface Effect extends
  Capability, SpeedStartEnd, DurationStartEnd, ParameterStartEnd, SoundSensitivityStartEnd {
  type: 'Effect'
  effectName?: string
  effectPreset?: EffectPreset
  soundControlled?: boolean
}

export type EffectPreset =
  'ColorJump' |
  'ColorFade';

export interface EffectSpeed extends Capability, SpeedStartEnd {
  type: 'EffectSpeed'
}

export interface EffectDuration extends Capability, DurationStartEnd {
  type: 'EffectDuration'
}

export interface EffectParameter extends Capability, ParameterStartEnd {
  type: 'EffectParameter'
}

export interface SoundSensitivity extends Capability, SoundSensitivityStartEnd {
  type: 'SoundSensitivity'
}

export interface BeamAngle extends Capability, BeamAngleStartEnd {
  type: 'BeamAngle'
}

export interface BeamPosition extends Capability, HorizontalAngleStartEnd, VerticalAngleStartEnd {
  type: 'BeamPosition'
}

export interface Focus extends Capability, DistanceStartEnd {
  type: 'Focus'
}

export interface Zoom extends Capability, BeamAngleStartEnd {
  type: 'Zoom'
}

/**
 * IrisPercent in percent (%) or ["closed", "open"]
 */
export interface Iris extends Capability {
  type: 'Iris'
  irisPercent?: string
  irisPercentStart?: string
  irisPercentEnd?: string
}

export interface IrisEffect extends Capability, SpeedStartEnd {
  type: 'IrisEffect'
  effectName: string
}

/**
 * FrostIntensity in percent (%)
 */
export interface Frost extends Capability {
  type: 'Frost'
  frostIntensity?: string
  frostIntensityStart?: string
  frostIntensityEnd?: string
}

export interface FrostEffect extends Capability, SpeedStartEnd {
  type: 'FrostEffect'
  effectName: string
}

export interface Prism extends Capability, RotationSpeedStartEnd, RotationAngleStartEnd {
  type: 'Prism'
}

export interface PrismRotation extends Capability, RotationSpeedStartEnd, RotationAngleStartEnd {
  type: 'PrismRotation'
}

/**
 * Insertion in percent (%) or ["out", "in"]
 */
export interface BladeInsertion extends Capability {
  type: 'BladeInsertion'
  blade: Blade | number
  insertion?: string
  insertionStart?: string
  insertionEnd?: string
}

export type Blade =
  'Top' |
  'Right' |
  'Bottom' |
  'Left';

export interface BladeRotation extends Capability, RotationAngleStartEnd {
  type: 'BladeRotation'
  blade: Blade | number
}

export interface BladeSystemRotation extends Capability, RotationAngleStartEnd {
  type: 'BladeSystemRotation'
}

export interface Fog extends Capability, RotationAngleStartEnd, FogOutputStartEnd {
  type: 'Fog'
  fogType?: FogTypes
}

export type FogTypes =
  'Fog' |
  'Haze';

export interface FogOutput extends Capability, FogOutputStartEnd {
  type: 'FogOutput'
}

export interface FogType extends Capability {
  type: 'FogType'
  fogType: FogTypes
}

export interface Rotation extends Capability, RotationSpeedStartEnd, RotationAngleStartEnd {
  type: 'Rotation'
}

export interface Speed extends Capability, SpeedStartEnd {
  type: 'Speed'
}

/**
 * time in seconds (s), milliseconds (ms), percent (%) or ["instant", "short", "long"]
 */
export interface Time extends Capability, SpeedStartEnd {
  type: 'Time'
  time?: string
  timeStart?: string
  timeEnd?: string
}

/**
 * hold in seconds (s), milliseconds (ms), percent (%) or ["instant", "short", "long"]
 */
export interface Maintenance extends Capability, ParameterStartEnd {
  type: 'Maintenance'
  hold?: string
}

export interface Generic extends Capability {
  type: 'Generic'
}
