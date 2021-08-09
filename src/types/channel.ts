import { Capabilities } from './capability';

/**
 * Definition of a single DMX channel.
 */
export interface Channel {
  name: string
  fineChannelAliases?: string[]
  dmxValueResolution?: DmxValueResolution
  /** number: DMXValue (255/65535 if fine) string: DMXValue percent */
  defaultValue?: number | string
  /** number: DMXValue (255/65535 if fine) string: DMXValue percent */
  highlightValue?: number | string
  constant?: boolean
  precedence?: ChannelPresedence
  capability?: Capabilities
  capabilities?: Capabilities[]
}

/**
 * Resolution of the fine channel
 */
export type DmxValueResolution =
  '8bit' |
  '16bit' |
  '24bit';

/**
 * Either Highest takes precedence (HTP) or Latest (change) takes precedence (LTP).
 */
export type ChannelPresedence =
  'HTP' |
  'LTP';
