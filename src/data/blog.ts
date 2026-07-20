export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  hue: number;
  body: string[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'best-neet-books-2026',
    title: 'Best NEET Books 2026: Complete Subject-wise List by Toppers',
    excerpt: 'Physics, Chemistry and Biology — the exact books NEET toppers used, from NCERT to advanced practice.',
    category: 'Study Guides', date: '2026-01-12', readTime: '8 min read', hue: 350,
    body: [
      'NEET 2026 is expected to see over 22 lakh aspirants competing for roughly 1 lakh MBBS seats. In an exam where a single mark can shift your rank by thousands, your booklist matters enormously. Here is the list our team compiled from interviews with 40+ NEET toppers.',
      '**Biology (Botany + Zoology) — 50% of your score.** Start and end with NCERT Class 11 & 12 Biology. Every line, diagram and table is a potential question. Supplement with the MTG NEET Guide Biology for chapterwise MCQs mapped to NCERT, and Arihant\'s 40 Years Chapterwise Solved Papers for pattern recognition.',
      '**Chemistry.** NCERT is again the backbone, especially for Inorganic. For Physical Chemistry, solve NCERT examples plus previous year questions. For Organic, master NCERT reactions and mechanisms before touching any reference book.',
      '**Physics.** NCERT + H.C. Verma for concepts, then NEET-specific question banks. Focus on Mechanics, Electrodynamics and Modern Physics — they carry the most weight.',
      '**The 3-pass strategy:** Pass 1 — read NCERT line by line. Pass 2 — solve chapterwise PYQs immediately after each chapter. Pass 3 — full-length mocks in the last 60 days. All books mentioned are available on Techno World Books with same-week delivery across India.',
    ],
  },
  {
    slug: 'mbbs-first-year-book-list',
    title: 'MBBS First Year Book List: Anatomy, Physiology & Biochemistry',
    excerpt: 'The complete first-prof booklist recommended by seniors — standard texts vs Indian authors, and what to actually buy.',
    category: 'Study Guides', date: '2026-01-05', readTime: '6 min read', hue: 280,
    body: [
      'Starting MBBS is overwhelming — and so is the book shopping. Here is the no-nonsense first year list used in most Indian medical colleges.',
      '**Anatomy:** B.D. Chaurasia (4 volumes) is your daily driver — exam-oriented with unforgettable line diagrams. Pair it with Gray\'s Anatomy for Students when you want clinical depth and imaging correlation. Buy Chaurasia first; add Gray\'s if budget allows.',
      '**Physiology:** Guyton & Hall is the gold standard for concepts. Many toppers read Guyton for understanding and revise from Indian author notes for exams.',
      '**Biochemistry:** Vasudevan or Lippincott Illustrated Reviews. Lippincott\'s diagrams make metabolism cycles finally stick.',
      '**Budget tip:** The complete first-year set (Chaurasia + Guyton + Lippincott) costs around ₹8,000–10,000 on Techno World Books — roughly 30% below MRP, and hostel delivery is free above ₹999.',
    ],
  },
  {
    slug: 'upsc-books-complete-guide',
    title: 'UPSC CSE 2026: The Only Booklist You Need (Prelims + Mains)',
    excerpt: 'Laxmikanth to Ramesh Singh — a minimal, high-yield booklist that avoids the trap of collecting books instead of reading them.',
    category: 'Book Recommendations', date: '2025-12-28', readTime: '10 min read', hue: 10,
    body: [
      'The biggest UPSC mistake is buying 50 books and finishing none. This minimal list covers Prelims and Mains GS with room for your optional.',
      '**Polity:** M. Laxmikanth\'s Indian Polity — read it five times. It is that important. **Economy:** Ramesh Singh\'s Indian Economy plus the latest Economic Survey summary. **History:** NCERTs + Spectrum\'s Modern India. **Geography:** NCERT Class 11–12 + GC Leong for physical geography. **Environment:** Shankar IAS. **Current Affairs:** One daily newspaper + monthly magazine. That\'s it.',
      '**CSAT:** R.S. Aggarwal\'s Quantitative Aptitude covers the maths; practice 10 PYQ papers for comprehension.',
      '**Rule of thumb:** One source per subject, read multiple times, plus 10 years of previous papers. Every book here ships from Techno World Books within 24 hours.',
    ],
  },
  {
    slug: 'jee-books-physics-chemistry-maths',
    title: 'JEE Main + Advanced Booklist: What Actually Works',
    excerpt: 'H.C. Verma, R.D. Sharma and beyond — a realistic JEE booklist from an IITian\'s perspective.',
    category: 'Study Guides', date: '2025-12-15', readTime: '7 min read', hue: 200,
    body: [
      'Ask any IITian and the list is surprisingly short. JEE rewards depth in few books, not shallow coverage of many.',
      '**Physics:** NCERT for theory, H.C. Verma Vol 1 & 2 for problems. If you finish HCV completely — every objective and subjective question — JEE Main physics is effectively done. Advanced needs coaching material or Cengage/Arihant series on top.',
      '**Mathematics:** R.D. Sharma Objective for volume of practice. Focus your energy on Calculus and Algebra — they dominate the paper.',
      '**Chemistry:** NCERT is king for Inorganic (read it like Biology). Physical Chemistry needs NCERT + one problem book. Organic — master NCERT mechanisms first.',
      '**Timeline:** Finish theory by December, January–March is for PYQs and mocks only. Get the full JEE set on Techno World Books — combos save up to 40%.',
    ],
  },
  {
    slug: 'best-books-2025-fiction',
    title: '10 Books India Couldn\'t Stop Reading in 2025',
    excerpt: 'From Atomic Habits to Bengali classics — the year\'s bestsellers across fiction, non-fiction and regional literature.',
    category: 'Book Recommendations', date: '2026-01-08', readTime: '5 min read', hue: 42,
    body: [
      'Our sales data from 2025 tells a fascinating story about what India reads. Self-improvement dominates, but literary fiction and regional classics are surging.',
      '**The top 5:** Atomic Habits stayed #1 for the third straight year. The Psychology of Money and Rich Dad Poor Dad prove India\'s personal-finance awakening is real. Sapiens and Ikigai round out a very introspective top five.',
      '**Fiction highlights:** The Alchemist never leaves the charts. Harry Potter found a whole new generation of readers. 1984 saw a massive spike among college readers.',
      '**Regional pride:** Bengali literature had a banner year — Feluda Samagra and Professor Shonku collections sold in record numbers, driven by nostalgia gifting during Durga Puja season.',
      'Browse all of these in our Best Sellers section — with rewards points on every purchase.',
    ],
  },
  {
    slug: 'how-to-read-more-books',
    title: 'How to Read 30 Books a Year (A Student\'s System)',
    excerpt: 'A practical system for students to build a reading habit around classes, exams and a phone that never stops buzzing.',
    category: 'Study Guides', date: '2025-12-20', readTime: '5 min read', hue: 150,
    body: [
      'Thirty books a year sounds impossible between lectures and exams. It isn\'t — it\'s 25 pages a day. Here\'s the system.',
      '**Anchor reading to an existing habit.** Read 10 pages with morning chai, 10 after lunch, 5 before sleep. Habit stacking (from Atomic Habits) works because it removes the decision of *when*.',
      '**Carry a book everywhere.** Metro rides, lecture gaps, waiting rooms — the average student has 90 minutes of dead time daily. That\'s 2,000 pages a month.',
      '**Quit books ruthlessly.** Life is too short for books that don\'t grab you by page 50. Finishing bad books is the #1 habit-killer.',
      '**Track it.** Keep a simple list of finished books. Watching it grow is its own motivation. Start your list today — your first book is 40% off on Techno World Books.',
    ],
  },
];

export const POPULAR_SEARCHES = [
  'NCERT Class 12', 'NEET books', 'Atomic Habits', 'UPSC polity', 'H.C. Verma physics',
  'Feluda Samagra', 'Rich Dad Poor Dad', 'GATE 2026', 'Harry Potter', 'MBBS first year books',
];
