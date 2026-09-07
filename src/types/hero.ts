export type BookPresetId = 'academic' | 'novel' | 'reference';

export interface BookPresetConfig {
  id: BookPresetId;
  name: string;
  description: string;
  imageSrc: string;
  container: {
    left: string;
    top: string;
    width: string;
    height: string;
  };
  overlay: {
    left: string;
    top: string;
    width: string;
    height: string;
    matrix: (bookScale: number) => string;
  };
  previewOverlay: {
    left: string;
    top: string;
    width: string;
    height: string;
    matrix: string;
  };
  shadow: {
    contact: {
      left: string;
      top: string;
      width: string;
      height: string;
      angle: string;
    };
    diffuse: {
      left: string;
      top: string;
      width: string;
      height: string;
      angle: string;
    };
  };
}

export const BOOK_PRESETS: Record<BookPresetId, BookPresetConfig> = {
  academic: {
    id: 'academic',
    name: 'Academic / College Textbook',
    description: 'Standard textbook format (~1:1.45). Ideal for engineering, medical & college books.',
    imageSrc: '/books mockup/Academic-College-Textbook.png',
    container: {
      left: '59.96%',
      top: '14.03%',
      width: '26.93%',
      height: '69.39%',
    },
    overlay: {
      left: '17.00%',
      top: '9.66%',
      width: '61.19%',
      height: '82.66%',
      matrix: (s: number) =>
        `matrix3d(0.907126, -0.076923, 0, ${-0.0003371 / s}, 0, 0.907126, 0, 0, 0, 0, 1, 0, 0, ${21.19 * s}, 0, 1)`,
    },
    previewOverlay: {
      left: '17.00%',
      top: '9.66%',
      width: '61.19%',
      height: '82.66%',
      matrix: 'matrix3d(0.907126, -0.076923, 0, -0.000984, 0, 0.907126, 0, 0, 0, 0, 1, 0, 0, 7.26, 0, 1)',
    },
    shadow: {
      contact: {
        left: '63.0%',
        top: '74.8%',
        width: '21.5%',
        height: '1.8%',
        angle: '4.9deg',
      },
      diffuse: {
        left: '61.0%',
        top: '74.0%',
        width: '26.0%',
        height: '5.0%',
        angle: '4.9deg',
      },
    },
  },
  novel: {
    id: 'novel',
    name: 'Standard Paperback / Novel',
    description: 'Wider paperback format (~1:1.35 - 1:1.42). Ideal for literature, fiction & exam guides.',
    imageSrc: '/books mockup/Standard-Paperback-Novel.png',
    container: {
      left: '60.44%',
      top: '14.56%',
      width: '27.05%',
      height: '69.93%',
    },
    overlay: {
      left: '15.29%',
      top: '8.79%',
      width: '67.88%',
      height: '82.09%',
      matrix: (s: number) =>
        `matrix3d(0.902576, -0.073654, 0, ${-0.0003173 / s}, 0, 0.902576, 0, 0, 0, 0, 1, 0, 0, ${22.61 * s}, 0, 1)`,
    },
    previewOverlay: {
      left: '15.29%',
      top: '8.79%',
      width: '67.88%',
      height: '82.09%',
      matrix: 'matrix3d(0.902576, -0.073654, 0, -0.000932, 0, 0.902576, 0, 0, 0, 0, 1, 0, 0, 7.70, 0, 1)',
    },
    shadow: {
      contact: {
        left: '62.8%',
        top: '74.8%',
        width: '22.0%',
        height: '1.8%',
        angle: '4.8deg',
      },
      diffuse: {
        left: '60.8%',
        top: '74.0%',
        width: '26.5%',
        height: '5.0%',
        angle: '4.8deg',
      },
    },
  },
  reference: {
    id: 'reference',
    name: 'Thick Reference / Handbook',
    description: 'Tall & thick handbook format (~1:1.60+). Ideal for manuals, dictionaries & comprehensive guides.',
    imageSrc: '/books mockup/Thick Reference-Handbook.png',
    container: {
      left: '59.72%',
      top: '15.30%',
      width: '24.24%',
      height: '68.76%',
    },
    overlay: {
      left: '19.15%',
      top: '7.94%',
      width: '57.96%',
      height: '83.42%',
      matrix: (s: number) =>
        `matrix3d(0.906274, -0.100870, 0, ${-0.0003990 / s}, 0, 0.906274, 0, 0, 0, 0, 1, 0, 0, ${23.70 * s}, 0, 1)`,
    },
    previewOverlay: {
      left: '19.15%',
      top: '7.94%',
      width: '57.96%',
      height: '83.42%',
      matrix: 'matrix3d(0.906274, -0.100870, 0, -0.001154, 0, 0.906274, 0, 0, 0, 0, 1, 0, 0, 8.19, 0, 1)',
    },
    shadow: {
      contact: {
        left: '63.2%',
        top: '74.8%',
        width: '21.5%',
        height: '1.8%',
        angle: '5.0deg',
      },
      diffuse: {
        left: '61.0%',
        top: '74.0%',
        width: '26.0%',
        height: '5.2%',
        angle: '5.0deg',
      },
    },
  },
};
