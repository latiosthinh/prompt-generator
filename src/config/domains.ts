import { Translations } from '@/i18n';

export interface PinnedAttributeOption {
  value: string;
  label: string;
}

export interface PinnedAttributeGroup {
  key: 'aspectRatio' | 'resolution' | 'motion' | 'camera' | 'stylePreset' | 'fps' | 'lighting';
  label: string;
  options: PinnedAttributeOption[];
}

export interface DomainConfig {
  id: string;
  name: string;
  description: string;
  iconName: 'Image' | 'Video' | 'Code' | 'PenTool' | 'Bot' | 'Sparkles';
  examples: string[];
  placeholder: string;
}

export function getDomains(t: Translations): DomainConfig[] {
  return [
    {
      id: 'image-generation',
      name: t.domains.image.name,
      description: t.domains.image.description,
      iconName: 'Image',
      examples: t.domains.image.examples,
      placeholder: t.domains.image.placeholder,
    },
    {
      id: 'video-generation',
      name: t.domains.video.name,
      description: t.domains.video.description,
      iconName: 'Video',
      examples: t.domains.video.examples,
      placeholder: t.domains.video.placeholder,
    },
    {
      id: 'coding-tech',
      name: t.domains.code.name,
      description: t.domains.code.description,
      iconName: 'Code',
      examples: t.domains.code.examples,
      placeholder: t.domains.code.placeholder,
    },
    {
      id: 'creative-writing',
      name: t.domains.writing.name,
      description: t.domains.writing.description,
      iconName: 'PenTool',
      examples: t.domains.writing.examples,
      placeholder: t.domains.writing.placeholder,
    },
    {
      id: 'agents-system',
      name: t.domains.agent.name,
      description: t.domains.agent.description,
      iconName: 'Bot',
      examples: t.domains.agent.examples,
      placeholder: t.domains.agent.placeholder,
    },
    {
      id: 'custom-general',
      name: t.domains.custom.name,
      description: t.domains.custom.description,
      iconName: 'Sparkles',
      examples: t.domains.custom.examples,
      placeholder: t.domains.custom.placeholder,
    },
  ];
}

export function getDomainPinnedAttributes(t: Translations): Record<string, PinnedAttributeGroup[]> {
  return {
    'image-generation': [
      {
        key: 'aspectRatio',
        label: t.pinnedAttributes.aspectRatio,
        options: [
          { value: '1:1', label: '1:1 (Square)' },
          { value: '16:9', label: '16:9 (Landscape)' },
          { value: '9:16', label: '9:16 (Portrait)' },
          { value: '4:3', label: '4:3 (Classic)' },
          { value: '21:9', label: '21:9 (Ultrawide)' },
        ],
      },
      {
        key: 'resolution',
        label: t.pinnedAttributes.resolution,
        options: [
          { value: 'HD', label: 'HD (720p)' },
          { value: 'FullHD', label: 'FullHD (1080p)' },
          { value: '2K', label: '2K (QHD)' },
          { value: '4K', label: '4K (UHD)' },
          { value: '8K', label: '8K Ultra' },
        ],
      },
      {
        key: 'stylePreset',
        label: t.pinnedAttributes.stylePreset,
        options: [
          { value: 'Photorealistic', label: 'Photorealistic' },
          { value: 'Anime', label: 'Anime / Manga' },
          { value: 'Digital Art', label: 'Digital Art' },
          { value: '3D Render', label: '3D Render / Octane' },
          { value: 'Cinematic', label: 'Cinematic Movie' },
        ],
      },
    ],
    'video-generation': [
      {
        key: 'aspectRatio',
        label: t.pinnedAttributes.aspectRatio,
        options: [
          { value: '16:9', label: '16:9 (Widescreen)' },
          { value: '9:16', label: '9:16 (Reels/TikTok)' },
          { value: '1:1', label: '1:1 (Feed)' },
          { value: '2.39:1', label: '2.39:1 (Anamorphic)' },
        ],
      },
      {
        key: 'resolution',
        label: t.pinnedAttributes.resolution,
        options: [
          { value: 'HD', label: 'HD (720p)' },
          { value: 'FullHD', label: 'FullHD (1080p)' },
          { value: '4K', label: '4K (UHD)' },
        ],
      },
      {
        key: 'motion',
        label: t.pinnedAttributes.motion,
        options: [
          { value: 'Subtle', label: 'Subtle / Slow Motion' },
          { value: 'Moderate', label: 'Smooth / Natural' },
          { value: 'Dynamic', label: 'Dynamic / High Action' },
          { value: 'Hyper-speed', label: 'Hyper-lapse / Fast' },
        ],
      },
      {
        key: 'camera',
        label: t.pinnedAttributes.camera,
        options: [
          { value: 'Static', label: 'Static / Fixed' },
          { value: 'Pan/Tilt', label: 'Pan / Tilt' },
          { value: 'Tracking', label: 'Tracking / Follow' },
          { value: 'FPV Drone', label: 'FPV Drone' },
          { value: 'Orbit', label: '360° Orbit' },
        ],
      },
      {
        key: 'fps',
        label: t.pinnedAttributes.fps,
        options: [
          { value: '24fps', label: '24 fps (Cinematic)' },
          { value: '30fps', label: '30 fps (Standard)' },
          { value: '60fps', label: '60 fps (Fluid)' },
        ],
      },
    ],
  };
}

export const DOMAINS = getDomains(require('@/i18n/vi').vi);
