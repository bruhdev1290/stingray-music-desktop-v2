import type { Theme } from './types';

const img = (name: string): string => `/themes/${name}`;
const thumb = (name: string): string => `/themes/thumbnails/${name}`;

export const themes: Theme[] = [
  {
    id: 'classic',
    name: 'Classic',
    thumbnailColor: '#181818'
  },
  {
    id: 'mono',
    name: 'Mono',
    thumbnailColor: '#181818',
    thumbnailImage: thumb('mono.avif'),
    properties: {
      '--font-family': 'ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace',
      '--color-highlight': '#bc2e2e'
    }
  },
  {
    id: 'violet',
    name: 'Violet',
    thumbnailColor: '#31094e',
    properties: {
      '--color-bg': '#31094e',
      '--color-highlight': '#c23de5'
    }
  },
  {
    id: 'oak',
    name: 'Oak',
    thumbnailColor: '#560d25',
    properties: {
      '--color-bg': '#560d25',
      '--color-highlight': '#fd4b67'
    }
  },
  {
    id: 'slate',
    name: 'Slate',
    thumbnailColor: '#29434e',
    properties: {
      '--color-bg': '#29434e',
      '--color-highlight': '#6c8b99'
    }
  },
  {
    id: 'madison',
    name: 'Madison',
    thumbnailColor: '#0e3463',
    properties: {
      '--color-bg': '#0e3463',
      '--color-highlight': '#fbab18'
    }
  },
  {
    id: 'astronaut',
    name: 'Astronaut',
    thumbnailColor: '#2a3074',
    properties: {
      '--color-bg': '#2a3074',
      '--color-highlight': '#7a78dd'
    }
  },
  {
    id: 'chocolate',
    name: 'Chocolate',
    thumbnailColor: '#3f2724',
    properties: {
      '--color-bg': '#3f2724',
      '--color-highlight': '#d96759'
    }
  },
  {
    id: 'laura',
    name: 'Laura',
    thumbnailColor: '#126673',
    properties: {
      '--color-bg': '#126673',
      '--color-highlight': 'rgba(10, 244, 255, .64)'
    }
  },
  {
    id: 'dawn',
    name: 'Before the Dawn',
    thumbnailImage: thumb('dawn.jpg'),
    properties: {
      '--color-highlight': '#ed5135',
      '--bg-image': `url(${img('bg-dawn.jpg')})`,
      '--color-bg': '#1e2747',
      '--bg-position': 'center bottom'
    }
  },
  {
    id: 'rose-petals',
    name: '…Has Its Thorns',
    thumbnailColor: '#7d083b',
    thumbnailImage: img('bg-rose-petals.svg'),
    properties: {
      '--color-bg': '#7d083b',
      '--bg-image': `url(${img('bg-rose-petals.svg')})`
    }
  },
  {
    id: 'purple-waves',
    name: 'Fortune Waves',
    thumbnailColor: '#44115c',
    thumbnailImage: img('bg-purple-waves.svg'),
    properties: {
      '--color-bg': '#44115c',
      '--bg-image': `url(${img('bg-purple-waves.svg')})`
    }
  },
  {
    id: 'pop-culture',
    name: 'Pop Culture',
    thumbnailColor: '#ad0937',
    thumbnailImage: thumb('pop-culture.jpg'),
    properties: {
      '--color-bg': '#ad0937',
      '--color-highlight': 'rgba(234, 208, 110, .9)',
      '--bg-image': `url(${img('bg-pop-culture.jpg')})`
    }
  },
  {
    id: 'jungle',
    name: 'To the Jungle',
    thumbnailColor: '#0f0f03',
    thumbnailImage: thumb('jungle.jpg'),
    properties: {
      '--color-bg': '#0f0f03',
      '--color-highlight': '#4f9345',
      '--bg-image': `url(${img('bg-jungle.jpg')})`
    }
  },
  {
    id: 'mountains',
    name: 'Rocky Mountain High',
    thumbnailColor: '#0e2656',
    thumbnailImage: thumb('mountains.jpg'),
    properties: {
      '--color-bg': '#0e2656',
      '--color-highlight': '#6488c3',
      '--bg-image': `url(${img('bg-mountains.jpg')})`
    }
  },
  {
    id: 'pines',
    name: 'In the Pines',
    thumbnailColor: '#06090c',
    thumbnailImage: thumb('pines.jpg'),
    properties: {
      '--color-bg': '#06090c',
      '--color-highlight': '#5984b9',
      '--bg-image': `url(${img('bg-pines.jpg')})`
    }
  },
  {
    id: 'nemo',
    name: 'Nemo',
    thumbnailColor: '#031724',
    thumbnailImage: thumb('nemo.jpg'),
    properties: {
      '--color-bg': '#031724',
      '--color-highlight': '#2896b8',
      '--bg-image': `url(${img('bg-nemo.jpg')})`
    }
  },
  {
    id: 'cat',
    name: "What's New Pussycat?",
    thumbnailColor: '#000',
    thumbnailImage: thumb('cat.jpg'),
    properties: {
      '--color-bg': '#000',
      '--color-highlight': '#d26c37',
      '--bg-image': `url(${img('bg-cat.jpg')})`,
      '--bg-position': 'left'
    }
  }
];
