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
    pageBlockCast?: {
      left: string;
      top: string;
      width: string;
      height: string;
      angle?: string;
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
      top: '15.20%',
      width: '26.93%',
      height: '69.39%',
    },
    spine: {
      left: '12.87%',
      top: '12.84%',
      width: '4.13%',
      height: '75.18%',
      matrix: (s: number) =>
        `matrix3d(0.997359, 0, 0, ${-0.0001420 / s}, 0, 1.0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)`,
    },
    previewSpine: {
      left: '12.87%',
      top: '12.84%',
      width: '4.13%',
      height: '75.18%',
      matrix: 'matrix3d(0.997359, 0, 0, -0.000414, 0, 1.0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)',
    },
    overlay: {
      left: '16.91%',
      top: '12.84%',
      width: '61.29%',
      height: '75.18%',
      matrix: (s: number) =>
        `matrix3d(0.905179, -0.072358, 0, ${-0.0003436 / s}, 0, 1.0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)`,
    },
    previewOverlay: {
      left: '16.91%',
      top: '12.84%',
      width: '61.29%',
      height: '75.18%',
      matrix: 'matrix3d(0.905179, -0.072358, 0, -0.001003, 0, 1.0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)',
    },
    shadow: {
      diffuse: {
        left: '61.5%',
        top: '72.0%',
        width: '24.5%',
        height: '9.0%',
        angle: '14.0deg',
      },
      contact: {
        left: '63.4%',
        top: '70.3%',
        width: '18.0%',
        height: '2.0%',
        angle: '16.0deg',
      },
      pageBlock: {
        left: '80.8%',
        top: '79.2%',
        width: '3.4%',
        height: '1.8%',
        angle: '-22.5deg',
      },
      pageBlockCast: {
        left: '80.5%',
        top: '77.0%',
        width: '4.8%',
        height: '3.8%',
        angle: '14.0deg',
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
      top: '15.70%',
      width: '27.05%',
      height: '69.93%',
    },
    spine: {
      left: '11.15%',
      top: '12.16%',
      width: '4.04%',
      height: '74.29%',
      matrix: (s: number) =>
        `matrix3d(0.998221, 0, 0, ${-0.0000974 / s}, 0, 1.0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)`,
    },
    previewSpine: {
      left: '11.15%',
      top: '12.16%',
      width: '4.04%',
      height: '74.29%',
      matrix: 'matrix3d(0.998221, 0, 0, -0.000286, 0, 1.0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)',
    },
    overlay: {
      left: '15.10%',
      top: '12.16%',
      width: '67.31%',
      height: '74.29%',
      matrix: (s: number) =>
        `matrix3d(0.902811, -0.067066, 0, ${-0.0003193 / s}, 0, 1.0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)`,
    },
    previewOverlay: {
      left: '15.10%',
      top: '12.16%',
      width: '67.31%',
      height: '74.29%',
      matrix: 'matrix3d(0.902811, -0.067066, 0, -0.000938, 0, 1.0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)',
    },
    shadow: {
      diffuse: {
        left: '61.5%',
        top: '72.5%',
        width: '25.0%',
        height: '8.5%',
        angle: '12.5deg',
      },
      contact: {
        left: '63.5%',
        top: '71.2%',
        width: '19.8%',
        height: '2.0%',
        angle: '13.2deg',
      },
      pageBlock: {
        left: '82.9%',
        top: '79.2%',
        width: '2.8%',
        height: '1.8%',
        angle: '-20.4deg',
      },
      pageBlockCast: {
        left: '82.5%',
        top: '77.2%',
        width: '4.5%',
        height: '3.6%',
        angle: '13.0deg',
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
      top: '16.20%',
      width: '24.24%',
      height: '68.76%',
    },
    spine: {
      left: '14.92%',
      top: '11.54%',
      width: '4.13%',
      height: '75.79%',
      matrix: (s: number) =>
        `matrix3d(0.998336, 0, 0, ${-0.0000993 / s}, 0, 1.0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)`,
    },
    previewSpine: {
      left: '14.92%',
      top: '11.54%',
      width: '4.13%',
      height: '75.79%',
      matrix: 'matrix3d(0.998336, 0, 0, -0.000287, 0, 1.0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)',
    },
    overlay: {
      left: '18.95%',
      top: '11.54%',
      width: '58.57%',
      height: '75.79%',
      matrix: (s: number) =>
        `matrix3d(0.905803, -0.090424, 0, ${-0.0003968 / s}, 0, 1.0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)`,
    },
    previewOverlay: {
      left: '18.95%',
      top: '11.54%',
      width: '58.57%',
      height: '75.79%',
      matrix: 'matrix3d(0.905803, -0.090424, 0, -0.001148, 0, 1.0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)',
    },
    shadow: {
      diffuse: {
        left: '61.5%',
        top: '74.5%',
        width: '21.0%',
        height: '7.5%',
        angle: '7.0deg',
      },
      contact: {
        left: '63.4%',
        top: '75.7%',
        width: '15.2%',
        height: '2.0%',
        angle: '7.0deg',
      },
      pageBlock: {
        left: '78.1%',
        top: '79.0%',
        width: '2.2%',
        height: '1.8%',
        angle: '-21.0deg',
      },
      pageBlockCast: {
        left: '77.8%',
        top: '77.2%',
        width: '4.0%',
        height: '3.5%',
        angle: '12.0deg',
      },
    },
  },
};
