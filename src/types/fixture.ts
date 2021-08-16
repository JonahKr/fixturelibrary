import { Channel } from './channel';
import { GoboWheelSlot } from './wheelslot';

/**
 * Definition of a DMX fixture following the OFL schema
 */
export interface Fixture{
  /** unique in manufacturer */
  name: string
  /** unique globally */
  shortName?: string
  /** most important category first */
  categories: FixtureCategory[]
  meta: {
    authors: string[]
    /** isoDateString */
    createDate: string
    /** isoDateString */
    lastModifyDate: string
    importPlugin?: {
      plugin: string
      /** isoDateString */
      date: string
      comment?:string
    }
  }
  comment?: string
  links?: {
    /** urlArray */
    manual: string[]
    /** urlArray */
    productPage: string[]
    /** urlArray */
    video: string[]
    /** urlArray */
    other: string[]
  }
  helpWanted?: string
  rdm?: {
    /** between 0 and 65535 */
    modelId: number
    softwareVersion?: string
  }
  physical?: Physical
  // TODO: Matrix Type
  matrix?: any
  wheels?: {
    [key: string]: {
      direction?: WheelDirection
      slots: GoboWheelSlot[]
    }
  }
  availableChannels?: {
    [key: string]: Channel
  }
  templateChannels?: {
    /** variablePixelKeyString */
    [key: string]: string
  }
  modes: {
    name: string
    shortName?: string
    rdmPersonalityIndex?: number
    physical?: Physical
    channels: (null | string | ChannelMode)[]
  }[]
}

/**
 * All different Categories a fixture can be assigned to
 */
export type FixtureCategory =
  'BarrelScanner' |
  'Blinder' |
  'Color Changer' |
  'Dimmer' |
  'Effect' |
  'Fan' |
  'Flower' |
  'Hazer' |
  'Laser' |
  'Matrix' |
  'Moving Head' |
  'Pixel Bar' |
  'Scanner' |
  'Smoke' |
  'Stand' |
  'Strobe' |
  'Other';

/**
 * Physical information about the fixture.
 */
export interface Physical{
  /** XYZ-Dimensions */
  dimensions?: [number, number, number]
  /** In kg */
  weight?: number
  /** In W */
  power?: number
  DMXconnector?: DMXconnector
  bulb?: {
    type?: string
    /** In Kelvin */
    colorTemperature: number
    /** In Lumens */
    lumens: number
  }
  lens?: {
    name: string
    /** Both 0 to 360 in Degrees */
    degreesMinMax: [number, number]
  }
  matrixPixels?: {
    /** XYZ-Dimensions */
    dimensions?: [number, number, number]
    /** XYZ-Spacing */
    spacing?: [number, number, number]
  }
}

/**
 * All possible DMX connector plugs
 */
export type DMXconnector =
  '3-pin' |
  '3-pin (swapped +/-)' |
  '3-pin XLR IP65' |
  '5-pin' |
  '5-pin XLR IP65' |
  '3-pin and 5-pin' |
  '3.5mm stereo jack';

export type ChannelMode = {} | {
  insert: 'matrixChannels'
  repeatFor: MatrixRepeats | string[]
  channelOrder: ChannelOrder
  templateChannels: (string | null)[]

};

export type MatrixRepeats =
  'eachPixelABC' |
  'eachPixelXYZ' |
  'eachPixelXZY' |
  'eachPixelYXZ' |
  'eachPixelYZX' |
  'eachPixelZXY' |
  'eachPixelZYX' |
  'eachPixelGroup';

export type ChannelOrder =
  'perPixel' |
  'perChannel';

/**
 * Either clockwise (CW) or counter clockwise (CCW)
 */
export type WheelDirection =
  'CW' |
  'CCW';
