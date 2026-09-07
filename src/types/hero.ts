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
  spine: {
    left: string;
    top: string;
    width: string;
    height: string;
    matrix: (bookScale: number) => string;
  };
  previewSpine: {
    left: string;
    top: string;
    width: string;
    height: string;
    matrix: string;
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
    spine: {
      left: '13.26%',
      top: '12.91%',
      width: '3.75%',
      height: '74.98%',
      matrix: () => 'none',
    },
    previewSpine: {
      left: '13.26%',
      top: '12.91%',
      width: '3.75%',
      height: '74.98%',
      matrix: 'none',
    },
    overlay: {
      left: '17.00%',
      top: '9.53%',
      width: '61.38%',
      height: '82.86%',
      matrix: (s: number) =>
        `matrix3d(0.907348, -0.075117, 0, ${-0.0003352 / s}, 0, 0.907348, 0, 0, 0, 0, 1, 0, 0, ${20.76 * s}, 0, 1)`,
    },
    previewOverlay: {
      left: '17.00%',
      top: '9.53%',
      width: '61.38%',
      height: '82.86%',
      matrix: 'matrix3d(0.907348, -0.075117, 0, -0.000978, 0, 0.907348, 0, 0, 0, 0, 1, 0, 0, 7.12, 0, 1)',
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
    spine: {
      left: '11.54%',
      top: '12.23%',
      width: '3.75%',
      height: '74.09%',
      matrix: () => 'none',
    },
    previewSpine: {
      left: '11.54%',
      top: '12.23%',
      width: '3.75%',
      height: '74.09%',
      matrix: 'none',
    },
    overlay: {
      left: '15.29%',
      top: '8.66%',
      width: '68.08%',
      height: '82.29%',
      matrix: (s: number) =>
        `matrix3d(0.902811, -0.072034, 0, ${-0.0003157 / s}, 0, 0.902811, 0, 0, 0, 0, 1, 0, 0, ${22.18 * s}, 0, 1)`,
    },
    previewOverlay: {
      left: '15.29%',
      top: '8.66%',
      width: '68.08%',
      height: '82.29%',
      matrix: 'matrix3d(0.902811, -0.072034, 0, -0.000927, 0, 0.902811, 0, 0, 0, 0, 1, 0, 0, 7.55, 0, 1)',
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
    spine: {
      left: '15.32%',
      top: '11.35%',
      width: '3.83%',
      height: '75.85%',
      matrix: (s: number) =>
        `matrix3d(1, -0.105263, 0, ${-0.0002142 / s}, 0, 1, 0, 0, 0, 0, 1, 0, 0, ${1.63 * s}, 0, 1)`,
    },
    previewSpine: {
      left: '15.32%',
      top: '11.35%',
      width: '3.83%',
      height: '75.85%',
      matrix: 'matrix3d(1, -0.105263, 0, -0.000620, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0.56, 0, 1)',
    },
    overlay: {
      left: '19.15%',
      top: '7.82%',
      width: '58.17%',
      height: '83.61%',
      matrix: (s: number) =>
        `matrix3d(0.907240, -0.097054, 0, ${-0.0003935 / s}, 0, 0.907240, 0, 0, 0, 0, 1, 0, 0, ${22.88 * s}, 0, 1)`,
    },
    previewOverlay: {
      left: '19.15%',
      top: '7.82%',
      width: '58.17%',
      height: '83.61%',
      matrix: 'matrix3d(0.907240, -0.097054, 0, -0.001138, 0, 0.907240, 0, 0, 0, 0, 1, 0, 0, 7.91, 0, 1)',
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
