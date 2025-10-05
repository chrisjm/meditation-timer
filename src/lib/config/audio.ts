import type { Segment } from '$lib/components/audio/TimeSlider.svelte';

export const AUDIO_CONFIG = {
  hlsUrl:
    'https://wanderingleafstudios.s3.us-west-1.amazonaws.com/audio/meditation-opus/meditation-opus.m3u8',

  segments: [
    {
      color: '#FF0000',
      length: 540,
      description: '174 Hz - Comfort & Security'
    },
    {
      color: '#FF4500',
      length: 540,
      description: '285 Hz - Healing & Rejuvenation'
    },
    {
      color: '#FFA500',
      length: 540,
      description: '396 Hz - Liberating Guilt & Fear'
    },
    {
      color: '#FFD700',
      length: 540,
      description: '417 Hz - Undoing Situations & Facilitating Change'
    },
    {
      color: '#32CD32',
      length: 540,
      description: '528 Hz - Transformation & Positivity (DNA Repair)'
    },
    {
      color: '#4169E1',
      length: 540,
      description: '639 Hz - Connecting & Relationships'
    },
    {
      color: '#4B0082',
      length: 540,
      description: '741 Hz - Detox'
    },
    {
      color: '#8A2BE2',
      length: 540,
      description: '852 Hz – Raise Energy'
    },
    {
      color: '#9932CC',
      length: 540,
      description: '963 Hz – Intuitive Awakening'
    }
  ] as Segment[],

  defaultVolumes: {
    startStopBell: 0.7,
    intervalBell: 0.7,
    backgroundMusic: 0.7
  }
} as const;
