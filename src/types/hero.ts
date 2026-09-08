export type BookPresetId = 'academic' | 'novel' | 'reference';

export interface BookPresetConfig {
  id: BookPresetId;
  name: string;
  description: string;
  imageSrc: string;
  aspectRatio: string;
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
    pageBlock?: {
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
    aspectRatio: '1041 / 1511',
    container: {
      left: '59.96%',
      top: '14.03%',
      width: '26.93%',
      height: '69.39%',
    },
    spine: {
      left: '13.26%',
      top: '12.97%',
      width: '3.84%',
      height: '74.85%',
      matrix: (s: number) =>
        `matrix3d(0.992056, -0.076923, 0, ${-0.0002037 / s}, 0, 0.992056, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)`,
    },
    previewSpine: {
      left: '13.26%',
      top: '12.97%',
      width: '3.84%',
      height: '74.85%',
      matrix: 'matrix3d(0.992056, -0.076923, 0, -0.001399, 0, 0.992056, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)',
    },
    overlay: {
      left: '17.10%',
      top: '12.97%',
      width: '60.90%',
      height: '74.85%',
      matrix: (s: number) =>
        `matrix3d(0.904800, -0.072784, 0, ${-0.0003472 / s}, 0, 1.0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)`,
    },
    previewOverlay: {
      left: '17.10%',
      top: '12.97%',
      width: '60.90%',
      height: '74.85%',
      matrix: 'matrix3d(0.904800, -0.072784, 0, -0.001013, 0, 1.0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)',
    },
    shadow: {
      contact: {
        left: '64.5%',
        top: '75.0%',
        width: '16.5%',
        height: '2.0%',
        angle: '6.1deg',
      },
      pageBlock: {
        left: '80.8%',
        top: '78.1%',
        width: '3.6%',
        height: '2.2%',
        angle: '-21.8deg',
      },
      diffuse: {
        left: '62.0%',
        top: '74.2%',
        width: '24.0%',
        height: '6.5%',
        angle: '5.5deg',
      },
    },
  },
  novel: {
    id: 'novel',
    name: 'Standard Paperback / Novel',
    description: 'Wider paperback format (~1:1.35 - 1:1.42). Ideal for literature, fiction & exam guides.',
    imageSrc: '/books mockup/Standard-Paperback-Novel.png',
    aspectRatio: '1040 / 1513',
    container: {
      left: '60.44%',
      top: '14.56%',
      width: '27.05%',
      height: '69.93%',
    },
    spine: {
      left: '11.73%',
      top: '12.29%',
      width: '3.56%',
      height: '73.96%',
      matrix: (s: number) =>
        `matrix3d(0.992864, -0.054054, 0, ${-0.0001929 / s}, 0, 0.992864, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)`,
    },
    previewSpine: {
      left: '11.73%',
      top: '12.29%',
      width: '3.56%',
      height: '73.96%',
      matrix: 'matrix3d(0.992864, -0.054054, 0, -0.001327, 0, 0.992864, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)',
    },
    overlay: {
      left: '15.29%',
      top: '12.29%',
      width: '66.92%',
      height: '73.96%',
      matrix: (s: number) =>
        `matrix3d(0.902419, -0.067422, 0, ${-0.0003224 / s}, 0, 1.0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)`,
    },
    previewOverlay: {
      left: '15.29%',
      top: '12.29%',
      width: '66.92%',
      height: '73.96%',
      matrix: 'matrix3d(0.902419, -0.067422, 0, -0.000947, 0, 1.0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)',
    },
    shadow: {
      contact: {
        left: '64.5%',
        top: '75.0%',
        width: '16.5%',
        height: '2.0%',
        angle: '6.0deg',
      },
      pageBlock: {
        left: '81.0%',
        top: '78.2%',
        width: '3.5%',
        height: '2.2%',
        angle: '-22.0deg',
      },
      diffuse: {
        left: '61.8%',
        top: '74.2%',
        width: '24.5%',
        height: '6.5%',
        angle: '5.2deg',
      },
    },
  },
  reference: {
    id: 'reference',
    name: 'Thick Reference / Handbook',
    description: 'Tall & thick handbook format (~1:1.60+). Ideal for manuals, dictionaries & comprehensive guides.',
    imageSrc: '/books mockup/Thick Reference-Handbook.png',
    aspectRatio: '992 / 1586',
    container: {
      left: '59.72%',
      top: '15.30%',
      width: '24.24%',
      height: '68.76%',
    },
    spine: {
      left: '15.32%',
      top: '11.66%',
      width: '3.83%',
      height: '75.47%',
      matrix: (s: number) =>
        `matrix3d(1, -0.105263, 0, ${-0.0002142 / s}, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)`,
    },
    previewSpine: {
      left: '15.32%',
      top: '11.66%',
      width: '3.83%',
      height: '75.47%',
      matrix: 'matrix3d(1, -0.105263, 0, -0.000620, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)',
    },
    overlay: {
      left: '19.15%',
      top: '11.66%',
      width: '58.17%',
      height: '75.47%',
      matrix: (s: number) =>
        `matrix3d(0.905446, -0.091015, 0, ${-0.0004011 / s}, 0, 1.0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)`,
    },
    previewOverlay: {
      left: '19.15%',
      top: '11.66%',
      width: '58.17%',
      height: '75.47%',
      matrix: 'matrix3d(0.905446, -0.091015, 0, -0.001160, 0, 1.0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)',
    },
    shadow: {
      contact: {
        left: '64.5%',
        top: '75.0%',
        width: '16.0%',
        height: '2.0%',
        angle: '6.2deg',
      },
      pageBlock: {
        left: '80.5%',
        top: '78.0%',
        width: '3.5%',
        height: '2.2%',
        angle: '-22.0deg',
      },
      diffuse: {
        left: '62.0%',
        top: '74.2%',
        width: '24.0%',
        height: '6.5%',
        angle: '5.2deg',
      },
    },
  },
};

